"use client";
import Image from "next/image";
import { AmbientVideo } from "./WarcraftMotion";
import { SceneAtmosphere } from "./SceneAtmosphere";
import styles from "./PortalBackdrop.module.css";

/** Distinct artwork for each destination, with one shared Blackout material palette. */
const scenes = [
  { route: "/servidor", art: "/warcraft/illidan-poster.webp", video: "/warcraft/illidan.mp4", theme: "server" },
  { route: "/como-conectarme", art: "/warcraft/scene-connect-fixed-poster.webp", video: "/warcraft/scene-connect-fixed.mp4", theme: "connect" },
  { route: "/terminos-y-condiciones", art: "/warcraft/scene-rules-human-poster.webp", video: "/warcraft/scene-rules-human.mp4", theme: "rules" },
  { route: "/registro", art: "/warcraft/scene-register-hd-poster.webp", video: "/warcraft/scene-register-hd.mp4", theme: "register" },
  { route: "/login", art: "/warcraft/blackout-gates-poster.webp", video: "/warcraft/blackout-gates.mp4", theme: "login" },
  { route: "/recuperar", art: "/cinematic/warrior.jpg", video: "/cinematic/scene-02-fel-kling.mp4", theme: "recover" },
  { route: "/restablecer", art: "/cinematic/warrior.jpg", video: "/cinematic/scene-02-fel-kling.mp4", theme: "recover" },
  { route: "/tienda/puntos", art: "/warcraft/high-resolution/nzoth-original.jpg", theme: "points" },
  { route: "/tienda", art: "/warcraft/high-resolution/lordaeron-battle-original.jpg", theme: "store" },
  { route: "/cuenta", art: "/warcraft/scene-rules-hd-poster.webp", video: "/warcraft/scene-rules-hd.mp4", theme: "account" },
] as const;

export function PortalBackdrop({ path }: { path: string }) {
  const scene = scenes.find(item => path.startsWith(item.route)) ?? scenes[2];
  return <div className={`${styles.backdrop} ${styles[scene.theme]}`} aria-hidden="true" data-scene={scene.theme}>
    <div key={scene.theme} className={styles.art}>
      {"video" in scene ? <AmbientVideo src={scene.video} poster={scene.art} priority /> :
        <Image src={scene.art} alt="" fill sizes="(max-width: 760px) 100vw, 80vw" quality={95} priority />}
    </div>
    {!("video" in scene) && <SceneAtmosphere theme={scene.theme === "points" ? "arcane" : "embers"} className={styles.atmosphere}/>}
    <div className={styles.shade}/>
  </div>;
}
