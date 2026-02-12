/**
 * Service Worker – PWA: cache statyczne (Cache First), API (Network First, bez cache).
 * Osobny moduł, bez mieszania z logiką aplikacyjną.
 * Wersja cache do bezpiecznej aktualizacji – zmiana CACHE_VERSION czyści stare cache.
 */
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `movie-mood-static-${CACHE_VERSION}`;
const PAGES_CACHE = `movie-mood-pages-${CACHE_VERSION}`;

/** Ścieżki do pre-cache (shell aplikacji + strona offline). */
const PRECACHE_URLS = [
  '/index.html',
  '/offline.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/core.js',
  '/js/genre-config.js',
  '/pages/genres.html',
  '/pages/auth.html',
  '/pages/movies.html',
  '/pages/favorites.html'
];

/** Czy żądanie dotyczy zasobu statycznego (CSS, JS, obrazy, fonty) z tego samego origin. */
function isStaticAsset(url) {
  try {
    const u = new URL(url);
    if (u.origin !== self.location.origin) return false;
    const path = u.pathname.toLowerCase();
    return (
      path.includes('/css/') ||
      path.includes('/js/') ||
      path.includes('/images/') ||
      path.includes('/fonts/') ||
      /\.(css|js|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|eot)$/.test(path)
    );
  } catch {
    return false;
  }
}

/** Czy żądanie idzie do API (backend lub TMDB) – nie cache’ujemy, nie serwujemy z cache. */
function isApiRequest(url) {
  try {
    const u = new URL(url);
    return (
      u.pathname.includes('/api/') ||
      u.hostname.includes('themoviedb.org')
    );
  } catch {
    return false;
  }
}

/** Czy to żądanie nawigacji (strona). */
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// —— install: pre-cache shell + offline ——
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(
        PRECACHE_URLS.map((path) => new URL(path, self.location.origin).href)
      ).catch((err) => {
        console.warn('[SW] Precache partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// —— activate: usunięcie starych cache (bezpieczna aktualizacja) ——
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name.startsWith('movie-mood-') && name !== STATIC_CACHE && name !== PAGES_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// —— fetch: strategie cache ——
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Żądań API nie cache’ujemy i nie serwujemy z cache (świeże dane, brak wrażliwych w cache).
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ offline: true, message: 'Brak połączenia z siecią.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Zasoby statyczne (CSS, JS, obrazy): Cache First.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone();
        if (res.ok) {
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return res;
      }))
    );
    return;
  }

  // Nawigacja (strony): Network First, fallback cache, na końcu strona offline.
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          if (res.ok) {
            caches.open(PAGES_CACHE).then((cache) => cache.put(request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match(new URL('/offline.html', self.location.origin).href);
          })
        )
    );
    return;
  }

  // Pozostałe żądania (np. inne dokumenty): Network First, fallback do cache.
  event.respondWith(
    fetch(request).then((res) => {
      const clone = res.clone();
      if (res.ok) {
        caches.open(PAGES_CACHE).then((cache) => cache.put(request, clone));
      }
      return res;
    }).catch(() => caches.match(request))
  );
});
