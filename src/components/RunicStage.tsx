"use client";

import { useEffect, useRef } from "react";
import styles from "./RunicStage.module.css";

/** A small, real-time 3D setting for the original character illustrations.
 * No remote embed, video or model download; the illustrated fallback is always present. */
export function RunicStage({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 800px)");
    let disposed = false, loading = false, visible = false;
    let teardown: (() => void) | undefined;
    let syncScene: (() => void) | undefined;
    const start = async () => {
      if (disposed || loading || teardown || !visible || !desktop.matches || reduced.matches) return;
      loading = true;
      try {
        const T = await import("three");
        if (disposed || !desktop.matches || reduced.matches) { loading = false; return; }
        const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = T.SRGBColorSpace;
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        element.appendChild(renderer.domElement);
        element.dataset.renderer = "webgl";
        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(28, 1, .1, 60);
        camera.position.set(0, 6.1, 10.8);
        camera.lookAt(0, .15, 0);
        const rig = new T.Group(); rig.scale.setScalar(1.1); scene.add(rig);
        const copper = new T.MeshStandardMaterial({ color: 0x99714b, roughness: .55, metalness: .78 });
        const steel = new T.MeshStandardMaterial({ color: 0x354655, roughness: .5, metalness: .72 });
        const glow = new T.MeshBasicMaterial({ color: 0xdca668, transparent: true, opacity: .8 });
        const frost = new T.MeshBasicMaterial({ color: 0x93cede, transparent: true, opacity: .7 });
        const base = new T.Mesh(new T.CylinderGeometry(3.1, 3.35, .16, 64), steel);
        base.position.y = -.09; rig.add(base);
        const outer = new T.Group(); rig.add(outer);
        const inner = new T.Group(); rig.add(inner);
        const rim = (radius: number, tube: number, material: typeof copper | typeof glow, y: number, parent = rig) => {
          const ring = new T.Mesh(new T.TorusGeometry(radius, tube, 6, 96), material);
          ring.rotation.x = Math.PI / 2; ring.position.y = y; parent.add(ring);
        };
        rim(3.23, .075, copper, .01); rim(2.95, .025, frost, .035);
        rim(2.34, .06, copper, .02); rim(2.22, .018, glow, .045, inner);
        rim(1.45, .024, frost, .035, inner);
        // Repeated bronze inlays and angular rune marks are actual mesh geometry.
        const inlayGeometry = new T.BoxGeometry(.08, .055, .25);
        const runeGeometry = new T.BoxGeometry(.04, .025, .19);
        for (let i = 0; i < 32; i++) {
          const angle = i / 32 * Math.PI * 2;
          const inlay = new T.Mesh(inlayGeometry, copper);
          inlay.position.set(Math.sin(angle) * 3.08, .06, Math.cos(angle) * 3.08);
          inlay.rotation.y = angle; outer.add(inlay);
          const rune = new T.Group(); rune.position.set(Math.sin(angle) * 2.65, .04, Math.cos(angle) * 2.65); rune.rotation.y = angle;
          for (let j = 0; j < 3; j++) {
            const stroke = new T.Mesh(runeGeometry, i % 4 === 0 ? frost : glow);
            stroke.rotation.y = j === 0 ? 0 : j === 1 ? .7 : -.7;
            stroke.position.set(j === 0 ? 0 : j === 1 ? -.05 : .05, .015, j === 0 ? 0 : -.045);
            rune.add(stroke);
          }
          inner.add(rune);
        }
        const diamondGeometry = new T.OctahedronGeometry(.18);
        for (let i = 0; i < 8; i++) {
          const angle = i / 8 * Math.PI * 2;
          const gem = new T.Mesh(diamondGeometry, i % 2 ? steel : copper);
          gem.scale.set(1, .65, 1.8); gem.rotation.y = angle;
          gem.position.set(Math.sin(angle) * 3.34, .12, Math.cos(angle) * 3.34); outer.add(gem);
        }
        scene.add(new T.HemisphereLight(0xc6e7f0, 0x19100b, 2.5));
        const warm = new T.PointLight(0xffaa55, 75, 20); warm.position.set(-4, 4, 3); scene.add(warm);
        const cool = new T.PointLight(0x8dcfff, 65, 20); cool.position.set(4, 3, -2); scene.add(cool);
        let frame = 0, last = 0, elapsed = 0, pointerX = 0, pointerY = 0, lost = false;
        const resize = () => {
          const { width, height } = element.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        };
        const render = (now: number) => {
          frame = requestAnimationFrame(render);
          if (now - last < 1000 / 30) return;
          elapsed += last ? Math.min((now - last) / 1000, .1) : 0; last = now;
          inner.rotation.y = elapsed * .035;
          outer.rotation.y = -elapsed * .012;
          rig.rotation.y += (pointerX * .13 - rig.rotation.y) * .035;
          rig.rotation.x += (pointerY * .035 - rig.rotation.x) * .035;
          glow.opacity = .7 + Math.sin(elapsed * .7) * .1;
          warm.position.x = -4 + Math.sin(elapsed * .3);
          renderer.render(scene, camera);
        };
        syncScene = () => {
          cancelAnimationFrame(frame); last = 0;
          const active = visible && !document.hidden && desktop.matches && !reduced.matches && !lost;
          element.dataset.active = String(active);
          if (active) frame = requestAnimationFrame(render);
        };
        const move = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          const rect = element.getBoundingClientRect();
          pointerX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
          pointerY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
        };
        const leave = () => { pointerX = 0; pointerY = 0; };
        const parent = element.closest(".wc-feature-scene") ?? element.parentElement;
        parent?.addEventListener("pointermove", move as EventListener, { passive: true });
        parent?.addEventListener("pointerleave", leave);
        const contextLost = (event: Event) => {
          event.preventDefault(); lost = true; delete element.dataset.renderer; syncScene?.();
        };
        const contextRestored = () => { lost = false; element.dataset.renderer = "webgl"; resize(); syncScene?.(); };
        renderer.domElement.addEventListener("webglcontextlost", contextLost);
        renderer.domElement.addEventListener("webglcontextrestored", contextRestored);
        const sizing = new ResizeObserver(resize); sizing.observe(element); resize(); syncScene();
        teardown = () => {
          cancelAnimationFrame(frame); sizing.disconnect();
          parent?.removeEventListener("pointermove", move as EventListener); parent?.removeEventListener("pointerleave", leave);
          renderer.domElement.removeEventListener("webglcontextlost", contextLost);
          renderer.domElement.removeEventListener("webglcontextrestored", contextRestored);
          const geometries = new Set<InstanceType<typeof T.BufferGeometry>>();
          scene.traverse(object => { if (object instanceof T.Mesh) geometries.add(object.geometry); });
          geometries.forEach(geometry => geometry.dispose());
          [copper, steel, glow, frost].forEach(material => material.dispose());
          renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
          delete element.dataset.renderer; delete element.dataset.active;
        };
      } catch {
        // WebGL is optional; the illustration and all controls remain usable.
        element.dataset.renderer = "fallback";
      } finally { loading = false; }
    };
    const sync = () => { syncScene?.(); void start(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { rootMargin: "80px" });
    observer.observe(element);
    reduced.addEventListener("change", sync); desktop.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      disposed = true; observer.disconnect(); teardown?.();
      reduced.removeEventListener("change", sync); desktop.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return <div ref={host} className={`${styles.root} wc-runic-stage ${className}`} aria-hidden="true"><span className={styles.fallback}/></div>;
}
