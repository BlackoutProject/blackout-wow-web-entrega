"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
const MotionContext = createContext({ paused: true });
export function WarcraftMotion({ children }: { children: React.ReactNode }) {
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    // Motion starts automatically; an old manual pause must not persist.
    const update = () => setPaused(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return <MotionContext.Provider value={{ paused }}><div className="warcraft-motion-root" data-motion={paused ? "paused" : "playing"}>{children}</div></MotionContext.Provider>;
}
/** Prepare nearby scenes before they enter the viewport; only play visible scenes. */
export function AmbientVideo({ src, poster, className = "", priority = false }: { src: string; poster: string; className?: string; priority?: boolean }) {
  // A route or class change gets fresh playback state, never the previous scene's opacity.
  return <AmbientScene key={src} src={src} poster={poster} className={className} priority={priority}/>;
}
function AmbientScene({ src, poster, className, priority }: { src: string; poster: string; className: string; priority: boolean }) {
  const { paused } = useContext(MotionContext);
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(priority);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const element = ref.current; if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(element);
    // Loading at the first visible pixel left an apparently static poster during scrolling.
    // A separate observer warms only the next screenful, without playing offscreen video.
    const prepare = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setLoaded(true); prepare.disconnect(); }
    }, { rootMargin: "650px 0px", threshold: 0 });
    if (!paused) prepare.observe(element);
    return () => { observer.disconnect(); prepare.disconnect(); };
  }, [paused]);
  useEffect(() => {
    const element = ref.current;
    const sync = () => {
      if (!element) return;
      element.muted = true;
      if (paused || !visible || !loaded || document.hidden) element.pause();
      else if (element.paused) void element.play().catch(() => {});
    };
    sync();
    element?.addEventListener("loadeddata", sync);
    element?.addEventListener("canplay", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pageshow", sync);
    window.addEventListener("focus", sync);
    // Recover if a browser temporarily blocked autoplay; never request sound.
    document.addEventListener("pointerdown", sync, { passive: true });
    return () => {
      element?.removeEventListener("loadeddata", sync);
      element?.removeEventListener("canplay", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pageshow", sync);
      window.removeEventListener("focus", sync);
      document.removeEventListener("pointerdown", sync);
      element?.pause();
    };
  }, [paused, visible, loaded]);
  // Reuse the already-compressed poster URL so image and native video share one request.
  return <div className={`wc-ambient ${className}`} aria-hidden="true" data-motion={paused ? "reduced" : visible ? "visible" : "offscreen"}><Image src={poster} alt="" fill unoptimized priority={priority}/><video ref={ref} src={(loaded && !paused) || ready ? src : undefined} poster={poster} autoPlay={visible && !paused} muted loop playsInline preload={loaded && !paused ? "auto" : "none"} onPlaying={() => setReady(true)} onError={() => setReady(false)} style={{ opacity: ready ? 1 : 0 }}/></div>;
}
