"use client";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { resolveAppLanguage } from "@/i18n/settings";
import { gameplayMediaCopy } from "@/lib/gameplay-media";

const configuredId = process.env.NEXT_PUBLIC_YOUTUBE_TUTORIAL_ID?.trim() ?? "";
const tutorialId = /^[a-zA-Z0-9_-]{11}$/.test(configuredId) ? configuredId : "";

export function ConnectTutorial() {
  const { i18n } = useTranslation();
  const c = gameplayMediaCopy[resolveAppLanguage(i18n.language)];
  const [playing, setPlaying] = useState(false);
  const playButton = useRef<HTMLButtonElement>(null);
  const close = () => { setPlaying(false); requestAnimationFrame(() => playButton.current?.focus({ preventScroll: true })); };
  if (!tutorialId) return null;
  return <section className="connection-tutorial" aria-labelledby="tutorial-title" id="tutorial">
    <header><p className="lore-kicker">{c.tutorialTag}</p><h2 id="tutorial-title">{c.tutorialTitle}</h2></header>
    {playing ? <div className="wc-trailer-frame" onKeyDown={event => { if (event.key === "Escape") close(); }}>
      <iframe src={`https://www.youtube-nocookie.com/embed/${tutorialId}?autoplay=1&rel=0`} title={c.tutorialLabel} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>
      <button type="button" className="wc-trailer-close" onClick={close} aria-label={c.close}>×</button>
    </div> : <button type="button" ref={playButton} className="connection-tutorial-play" onClick={() => setPlaying(true)}><span aria-hidden="true">▶</span>{c.tutorialPlay}<b aria-hidden="true">→</b></button>}
  </section>;
}
