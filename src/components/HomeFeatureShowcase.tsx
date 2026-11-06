import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { AmbientVideo } from "./WarcraftMotion";
import styles from "./HomeFeatureShowcase.module.css";

type Feature = { title: string; text: string; href: string };
const artwork = ["/warcraft/feature-champion-poster.webp", "/warcraft/feature-wardrobe-poster.webp", "/warcraft/customization-maghar.png"];
const films = ["/warcraft/feature-champion.mp4", "/warcraft/feature-wardrobe.mp4"];

/** Home offers a short introduction. Class selection and mechanics live in the server guide. */
export function HomeFeatureShowcase({ items, labels, action, navigationLabel }: {
  items: Feature[]; labels: string[]; action: string; navigationLabel: string;
}) {
  return <div className={`${styles.root} wc-feature-showcase`} aria-label={navigationLabel}>
    {items.map((item, index) => <article key={item.href} className={`${styles.card} wc-home-feature`} data-feature={index}>
      <div className={styles.art} aria-hidden="true">{films[index]
        ? <AmbientVideo src={films[index]} poster={artwork[index]}/>
        : <Image src={artwork[index]} alt="" fill sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 400px" quality={95}/>}</div>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{labels[index]}</p>
        <h3>{item.title.split("\n").map((line, lineIndex) => <span key={lineIndex}>{line}{" "}</span>)}</h3>
        <p className={styles.description}>{item.text}</p>
        <Link className={styles.action} href={item.href} aria-label={`${action}: ${labels[index]}`}><span>{action}</span><ArrowUpRight size={20} aria-hidden="true"/></Link>
      </div>
      <span className={styles.frame} aria-hidden="true"><i/><i/><i/><i/></span>
    </article>)}
  </div>;
}
