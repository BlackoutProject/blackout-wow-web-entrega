import ServerContent from '@/components/ServerContent';
import { localizedPageMetadata } from "@/lib/page-metadata";
export function generateMetadata() { return localizedPageMetadata({
  title: "Servidor WoW custom WotLK 3.3.5a",
  description:
    "Descubre Blackout 255: Evocador, Cazador de demonios, Monje y 10 hechizos custom por clase de WotLK. 35 raids, 19 custom, más de 30 mapas custom y progresión T1–T35.",
  pathname: "/servidor",
  keywords: [
    "servidor WoW Latinoamérica",
    "Blackout WoW WotLK",
    "WoW custom 3.3.5",
  ],
}); }
export default function Page(){return <ServerContent/>;}
