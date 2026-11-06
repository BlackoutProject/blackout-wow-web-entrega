"use client";

import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { resolveAppLanguage } from "@/i18n/settings";
import { gameplayMediaCopy, mediaForTopic, type GameplayTopic } from "@/lib/gameplay-media";
import { useDialogFocus } from "@/lib/use-dialog-focus";
import styles from "./GameplayGallery.module.css";

export function GameplayGallery({ topic, featured = false }: { topic: GameplayTopic; featured?: boolean }) {
  const { i18n } = useTranslation();
  const language = resolveAppLanguage(i18n.language);
  const c = gameplayMediaCopy[language];
  const items = mediaForTopic(topic);
  const [selected, setSelected] = useState<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = () => setSelected(null);
  useDialogFocus(selected !== null, panel, close);
  if (!items.length) return null;
  const current = selected === null ? null : items[selected];
  const move = (direction: number) => setSelected(index => index === null ? null : (index + direction + items.length) % items.length);

  return <section className={`${styles.root} ${featured ? styles.featured : ""}`} aria-label={c.tag}>
    {featured && <header><p className="wc-kicker">{c.tag}</p><h2>{c.title}</h2></header>}
    <div className={styles.grid}>{items.map((item, index) => <button type="button" key={item.id} className={styles.card} onClick={() => setSelected(index)} aria-label={`${item.kind === "video" ? c.play : c.view}: ${item.caption[language]}`}>
      <Image src={item.poster} alt="" width={item.width} height={item.height} sizes="(max-width: 700px) 88vw, 540px"/>
      <span className={styles.caption}>{item.caption[language]}<b aria-hidden="true">{item.kind === "video" ? "▶" : "↗"}</b></span>
    </button>)}</div>
    {current && createPortal(<div className={styles.backdrop} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div ref={panel} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={`${id}-caption`} onKeyDown={event => {
        if ((event.target as HTMLElement).tagName === "VIDEO") return;
        if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
      }}>
        <button type="button" className={styles.close} onClick={close} aria-label={c.close}>×</button>
        <div className={styles.media} key={current.id}>{current.kind === "video"
          ? <video src={current.src} poster={current.poster} controls playsInline preload="metadata" aria-label={current.caption[language]}/>
          : <Image src={current.src} width={current.width} height={current.height} alt={current.caption[language]} sizes="94vw" quality={85}/>}</div>
        <div className={styles.toolbar}>
          {items.length > 1 && <button type="button" onClick={() => move(-1)} aria-label={c.previous}>←</button>}
          <p id={`${id}-caption`} aria-live="polite">{current.caption[language]}</p>
          {items.length > 1 && <button type="button" onClick={() => move(1)} aria-label={c.next}>→</button>}
        </div>
      </div>
    </div>, document.body)}
  </section>;
}
