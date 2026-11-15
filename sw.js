// Basit service worker: uygulama kabuğu önbellekte (çevrimdışı açılır), ntfy istekleri hiç önbelleğe alınmaz.
const SURUM = "zepul-telefon-v2";
const KABUK = ["./", "index.html", "manifest.webmanifest", "ikon.svg", "ikon-192.png", "ikon-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(SURUM).then((c) => c.addAll(KABUK))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== SURUM).map((x) => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // ntfy.sh: doğrudan ağ
  // Önce ağ (güncel sürüm), olmazsa önbellek
  e.respondWith(fetch(e.request).then((r) => {
    if (r.ok) { const k = r.clone(); caches.open(SURUM).then((c) => c.put(e.request, k)); }
    return r;
  }).catch(() => caches.match(e.request).then((r) => r || caches.match("index.html"))));
});
