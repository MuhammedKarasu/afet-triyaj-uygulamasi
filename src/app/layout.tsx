import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AfetSaha", template: "%s | AfetSaha" },
  description: "Acil durum ve saha yönetimi için dijital triyaj platformu",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
