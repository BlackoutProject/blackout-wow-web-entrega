"use client";

import { useEffect, useRef } from "react";

const palettes = {
  embers: ["241,116,43", "255,204,112"],
  frost: ["128,184,218", "212,232,239"],
  fel: ["126,201,65", "207,238,125"],
  arcane: ["110,180,223", "196,151,233"],
  jade: ["94,199,164", "195,231,169"],
  community: ["186,142,93", "215,194,155"],
} as const;

/** Decorative depth particles, only rendered while this scene is visible. */
export function SceneAtmosphere({ theme = "embers", className = "" }: { theme?: keyof typeof palettes; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1, height = 1, visible = false, frame = 0, last = 0, elapsed = 0;
    const particles = Array.from({ length: 64 }, (_, i) => ({
      x: ((i * 73.31 + 13) % 101) / 101,
      y: ((i * 43.7 + 21) % 97) / 97,
      depth: .25 + ((i * 17.13) % 71) / 100,
      phase: i * 1.73,
    }));
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (now - last < 1000 / 30) return;
      const delta = last ? Math.min((now - last) / 1000, .08) : 0;
      last = now; elapsed += delta;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";
      const count = width < 600 ? 28 : 64;
      particles.slice(0, count).forEach((p, i) => {
        const rise = theme === "frost" ? -1 : 1;
        const y = (((p.y * height - elapsed * (8 + p.depth * 23) * rise) % height) + height) % height;
        const x = p.x * width + Math.sin(elapsed * .42 + p.phase) * (12 + p.depth * 25);
        const fade = Math.min(y / (height * .15), (height - y) / (height * .2), 1);
        const alpha = (.16 + p.depth * .48) * fade * (.7 + Math.sin(elapsed * 1.4 + p.phase) * .3);
        const color = palettes[theme][i % 2];
        const radius = .65 + p.depth * 1.3;
        context.fillStyle = `rgba(${color},${alpha * .12})`;
        context.beginPath(); context.ellipse(x, y, radius * 4, radius * 4, 0, 0, Math.PI * 2); context.fill();
        context.fillStyle = `rgba(${color},${alpha})`;
        context.beginPath(); context.ellipse(x, y, radius * .65, radius * (theme === "embers" ? 2 : 1), .3, 0, Math.PI * 2); context.fill();
      });
    };
    const sync = () => {
      cancelAnimationFrame(frame); last = 0;
      const playing = visible && !document.hidden && !reduced.matches;
      canvas.dataset.playing = String(playing);
      if (playing) frame = requestAnimationFrame(draw);
      else if (reduced.matches) context.clearRect(0, 0, width, height);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .01 });
    const sizing = new ResizeObserver(resize);
    resize(); sizing.observe(canvas); observer.observe(canvas);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); sizing.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [theme]);
  return <canvas ref={ref} className={`wc-scene-atmosphere ${className}`} aria-hidden="true"/>;
}
