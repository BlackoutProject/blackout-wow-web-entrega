"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Progressive visual effects. Content remains fully visible without JavaScript. */
export function WarcraftVisualEffects() {
  const path = usePathname();
  useEffect(() => {
    const main = document.getElementById("site-main");
    if (!main) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const cards = [...main.querySelectorAll<HTMLElement>(".wc-home-highlight, .wc-home-feature, .wc-path, .wc-battle-scene, .lore-feature, .server-progression-grid article, .server-system-cards article, .lore-customization article")];
    const scenes = [...main.querySelectorAll<HTMLElement>(".blackout-hero, .wc-hero, .wc-trailer-pending, .wc-home-overview, .wc-feature-showcase, .wc-classes, .class-spells, .server-systems, .wc-community")];
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      const element = entry.target as HTMLElement;
      element.dataset.inView = String(entry.isIntersecting);
      if (entry.isIntersecting) element.dataset.revealed = "true";
    }), { threshold: .12 });
    [...cards, ...scenes].forEach(element => observer.observe(element));
    let frame = 0;
    let current: HTMLElement | null = null;
    const clearDepth = () => {
      cancelAnimationFrame(frame);
      if (current) { ["--depth-x", "--depth-y", "--light-x", "--light-y", "--scene-x", "--scene-y"].forEach(property => current?.style.removeProperty(property)); current.removeAttribute("data-depth-active"); }
      current = null;
    };
    const move = (event: PointerEvent) => {
      if (media.matches || !fine.matches || event.pointerType !== "mouse") return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>(".wc-home-highlight, .wc-feature-scene, .wc-battle-scene, .wc-path, .wc-hero, .wc-class-figure, .wc-system-panels") : null;
      if (current !== target) clearDepth();
      if (!target) return;
      current = target;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        target.style.setProperty("--depth-x", `${(x - .5) * 4}deg`);
        target.style.setProperty("--depth-y", `${(.5 - y) * 4}deg`);
        target.style.setProperty("--light-x", `${x * 100}%`);
        target.style.setProperty("--light-y", `${y * 100}%`);
        target.style.setProperty("--scene-x", `${(x - .5) * 16}px`);
        target.style.setProperty("--scene-y", `${(y - .5) * 10}px`);
        target.dataset.depthActive = "true";
      });
    };
    main.addEventListener("pointermove", move, { passive: true });
    main.addEventListener("pointerleave", clearDepth);
    media.addEventListener("change", clearDepth);
    const syncVisibility = () => { main.dataset.effectsPaused = String(document.hidden); if (document.hidden) clearDepth(); };
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      observer.disconnect(); clearDepth();
      main.removeEventListener("pointermove", move);
      main.removeEventListener("pointerleave", clearDepth);
      media.removeEventListener("change", clearDepth);
      document.removeEventListener("visibilitychange", syncVisibility);
      delete main.dataset.effectsPaused;
    };
  }, [path]);
  return null;
}
