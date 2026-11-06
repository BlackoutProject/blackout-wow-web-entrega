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


type Product = {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  imageUrl: string | null;
  priceUsd: number;
  donationPoints: number;
};

type ProductListResponse = { products: Product[] };

function imageForProduct(category: string) {
  if (category.toLowerCase().includes("puntos")) return "/images/store/donation-points.svg";
  return "/images/store/donation-points.svg";
}

export default function ShopPage() {
  const { t } = useTranslation();
  const ITEMS_PER_PAGE = 6;
  const { accessToken, isAuthReady } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(CATEGORY_FILTER_ALL);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!accessToken) {
      router.replace(`/login?next=${encodeURIComponent("/tienda")}`);
    }
  }, [isAuthReady, accessToken, router]);

  useEffect(() => {
    if (!isAuthReady || !accessToken) return;
    (async () => {
      setCatalogLoading(true);
      try {
        const r = await apiJson<ProductListResponse>("/api/v1/shop/products");
        setProducts(r.products);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("common.error"));
      } finally {
        setCatalogLoading(false);
      }
    })();
  }, [isAuthReady, accessToken, t]);

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

  async function buy(productId: number) {
    if (!accessToken) {
      router.replace(`/login?next=${encodeURIComponent("/tienda")}`);
      return;
    }
    setBusyId(productId);
    setError(null);
    try {
      const r = await apiJson<{ approvalUrl: string; paypalOrderId: string }>("/api/v1/shop/orders", {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ productId }),
      });
      if (typeof window !== "undefined" && r.paypalOrderId) {
        sessionStorage.setItem("blackout_pending_paypal", r.paypalOrderId);
      }
      if (typeof window !== "undefined") {
        window.location.assign(r.approvalUrl);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
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
        <div className="store-introduction relative overflow-hidden border p-6 md:p-8">
          <div className="relative z-10">
          <h1 className="font-display text-3xl font-semibold text-zinc-50">
            {t("store.donation.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            {t("store.donation.subtitle")}
          </p>
          </div>
        </div>
        <p className="mt-3 text-sm text-zinc-400">
          {t("store.donation.hasPointsLead")}{" "}
          <Link href="/tienda/puntos" className="text-amber-300 hover:underline">
            {t("store.donation.redeemShop")}
          </Link>
          .
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-[2fr_1fr]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("store.donation.searchPlaceholder")}
            aria-label={t("store.donation.searchPlaceholder")}
            className="w-full rounded border border-white/15 bg-black/50 px-3 py-2 text-zinc-100 outline-none focus:border-sky-500/60"
          />
          <select
            aria-label={t("store.donation.allCategories")}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded border border-white/15 bg-black/50 px-3 py-2 text-zinc-100 outline-none focus:border-sky-500/60"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === CATEGORY_FILTER_ALL
                  ? t("store.donation.allCategories")
                  : c}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="mt-6 text-red-400">{error}</p>}
        {!error && filtered.length > 0 && (
          <p className="mt-4 text-sm text-zinc-500">
            {t("store.donation.showingCount", {
              count: filtered.length,
            })}
          </p>
        )}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((p) => (
            <div
              key={p.id}
              className="store-card metal-border overflow-hidden rounded-xl border border-white/10 bg-zinc-950/70"
            >
              <div className="relative h-44 w-full">
                <Image src={p.imageUrl || imageForProduct(p.category)} alt={p.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/20" />
                <p className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-xs uppercase tracking-wider text-zinc-100">
                  {p.category}
                </p>
              </div>
              <div className="flex h-[270px] flex-col p-5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-sky-300/80">
                  {t("store.donation.sku")}: {p.sku}
                </p>
                <h2 className="font-display line-clamp-2 wrap-break-word text-lg font-semibold text-amber-300">{p.name}</h2>
                <p className="mt-2 flex-1 line-clamp-3 wrap-break-word text-sm text-zinc-400">{p.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-amber-300">
                    {p.donationPoints} {t("store.donation.points")}
                  </p>
                  <span className="rounded-full border border-sky-400/35 bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-200">
                    {t("store.donation.autoDelivery")}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-2xl font-bold text-sky-200">${p.priceUsd}</p>
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => buy(p.id)}
                    className="blackout-action rounded px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    {busyId === p.id
                      ? t("store.donation.redirecting")
                      : t("store.donation.buy")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {!error && (catalogLoading || filtered.length === 0) && (
          <p role="status" className="store-empty mt-8 text-center text-sm text-zinc-500">
            {t(catalogLoading ? "store.donation.loadingCatalog" : products.length === 0 ? "store.donation.emptyCatalog" : "store.donation.noProducts")}
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
        <StoreContact />
      </div>
    </SiteShell>
  );
}
