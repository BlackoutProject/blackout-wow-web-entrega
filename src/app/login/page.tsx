"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  authInputShell,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLock,
  IconSpark,
  IconUser,
} from "@/components/AuthFormUi";
import { SiteShell } from "@/components/SiteShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { useInterfaceCopy } from "@/lib/use-interface-copy";


function LoginPageLoading() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[min(780px,calc(100dvh-220px))] items-center justify-center px-4">
      <div className="flex items-center gap-3 text-sm text-zinc-400">
        <svg
          className="h-5 w-5 animate-spin text-amber-500/80"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {t("auth.login.loadingPage")}
      </div>
    </div>
  );
}

function LoginPageContent() {
  const ui = useInterfaceCopy();
  const { t } = useTranslation();
  const { login, accessToken, isAuthReady } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fromRegistration = searchParams.get("registered") === "1";

  useEffect(() => {
    if (!isAuthReady || !accessToken) return;
    const next = searchParams.get("next");
    router.replace(next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/cuenta");
  }, [isAuthReady, accessToken, searchParams, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/cuenta");
    } catch (err) {
      if (err instanceof ApiError) {
        const rawMessage = `${err.message} ${err.detail ?? ""}`.toLowerCase();
        const looksLikeInvalidCredentials =
          rawMessage.includes("bad credentials") ||
          rawMessage.includes("credenciales inválidas") ||
          rawMessage.includes("credenciales invalidas");

        const friendlyMessage =
          err.status === 401 || looksLikeInvalidCredentials
            ? "No pudimos iniciar sesión con esos datos. Revisa tu usuario y contraseña."
            : err.status === 429
              ? "Has hecho varios intentos. Espera un momento y vuelve a intentarlo."
              : err.status >= 500
                ? "Nuestros servidores están ocupados en este momento. Intenta de nuevo en unos minutos."
                : err.status === 0
                  ? "No se ha podido conectar con el servidor. Inténtalo de nuevo en unos minutos."
                  : "No pudimos iniciar sesión por ahora. Intenta nuevamente.";
        setError(ui(friendlyMessage));
      } else {
        setError(ui("No pudimos iniciar sesión por ahora. Intenta nuevamente."));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page relative isolate min-h-[min(820px,calc(100dvh-180px))] overflow-hidden bg-[#030306]">

      <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-br from-black/88 via-black/72 to-[#0a1628]/90" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_110%_70%_at_50%_-10%,rgba(251,191,36,0.12),transparent_52%),radial-gradient(ellipse_at_80%_70%,rgba(56,189,248,0.09),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(105deg,transparent_0%,rgba(0,0,0,0.2)_40%,transparent_65%)]" />

      <div className="auth-layout relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="auth-grid grid items-stretch gap-10 lg:grid-cols-[minmax(0,1fr)_min(100%,420px)] lg:gap-16 xl:grid-cols-[minmax(0,1.15fr)_440px]">
          <header className="auth-introduction flex flex-col justify-center space-y-8 text-center lg:text-left">
            <div className="lg:pr-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-400/95">
                {t("auth.login.panelKicker")}
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl xl:text-[3.25rem]">
                {t("auth.login.panelHeading")}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400 lg:mx-0 mx-auto">
                {t("auth.login.panelDescription")}
              </p>
            </div>
            <ul className="mx-auto flex max-w-md flex-col gap-3.5 text-left text-sm text-zinc-300 lg:mx-0 lg:max-w-none">
              <li className="flex gap-3 rounded-xl border border-white/[0.07] bg-black/25 px-4 py-3.5 backdrop-blur-sm">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/12 text-amber-400/95 ring-1 ring-amber-400/20">
                  <IconCheck className="h-4 w-4" />
                </span>
                <span className="leading-snug">{t("auth.login.bulletGame")}</span>
              </li>
              <li className="flex gap-3 rounded-xl border border-white/[0.07] bg-black/25 px-4 py-3.5 backdrop-blur-sm">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/12 text-sky-300/95 ring-1 ring-sky-400/25">
                  <IconSpark className="h-4 w-4" />
                </span>
                <span className="leading-snug">{t("auth.login.bulletAccount")}</span>
              </li>
            </ul>
          </header>

          <div className="auth-form-panel metal-border relative flex flex-col rounded-2xl border border-white/10 bg-zinc-950/75 p-6 shadow-[0_28px_90px_-20px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[18px] sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-sky-500/10 blur-3xl" />

            <div className="relative">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-zinc-50 sm:text-[1.65rem]">
                {t("auth.login.title")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{t("auth.login.subtitle")}</p>
              <p className="mt-4 text-sm text-zinc-400">
                {t("auth.login.noAccount")}{" "}
                <Link
                  href="/registro"
                  className="font-medium text-amber-400/95 underline decoration-amber-500/35 underline-offset-4 transition hover:text-amber-300 hover:decoration-amber-400/60"
                >
                  {t("auth.login.signup")}
                </Link>
              </p>
            </div>

            {fromRegistration && (
              <div
                className="relative mt-6 flex gap-3 rounded-xl border border-emerald-500/35 bg-emerald-950/45 px-4 py-3 text-sm text-emerald-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                role="status"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-emerald-200">
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                <span className="leading-snug">{t("auth.login.registeredBanner")}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="relative mt-8 space-y-5">
              <div>
                <label
                  htmlFor="login-username"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-zinc-500"
                >
                  {t("auth.login.username")}
                </label>
                <div className="relative">
                  <IconUser className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500" />
                  <input
                    id="login-username"
                    className={`${authInputShell} pl-11`}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-zinc-500"
                >
                  {t("auth.login.password")}
                </label>
                <div className="relative">
                  <IconLock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className={`${authInputShell} pl-11 pr-12`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")
                    }
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-xl text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
                  >
                    {showPassword ? (
                      <IconEyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <IconEye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="rounded-xl border border-red-500/35 bg-red-950/50 px-4 py-3 text-sm leading-snug text-red-200/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 w-full overflow-hidden rounded-xl bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_0_42px_-8px_rgba(251,191,36,0.55),inset_0_1px_0_rgba(255,255,255,0.22)] transition-[transform,filter] hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-55"
              >
                <span className="relative z-10 inline-flex w-full items-center justify-center gap-2">
                  {loading && (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle
                        className="opacity-30"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  )}
                  {loading ? t("auth.login.loading") : t("auth.login.submit")}
                </span>
              </button>
            </form>

            <p className="relative mt-8 border-t border-white/[0.08] pt-6 text-center">
              <Link
                href="/recuperar"
                className="text-sm font-medium text-sky-300/95 underline decoration-sky-500/35 underline-offset-4 transition hover:text-sky-200 hover:decoration-sky-400/55"
              >
                {t("auth.login.forgotPassword")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <SiteShell>
      <Suspense fallback={<LoginPageLoading />}>
        <LoginPageContent />
      </Suspense>
    </SiteShell>
  );
}
