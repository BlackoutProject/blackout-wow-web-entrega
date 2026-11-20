import { localizedPageMetadata } from "@/lib/page-metadata";

export function generateMetadata() { return localizedPageMetadata({
  title: "Mi cuenta",
  description:
    "Consulta tus personajes y los datos de tu cuenta Blackout-WoW, gestiona tu seguridad y contacta con V en Discord para aportaciones VIP o Donor. Requiere iniciar sesión.",
  pathname: "/cuenta",
  noIndex: true,
}); }

export default function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
