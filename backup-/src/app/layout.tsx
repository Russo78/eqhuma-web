import "./globals.css";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthProvider } from "@/contexts/auth-context";

export const metadata: Metadata = {
  title: "EQHuma | Especialistas en Recursos Humanos y Asesoría",
  description: "Somos una empresa líder en soluciones de recursos humanos, ofrecemos servicios integrales de capital humano en todos los sectores.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
