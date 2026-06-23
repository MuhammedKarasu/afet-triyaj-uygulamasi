"use client";

import { useEffect, useState } from "react";
import { Share2, X } from "lucide-react";

export function PwaInstallHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    const dismissed = window.localStorage.getItem("afetsaha:pwa-hint-dismissed") === "1";
    const isiPhoneSafari = /iphone|ipad|ipod/i.test(navigator.userAgent) && /safari/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    setVisible(isiPhoneSafari && !standalone && !dismissed);
  }, []);

  if (!visible) return null;
  const dismiss = () => {
    window.localStorage.setItem("afetsaha:pwa-hint-dismissed", "1");
    setVisible(false);
  };

  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-brand-950 lg:hidden">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-brand-700 shadow-sm"><Share2 className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1"><p className="text-sm font-bold">AfetSaha'yı ana ekrana ekleyin</p><p className="mt-1 text-xs leading-5 text-brand-800/75">Safari'de Paylaş simgesine, ardından <b>Ana Ekrana Ekle</b> seçeneğine dokunun.</p></div>
      <button onClick={dismiss} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-brand-700 hover:bg-white" aria-label="Kurulum ipucunu kapat"><X className="h-4 w-4" /></button>
    </div>
  );
}
