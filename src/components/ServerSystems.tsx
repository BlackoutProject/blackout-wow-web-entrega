"use client";

import { useId, useState } from "react";
import { WarcraftSigil } from "./WarcraftSigil";
import { GameplayGallery } from "./GameplayGallery";

const sigils = ["rune", "orb", "banner", "chest", "leaf", "key", "shield"] as const;
const topics = ["aio", "paragon", "battle-pass", "transmog", "druid", "mall", "convenience"] as const;

/** The selector presents the existing server copy, without simulated game UI. */
export function ServerSystems({ items, label }: {
  items: readonly { title: string; text: string; facts?: readonly { value: string; label: string }[]; steps?: readonly { title: string; text: string }[] }[];
  label: string;
}) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  return <div className={`wc-system-browser wc-system-selected-${selected}`}>
    <div className="wc-system-select">
      <select aria-label={label} value={selected} onChange={event => setSelected(Number(event.target.value))}>
        {items.map((item, index) => <option key={item.title} value={index}>{item.title}</option>)}
      </select>
      <span aria-hidden="true">⌄</span>
    </div>
    <div className="wc-system-tabs" role="tablist" aria-label={label} aria-orientation="vertical">
      {items.map((item, index) => <button
        key={item.title}
        id={`${id}-tab-${index}`}
        type="button"
        role="tab"
        aria-selected={selected === index}
        aria-controls={`${id}-panel-${index}`}
        tabIndex={selected === index ? 0 : -1}
        onClick={() => setSelected(index)}
        onKeyDown={event => {
          const next = event.key === "ArrowDown" ? (index + 1) % items.length
            : event.key === "ArrowUp" ? (index + items.length - 1) % items.length
            : event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : null;
          if (next === null) return;
          event.preventDefault();
          setSelected(next);
          event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus({ preventScroll: true });
        }}
      ><span className="wc-system-tab-icon" aria-hidden="true"><WarcraftSigil kind={sigils[index]}/></span><span>{item.title}</span><b aria-hidden="true">›</b></button>)}
    </div>
    <div className="wc-system-panels">
      {items.map((item, index) => <article
        key={item.title}
        id={`${id}-panel-${index}`}
        role="tabpanel"
        aria-labelledby={`${id}-title-${index}`}
        hidden={selected !== index}
        tabIndex={0}
        className="wc-system-panel"
      ><div className="wc-system-insignia" aria-hidden="true"><WarcraftSigil kind={sigils[index]}/></div><h3 id={`${id}-title-${index}`}>{item.title}</h3><p>{item.text}</p>
        {item.facts && <dl className="wc-system-facts">{item.facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>}
        {item.steps && <ol className="wc-system-journey">{item.steps.map((step, stepIndex) => <li key={step.title}>
          <span className="wc-journey-node" aria-hidden="true"><WarcraftSigil kind={index === 1 ? (["swords", "key", "orb"] as const)[stepIndex] : stepIndex === 0 ? "banner" : "chest"}/></span>
          <div><h4>{step.title}</h4><p>{step.text}</p></div>
        </li>)}</ol>}
        {selected === index && <GameplayGallery topic={topics[index]}/>}
        <span className="wc-system-rule" aria-hidden="true"/></article>)}
    </div>
  </div>;
}
