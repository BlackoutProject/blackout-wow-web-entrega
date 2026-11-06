"use client";

import { useEffect, useRef } from "react";

/** One persistent painted cursor. Native :active/drag cursors never replace it. */
export function BlackoutCursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cursor = ref.current;
    if (!cursor) return;
    const root = document.documentElement;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const highContrast = matchMedia("(forced-colors: active)");
    let x = -100, y = -100, present = false, pressed = false;
    const hide = () => {
      present = false; pressed = false;
      cursor.dataset.visible = "false";
      cursor.dataset.pressed = "false";
      root.removeAttribute("data-blackout-cursor");
    };
    const paint = (target: EventTarget | null) => {
      if (!fine.matches || highContrast.matches || !present) { hide(); return; }
      const element = target instanceof Element ? target : null;
      // Keep the OS caret and native dropdown/iframe behavior where they are useful.
      const native = element?.closest('input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]),textarea,[contenteditable="true"],select,iframe');
      cursor.style.transform = `translate3d(${x - 5}px,${y - 4}px,0)`;
      cursor.dataset.visible = String(!native);
      cursor.dataset.pressed = String(pressed);
      cursor.dataset.interactive = String(!!element?.closest('a[href],button,summary,[role="tab"],[role="button"]'));
      if (native) root.removeAttribute("data-blackout-cursor");
      else root.dataset.blackoutCursor = "painted";
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") { hide(); return; }
      x = event.clientX; y = event.clientY; present = true;
      paint(event.target);
    };
    const down = (event: PointerEvent) => { pressed = true; move(event); };
    const up = (event: PointerEvent) => { pressed = false; move(event); };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) hide(); };
    const refresh = () => { if (present) paint(document.elementFromPoint(x, y)); };
    const visibility = () => { if (document.hidden) hide(); };
    const preventArtworkDrag = (event: DragEvent) => {
      if (event.target instanceof Element && event.target.closest('.site-shell a[href],.wc-crest,.wc-class-figure')) event.preventDefault();
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", move, { passive: true });
    document.addEventListener("pointerdown", down, { passive: true, capture: true });
    document.addEventListener("pointerup", up, { passive: true, capture: true });
    document.addEventListener("pointercancel", hide);
    document.documentElement.addEventListener("pointerleave", leave);
    document.addEventListener("scroll", refresh, { passive: true, capture: true });
    document.addEventListener("dragstart", preventArtworkDrag);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", hide);
    fine.addEventListener("change", hide);
    highContrast.addEventListener("change", hide);
    return () => {
      hide();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", move);
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("pointerup", up, true);
      document.removeEventListener("pointercancel", hide);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.removeEventListener("scroll", refresh, true);
      document.removeEventListener("dragstart", preventArtworkDrag);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", hide);
      fine.removeEventListener("change", hide);
      highContrast.removeEventListener("change", hide);
    };
  }, []);
  return <div ref={ref} className="blackout-cursor" aria-hidden="true" data-visible="false"><svg width="32" height="32" viewBox="0 0 32 32"><path d="M5 4 25 12 16 16 12 25Z" fill="none" stroke="#e23830" strokeWidth="5" strokeLinejoin="round" opacity=".16"/><path d="M5 4 25 12 16 16 12 25Z" fill="#110b0c" stroke="#f34b42" strokeWidth="1.8" strokeLinejoin="round"/></svg></div>;
}
