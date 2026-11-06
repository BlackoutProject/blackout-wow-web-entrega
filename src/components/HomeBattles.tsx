import Link from "next/link";
import { WarcraftSigil } from "./WarcraftSigil";
import { AmbientVideo } from "./WarcraftMotion";
import { homeOverviewCopy } from "@/lib/home-overview-copy";
import styles from "./HomeWorld.module.css";

const battleFilms = {
  pve: { src: "/warcraft/scene-boss-hd.mp4", poster: "/warcraft/scene-boss-hd-poster.webp" },
  pvp: { src: "/warcraft/home-pvp.mp4", poster: "/warcraft/home-pvp-poster.webp" },
};

export function HomeBattles({ copy }: { copy: typeof homeOverviewCopy.es }) {
  return <div className={styles.battles}>
    <div className={styles.battleGrid}>{(["pve", "pvp"] as const).map(mode => <article key={mode} className={`${styles.battle} wc-battle-scene`} data-mode={mode}>
      <div className={styles.battleArt}><AmbientVideo className={styles.film} {...battleFilms[mode]}/></div>
      <div className={styles.battleCopy}>
        <span className={styles.battleTag}><WarcraftSigil kind={mode === "pve" ? "shield" : "swords"}/>{mode.toUpperCase()}</span>
        <h3>{copy[mode === "pve" ? "pveTitle" : "pvpTitle"].split("\n").map((line,index) => <span key={index}>{line}{" "}</span>)}</h3>
        <p>{copy[mode === "pve" ? "pveText" : "pvpText"]}</p>
        <Link className={styles.battleLink} href={`/servidor#${mode}`}>{copy[mode === "pve" ? "pveLink" : "pvpLink"]}<b aria-hidden="true">→</b></Link>
      </div>
      <span className={styles.battleFrame} aria-hidden="true"><i/><i/><i/><i/></span>
    </article>)}</div>
    <dl className={`wc-path-facts ${styles.realmFacts}`}>{["35", "19", "30+"].map((value,index) => <div key={value}><dt>{copy.pveFacts[index]}{index === 1 && <small>{copy.customRaidsNote}</small>}</dt><dd>{value}</dd></div>)}</dl>
  </div>;
}
