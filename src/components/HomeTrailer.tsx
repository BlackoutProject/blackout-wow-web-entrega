"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { homeOverviewCopy } from "@/lib/home-overview-copy";
import { resolveAppLanguage } from "@/i18n/settings";

const officialTrailerId = "06t4KdlMcRI";
const configuredId = process.env.NEXT_PUBLIC_YOUTUBE_TRAILER_ID?.trim() ?? "";
const trailerId = /^[a-zA-Z0-9_-]{11}$/.test(configuredId) ? configuredId : officialTrailerId;
const watchUrl = `https://www.youtube.com/watch?v=${trailerId}`;
const poster = trailerId === officialTrailerId ? "/warcraft/blackout-official-trailer.jpg" : "/warcraft/dark-portal.jpg";

export function HomeTrailer() {
  const { i18n } = useTranslation();
  const c = homeOverviewCopy[resolveAppLanguage(i18n.language)];
  const [playing, setPlaying] = useState(false);
  const playButton = useRef<HTMLButtonElement>(null);
  const close = () => {
    setPlaying(false);
    requestAnimationFrame(() => playButton.current?.focus({ preventScroll: true }));
  };

  return <section className="wc-section wc-trailer" id="trailer" aria-labelledby="trailer-title">
    <div className="wc-wrap">
      <header className="wc-trailer-heading">
        <div><p className="wc-kicker">{c.trailerTag}</p><h2 id="trailer-title">{c.trailerTitle}</h2></div>
        <a className="wc-text-link" href={watchUrl} target="_blank" rel="noopener noreferrer">{c.watchOnYouTube}<b aria-hidden="true">↗</b></a>
      </header>
      <div className="wc-trailer-frame" onKeyDown={event => { if (event.key === "Escape" && playing) close(); }}>
        {playing ? <>
          <iframe src={`https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&playsinline=1&rel=0`} title={c.trailerLabel} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>
          <button type="button" className="wc-trailer-close" onClick={close} aria-label={c.trailerClose}>×</button>
        </> : <>
          <Image className="wc-trailer-poster" src={poster} fill sizes="(max-width: 1250px) 88vw, 1100px" quality={85} alt=""/>
          <div className="wc-trailer-overlay"/>
          <div className="wc-trailer-caption">
            <span className="wc-trailer-wordmark">BLACKOUT<span>WOW · 255</span></span>
            <button ref={playButton} className="wc-trailer-play" type="button" onClick={() => setPlaying(true)}>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m9 5 11 7-11 7z"/></svg>
              {c.trailerPlay}
            </button>
          </div>
          <span className="wc-corners" aria-hidden="true"><i/><i/><i/><i/></span>
        </>}
      </div>
    </div>
  </section>;
}
