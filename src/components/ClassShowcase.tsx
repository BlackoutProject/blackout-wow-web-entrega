"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { warcraftCopy } from "@/lib/warcraft-copy";
import { SceneAtmosphere } from "./SceneAtmosphere";
import { WarcraftSigil } from "./WarcraftSigil";
import { GameplayGallery } from "./GameplayGallery";

const classArtwork = {
  evoker: { width: 3095, height: 3277 },
  "demon-hunter": { width: 1052, height: 984 },
  monk: { width: 1328, height: 1144 },
} as const;

/** Decorative energy follows a different path for each class; the original art stays intact. */
function ClassEnergy({ selected }: { selected: number }) {
  const paths = [
    ["M90 370C10 240 80 90 235 95S465 240 390 370", "M100 400C180 465 365 445 420 310"],
    ["M55 375 150 190 100 80 220 170", "M425 375 330 190 380 80 260 170"],
    ["M70 350C10 210 150 80 310 110S470 300 360 365 110 390 100 290", "M60 405C200 455 380 430 430 310"],
  ][selected];
  return <svg key={selected} className="wc-class-energy" viewBox="0 0 480 480" fill="none" aria-hidden="true">
    {paths.map(path => <g key={path}><path className="wc-energy-track" d={path}/><path className="wc-energy-current" d={path} pathLength="100"/></g>)}
  </svg>;
}

function AnimatedClassArtwork({ kind, selected }: { kind: keyof typeof classArtwork; selected: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let visible = false;
    const sync = () => setActive(visible && selected && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.05 });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [selected]);
  return <div ref={root} className={`wc-official-character wc-official-${kind}`} data-active={active} data-selected={selected} aria-hidden="true"><div className="wc-character-motion"><Image sizes={kind === "evoker" ? "(max-width: 600px) 540px, (max-width: 900px) 730px, 900px" : "(max-width: 600px) 470px, 650px"} quality={95} src={`/warcraft/classes/${kind}.png`} alt="" {...classArtwork[kind]}/></div><i className="wc-character-motes"/></div>;
}

export function ClassShowcase() {
  const { i18n } = useTranslation();
  const c = warcraftCopy[i18n.language as keyof typeof warcraftCopy] ?? warcraftCopy.es;
  const [selectedClass, setSelectedClass] = useState(1);
  const classNames = c.classNames;
  return (
    <section className={`wc-classes wc-section wc-selected-class-${selectedClass}`} id="clases" aria-labelledby="classes-title">
      <div className="wc-class-landscape" aria-hidden="true"/>
      <div className="wc-wrap wc-class-layout">
        <div className="wc-class-copy">
          <p className="wc-kicker">{c.classesTag}</p>
          <div className="wc-class-story" aria-live="polite" aria-atomic="true">
            <div key={selectedClass} className="wc-class-story-content">
              <h2 id="classes-title">{classNames[selectedClass]}</h2>
              <p id="class-description" className="wc-section-intro">{c.classDescriptions[selectedClass]}</p>
            </div>
          </div>
          <p className="wc-class-choice">{c.chooseClass}</p>
          <div className="wc-class-list" role="tablist" aria-label={c.classesTag}>{classNames.map((name, i) => <button key={name} id={`class-tab-${i}`} type="button" role="tab" aria-selected={selectedClass === i} aria-controls="class-preview" tabIndex={selectedClass === i ? 0 : -1} className={"wc-class-item wc-class-" + i} onClick={() => setSelectedClass(i)} onKeyDown={event => { const next = event.key === "ArrowRight" ? (i + 1) % 3 : event.key === "ArrowLeft" ? (i + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : null; if (next !== null) { event.preventDefault(); setSelectedClass(next); (event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next])?.focus({ preventScroll: true }); } }}><span aria-hidden="true"><WarcraftSigil kind={(["orb", "swords", "leaf"] as const)[i]}/></span><strong>{name}<small>{c.classTypes[i]}</small></strong></button>)}</div>
        </div>
        <div className="wc-class-figure wc-class-preview" id="class-preview" role="tabpanel" aria-labelledby={`class-tab-${selectedClass}`} aria-describedby="class-description" tabIndex={0}>
          <div key={`rift-${selectedClass}`} className="wc-class-rift" aria-hidden="true"><i/><i/><i/><b/></div>
          <div className="wc-class-halo" aria-hidden="true"><i/><i/><span>✦</span></div>
          <ClassEnergy selected={selectedClass}/>
          {(["evoker", "demon-hunter", "monk"] as const).map((kind, index) => <AnimatedClassArtwork key={kind} kind={kind} selected={selectedClass === index}/>)}
          <SceneAtmosphere theme={selectedClass === 0 ? "arcane" : selectedClass === 1 ? "fel" : "jade"}/>
        </div>
        <div className="wc-class-gameplay"><GameplayGallery key={selectedClass} topic={(["evoker", "demon-hunter", "monk"] as const)[selectedClass]}/></div>
        <Link className="wc-text-link wc-class-details-link" href="/servidor#hechizos-custom">{c.spellsLink} <b aria-hidden="true">→</b></Link>
      </div>
    </section>
  );
}
