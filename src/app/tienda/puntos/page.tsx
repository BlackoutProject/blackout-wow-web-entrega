"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteShell } from "@/components/SiteShell";
import { StoreContact } from "@/components/StoreContact";
import { useAuth } from "@/context/AuthContext";
import { apiJson } from "@/lib/api";
import { CATEGORY_FILTER_ALL } from "@/lib/store-category-filter";

type RewardProduct = {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  imageUrl: string | null;
  costPoints: number;
  deliveryType?: string;
};

type RewardCatalogResponse = {
  products: RewardProduct[];
  pointsBalance: number;
};

type CharacterOption = {
  id: number;
  name: string;
  level: number;
};

type RedeemResponse = {
  message: string;
  pointsBalance: number;
};

function imageForReward(category: string) {
  const c = category.toLowerCase();
  if (c.includes("monturas")) return "/images/store/reward-mounts.svg";
  if (c.includes("servicios")) return "/images/store/reward-services.svg";
  return "/images/store/reward-general.svg";
}

function resolveRewardImage(imageUrl: string | null, category: string) {
  const candidate = imageUrl?.trim();
  if (!candidate) return imageForReward(category);
  if (candidate.startsWith("/") || candidate.startsWith("http://") || candidate.startsWith("https://")) {
    return candidate;
  }
  return imageForReward(category);
}

export default function RewardShopPage() {
  const { t } = useTranslation();
  const ITEMS_PER_PAGE = 6;
  const { accessToken, isAuthReady } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<RewardProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(CATEGORY_FILTER_ALL);
  const [page, setPage] = useState(1);
  const [characters, setCharacters] = useState<CharacterOption[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!accessToken) {
      router.replace(`/login?next=${encodeURIComponent("/tienda/puntos")}`);
      return;
    }
    (async () => {
      setCatalogLoading(true);
      try {
        const data = await apiJson<RewardCatalogResponse>("/api/v1/rewards/products", {
          token: accessToken,
        });
        const chars = await apiJson<CharacterOption[]>("/api/v1/me/characters", {
          token: accessToken,
        });
        setProducts(data.products);
        setPointsBalance(data.pointsBalance);
        setCharacters(chars);
        setSelectedCharacterId(chars.length > 0 ? chars[0].id : null);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("common.error"));
      } finally {
        setCatalogLoading(false);
      }
    })();
  }, [isAuthReady, accessToken, router, t]);

  const categories = useMemo(() => {
    const all = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean)),
    );
    return [CATEGORY_FILTER_ALL, ...all];
  }, [products]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const byCategory =
        category === CATEGORY_FILTER_ALL || p.category === category;
      const bySearch =
        term.length === 0 ||
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        (p.description ?? "").toLowerCase().includes(term);
      return byCategory && bySearch;
    });
  }, [products, search, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  async function redeem(rewardProductId: number) {
    if (!accessToken) return;
    if (!selectedCharacterId) {
      setError(t("store.redeem.errPickChar"));
      return;
    }
    setBusyId(rewardProductId);
    setError(null);
    setMsg(null);
    try {
      const data = await apiJson<RedeemResponse>("/api/v1/rewards/redeem", {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ rewardProductId, characterId: selectedCharacterId }),
      });
      setPointsBalance(data.pointsBalance);
      setMsg(data.message);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : t("store.redeem.errRedeem"),
      );
    } finally {
      setBusyId(null);
    }
  }

  if (!isAuthReady || !accessToken) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-zinc-400">
          {!isAuthReady ? t("account.loadingSession") : t("account.redirecting")}
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-4 py-16">
        <Link href="/cuenta" className="account-back-link"><span aria-hidden="true">←</span> {t("nav.account")}</Link>
        <div className="store-introduction border p-6 md:p-8">
          <h1 className="font-display text-3xl font-semibold text-zinc-50">
            {t("store.redeem.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            {t("store.redeem.subtitle")}
          </p>
          <div className="mt-5 grid gap-3 text-xs text-zinc-300 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <span className="text-amber-300">{t("store.redeem.step1Label")}</span>{" "}
              {t("store.redeem.step1")}
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <span className="text-amber-300">{t("store.redeem.step2Label")}</span>{" "}
              {t("store.redeem.step2")}
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <span className="text-amber-300">{t("store.redeem.step3Label")}</span>{" "}
              {t("store.redeem.step3")}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-amber-400/30 bg-amber-950/20 p-4">
            <p className="text-xs uppercase tracking-widest text-amber-300/80">
              {t("store.redeem.balanceLabel")}
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-200">
              {pointsBalance} {t("store.redeem.balanceSuffix")}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {t("store.redeem.balanceHint")}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-4">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              {t("store.redeem.charLabel")}
            </p>
            <div className="mt-2">
              <select
                aria-label={t("store.redeem.charLabel")}
                value={selectedCharacterId ?? ""}
                onChange={(e) => setSelectedCharacterId(e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded border border-white/15 bg-black/50 px-3 py-2 text-zinc-100 outline-none focus:border-amber-500/60"
              >
                {characters.length === 0 && (
                  <option value="">{t("store.redeem.charNone")}</option>
                )}
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {t("store.redeem.characterOption", {
                      name: c.name,
                      level: c.level,
                    })}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {t("store.redeem.charHint")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-xl border border-white/10 bg-zinc-950/60 p-4 md:grid-cols-[2fr_1fr]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("store.redeem.searchPlaceholder")}
            aria-label={t("store.redeem.searchPlaceholder")}
            className="w-full rounded border border-white/15 bg-black/50 px-3 py-2 text-zinc-100 outline-none focus:border-amber-500/60"
          />
          <select
            aria-label={t("store.redeem.allCategories")}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded border border-white/15 bg-black/50 px-3 py-2 text-zinc-100 outline-none focus:border-amber-500/60"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === CATEGORY_FILTER_ALL
                  ? t("store.redeem.allCategories")
                  : c}
              </option>
            ))}
          </select>
        </div>

        {msg && <p className="mt-6 text-emerald-400">{msg}</p>}
        {error && <p className="mt-6 text-red-400">{error}</p>}
        {!error && !catalogLoading && filtered.length > 0 && (
          <p className="mt-4 text-sm text-zinc-500">
            {t("store.redeem.showingLine", {
              count: filtered.length,
              category:
                category === CATEGORY_FILTER_ALL
                  ? t("store.redeem.allCategories")
                  : category,
            })}
          </p>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((p) => {
            const canRedeem = pointsBalance >= p.costPoints;
            return (
              <div key={p.id} className="store-card overflow-hidden rounded-xl border border-white/10 bg-zinc-950/70">
                <div className="relative h-44 w-full">
                  <Image
                    src={resolveRewardImage(p.imageUrl, p.category)}
                    alt={p.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/20" />
                  <p className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-xs uppercase tracking-wider text-zinc-100">
                    {p.category}
                  </p>
                </div>
                <div className="flex h-[280px] flex-col p-5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-sky-300/80">
                    {t("store.donation.sku")}: {p.sku}
                  </p>
                  <h2 className="font-display line-clamp-2 wrap-break-word text-lg font-semibold text-sky-200">{p.name}</h2>
                  <p className="mt-2 flex-1 line-clamp-3 wrap-break-word text-sm text-zinc-400">{p.description}</p>
                  <div className="mt-3">
                    <span className="rounded-full border border-amber-400/35 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                      {p.deliveryType ?? t("store.redeem.deliveryReward")}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xl font-bold text-amber-300">
                      {p.costPoints} {t("store.donation.points")}
                    </p>
                    <button
                      type="button"
                      disabled={busyId === p.id || !canRedeem}
                      onClick={() => redeem(p.id)}
                      className="blackout-action rounded px-4 py-2 text-sm font-semibold disabled:opacity-50"
                    >
                      {busyId === p.id
                        ? t("store.redeem.redeeming")
                        : canRedeem
                          ? t("store.redeem.redeemBtn")
                          : t("store.redeem.notEnoughBalance")}
                    </button>
                  </div>
                  {!canRedeem && (
                    <p className="mt-2 text-xs text-red-300/80">
                      {t("store.redeem.needMoreHint")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {!error && (catalogLoading || filtered.length === 0) && (
          <p role="status" className="store-empty mt-8 text-center text-sm text-zinc-500">
            {t(catalogLoading ? "store.donation.loadingCatalog" : products.length === 0 ? "store.redeem.emptyCatalog" : "store.redeem.noFilter")}
          </p>
        )}
        {filtered.length > ITEMS_PER_PAGE && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="blackout-control rounded border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              {t("store.donation.prev")}
            </button>
            <p className="text-sm text-zinc-400">
              {t("store.donation.pageOf", { page, pages: totalPages })}
            </p>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="blackout-control rounded border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              {t("store.donation.next")}
            </button>
          </div>
        )}

        <div className="mt-10">
          <Link href="/tienda" className="text-sky-300 hover:underline">
            {t("store.redeem.backShop")}
          </Link>
        </div>
        <StoreContact />
      </div>
    </SiteShell>
  );
}
