const resetScript = `
(() => {
  if (!("serviceWorker" in navigator)) return;

  const reloadKey = "afetsaha-dev-pwa-reset-v1";
  const wasControlled = Boolean(navigator.serviceWorker.controller);
  const clearWorkers = navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())));
  const clearCaches = "caches" in window
    ? caches.keys().then((keys) => Promise.all(
        keys.filter((key) => key.startsWith("afetsaha-")).map((key) => caches.delete(key)),
      ))
    : Promise.resolve([]);

  Promise.all([clearWorkers, clearCaches])
    .then(() => {
      if (wasControlled && sessionStorage.getItem(reloadKey) !== "done") {
        sessionStorage.setItem(reloadKey, "done");
        window.location.reload();
        return;
      }

      if (!wasControlled) sessionStorage.removeItem(reloadKey);
    })
    .catch(() => undefined);
})();
`;

/** Geliştirme sunucusunu önceki production PWA kaydı ve cache'inden ayırır. */
export function DevelopmentPwaReset() {
  if (process.env.NODE_ENV === "production") return null;

  return <script id="afetsaha-development-pwa-reset" dangerouslySetInnerHTML={{ __html: resetScript }} />;
}
