"use client";

import {useDialogFocus} from "@/lib/use-dialog-focus";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
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

type AccountModalId = "info" | "security";

function AccountModal({
  open,
  titleId,
  title,
  subtitle,
  closeLabel,
  onClose,
  children,
}: {
  open: boolean;
  titleId: string;
  title: string;
  subtitle?: string;
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
        className={`home-card metal-border relative z-10 flex max-h-[min(92dvh,900px)] w-full flex-col rounded-t-2xl border border-white/12 border-b-0 bg-zinc-950/95 shadow-2xl shadow-black/60 sm:max-h-[85vh] sm:rounded-2xl sm:border-b sm:max-w-lg`}
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
  const { t } = useTranslation();
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
  const [openModal, setOpenModal] = useState<AccountModalId | null>(null);
  const modalTitleId = useId();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!accessToken) {
      router.replace(`/login?next=${encodeURIComponent("/cuenta" + window.location.hash)}`);
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

          </>
        )}
        {!data && (
          <div className="mt-10 flex flex-wrap gap-4">
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
