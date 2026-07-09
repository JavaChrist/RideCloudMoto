"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker au chargement pour rendre l'app installable (PWA).
 * Sans enregistrement global, l'invite d'installation du navigateur n'apparaît pas.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* silencieux : l'échec d'enregistrement ne doit pas casser l'app */
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
