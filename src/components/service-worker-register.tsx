"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // Hydration sonrası yedek temizlik: asıl erken temizlik root layout'un head bölümünde çalışır.
      const wasControlled = Boolean(navigator.serviceWorker.controller);
      const reloadKey = "afetsaha-dev-pwa-reset-v1";

      Promise.all([
        navigator.serviceWorker.getRegistrations().then((registrations) => Promise.all(registrations.map((registration) => registration.unregister()))),
        "caches" in window ? caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("afetsaha-")).map((key) => caches.delete(key)))) : Promise.resolve([]),
      ])
        .then(() => {
          if (wasControlled && sessionStorage.getItem(reloadKey) !== "done") {
            sessionStorage.setItem(reloadKey, "done");
            window.location.reload();
            return;
          }

          if (!wasControlled) sessionStorage.removeItem(reloadKey);
        })
        .catch(() => undefined);
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch(() => {
        // Uygulama service worker olmadan da normal web uygulaması olarak çalışmaya devam eder.
      });
  }, []);
  return null;
}
