import { localizedPageMetadata } from "@/lib/page-metadata";

export function generateMetadata() { return localizedPageMetadata({
  title: "Canjear puntos en el juego",
  description:
    "Canjea tus puntos de Blackout-WoW por recompensas para tus personajes. Requiere iniciar sesión y tener puntos disponibles en tu cuenta.",
  pathname: "/tienda/puntos",
  noIndex: true,
}); }

export default function RewardShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
