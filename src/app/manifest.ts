import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "AfetSaha",
    short_name: "AfetSaha",
    description: "Acil Durum ve Saha Yönetimi",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f3f7f8",
    theme_color: "#0c8b72",
    lang: "tr",
    categories: ["medical", "productivity", "utilities"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Ana Sayfa", short_name: "Ana Sayfa", url: "/dashboard", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Yeni Yaralı Kaydı", short_name: "Yeni Kayıt", url: "/patients/new", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Yaralılar", short_name: "Yaralılar", url: "/patients", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
