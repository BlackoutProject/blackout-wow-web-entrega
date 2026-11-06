"use client";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { SiteShell } from "./SiteShell";
import { warcraftCopy } from "@/lib/warcraft-copy";
import { homeOverviewCopy } from "@/lib/home-overview-copy";
import { steelHomeCopy } from "@/lib/steel-home-copy";
import { BlackoutHero } from "./BlackoutHero";
import { SupportShowcase } from "./SupportShowcase";
import { DiscordCommunity } from "./DiscordCommunity";
import { HomeTrailer } from "./HomeTrailer";
import { ArrowRight } from "@phosphor-icons/react";
import { HomeFeatureShowcase } from "./HomeFeatureShowcase";
import { GameplayGallery } from "./GameplayGallery";
import { HomeBattles } from "./HomeBattles";
import worldStyles from "./HomeWorld.module.css";

function HeadingLines({ text }: { text: string }) { return <>{text.split("\n").map((line,index) => <span key={index} className={`wc-heading-line${index ? " wc-heading-accent" : ""}`}>{line}{" "}</span>)}</>; }

export default function WarcraftHome() {
  const { i18n } = useTranslation();
  const c = warcraftCopy[i18n.language as keyof typeof warcraftCopy] ?? warcraftCopy.es;
  const overview = homeOverviewCopy[i18n.language as keyof typeof homeOverviewCopy] ?? homeOverviewCopy.es;
  const steel = steelHomeCopy[i18n.language as keyof typeof steelHomeCopy] ?? steelHomeCopy.es;
  const highlights = overview.highlights.map((item, index) => ({ ...item, title: [steel.classesTitle,steel.systemsTitle,steel.characterTitle][index], text: [steel.classesText, steel.systemsText, steel.characterText][index] }));
  return <SiteShell>
    <BlackoutHero />
    <HomeTrailer />
    <section className={`${worldStyles.world} wc-section wc-home-overview`} id="reino" aria-labelledby="world-title">
      <div className="wc-wrap">
        <header className={worldStyles.heading}><p className="wc-kicker">{overview.overviewTag}</p><h2 id="world-title"><HeadingLines text={steel.worldTitle}/></h2><p>{overview.overviewIntro}</p></header>
        <HomeBattles copy={overview}/>
        <HomeFeatureShowcase items={highlights} labels={[overview.serverSections[0],overview.serverSections[4],overview.serverSections[5]]} action={c.details} navigationLabel={overview.serverNavigation}/>
        <div className={worldStyles.invitation}><div><h3>{overview.detailsTitle}</h3><p>{steel.guideText}</p></div><Link className="wc-button" href="/servidor">{overview.detailsLink}<ArrowRight size={20} aria-hidden="true"/></Link></div>
        <GameplayGallery topic="collection" featured/>
      </div>
    </section>
    <DiscordCommunity />
    <SupportShowcase />
  </SiteShell>;
}
