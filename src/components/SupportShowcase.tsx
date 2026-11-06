"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { DISCORD_INVITE_URL } from "@/lib/site-config";
import { supportCopy } from "@/lib/support-copy";
import { AmbientVideo } from "./WarcraftMotion";
import styles from "./SupportShowcase.module.css";

export function SupportShowcase() {
  const { i18n } = useTranslation();
  const { accessToken } = useAuth();
  const c = supportCopy[i18n.language as keyof typeof supportCopy] ?? supportCopy.es;

  return (
    <section className={`${styles.support} wc-join wc-section wc-support`} id="tienda" aria-labelledby="support-title">
      <AmbientVideo className="wc-join-film" src="/cinematic/scene-03-shadow-kling.mp4" poster="/cinematic/sylvanas.jpg" preloadDistance={100} />
      <div className="wc-wrap">
        <div className="wc-join-copy">
          <p className="wc-kicker">{c.eyebrow}</p>
          <h2 id="support-title">{c.title}<br /><em>{c.accent}</em></h2>
          <p className="wc-section-intro">{c.intro}</p>
          <div className="wc-actions">
            <Link className="wc-button" href={accessToken ? "/cuenta#donor" : "/login?next=%2Fcuenta%23donor"}>{accessToken ? c.account : c.login}<span aria-hidden="true">›</span></Link>
          </div>
          <a className="wc-text-link" href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">{c.discord}<b aria-hidden="true">↗</b></a>
        </div>
      </div>
    </section>
  );
}
