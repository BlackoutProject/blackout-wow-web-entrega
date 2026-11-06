type SigilKind = "rune" | "shield" | "swords" | "orb" | "mask" | "chest" | "leaf" | "key" | "banner";

/** Small decorative emblems, kept as vectors so they stay crisp at every size. */
export function WarcraftSigil({ kind = "rune", className = "" }: { kind?: SigilKind; className?: string }) {
  return <svg className={`wc-sigil ${className}`} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "rune" && <><path d="m32 5 20 27-20 27L12 32Z"/><path d="m32 15 12 17-12 17-12-17Zm0-10v10m0 34v10M5 32h15m24 0h15"/><circle cx="32" cy="32" r="5"/></>}
    {kind === "shield" && <><path d="m32 5 22 9-3 24c-2 10-13 18-19 21-6-3-17-11-19-21l-3-24Z"/><path d="m32 12 15 6-3 20c-1 6-7 12-12 15-5-3-11-9-12-15l-3-20Z"/><path d="m32 19 4 10 11 2-9 7 2 10-8-6-8 6 2-10-9-7 11-2Z"/></>}
    {kind === "swords" && <><path d="M10 6 9 17l32 32 7-7-32-32ZM54 6l1 11-32 32-7-7 32-32Z"/><path d="m36 48 12-12m-32 0 12 12M43 47l10 10m-32-10L11 57M49 59l9-9M6 50l9 9"/></>}
    {kind === "orb" && <><circle cx="32" cy="32" r="16"/><ellipse cx="32" cy="32" rx="29" ry="10" transform="rotate(-32 32 32)"/><path d="m32 9 3 16 6 7-6 7-3 16-3-16-6-7 6-7ZM9 9l3 3m40 40 3 3M9 55l3-3m40-40 3-3"/></>}
    {kind === "mask" && <><path d="m12 12 20 7 20-7-4 28-16 17-16-17Z"/><path d="m12 12 7 16 13-9 13 9 7-16M20 32l8 5m8 0 8-5m-12-5-5 16h10m-12 5h14"/></>}
    {kind === "chest" && <><path d="M8 30h48v24H8Zm0 0V18c0-8 48-8 48 0v12M18 12v42m28-42v42M8 37h48"/><path d="M27 29h10v16H27Z"/><circle cx="32" cy="35" r="1"/></>}
    {kind === "leaf" && <><path d="M50 8C26 7 8 21 12 40c4 19 33 17 38-32ZM12 55l28-32M21 46l-2-17m9 10 14-1M28 39l-1-16"/></>}
    {kind === "key" && <><circle cx="22" cy="22" r="15"/><path d="m32 33 24 24M41 42l8-8m-1 15 8-8M15 22l7-7 7 7-7 7Z"/></>}
    {kind === "banner" && <><path d="M13 60V6m0 5h39l-8 13 8 14H13M7 6h12M9 60h8"/><path d="m29 16 9 8-9 8-7-8Z"/></>}
  </svg>;
}
