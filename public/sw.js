/* Offline shell for the OPD console.
 *
 * Caches ONLY the app shell (static assets + page HTML/RSC, which contain no
 * patient data — all data is fetched client-side from /api). API and upload
 * requests are never cached or intercepted. Caches are wiped on sign-out. */
const VERSION = "v1";
const STATIC = `opd-static-${VERSION}`;
const PAGES = `opd-pages-${VERSION}`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGES).then((c) => c.add(OFFLINE_URL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC && k !== PAGES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "clear-caches") {
    event.waitUntil(
      Promise.all([caches.delete(STATIC), caches.delete(PAGES)]).then(() => caches.open(PAGES).then((c) => c.add(OFFLINE_URL))),
    );
  }
});

const cacheable = (res) => res && res.status === 200 && !res.redirected && res.type === "basic";

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/uploads/")) return;

  // Immutable build assets, fonts and icons: cache-first.
  if (url.pathname.startsWith("/_next/static/") || /\.(?:woff2?|png|svg|ico|webp)$/.test(url.pathname)) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (cacheable(res)) cache.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  const isNavigation = req.mode === "navigate";
  const isRsc = req.headers.get("RSC") === "1";
  if (!isNavigation && !isRsc) return;

  // Pages / RSC payloads: network-first, fall back to the last good copy, then the offline page.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (cacheable(res)) {
          const copy = res.clone();
          caches.open(PAGES).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(async () => {
        const cache = await caches.open(PAGES);
        const hit = await cache.match(req);
        if (hit) return hit;
        if (isNavigation) {
          const offline = await cache.match(OFFLINE_URL);
          if (offline) return offline;
        }
        return Response.error();
      }),
  );
});
