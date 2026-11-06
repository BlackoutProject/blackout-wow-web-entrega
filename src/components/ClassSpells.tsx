"use client";

import { useTranslation } from "react-i18next";
import { classSpellsCopy } from "@/lib/class-spells-copy";
import { WarcraftSigil } from "./WarcraftSigil";

const expansions = ["Cataclysm", "MoP", "WoD", "Legion", "BfA", "Shadowlands", "Dragonflight", "The War Within"];

export function ClassSpells() {
  const { i18n } = useTranslation();
  const c = classSpellsCopy[i18n.language as keyof typeof classSpellsCopy] ?? classSpellsCopy.es;
  return (
    <section className="class-spells" id="hechizos-custom" aria-labelledby="spells-title">
      <div className="wc-spell-seal" aria-hidden="true"><WarcraftSigil kind="orb"/></div>
      <div className="class-spells-intro">
        <span className="lore-kicker">{c.eyebrow}</span>
        <h2 id="spells-title">{c.title}<br/><em>{c.accent}</em></h2>
        <p>{c.description}</p>
      </div>
      <ul className="class-spells-classes" aria-label={c.classesLabel}>
        {c.classes.map(name => (
          <li key={name}><span aria-hidden="true">◆</span>{name}</li>
        ))}
      </ul>
      <div className="class-spells-origins">
        <span className="lore-kicker">{c.origin}</span>
        <p>{expansions.join(" · ")} <em>· {c.more}</em></p>
      </div>
    </section>
  );
}
