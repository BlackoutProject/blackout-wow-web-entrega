"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ClassSpells } from "./ClassSpells";
import { RaceCustomization } from "./RaceCustomization";
import { ClassShowcase } from "./ClassShowcase";
import { SiteShell } from "./SiteShell";
import { serverCopy } from "@/lib/server-copy";
import { warcraftCopy } from "@/lib/warcraft-copy";
import { homeOverviewCopy } from "@/lib/home-overview-copy";
import { serverGuideCopy } from "@/lib/server-guide-copy";
import { DISCORD_INVITE_URL } from "@/lib/site-config";
import { WarcraftSigil } from "./WarcraftSigil";
import { ServerSystems } from "./ServerSystems";
import { PageSectionNav } from "./PageSectionNav";
import { BattleArtwork } from "./BattleArtwork";
import battles from "./ServerBattles.module.css";

export default function ServerContent() {
  const { i18n } = useTranslation();
  const language = i18n.language as keyof typeof serverCopy;
  const c = serverCopy[language] ?? serverCopy.es;
  const profile = warcraftCopy[language] ?? warcraftCopy.es;
  const overview = homeOverviewCopy[language] ?? homeOverviewCopy.es;
  const guide = serverGuideCopy[language] ?? serverGuideCopy.es;
  const sectionIds = ["clases", "hechizos-custom", "progresion", "experiencia", "sistemas", "razas-y-morphs", "preguntas"];
  return (
    <SiteShell>
      <section className="lore-hero server-hero">
        <span className="lore-kicker">{c.eyebrow}</span>
        <h1>{c.title}<br /><em>{c.accent}</em></h1>
        <p>{c.intro}</p>
        <p className="wc-realm-profile">{profile.realmProfile}</p>
        <div className="lore-actions">
          <Link className="lore-button" href="/registro">{c.join}<span aria-hidden="true">↗</span></Link>
          <Link href="/como-conectarme">{c.download} →</Link>
        </div>
      </section>
      <section className="lore-container server-overview">
        <div className="lore-stats">
          {["255", "35", "19", "30+"].map((value, index) => (
            <div key={value}><strong>{value}</strong><span>{c.labels[index]}</span>{index === 2 && <small>{c.customRaidsNote}</small>}</div>
          ))}
        </div>
      </section>
      <PageSectionNav label={overview.serverNavigation} items={overview.serverSections.map((label, index) => ({ id: sectionIds[index], label }))}/>
      <ClassShowcase />
      <section className="lore-container server-spells">
        <ClassSpells />
        <p className="server-build-note">{c.features[2].items[1]}</p>
      </section>
      <section className="lore-container server-progression" id="progresion" aria-labelledby="progression-title">
        <header className="lore-heading"><span className="lore-kicker">{guide.progressionTag}</span><h2 id="progression-title">{guide.progressionTitle}</h2><p>{guide.progressionIntro}</p></header>
        <div className="server-progression-grid">{guide.progressionItems.map((item,index) => <article key={item.title}><span className="server-emblem"><WarcraftSigil kind={(["shield", "swords", "key"] as const)[index]}/></span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </section>
      <section className="lore-container server-experience" id="experiencia">
        <div className="lore-heading"><h2>{c.experience}</h2></div>
        <div className={battles.grid}>
          {c.features.slice(0, 2).map((feature, index) => (
            <article className={battles.card} id={["pve", "pvp"][index]} key={feature.tag}>
              <div className={battles.art}><BattleArtwork scene={index === 0 ? "ulduar" : "factions"}/></div>
              <div className={battles.copy}>
              <span className="lore-kicker">{feature.tag}</span>
              <h3>{feature.title}</h3>
              <p className="server-feature-description">{index === 0 ? guide.pveIntro : guide.pvpIntro}</p>
              {index === 1 && <ul>{feature.items.map(item => <li key={item}>{item}</li>)}</ul>}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="wc-section server-systems" id="sistemas" aria-labelledby="systems-title">
        <Image className="server-systems-art" src="/warcraft/high-resolution/guardians-original.jpg" fill sizes="(max-width: 600px) 240vw, 100vw" quality={95} alt=""/>
        <div className="wc-wrap">
          <header className="server-systems-heading">
            <p className="wc-kicker">{c.features[3].tag}</p>
            <h2 id="systems-title">{overview.systemsTitle}</h2>
            <p className="wc-section-intro">{guide.systemsIntro}</p>
          </header>
          <ServerSystems items={guide.systems} label={overview.serverSections[4]}/>
          <dl className="server-collections">{guide.collections.map((item, index) => <div key={item.label}>
            <dt><span className="server-collection-emblem" aria-hidden="true"><WarcraftSigil kind={index === 0 ? "shield" : "chest"}/></span>{item.label}</dt><dd>{item.value}</dd>
          </div>)}</dl>
        </div>
      </section>
      <section className="lore-container server-customization">
        <RaceCustomization />
        <p className="server-build-note">{c.features[2].items[3]}</p>
        <section className="server-faq" id="preguntas" aria-labelledby="faq-title">
          <header className="lore-heading"><span className="lore-kicker">{guide.faqTag}</span><h2 id="faq-title">{guide.faqTitle}</h2></header>
          {guide.faq.map(item => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><div><p>{item.answer}</p><Link className="wc-text-link" href={item.href}>{item.link}<b aria-hidden="true">→</b></Link></div></details>)}
        </section>
        <div className="lore-fair">
          <span aria-hidden="true">✧</span>
          <div><h2>{c.fair}</h2><p>{c.fairText}</p></div>
          <Link href="/terminos-y-condiciones">{c.rules} ↗</Link>
        </div>
        <div className="lore-community">
          <span className="lore-kicker">{c.communityTag}</span>
          <h2>{c.community}</h2><p>{c.communityText}</p>
          <div className="lore-actions">
            <Link className="lore-button" href="/registro">{c.join}<span aria-hidden="true">↗</span></Link>
            <Link href="/como-conectarme">{c.download}<span aria-hidden="true"> →</span></Link>
          </div>
          <a className="wc-text-link" href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">{c.discord}<b aria-hidden="true">↗</b></a>
        </div>
      </section>
    </SiteShell>
  );
}
