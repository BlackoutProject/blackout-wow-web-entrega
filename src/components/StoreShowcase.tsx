"use client";

import Link from "next/link";
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
    <section className="wc-join wc-section wc-store-showcase" aria-labelledby="store-title">
      <div className="wc-wrap">
        <header className="wc-join-copy" id="donor">
          <div className="wc-store-heading">
          <p className="wc-kicker">{c.eyebrow}</p>
          <h2 id="store-title">{c.title}<br /><em>{c.accent}</em></h2>
          </div>
          <div className="wc-store-introduction">
          <p className="wc-section-intro">{c.intro}</p>
          <div className="wc-actions">
            <Link className="wc-button" href="/tienda">{c.store}<span aria-hidden="true">›</span></Link>
            <a className="wc-button wc-button-ghost" href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">{c.discord}<span aria-hidden="true">↗</span></a>
          </div>
          </div>
        </header>

        <div className="wc-store-plans">
          <article className="wc-store-plan" aria-labelledby="vip-title">
            <header><div><h3 id="vip-title">VIP</h3><p className="wc-store-price">50 <small>USD</small></p></div><span>{c.account}</span></header>
            <p className="wc-store-plan-intro">{c.vipIntro}</p>
            <ul>
              <li><strong>{c.instance}</strong><p>{c.instanceText}</p></li>
              <li className="wc-store-commands"><span><code>.vip</code>{c.vipMenu}</span><span><code>.vbuff</code>{c.vipBuff}</span></li>
              <li><strong>{c.vipItems}</strong><p>{c.vipItemsText}</p></li>
              <li><strong>{c.bags}</strong><p>{c.bagsText}</p></li>
            </ul>
          </article>
          <article className="wc-store-plan wc-store-plan-plus" aria-labelledby="vip-plus-title">
            <header><div><h3 id="vip-plus-title">VIP <em>PLUS</em></h3><p className="wc-store-price">200 <small>USD</small></p></div><span>{c.account}</span></header>
            <p className="wc-store-plan-intro">{c.plusIntro}</p>
            <ul>
              <li><strong>{c.mall}</strong><p>{c.mallText}</p></li>
              <li><strong>{c.gear}</strong></li>
              <li><strong>{c.vipItems}</strong></li>
              <li><strong>{c.bags}</strong></li>
              <li><strong>{c.weapons}</strong></li>
              <li><strong>{c.keys}</strong></li>
            </ul>
          </article>
        </div>

        <div className="wc-store-individual">
          <h3>{c.individual}</h3>
          <ul>{c.individualItems.map(item => <li key={item.name}><strong>{item.name}</strong><span>{item.price}</span><p>{item.description}</p></li>)}</ul>
        </div>
        <div className="wc-store-fair">
          <div><h3>{c.fairTitle}</h3><p>{c.fairText}</p></div>
          <Link className="wc-text-link" href="/tienda/puntos">{c.redeem}<b aria-hidden="true">→</b></Link>
        </div>
        <p className="wc-store-help">{c.helpText}{" "}<a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">{c.helpLink}<span aria-hidden="true"> ↗</span></a></p>
      </div>
    </section>
  );
}
