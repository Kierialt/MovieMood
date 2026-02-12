# PWA (Progressive Web App) – Movie Mood Picker

## 1. Jak działa Service Worker w tym projekcie

- **Service Worker** (`service-worker.js`) działa w tle w przeglądarce i przechwytuje żądania sieciowe (fetch).
- Jest **osobnym plikiem** w katalogu frontendu – nie miesza się z logiką aplikacyjną (routing, API, UI).
- **Rejestracja** odbywa się w module `js/sw-registration.js`, który jest importowany raz w `main.js` – bez wpływu na resztę kodu.
- Działa tylko w **bezpiecznym kontekście**: HTTPS lub `localhost` / `127.0.0.1`.

### Przepływ

1. Przy pierwszym wejściu na stronę przeglądarka rejestruje Service Workera (z `service-worker.js` lub `../service-worker.js` w zależności od ścieżki).
2. W zdarzeniu `install` SW otwiera cache statyczny i pre-cache’uje listę plików (shell + strona offline).
3. W zdarzeniu `activate` usuwa stare wersje cache (po zmianie `CACHE_VERSION`).
4. Przy każdym żądaniu (`fetch`):
   - **API** (backend, TMDB) → tylko sieć, **bez zapisu do cache** (świeże dane, brak wrażliwych w cache).
   - **Zasoby statyczne** (CSS, JS, obrazy) → **Cache First** (najpierw cache, potem sieć).
   - **Nawigacja** (strony HTML) → **Network First** (najpierw sieć, przy braku sieci – cache, na końcu strona `offline.html`).

## 2. Co zostało dodane

| Element | Opis |
|--------|------|
| `service-worker.js` | Service Worker: strategie cache, pre-cache, aktualizacja po `CACHE_VERSION`. |
| `js/sw-registration.js` | Rejestracja SW (bezpieczny kontekst, ścieżka zależna od `/pages/`). |
| `offline.html` | Dedykowana strona „Jesteś offline” z linkiem do strony głównej. |
| `manifest.json` | Nazwa, `short_name`, `theme_color`, `display: standalone`, ikony 192/512. |
| `icons/icon-192.png`, `icons/icon-512.png` | Ikony aplikacji (do instalacji PWA). |
| `icons/icon.svg` | Wersja wektorowa ikony (opcjonalna do dalszej obróbki). |
| W każdym HTML | `<link rel="manifest" href="...">`, `<meta name="theme-color" content="#5c6b7a">`. |
| W `main.js` | Jedna linia: `import './sw-registration.js';`. |

## 3. Czy backend wymagał zmian

**Nie.** Backend (ASP.NET Core) pozostaje bez zmian:

- Żadne endpointy API nie zostały zmodyfikowane.
- Nie dodano serwowania plików statycznych w backendzie – frontend nadal może być serwowany osobno (np. Live Server, nginx, lub w przyszłości `UseStaticFiles` z katalogu frontendu).
- Service Worker i manifest działają po stronie klienta; backend nie musi „wiedzieć” o PWA.

Jeśli w przyszłości zdecydujesz się serwować frontend z backendu (np. z jednej domeny), wystarczy skonfigurować `UseStaticFiles` na katalog z frontendem – bez zmian w logice PWA.

## 4. Co zmienia się „z zewnątrz” dla użytkownika

- **Instalacja**: w obsługiwanych przeglądarkach (Chrome, Edge, Safari na iOS itd.) pojawia się możliwość **„Zainstaluj aplikację”** – aplikacja może być dodana do ekranu głównego i otwierana jak natywna (bez paska adresu przy `display: standalone`).
- **Offline**: przy braku sieci użytkownik zobaczy ostatnio odwiedzoną stronę (jeśli była w cache) albo stronę **„Jesteś offline”** z linkiem do strony głównej – bez czerwonych błędów w konsoli.
- **Szybsze ładowanie**: powtórne wejścia na stronę korzystają z cache dla CSS/JS/obrazów (Cache First), co skraca czas ładowania.
- **Spójny wygląd**: pasek stanu / nagłówek przeglądarki w kolorze aplikacji (`theme_color`).

## 5. Strategia cache (skrót)

| Typ żądania | Strategia | Cache? |
|-------------|-----------|--------|
| API (backend, TMDB) | Network only | Nie – nigdy nie cache’ujemy API. |
| CSS, JS, obrazy, fonty (same origin) | Cache First | Tak – najpierw cache, potem sieć. |
| Nawigacja (strony HTML) | Network First → cache → `offline.html` | Tak – strony po udanej odpowiedzi. |

- **Bezpieczna aktualizacja**: w `service-worker.js` stała `CACHE_VERSION` (np. `v1`). Po jej zmianie (np. na `v2`) przy `activate` stare cache są usuwane, więc użytkownik nie dostaje starych plików.

## 6. Rozszerzenia w przyszłości (np. push notifications)

- **Push notifications**: wymagają po stronie backendu endpointu do wysyłania powiadomień (np. Web Push API, biblioteki dla ASP.NET Core) oraz w Service Workerze obsługi `push` i `notificationclick`. Obecna struktura (osobny plik SW, rejestracja w `sw-registration.js`) ułatwia dodanie tych zdarzeń bez mieszania z logiką aplikacji.
- **Background Sync**: w SW można dodać obsługę `sync` i odsyłać dane do API, gdy połączenie wróci.
- **Periodic Background Sync**: w SW + w manifest odpowiednie uprawnienia – do odświeżania treści w tle (zgodnie z polityką przeglądarki).

Żadna z tych funkcji nie wymaga zmiany istniejących endpointów API – tylko rozszerzenia backendu (nowe endpointy) i nowe handlery w `service-worker.js`.

## 7. Bezpieczeństwo i dobre praktyki

- **Wrażliwe dane**: Service Worker **nie cache’uje** odpowiedzi API – tokeny i dane użytkownika nie trafiają do cache.
- **API**: żądania do `/api/` i TMDB są zawsze realizowane przez sieć; przy braku połączenia zwracany jest 503 (aplikacja może pokazać komunikat offline).
- **HTTPS**: PWA w produkcji powinno być serwowane przez HTTPS (Service Worker wymaga bezpiecznego kontekstu; localhost jest traktowany jako bezpieczny).
- **Aktualizacje**: zmiana `CACHE_VERSION` w `service-worker.js` powoduje usunięcie starych cache przy następnej aktywacji nowego SW.

## 8. Podsumowanie zmian

- **Dodane pliki**: `service-worker.js`, `js/sw-registration.js`, `offline.html`, `manifest.json`, `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon.svg`, `docs/PWA.md`.
- **Zmodyfikowane**: `index.html`, `pages/*.html` (manifest + theme-color), `main.js` (import `sw-registration.js`).
- **Backend**: brak zmian.
- **Skalowalność**: SW i rejestracja są wydzielone; dodanie nowych stron/zasobów do pre-cache lub nowych strategii to edycja jednego pliku (`service-worker.js`). Rozbudowa o push/background sync nie wymaga refaktoryzacji istniejącej logiki.

## 9. Jak testować PWA

### Lokalnie

1. **Serwuj frontend przez HTTP(S)** – np. Live Server w VS Code (port 5500), lub `npx serve frontend` w katalogu projektu. Service Worker nie działa przy otwieraniu plików przez `file://`.
2. Otwórz aplikację w przeglądarce (np. `http://localhost:5500`).
3. W DevTools → Application (Chrome) / Storage (Firefox):
   - **Service Workers** – powinien być zarejestrowany i aktywny.
   - **Cache Storage** – powinny być cache `movie-mood-static-*` i `movie-mood-pages-*`.
   - **Manifest** – powinien być widoczny z ikonami i `display: standalone`.
4. **Offline**: w DevTools → Network włącz „Offline” i odśwież stronę lub przejdź do innej – powinna pojawić się strona z cache lub `offline.html`.
5. **Instalacja**: w pasku adresu (Chrome/Edge) lub w menu powinna być opcja „Zainstaluj Movie Mood Picker” (jeśli spełnione są kryteria PWA).

### Po wdrożeniu

1. Serwuj frontend przez **HTTPS**.
2. Sprawdź manifest pod poprawnym URL (np. `https://twoja-domena.pl/manifest.json`).
3. Zweryfikuj w [Lighthouse](https://developers.google.com/web/tools/lighthouse) zakładkę „Progressive Web App” – powinna przechodzić wymagania dla PWA (manifest, SW, offline, instalowalność).
4. Przetestuj instalację na urządzeniu mobilnym (Android/iOS) i zachowanie offline.
