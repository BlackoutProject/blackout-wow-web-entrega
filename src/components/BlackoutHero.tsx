"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ArrowUpRight, DiscordLogo, CaretDown } from "@phosphor-icons/react";
import { AmbientVideo } from "./WarcraftMotion";
import { warcraftCopy } from "@/lib/warcraft-copy";
import { steelHomeCopy } from "@/lib/steel-home-copy";
import { DISCORD_INVITE_URL } from "@/lib/site-config";
import styles from "./BlackoutHero.module.css";

gsap.registerPlugin(useGSAP);

/** The original film provides the entire hero scene; no separate portrait cutout. */
export function BlackoutHero() {
  const { i18n } = useTranslation();
  const c = warcraftCopy[i18n.language as keyof typeof warcraftCopy] ?? warcraftCopy.es;
  const copy = steelHomeCopy[i18n.language as keyof typeof steelHomeCopy] ?? steelHomeCopy.es;
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const element = root.current;
    if (!element) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(element.querySelectorAll("[data-hero-reveal]"), {
        y: 16, opacity: 0, duration: .8, stagger: .09, ease: "power2.out", clearProps: "all",
      });
    });
    return () => media.revert();
  }, { scope: root });

  return <section ref={root} className={`${styles.hero} blackout-hero`} aria-labelledby="hero-title">

    <AmbientVideo className={styles.orc} src="/warcraft/blackout-orc.mp4" poster="/warcraft/blackout-orc-poster.webp" priority />
    <div className={styles.shade} aria-hidden="true" />
    <div className={`${styles.layout} wc-wrap`}>
      <div className={styles.copy}>
        <Image className={styles.crest} src="/warcraft/crest.webp" width={1024} height={682} sizes="(max-width: 600px) 260px, 360px" quality={95} alt="Blackout WoW" priority data-hero-reveal />
        <h1 id="hero-title" data-hero-reveal>{c.title}<br/><em>{c.accent}</em></h1>
        <p className={styles.intro} data-hero-reveal>{copy.summary}<br/><span>{copy.detail.replace("V1–V10", "V1\u2060–\u2060V10")}</span></p>
        <div className={styles.actions} data-hero-reveal>
          <Link href="/registro" className="wc-button">{c.create}<ArrowRight size={20} aria-hidden="true" /></Link>
          <Link href="/como-conectarme" className="wc-button wc-button-ghost">{c.play}<ArrowRight size={20} aria-hidden="true" /></Link>
        </div>
        <a className={styles.discord} href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" data-hero-reveal><DiscordLogo size={27} weight="fill" aria-hidden="true" />{c.discord}<ArrowUpRight size={16} aria-hidden="true" /></a>
        <p className={styles.profile} data-hero-reveal>{c.realmProfile}</p>
      </div>
    </div>
    <a href="#reino" className={styles.explore}>{c.explore}<CaretDown size={18} aria-hidden="true" /></a>
  </section>;
}
