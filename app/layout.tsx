import type { Metadata } from "next";
import "./globals.css";

/*
  Layout principal - envuelve TODAS las páginas de la app.

  - <html> y <body> se definen acá una sola vez
  - {children} es donde se renderiza el contenido de cada página
  - Metadata define el título y descripción que aparecen en la pestaña del navegador
    y cuando compartís el link en redes sociales
*/

export const metadata: Metadata = {
  title: "GastosUY - Entendé tus gastos en segundos",
  description:
    "Subí tu estado de cuenta bancario o de tarjeta de crédito y obtené un resumen categorizado de tus gastos en Excel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
