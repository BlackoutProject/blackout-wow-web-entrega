"use client";

import {useDialogFocus} from "@/lib/use-dialog-focus";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RegistrationCaptcha } from "@/components/RegistrationCaptcha";
import { useTranslation } from "react-i18next";
import {
  authInputShell,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconSpark,
  IconUser,
} from "@/components/AuthFormUi";
import { SiteShell } from "@/components/SiteShell";
import { useAuth } from "@/context/AuthContext";


export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [captchaAttempt, setCaptchaAttempt] = useState(0);
  const isUsernameValid = username.trim().length >= 3;
  const isEmailValid = email.trim().length > 0;
  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit =
    isUsernameValid &&
    isEmailValid &&
    isPasswordValid &&
    doPasswordsMatch &&
    Boolean(recaptchaToken) &&
    !loading;

  useEffect(() => {setRecaptchaToken(null);}, [i18n.language]);

  const welcomeRef=useRef<HTMLDivElement>(null);
  useDialogFocus(showWelcomeModal,welcomeRef,()=>setShowWelcomeModal(false));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || showWelcomeModal) return;
    setError(null);
    if (!doPasswordsMatch) {
      setError(t("auth.register.passwordMismatch"));
      return;
    }
    if (!recaptchaToken) {
      setError(t("auth.register.recaptchaHint"));
      return;
    }
    setLoading(true);
    try {
      await register(username, password, email, recaptchaToken);
      setShowWelcomeModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setRecaptchaToken(null);
      setCaptchaAttempt(attempt => attempt + 1);
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <div className="auth-page relative isolate min-h-[min(880px,calc(100dvh-160px))] overflow-hidden bg-[#030306]">

        <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-br from-black/88 via-black/72 to-[#0a1628]/90" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_110%_70%_at_50%_-10%,rgba(251,191,36,0.12),transparent_52%),radial-gradient(ellipse_at_80%_70%,rgba(56,189,248,0.09),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(105deg,transparent_0%,rgba(0,0,0,0.2)_40%,transparent_65%)]" />

        <div className="auth-layout relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:py-20">
          <div className="auth-grid grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_min(100%,460px)] lg:gap-14 xl:grid-cols-[minmax(0,1.1fr)_min(100%,480px)]">
            <header className="auth-introduction flex flex-col justify-center space-y-8 text-center lg:sticky lg:top-8 lg:text-left">
                <div className="lg:pr-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-400/95">
                  {t("auth.register.panelKicker")}
                </p>
                <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl xl:text-[3.1rem]">
                  {t("auth.register.panelHeading")}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400 lg:mx-0 mx-auto">
                  {t("auth.register.panelDescription")}
                </p>
              </div>
              <ul className="mx-auto flex max-w-md flex-col gap-3.5 text-left text-sm text-zinc-300 lg:mx-0 lg:max-w-none">
                <li className="flex gap-3 rounded-xl border border-white/[0.07] bg-black/25 px-4 py-3.5 backdrop-blur-sm">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/12 text-amber-400/95 ring-1 ring-amber-400/20">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <span className="leading-snug">{t("auth.register.bulletRealm")}</span>
                </li>
                <li className="flex gap-3 rounded-xl border border-white/[0.07] bg-black/25 px-4 py-3.5 backdrop-blur-sm">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/12 text-sky-300/95 ring-1 ring-sky-400/25">
                    <IconSpark className="h-4 w-4" />
                  </span>
                  <span className="leading-snug">{t("auth.register.bulletEmail")}</span>
                </li>
              </ul>
            </header>

            <div className="auth-form-panel metal-border relative flex flex-col rounded-2xl border border-white/10 bg-zinc-950/75 p-6 shadow-[0_28px_90px_-20px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[18px] sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-sky-500/10 blur-3xl" />

              <div className="relative">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-zinc-50 sm:text-[1.65rem]">
                  {t("auth.register.title")}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{t("auth.register.subtitle")}</p>
                <p className="mt-4 text-sm text-zinc-400">
                  {t("auth.register.already")}{" "}
                  <Link
                    href="/login"
                    className="font-medium text-amber-400/95 underline decoration-amber-500/35 underline-offset-4 transition hover:text-amber-300 hover:decoration-amber-400/60"
                  >
                    {t("auth.register.login")}
                  </Link>
                </p>
              </div>

              <form onSubmit={onSubmit} className="relative mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="reg-username"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-zinc-500"
                  >
                    {t("auth.register.username")}
                  </label>
                  <div className="relative">
                    <IconUser className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500" />
                    <input
                      id="reg-username"
                      className={`${authInputShell} pl-11`}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      minLength={3}
                      maxLength={32}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="reg-email"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-zinc-500"
                  >
                    {t("auth.register.email")}
                  </label>
                  <div className="relative">
                    <IconMail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500" />
                    <input
                      id="reg-email"
                      type="email"
                      className={`${authInputShell} pl-11`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="reg-password"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-zinc-500"
                  >
                    {t("auth.register.password")}
                  </label>
                  <div className="relative">
                    <IconLock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500" />
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      className={`${authInputShell} pl-11 pr-12`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? t("auth.register.hidePassword")
                          : t("auth.register.showPassword")
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
                <div>
                  <label
                    htmlFor="reg-confirm"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-zinc-500"
                  >
                    {t("auth.register.confirmPassword")}
                  </label>
                  <div className="relative">
                    <IconLock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500" />
                    <input
                      id="reg-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      className={`${authInputShell} pl-11 pr-12`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={8}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? t("auth.register.hidePassword")
                          : t("auth.register.showPassword")
                      }
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-xl text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
                    >
                      {showConfirmPassword ? (
                        <IconEyeOff className="h-[18px] w-[18px]" />
                      ) : (
                        <IconEye className="h-[18px] w-[18px]" />
                      )}
                    </button>
                  </div>
                </div>

                {confirmPassword.length > 0 && !doPasswordsMatch ? (
                  <div
                    className="rounded-xl border border-amber-500/30 bg-amber-950/35 px-4 py-3 text-sm text-amber-100/95"
                    role="status"
                  >
                    {t("auth.register.passwordMismatch")}
                  </div>
                ) : null}

                <RegistrationCaptcha key={i18n.language + captchaAttempt} onToken={setRecaptchaToken}/>

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
                  disabled={!canSubmit}
                  className="group relative mt-1 w-full overflow-hidden rounded-xl bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_0_42px_-8px_rgba(251,191,36,0.55),inset_0_1px_0_rgba(255,255,255,0.22)] transition-[transform,filter] hover:enabled:brightness-110 active:enabled:scale-[0.99] disabled:cursor-not-allowed disabled:border disabled:border-zinc-600/60 disabled:bg-zinc-800/90 disabled:bg-none disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-400 disabled:opacity-100 disabled:shadow-none disabled:hover:translate-y-0"
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
                    {loading ? t("auth.register.submitting") : t("auth.register.submit")}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-[2px]">
          <div
            className="metal-border w-full max-w-lg rounded-2xl border border-amber-400/25 bg-zinc-950/95 p-7 shadow-[0_28px_80px_-24px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:p-8"
            ref={welcomeRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300/90">
              {t("auth.register.welcomeBrand")}
            </p>
            <h2
              id="welcome-title"
              className="mt-3 font-display text-2xl font-semibold leading-tight text-zinc-50 sm:text-3xl"
            >
              {t("auth.register.welcomeTitle")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">{t("auth.register.welcomeBody")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push("/login?registered=1")}
                className="rounded-xl bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_36px_-8px_rgba(251,191,36,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:brightness-110"
              >
                {t("auth.register.welcomeLogin")}
              </button>
              <button
                type="button"
                onClick={() => setShowWelcomeModal(false)}
                className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/25 hover:bg-white/10"
              >
                {t("auth.register.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </SiteShell>
  );
}
