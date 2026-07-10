/* RideCloudMoto — Service Worker (Web Push) */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/* Gestionnaire fetch minimal (réseau d'abord) — requis pour l'installabilité PWA. */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).catch(() => Response.error()));
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: "RideCloudMoto", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "RideCloudMoto";
  const isSos = (payload.tag || "").indexOf("sos") === 0;
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/logo192.png",
    badge: "/logo96.png",
    tag: payload.tag || "ridecloudmoto",
    data: { url: payload.url || "/categories" },
    requireInteraction: isSos,
    vibrate: isSos ? [200, 100, 200, 100, 200] : undefined,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/categories";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
