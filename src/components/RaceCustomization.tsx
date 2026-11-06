"use client";

import { useTranslation } from "react-i18next";
import { WarcraftSigil } from "./WarcraftSigil";

// Localized names: Blizzard's /es-es/game/races and /pt-br/game/races.
// Only names are used; Blackout offers these appearances through morphs.
const appearances = {
  es: ["Elfo del Vacío", "Mecagnomo", "Dracthyr", "Humano de Kul Tiras", "Pandaren", "Enano Hierro Negro", "Draenei forjado por la Luz", "Nocheterna", "Vulpera", "Trol Zandalari", "Orco Mag’har", "Tauren Monte Alto"],
  en: ["Void Elf", "Mechagnome", "Dracthyr", "Kul Tiran", "Pandaren", "Dark Iron Dwarf", "Lightforged Draenei", "Nightborne", "Vulpera", "Zandalari Troll", "Mag’har Orc", "Highmountain Tauren"],
  pt: ["Elfo Caótico", "Gnomecânico", "Dracthyr", "Kultireno", "Pandaren", "Anão Ferro Negro", "Draenei Forjado a Luz", "Filhos da Noite", "Vulpera", "Troll Zandalari", "Orc Mag’har", "Tauren Altamontês"],
};
const copy = {
  es: {
    eyebrow: "TU PERSONAJE · TU IDENTIDAD",
    title: "Una apariencia a tu medida.",
    racesTitle: "Más personalización para las razas de WotLK",
    racesText: "Dale tu estilo a las razas originales de WotLK con diseños custom y más opciones de apariencia que en el cliente original.",
    morphsTitle: "16 apariencias raciales jugables",
    morphsText: "Usa un objeto de morph custom para adoptar la apariencia de otra raza, como pandaren, y jugar con ella. Estas transformaciones visuales se aplican a tu personaje y son independientes de la raza base que eliges al crearlo.",
    more: "y más…",
  },
  en: {
    eyebrow: "YOUR CHARACTER · YOUR IDENTITY",
    title: "Make your appearance your own.",
    racesTitle: "Expanded customization for WotLK races",
    racesText: "Give the original WotLK races your own style with custom designs and more appearance options than the original client offers.",
    morphsTitle: "16 playable racial appearances",
    morphsText: "Use a custom morph item to take on another race’s appearance, such as pandaren, and play with it. These visual transformations apply to your character independently of the base race you choose at character creation.",
    more: "and more…",
  },
  pt: {
    eyebrow: "SEU PERSONAGEM · SUA IDENTIDADE",
    title: "Uma aparência do seu jeito.",
    racesTitle: "Mais personalização para as raças de WotLK",
    racesText: "Dê seu estilo às raças originais de WotLK com designs custom e mais opções de aparência do que no cliente original.",
    morphsTitle: "16 aparências raciais jogáveis",
    morphsText: "Use um item de morph custom para adotar a aparência de outra raça, como pandaren, e jogar com ela. Essas transformações visuais são aplicadas ao personagem e são independentes da raça base escolhida na criação.",
    more: "e mais…",
  },
};

export function RaceCustomization() {
  const { i18n } = useTranslation();
  const language = i18n.language as keyof typeof copy;
  const c = copy[language] ?? copy.es;
  const names = appearances[language] ?? appearances.es;
  return (
    <section className="lore-customization" id="razas-y-morphs" aria-labelledby="customization-title">
      <header><span className="lore-kicker">{c.eyebrow}</span><h2 id="customization-title">{c.title}</h2></header>
      <div className="lore-customization-grid">
        <article><span className="server-emblem"><WarcraftSigil kind="mask"/></span><h3>{c.racesTitle}</h3><p>{c.racesText}</p></article>
        <article><span className="server-emblem"><WarcraftSigil kind="rune"/></span><h3>{c.morphsTitle}</h3><p>{c.morphsText}</p><ul>{names.map(name => <li key={name}>{name}</li>)}<li className="lore-customization-more">{c.more}</li></ul></article>
      </div>
    </section>
  );
}
