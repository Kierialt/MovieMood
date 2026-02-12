/**
 * Rejestracja Service Workera – osobny moduł, bez mieszania z logiką aplikacyjną.
 * Uruchamiany raz przy starcie aplikacji. Działa tylko w bezpiecznym kontekście (HTTPS / localhost).
 */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isSecure) return;

  const isInPages = /\/pages\//.test(window.location.pathname);
  const swUrl = isInPages ? '../service-worker.js' : 'service-worker.js';

  navigator.serviceWorker
    .register(swUrl, { scope: isInPages ? '../' : './' })
    .then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nowa wersja SW jest gotowa; można np. pokazać "Odśwież, by zobaczyć nową wersję".
          }
        });
      });
    })
    .catch((err) => {
      console.warn('[PWA] Service Worker registration failed:', err);
    });
}

registerServiceWorker();
