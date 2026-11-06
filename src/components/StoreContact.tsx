"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { DISCORD_INVITE_URL } from "@/lib/site-config";
import { storeShowcaseCopy } from "@/lib/store-showcase-copy";

/** A useful next step even when the live shop has no published products. */
export function StoreContact() {
  const { accessToken } = useAuth();
  const { i18n } = useTranslation();
  const c = storeShowcaseCopy[i18n.language as keyof typeof storeShowcaseCopy] ?? storeShowcaseCopy.es;
  if (!accessToken) return null;
  return <aside className="store-contact">
    <Link className="store-contact-options" href="/cuenta#donor">VIP &amp; DONOR <span aria-hidden="true">↗</span></Link>
    <div><p>{c.helpText}</p><a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">{c.helpLink} <span aria-hidden="true">↗</span></a></div>
  </aside>;
}
