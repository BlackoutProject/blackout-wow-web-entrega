import ConnectContent from '@/components/ConnectContent';
import { localizedPageMetadata } from "@/lib/page-metadata";
export function generateMetadata() { return localizedPageMetadata({
  title: "Cómo conectarme al servidor",
  description:
    "Juega en Blackout-WoW con WoW 3.3.5a: crea tu cuenta, prepara el cliente e instala los parches, WoW.exe y los addons obligatorios AIO y Druid C Fix.",
  pathname: "/como-conectarme",
  keywords: [
    "realmlist Blackout WoW",
    "conectar WoW 3.3.5a",
    "cliente WotLK private server",
  ],
}); }
export default function Page(){return <ConnectContent/>;}
