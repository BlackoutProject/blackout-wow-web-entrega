"use client";

import { useEffect, useId, useRef, useState } from "react";
import { WarcraftSigil } from "./WarcraftSigil";

/** Native anchor links work without JS; enhancement keeps the current section visible. */
export function PageSectionNav({ items, label }: {
  items: readonly { id: string; label: string }[];
  label: string;
}) {
  const nav = useRef<HTMLElement>(null);
  const [active, setActive] = useState(items[0]?.id ?? "");
  const selectId = useId();
  const sectionKey = items.map(item => item.id).join("|");

  useEffect(() => {
    const element = nav.current;
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!element || !header) return;
    element.dataset.enhanced = "true";
    const root = document.documentElement;
    const sections = sectionKey.split("|").map(id => document.getElementById(id)).filter((section): section is HTMLElement => !!section);
    let frame = 0;
    let offset = 0;
    const update = () => {
      frame = 0;
      let current = sections[0]?.id ?? "";
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= offset + 96) current = section.id;
      }
      setActive(previous => previous === current ? previous : current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const measure = () => {
      const headerHeight = header.getBoundingClientRect().height;
      const navHeight = element.getBoundingClientRect().height;
      root.style.setProperty("--section-header-height", `${headerHeight}px`);
      root.style.setProperty("--section-nav-height", `${navHeight}px`);
      offset = headerHeight + navHeight;
      schedule();
    };
    const resize = new ResizeObserver(measure);
    resize.observe(header);
    resize.observe(element);
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("hashchange", schedule);
    return () => {
      resize.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("hashchange", schedule);
      root.style.removeProperty("--section-header-height");
      root.style.removeProperty("--section-nav-height");
      delete element.dataset.enhanced;
    };
  }, [sectionKey]);

  return <nav ref={nav} className="page-section-nav" aria-label={label}>
    <div className="page-section-inner">
      <span className="page-section-emblem" aria-hidden="true"><WarcraftSigil kind="rune"/></span>
      <div className="page-section-links">
        {items.map(item => <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? "location" : undefined}>{item.label}</a>)}
      </div>
      <div className="page-section-mobile">
        <label className="sr-only" htmlFor={selectId}>{label}</label>
        <select id={selectId} value={active} onChange={event => {
          const id = event.target.value;
          setActive(id);
          if (window.location.hash === `#${id}`) document.getElementById(id)?.scrollIntoView({ block: "start" });
          else window.location.hash = id;
        }}>{items.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
        <span aria-hidden="true">⌄</span>
      </div>
    </div>
  </nav>;
}
