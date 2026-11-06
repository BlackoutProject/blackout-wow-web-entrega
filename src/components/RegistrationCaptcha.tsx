"use client";

import { useEffect, useRef, useState } from "react";
import { ReCAPTCHA } from "react-google-recaptcha";
import { useTranslation } from "react-i18next";
import { publicEnv } from "@/config/public-env";
import styles from "./RegistrationCaptcha.module.css";

type CaptchaAPI = { render: (...args: unknown[]) => number };
type CaptchaWindow = Window & { grecaptcha?: CaptchaAPI; blackoutCaptchaReady?: () => void };
let pending: Promise<CaptchaAPI> | undefined;

function loadCaptcha(): Promise<CaptchaAPI> {
  const win = window as CaptchaWindow;
  if (win.grecaptcha?.render) return Promise.resolve(win.grecaptcha);
  if (pending) return pending;

  pending = new Promise<CaptchaAPI>((resolve, reject) => {
    const script = document.createElement("script");
    const fail = () => {
      clearTimeout(timer);
      delete win.blackoutCaptchaReady;
      script.remove();
      pending = undefined;
      reject(new Error("reCAPTCHA unavailable"));
    };
    const timer = window.setTimeout(fail, 20000);
    win.blackoutCaptchaReady = () => {
      if (!win.grecaptcha?.render) return fail();
      clearTimeout(timer);
      delete win.blackoutCaptchaReady;
      resolve(win.grecaptcha);
    };
    script.async = true;
    script.src = "https://www.google.com/recaptcha/api.js?onload=blackoutCaptchaReady&render=explicit";
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return pending;
}

type Status = "ready" | "expired" | "unavailable" | "verified";

export function RegistrationCaptcha({ onToken }: { onToken: (value: string | null) => void }) {
  const { t, i18n } = useTranslation();
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<ReCAPTCHA>(null);
  const [size, setSize] = useState<"compact" | "normal">();
  const [api, setApi] = useState<CaptchaAPI>();
  const [status, setStatus] = useState<Status>("ready");
  const [attempt, setAttempt] = useState(0);
  const [localPreview, setLocalPreview] = useState(false);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    setLocalPreview(["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname));
    let previous: typeof size;
    const measure = () => {
      const next = element.clientWidth >= 304 ? "normal" : "compact";
      if (next === previous) return;
      previous = next;
      onToken(null);
      setStatus(current => current === "verified" ? "ready" : current);
      setSize(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [onToken]);

  useEffect(() => {
    let active = true;
    loadCaptcha().then(
      loaded => { if (active) setApi(loaded); },
      () => { if (active) setStatus("unavailable"); }
    );
    return () => { active = false; };
  }, [attempt]);

  return <section id="verificacion" className={styles.panel} aria-labelledby="captcha-title">
    <h3 id="captcha-title" className={styles.heading}>
      <svg width="18" height="20" viewBox="0 0 24 26" fill="none" aria-hidden="true">
        <path d="M12 2 21 5v7c0 5-4 9-9 12-5-3-9-7-9-12V5l9-3Z" stroke="currentColor" strokeWidth="1.6"/>
        <path d="m8 13 3 3 5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {t("auth.register.captchaTitle")}
    </h3>
    <div className={styles.control} ref={box}>
      {api && size && status !== "unavailable" && <ReCAPTCHA
        key={size} ref={widget} sitekey={publicEnv.recaptchaSiteKey} grecaptcha={api}
        size={size} theme="dark" hl={i18n.language === "pt" ? "pt-BR" : i18n.language}
        onChange={value => { onToken(value); setStatus(value ? "verified" : "ready"); }}
        onExpired={() => { onToken(null); setStatus("expired"); widget.current?.reset(); }}
        onErrored={() => { onToken(null); setStatus("unavailable"); }}
      />}
    </div>
    <div className={styles.feedback} role="status">
      {status === "unavailable" ? t("auth.register.captchaUnavailable")
        : status === "expired" ? t("auth.register.captchaExpired")
        : !api ? t("auth.register.captchaLoading") : null}
    </div>
    {status === "unavailable" && <button type="button" className={styles.retry} onClick={() => {
      setStatus("ready");
      setApi(undefined);
      setAttempt(value => value + 1);
    }}>{t("auth.register.captchaRetry")}</button>}
    {localPreview && <a className={styles.official} href="https://blackout-wow.com/registro" target="_blank" rel="noopener noreferrer">
      {t("auth.register.captchaOfficial")} <span aria-hidden="true">↗</span>
    </a>}
  </section>;
}
