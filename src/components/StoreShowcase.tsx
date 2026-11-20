"use client";

import { useTranslation } from "react-i18next";
import { DISCORD_INVITE_URL } from "@/lib/site-config";
import { storeShowcaseCopy } from "@/lib/store-showcase-copy";
import { useAuth } from "@/context/AuthContext";

export function StoreShowcase() {
  const { i18n } = useTranslation();
  const { accessToken } = useAuth();
  const c = storeShowcaseCopy[i18n.language as keyof typeof storeShowcaseCopy] ?? storeShowcaseCopy.es;
  if (!accessToken) return null;

  return (
    <section className="wc-join wc-section wc-store-showcase" aria-labelledby="donor-title">
      <div className="wc-wrap">
        <header className="wc-join-copy" id="donor">
          <div className="wc-store-heading">
            <p className="wc-kicker">{c.eyebrow}</p>
            <h2 id="donor-title">{c.title}<br /><em>{c.accent}</em></h2>
          </div>
          <div className="wc-store-introduction">
            <p className="wc-section-intro">{c.intro}</p>
            <div className="wc-actions">
              <a className="wc-button" href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
                {c.discord}<span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </header>
      </div>
    </section>
  );
}
