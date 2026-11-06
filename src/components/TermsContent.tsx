"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { SiteShell } from "@/components/SiteShell";
import { WarcraftSigil } from "./WarcraftSigil";
import { defaultLng, isSupportedLanguage } from "@/i18n/settings";
import { rulesCopy } from "@/lib/rules-copy";

const sigils = ["shield", "banner", "mask", "swords", "chest", "rune", "key"] as const;

export default function TermsContent() {
  const { i18n } = useTranslation();
  const lang = isSupportedLanguage(i18n.language) ? i18n.language : defaultLng;
  const tx = rulesCopy[lang];

  return <SiteShell>
    <section className="lore-hero rules-hero">
      <span className="lore-kicker">{tx.badge}</span>
      <h1>{tx.title}</h1><p>{tx.intro}</p>
      <div className="lore-actions"><Link className="lore-button" href="/como-conectarme">{tx.ctaConnect}<span aria-hidden="true">↗</span></Link></div>
    </section>
    <section className="lore-container rules-layout" aria-labelledby="rules-heading">
      <aside className="rules-directory">
        <h2 id="rules-heading">{tx.rulesHeading}</h2>
        <nav aria-labelledby="rules-heading">
          {tx.sections.map((block, index) => <a key={block.id} href={`#${block.id}`}><WarcraftSigil kind={sigils[index]}/><span>{block.title}</span></a>)}
          <a href="#sanciones" className="rules-sanctions-link"><WarcraftSigil kind="shield"/><span>{tx.sanctionsTitle}</span></a>
        </nav>
      </aside>
      <div className="rules-body">
        <div className="rules-scope"><span className="lore-kicker">{tx.scopeLabel}</span><p>{tx.scope}</p></div>
        {tx.sections.map((block, index) => <article className="rules-card" key={block.id} id={block.id} aria-labelledby={`${block.id}-title`}>
          <div className="rules-card-emblem"><WarcraftSigil kind={sigils[index]}/></div>
          <div><h3 id={`${block.id}-title`}>{block.title}</h3><ul>{block.rules.map(rule => <li key={rule}>{rule}</li>)}</ul></div>
        </article>)}
        <article className="rules-sanctions" id="sanciones" aria-labelledby="sanctions-title">
          <span className="lore-kicker">BLACKOUT-WOW</span><h3 id="sanctions-title">{tx.sanctionsTitle}</h3>
          <p>{tx.sanctionsIntro}</p><ul>{tx.sanctions.map(rule => <li key={rule}>{rule}</li>)}</ul>
        </article>
        <aside className="rules-note"><strong>{tx.disclaimer}</strong><p>{tx.end}</p></aside>
      </div>
    </section>
  </SiteShell>;
}
