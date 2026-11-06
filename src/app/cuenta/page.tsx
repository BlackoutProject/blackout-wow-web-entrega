"use client";

import {useDialogFocus} from "@/lib/use-dialog-focus";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteShell } from "@/components/SiteShell";
import { LogoutButton } from "@/components/LogoutButton";
import { StoreShowcase } from "@/components/StoreShowcase";
import { useAuth } from "@/context/AuthContext";
import { apiJson } from "@/lib/api";

type GameAccountSummary = {
  username: string;
  email: string;
  accountId: number;
  portalRole: string;
  online: boolean;
  joinDate: string | null;
  lastLogin: string | null;
  characterCount: number;
  donationPointsBalance: number;
  recentOrders: {
    orderId: number;
    productName: string;
    donationPoints: number;
    status: string;
    paypalOrderId: string | null;
    createdAt: string;
  }[];
};

const statAccents = {
  amber: {
    bar: "from-amber-400/90 to-orange-500/40",
    glow: "bg-amber-500/30",
  },
  emerald: {
    bar: "from-emerald-400/90 to-teal-600/35",
    glow: "bg-emerald-500/25",
  },
  sky: {
    bar: "from-sky-400/90 to-cyan-600/35",
    glow: "bg-sky-500/25",
  },
  zinc: {
    bar: "from-zinc-300/80 to-zinc-600/30",
    glow: "bg-zinc-400/15",
  },
} as const;


function StatCard({
  label,
  accent,
  children,
}: {
  label: string;
  accent: keyof typeof statAccents;
  children: React.ReactNode;
}) {
  const a = statAccents[accent];
  return (
    <div className="account-stat metal-border group relative w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/75 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_12px_28px_rgba(2,6,23,0.42)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_36px_rgba(2,6,23,0.5)] motion-reduce:hover:translate-y-0 sm:p-3.5">
      <div
        className={`pointer-events-none absolute left-5 right-5 top-0 h-[2px] rounded-full bg-linear-to-r ${a.bar}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full ${a.glow} blur-3xl opacity-80 transition-opacity duration-500 group-hover:opacity-100`}
        aria-hidden
      />
      <p className="relative text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <div className="relative mt-1">{children}</div>
    </div>
  );
}

type AccountModalId = "info" | "security" | "orders";

function AccountModal({
  open,
  titleId,
  title,
  subtitle,
  wide,
  closeLabel,
  onClose,
  children,
}: {
  open: boolean;
  titleId: string;
  title: string;
  subtitle?: string;
  wide?: boolean;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useDialogFocus(open, panelRef, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`home-card metal-border relative z-10 flex max-h-[min(92dvh,900px)] w-full flex-col rounded-t-2xl border border-white/12 border-b-0 bg-zinc-950/95 shadow-2xl shadow-black/60 sm:max-h-[85vh] sm:rounded-2xl sm:border-b ${wide ? "sm:max-w-4xl" : "sm:max-w-lg"}`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-display text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-zinc-100"
          >
            {closeLabel}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = useMemo(
    () =>
      i18n.language?.startsWith("en")
        ? "en-US"
        : i18n.language?.startsWith("pt")
          ? "pt-BR"
          : "es-CL",
    [i18n.language],
  );
  const ORDERS_PER_PAGE = 5;
  const { accessToken, isAuthReady } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<GameAccountSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [openModal, setOpenModal] = useState<AccountModalId | null>(null);
  const modalTitleId = useId();

  const totalOrderPages = useMemo(() => {
    if (!data?.recentOrders?.length) return 1;
    return Math.max(1, Math.ceil(data.recentOrders.length / ORDERS_PER_PAGE));
  }, [data]);

  const pagedOrders = useMemo(() => {
    if (!data?.recentOrders?.length) return [];
    const start = (ordersPage - 1) * ORDERS_PER_PAGE;
    return data.recentOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [data, ordersPage]);

  useEffect(() => {
    if (ordersPage > totalOrderPages) {
      setOrdersPage(totalOrderPages);
    }
  }, [ordersPage, totalOrderPages]);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    (async () => {
      try {
        const r = await apiJson<GameAccountSummary>("/api/v1/me/game-account", {
          token: accessToken,
        });
        setData(r);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("common.error"));
      }
    })();
  }, [isAuthReady, accessToken, router, t]);

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordError(null);
    if (!accessToken) {
      setPasswordError(t("account.errSession"));
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(t("account.errPwdShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("account.errPwdMatch"));
      return;
    }

    setSavingPassword(true);
    try {
      const result = await apiJson<{ message?: string }>(
        "/api/v1/auth/change-password",
        {
          method: "POST",
          token: accessToken,
          body: JSON.stringify({ currentPassword, newPassword }),
        },
      );
      setPasswordMsg(result.message ?? t("account.pwdUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setPasswordError(
        e instanceof Error ? e.message : t("account.errPwdSave"),
      );
    } finally {
      setSavingPassword(false);
    }
  }

  const sidebarActionClass = (active: boolean) =>
    [
      "shrink-0 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors lg:w-full",
      active
        ? "border-sky-400/40 bg-sky-950/35 text-sky-100"
        : "border-white/10 bg-zinc-950/65 text-zinc-200 hover:border-white/18 hover:bg-zinc-900/75",
    ].join(" ");

  return (
    <SiteShell>
      <div className="account-content mx-auto max-w-6xl px-4 py-10 md:py-12">
        {/* Sin `home-card`: su regla "> * { z-index:1 }" anulaba z-20 y `absolute`, tapando texto y vídeo */}
        <div className="account-introduction relative isolate flex flex-col">

          <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-3 text-center sm:px-6">
            <h1 className="max-w-xl font-display text-base font-bold tracking-[0.08em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,.95),0_0_28px_rgba(0,0,0,.5)] sm:text-lg md:text-xl">
              {t("account.title")}
            </h1>
            <p className="mt-2 max-w-md font-sans text-[11px] font-medium leading-snug text-zinc-100 [text-shadow:0_2px_8px_rgba(0,0,0,.92)] sm:max-w-lg sm:text-xs sm:leading-relaxed md:text-[0.8125rem]">
              {t("account.heroIntro")}
            </p>
          </div>
        </div>

        {accessToken && <div className="account-toolbar">
          <nav className="account-shortcuts" aria-label={t("account.navShortcuts")}>
            <Link href="/tienda" className="account-donor-link">{t("nav.store")}</Link>
            <Link href="/tienda/puntos" className="account-donor-link">{t("nav.redeem")}</Link>
            <a className="account-donor-link" href="#donor">VIP &amp; DONOR<span aria-hidden="true">↓</span></a>
          </nav>
          <LogoutButton />
        </div>}

        {!isAuthReady && (
          <p className="mt-8 text-zinc-400">{t("account.loadingSession")}</p>
        )}
        {isAuthReady && !accessToken && (
          <p className="mt-8 text-zinc-400">{t("account.redirecting")}</p>
        )}
        {error && <p className="mt-8 text-red-400">{error}</p>}
        {accessToken && data && (
          <>
            <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
              <aside className="account-navigation metal-border order-2 h-fit w-full shrink-0 rounded-2xl border border-white/10 bg-zinc-950/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_12px_28px_rgba(2,6,23,0.38)] lg:sticky lg:order-1 lg:top-24 lg:w-56 lg:self-start lg:p-5">
                <p className="mb-3 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {t("account.panelNavHint")}
                </p>
                <nav
                  className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
                  aria-label={t("account.panelNavHint")}
                >
                  <button
                    type="button"
                    className={sidebarActionClass(openModal === "info")}
                    aria-expanded={openModal === "info"}
                    onClick={() => setOpenModal("info")}
                  >
                    {t("account.navAccountInfo")}
                  </button>
                  <button
                    type="button"
                    className={sidebarActionClass(openModal === "security")}
                    aria-expanded={openModal === "security"}
                    onClick={() => setOpenModal("security")}
                  >
                    {t("account.navSecurity")}
                  </button>
                  <button
                    type="button"
                    className={sidebarActionClass(openModal === "orders")}
                    aria-expanded={openModal === "orders"}
                    onClick={() => setOpenModal("orders")}
                  >
                    {t("account.navPurchases")}
                  </button>
                </nav>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="mb-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    {t("account.navShortcuts")}
                  </p>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/recuperar"
                      className="rounded-lg border border-white/12 px-3 py-2 text-center text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 lg:text-left"
                    >
                      {t("account.recoverAccess")}
                    </Link>
                  </div>
                </div>
              </aside>

              <div className="order-1 min-w-0 flex-1 space-y-6 lg:order-2">
                <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 xl:grid-cols-4">
                  <StatCard label={t("account.statUser")} accent="amber">
                    <p className="truncate font-display text-xs font-medium tracking-tight text-amber-100 sm:text-sm">
                      {data.username}
                    </p>
                  </StatCard>
                  <StatCard label={t("account.statStatus")} accent="emerald">
                    <p
                      className={
                        data.online
                          ? "inline-flex items-center gap-1.5 font-display text-xs font-semibold tracking-tight text-emerald-300 sm:text-sm"
                          : "font-display text-xs font-semibold tracking-tight text-zinc-400 sm:text-sm"
                      }
                    >
                      {data.online && (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50 opacity-75 motion-reduce:hidden" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        </span>
                      )}
                      {data.online ? t("account.online") : t("account.offline")}
                    </p>
                  </StatCard>
                  <StatCard label={t("account.statChars")} accent="sky">
                    <p className="font-display text-lg font-bold tabular-nums text-sky-100 sm:text-xl">
                      {data.characterCount}
                    </p>
                  </StatCard>
                  <StatCard label={t("account.statAccountId")} accent="zinc">
                    <p className="font-mono text-sm font-medium text-zinc-200 sm:text-base">
                      #{data.accountId}
                    </p>
                  </StatCard>
                </div>

                <div className="account-balance metal-border relative shrink-0 overflow-hidden rounded-2xl border border-amber-400/35 bg-linear-to-br from-amber-950/45 via-zinc-950/85 to-zinc-950/90 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_30px_rgba(2,6,23,0.42),0_0_28px_rgba(120,53,15,0.16)] md:flex md:items-center md:justify-between md:gap-8 md:px-5 md:py-3.5">
                  <div
                    className="pointer-events-none absolute -right-8 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-amber-400/12 blur-2xl md:right-12 md:h-32 md:w-32"
                    aria-hidden
                  />
                  <div className="relative z-10 shrink-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/75">
                      {t("account.donationTitle")}
                    </p>
                    <p className="mt-1 font-display text-xl font-bold tracking-tight text-amber-100 md:text-2xl">
                      {data.donationPointsBalance}{" "}
                      <span className="text-sm font-semibold text-amber-200/85 md:text-base">
                        {t("account.donationPoints")}
                      </span>
                    </p>
                  </div>
                  <p className="relative z-10 mt-2 max-w-md text-xs leading-relaxed text-zinc-400 md:mt-0 md:flex-1 md:text-right md:text-sm">
                    {t("account.donationHint")}
                  </p>
                </div>
              </div>
            </div>

            <AccountModal
              open={openModal === "info"}
              titleId={`${modalTitleId}-info`}
              title={t("account.navAccountInfo")}
              subtitle={t("account.modalInfoSubtitle")}
              closeLabel={t("account.closeModal")}
              onClose={() => setOpenModal(null)}
            >
              <dl className="space-y-2.5 text-sm">
                {[
                  { label: t("account.infoEmail"), value: data.email },
                  {
                    label: t("account.infoCreated"),
                    value: data.joinDate ?? t("common.dash"),
                  },
                  {
                    label: t("account.infoLastAccess"),
                    value: data.lastLogin ?? t("common.dash"),
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col gap-0.5 rounded-xl border border-white/6 bg-black/30 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      {row.label}
                    </dt>
                    <dd className="break-all text-zinc-200 sm:text-right sm:break-normal">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </AccountModal>

            <AccountModal
              open={openModal === "security"}
              titleId={`${modalTitleId}-security`}
              title={t("account.navSecurity")}
              subtitle={t("account.modalSecuritySubtitle")}
              closeLabel={t("account.closeModal")}
              onClose={() => setOpenModal(null)}
            >
              <form
                onSubmit={onChangePassword}
                className="space-y-3 rounded-xl border border-white/6 bg-black/25 p-4"
              >
                <div>
                  <label htmlFor="current-password" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    {t("account.pwdCurrent")}
                  </label>
                  <input id="current-password" type="password"
                    className="mt-1.5 w-full rounded-lg border border-white/12 bg-black/45 px-3 py-2.5 text-zinc-100 outline-none ring-amber-500/0 transition-[border-color,box-shadow] focus:border-amber-500/55 focus:ring-2 focus:ring-amber-500/20"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    {t("account.pwdNew")}
                  </label>
                  <input id="new-password" type="password"
                    className="mt-1.5 w-full rounded-lg border border-white/12 bg-black/45 px-3 py-2.5 text-zinc-100 outline-none ring-amber-500/0 transition-[border-color,box-shadow] focus:border-amber-500/55 focus:ring-2 focus:ring-amber-500/20"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirm-new-password" className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    {t("account.pwdConfirm")}
                  </label>
                  <input id="confirm-new-password" type="password"
                    className="mt-1.5 w-full rounded-lg border border-white/12 bg-black/45 px-3 py-2.5 text-zinc-100 outline-none ring-amber-500/0 transition-[border-color,box-shadow] focus:border-amber-500/55 focus:ring-2 focus:ring-amber-500/20"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                {passwordMsg && (
                  <p className="text-sm text-emerald-400">{passwordMsg}</p>
                )}
                {passwordError && (
                  <p className="text-sm text-red-400">{passwordError}</p>
                )}
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="metal-border w-full rounded-lg bg-linear-to-r from-amber-600 to-orange-500 py-2.5 text-sm font-semibold text-black transition-[filter] hover:brightness-110 disabled:opacity-60"
                >
                  {savingPassword ? t("account.saving") : t("account.changePassword")}
                </button>
              </form>
            </AccountModal>

            <AccountModal
              open={openModal === "orders"}
              titleId={`${modalTitleId}-orders`}
              title={t("account.navPurchases")}
              subtitle={t("account.modalOrdersSubtitle")}
              wide
              closeLabel={t("account.closeModal")}
              onClose={() => setOpenModal(null)}
            >
              {data.recentOrders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-black/20 px-4 py-10 text-center">
                  <p className="text-sm text-zinc-500">
                    {t("account.noPurchasesYet")}
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/7 bg-black/25">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-white/8 bg-white/4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        <tr>
                          <th className="px-4 py-3.5 font-medium">
                            {t("account.ordersProduct")}
                          </th>
                          <th className="px-4 py-3.5 font-medium">
                            {t("account.ordersPoints")}
                          </th>
                          <th className="px-4 py-3.5 font-medium">
                            {t("account.ordersState")}
                          </th>
                          <th className="px-4 py-3.5 font-medium">
                            {t("account.ordersDate")}
                          </th>
                          <th className="px-4 py-3.5 font-medium">
                            {t("account.ordersPaypal")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedOrders.map((order, i) => (
                          <tr
                            key={order.orderId}
                            className={
                              i % 2 === 0
                                ? "border-t border-white/5 bg-white/2 text-zinc-300"
                                : "border-t border-white/5 text-zinc-300"
                            }
                          >
                            <td className="px-4 py-3.5 font-medium text-zinc-200">
                              {order.productName}
                            </td>
                            <td className="px-4 py-3.5 tabular-nums text-amber-300/95">
                              {order.donationPoints}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={
                                  order.status === "PAID"
                                    ? "inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/25"
                                    : order.status === "FAILED"
                                      ? "inline-flex rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-300 ring-1 ring-red-500/25"
                                      : "inline-flex rounded-full bg-zinc-500/10 px-2 py-0.5 text-xs font-medium text-zinc-400 ring-1 ring-white/10"
                                }
                              >
                                {order.status === "PAID"
                                  ? t("account.orderStatusPaid")
                                  : order.status === "FAILED"
                                    ? t("account.orderStatusFailed")
                                    : t("account.orderStatusOther", {
                                        status: order.status,
                                      })}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-zinc-400">
                              {new Date(order.createdAt).toLocaleString(
                                dateLocale,
                              )}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs text-zinc-500">
                              {order.paypalOrderId ?? t("common.dash")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {data.recentOrders.length > ORDERS_PER_PAGE && (
                    <div className="flex items-center justify-end gap-3 border-t border-white/8 bg-white/2 px-4 py-3">
                      <button
                        type="button"
                        disabled={ordersPage === 1}
                        onClick={() =>
                          setOrdersPage((p) => Math.max(1, p - 1))
                        }
                        className="rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/5 disabled:opacity-50"
                      >
                        {t("account.ordersPrev")}
                      </button>
                      <span className="text-xs text-zinc-500">
                        {t("account.ordersPageOf", {
                          current: ordersPage,
                          total: totalOrderPages,
                        })}
                      </span>
                      <button
                        type="button"
                        disabled={ordersPage === totalOrderPages}
                        onClick={() =>
                          setOrdersPage((p) =>
                            Math.min(totalOrderPages, p + 1),
                          )
                        }
                        className="rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/5 disabled:opacity-50"
                      >
                        {t("account.ordersNext")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </AccountModal>
          </>
        )}
        {!data && (
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/tienda"
              className="rounded-md border border-sky-400/40 bg-sky-950/40 px-4 py-2 text-sm font-semibold text-sky-200 hover:bg-sky-900/50"
            >
              {t("account.goStore")}
            </Link>
            <Link
              href="/tienda/puntos"
              className="rounded-md border border-amber-400/40 bg-amber-950/30 px-4 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-900/40"
            >
              {t("account.redeem")}
            </Link>
            <Link
              href="/recuperar"
              className="rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5"
            >
              {t("account.recoverAccess")}
            </Link>
          </div>
        )}
      </div>
      <StoreShowcase />
    </SiteShell>
  );
}
