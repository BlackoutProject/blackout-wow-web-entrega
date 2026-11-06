import type { AppLanguage } from "@/i18n/settings";

export type GameplayTopic = "collection" | "evoker" | "demon-hunter" | "monk" | "aio" | "paragon" | "battle-pass" | "transmog" | "druid" | "mall" | "convenience";
export type GameplayMedia = {
  id: string;
  topic: GameplayTopic;
  kind: "image" | "video";
  src: `/blackout-media/${string}`;
  poster: `/blackout-media/${string}`;
  width: number;
  height: number;
  caption: Record<AppLanguage, string>;
};

// Add verified Blackout screenshots and recordings here. Illustrations are not gameplay.
// Empty topics render nothing: no empty cards, invented footage or disabled controls.
export const gameplayMedia: readonly GameplayMedia[] = [];

export function mediaForTopic(topic: GameplayTopic) {
  return gameplayMedia.filter(item => item.topic === topic);
}

export const gameplayMediaCopy = {
  es: { tag: "DENTRO DE BLACKOUT", title: "Descúbrelo en el juego.", view: "Ampliar captura", play: "Ver gameplay", close: "Cerrar", previous: "Anterior", next: "Siguiente", tutorialTag: "GUÍA EN VÍDEO", tutorialTitle: "Prepara tu cliente, paso a paso.", tutorialPlay: "VER TUTORIAL", tutorialLabel: "Tutorial oficial de instalación de Blackout-WoW" },
  en: { tag: "INSIDE BLACKOUT", title: "See it in the game.", view: "Enlarge screenshot", play: "Watch gameplay", close: "Close", previous: "Previous", next: "Next", tutorialTag: "VIDEO GUIDE", tutorialTitle: "Set up your client, step by step.", tutorialPlay: "WATCH TUTORIAL", tutorialLabel: "Official Blackout-WoW installation tutorial" },
  pt: { tag: "DENTRO DO BLACKOUT", title: "Descubra no jogo.", view: "Ampliar captura", play: "Assistir ao gameplay", close: "Fechar", previous: "Anterior", next: "Próximo", tutorialTag: "GUIA EM VÍDEO", tutorialTitle: "Prepare seu cliente, passo a passo.", tutorialPlay: "ASSISTIR AO TUTORIAL", tutorialLabel: "Tutorial oficial de instalação do Blackout-WoW" },
} satisfies Record<AppLanguage, Record<string, string>>;
