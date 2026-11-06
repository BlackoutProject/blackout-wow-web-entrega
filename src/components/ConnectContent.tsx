"use client";
import Link from "next/link";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {SiteShell} from "./SiteShell";
import {DISCORD_INVITE_URL} from "@/lib/site-config";
import {connectionCopy} from "@/lib/connection-copy";
import {defaultLng, isSupportedLanguage} from "@/i18n/settings";
import {ConnectTutorial} from "./ConnectTutorial";
import {WarcraftSigil} from "./WarcraftSigil";

const patchDownloadUrl = process.env.NEXT_PUBLIC_PATCH_DOWNLOAD_URL?.trim() || "";
const realmlistCommand = "set realmlist logon.blackout-wow.com";
const links = {
  patch: [
    { provider: "MEGA", url: "https://mega.nz/file/Ds4T0KaR#tvx9ZKoLGR2ibW2YqNHM9rjxDxkw4tQtyulxLf5YpYY" },
    { provider: "Google Drive", url: "https://drive.google.com/file/d/18zFPYn4CBTduIFF0bO-Of_nSxX6P6nCL/view?usp=sharing" }
  ],
  aio: [
    { provider: "MEGA", url: "https://mega.nz/file/KshwXbJZ#4v_D_CDfwYPKqNu4KgWGRhK45HSp_9yhv8sjTgDe2F4" },
    { provider: "Google Drive", url: "https://drive.google.com/file/d/1-w4jnu1TxzwASASyO-qEkN_JURE8NPk-/view?usp=sharing" }
  ],
  fix: [
    { provider: "Google Drive", url: "https://drive.google.com/file/d/1_lURvxnmrZYuwzT5L7uGLgRV4G0CzIjd/view?usp=sharing" }
  ],
  es: "https://drive.google.com/file/d/15eqo-VXNtD-8JelsrHfoPnogeNKddJKE/view?usp=sharing",
  en: "https://drive.google.com/file/d/1_3-KSxI1XKdsgpOJwkeKi6gboDQ1M1Mg/view?usp=sharing"
};

function DownloadSources({ file, sources, showName = false }: {
  file: string;
  sources: { provider: string; url: string }[];
  showName?: boolean;
}) {
  return <div className="connection-sources" role="group" aria-label={file}>
    {showName && <strong className="connection-source-name">{file}</strong>}
    <div className="connection-download-actions">
      {sources.map(({ provider, url }) =>
        <a key={url} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${file} · ${provider}`}>
          {provider}<span aria-hidden="true">↓</span>
        </a>
      )}
    </div>
  </div>;
}

export default function ConnectContent() {
  const {i18n} = useTranslation();
  const c = connectionCopy[isSupportedLanguage(i18n.language) ? i18n.language : defaultLng];
  const patchSources = [...links.patch];
  if (/^https:\/\//i.test(patchDownloadUrl) && !patchSources.some(source => source.url === patchDownloadUrl)) {
    patchSources.push({ provider: c.otherSource, url: patchDownloadUrl });
  }
  const [copyState, setCopyState] = useState<"idle" | "done" | "error">("idle");
  async function copyRealmlist() {
    try {
      await navigator.clipboard.writeText(realmlistCommand);
      setCopyState("done");
    } catch {
      setCopyState("error");
    }
  }

  return <SiteShell>
    <section className="lore-hero">
      <span className="lore-kicker">{c.badge}</span><h1>{c.title}</h1><p>{c.intro}</p>
      <aside className="connection-realm" id="realmlist" aria-labelledby="realmlist-title">
        <h2 id="realmlist-title">{c.realmTitle}</h2>
        <div className="connection-realm-command">
          <code dir="ltr">{realmlistCommand}</code>
          <button type="button" className="connect-realmlist" onClick={copyRealmlist} aria-label={c.copy} title={c.copy}>
            <span aria-hidden="true">{copyState === "done" ? "✓" : "⧉"}</span>
          </button>
        </div>
        <p>{c.realmHelp}</p>
        <p role="status">{copyState === "done" ? c.copied : copyState === "error" ? c.copyError : ""}</p>
      </aside>
      <div className="lore-actions"><a className="lore-button" href="#descargas">{c.downloads}<span aria-hidden="true">↓</span></a><Link href="/registro">{c.create} →</Link></div>
    </section>
    <section className="lore-container">
      <div className="lore-heading connection-heading" id="descargas"><span className="lore-kicker">BLACKOUT · 3.3.5a</span><h2>{c.downloads}</h2><p>{c.downloadIntro}</p></div>
      <div className="connect-steps connection-paths connection-guided-downloads">{c.paths.map((path,i)=><article key={path.id} id={`instalacion-${path.id}`} aria-labelledby={`instalacion-${path.id}-title`}>
        <div className="connection-option-heading"><span className="connection-option-icon" aria-hidden="true"><WarcraftSigil kind={i === 0 ? "shield" : "key"}/></span><span className="lore-kicker connection-option">{c.optionLabel} {i+1}</span></div><h2 id={`instalacion-${path.id}-title`}>{path.title}</h2><p className="connection-path-intro">{path.intro}</p>
        <ol>{path.steps.map(step=><li key={step.title}>
          <h3>{step.title}</h3><p>{step.text}</p>
          {step.download === "client" && <div className="connection-download-actions"><a href={links.en} target="_blank" rel="noopener noreferrer">{c.clientEn}<span aria-hidden="true">↓</span></a><a href={links.es} target="_blank" rel="noopener noreferrer">{c.clientEs}<span aria-hidden="true">↓</span></a></div>}
          {step.download === "patch" && <DownloadSources file={c.patch} sources={patchSources}/>}
          {step.download === "addons" && <>
            <DownloadSources file="AIO" sources={links.aio} showName/>
            <DownloadSources file="Druid C Fix" sources={links.fix} showName/>
          </>}
          {step.download === "realmlist" && <a className="connection-realm-link" href="#realmlist">{c.realmLink}<span aria-hidden="true">↑</span></a>}
        </li>)}</ol>
      </article>)}</div>
      <p className="connection-updates connection-download-updates">{c.updatesIntro}{" "}<a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">{c.updatesLink}<span aria-hidden="true"> ↗</span></a>.</p>
      <ConnectTutorial/>
      <details className="connection-filemap" aria-labelledby="filemap-title">
        <summary><span><span className="lore-kicker">{c.fileMapTag}</span><span className="connection-filemap-title" id="filemap-title">{c.fileMapTitle}</span></span><span className="connection-expand" aria-hidden="true">+</span></summary>
        <p className="connection-filemap-intro">{c.fileMapIntro}</p>
        <div className="connection-folder-root"><span aria-hidden="true">▱</span>{c.gameFolder}</div>
        <dl>{c.fileMapItems.map(item => <div key={item.path}>
          <dt><code>{item.path}</code></dt><dd><strong>{item.title}</strong><p>{item.text}</p></dd>
        </div>)}</dl>
      </details>
      <div className="connection-final-steps">
      <aside className="connect-tips"><h2>{c.tips}</h2><p>{c.tipText}</p><Link href="/recuperar">{c.recover} ↗</Link></aside>
      </div>
    </section>
  </SiteShell>;
}
