# Code Splitting w projekcie Movie Mood Picker

## Jak to działa

### 1. Entry point (`js/main.js`)

- Ładowany na **wszystkich** stronach (jako moduł ES: `type="module"`).
- Zawiera **minimalny** kod startowy:
  - import `core.js` (API, auth, updateAuthLink),
  - `updateAuthLink()` po załadowaniu DOM,
  - logikę strony głównej (content-type grid) i strony gatunków (genre grid),
  - **routing**: na podstawie `pathname` wywołuje **dynamiczny** `import('./pages/...')` tylko dla aktualnej strony.

### 2. Core (`js/core.js`)

- Współdzielony moduł: konfiguracja API, `apiRequest`, funkcje auth (getToken, setToken, isAuthenticated, updateAuthLink, logout).
- Importowany przez `main.js` oraz przez moduły stron i `modules/movie-detail.js`.

### 3. Moduły stron (`js/pages/*.js`)

- **movies.js** – ładowany **tylko na** `/movies.html`: lista filmów, infinite scroll, render kart, przycisk „Więcej szczegółów”.
- **favorites.js** – ładowany **tylko na** `/favorites.html`: lista ulubionych, usuwanie.
- **auth.js** – ładowany **tylko na** `/auth.html`: logowanie, rejestracja, zakładki.

Każdy moduł eksportuje `init()`, które main wywołuje po `import()`.

### 4. Moduł szczegółów filmu (`js/modules/movie-detail.js`) – lazy

- **Nie** ładuje się przy wejściu na stronę filmów.
- Ładuje się **dopiero** po kliknięciu „Więcej szczegółów” w `movies.js`:
  - `const { openMovieDetailModal } = await import('../modules/movie-detail.js');`
  - `openMovieDetailModal(movieId, apiType);`
- Zawiera: otwieranie/zamykanie modala, fetch szczegółów, obsadę, **trailer**, **galerię**, **rekomendacje** i ich renderowanie.

---

## Co się zmienia

### Struktura plików

- **Nowe:**  
  `js/core.js`, `js/pages/movies.js`, `js/pages/favorites.js`, `js/pages/auth.js`, `js/modules/movie-detail.js`.
- **Zmieniony:**  
  `js/main.js` – zmniejszony do roli entry + routing (bez logiki stron i modala).
- **Bez zmian:**  
  `genre-config.js` (ładowany jak dotąd jako zwykły skrypt, np. przed main), HTML/CSS, backend.

### Sposób ładowania JS

- **Przed:** jedna duża paczka – `main.js` (~1000 linii) na każdej stronie.
- **Po:**
  - Wszędzie: `main.js` (cienki) + `core.js` (jeden wspólny import w main).
  - Strona główna / gatunki: tylko main + core (+ genre-config).
  - Movies: main → dynamiczny `import('./pages/movies.js')` → `movies.init()`.
  - Favorites: main → `import('./pages/favorites.js')` → `init()`.
  - Auth: main → `import('./pages/auth.js')` → `init()`.
  - Modal (szczegóły filmu, trailer, galeria, rekomendacje): ładowane **dopiero** przy pierwszym kliknięciu „Więcej szczegółów” przez `import('../modules/movie-detail.js')` z poziomu `movies.js`.

### Wydajność

- Mniejszy początkowy JS na stronie głównej i gatunkach (brak kodu filmów, ulubionych, auth, modala).
- Na `/movies.html` – brak kodu modala/trailera/galerii/rekomendacji do pierwszego kliknięcia.
- Kolejne otwarcia modala używają już załadowanego modułu (cache `import()`).

### Dla użytkownika

- Działanie aplikacji bez zmian (nawigacja, filmy, ulubione, logowanie, modal, trailer, galeria, rekomendacje).
- Możliwa szybsza pierwsza odpowiedź strony (mniej JS do parsowania przy starcie).

### Backend

- **Nic się nie zmienia** – API, endpointy, CORS, auth działają tak samo.

---

## Wymagania architektoniczne (zachowane)

- Istniejąca struktura projektu (frontend w `frontend/`, strony w `pages/`, skrypty w `js/`) pozostaje.
- Logika renderowania jest w modułach (np. `renderMovies`, `renderMovieDetailContent`), fetch w osobnych funkcjach (np. `apiRequest`, `fetchMovieDetails`); nie mieszamy tego w jednym wielkim pliku.
- Kod podzielony na core, strony i moduł movie-detail jest czytelny i łatwy do rozbudowy (np. nowa strona = nowy plik w `pages/` + jeden `import()` w main).

---

## Rozbudowa

- **Nowa strona:**  
  Dodać `js/pages/nazwa-strony.js` z `export function init() { ... }` i w `main.js` w `DOMContentLoaded` wykryć path i wywołać `import('./pages/nazwa-strony.js').then(m => m.init())`.
- **Nowy moduł lazy (np. inny modal):**  
  W odpowiednim miejscu (np. w `pages/...`) użyć `await import('../modules/nazwa-modulu.js')` i wywołać eksportowaną funkcję.

---

## Czy warto przy małym projekcie?

- **Mały projekt (kilka stron, jeden główny plik JS):** code splitting nie jest konieczny; można go dodać później przy wzroście kodu.
- **Średni/duży lub planowany wzrost:** tak – mniejszy początkowy bundle, szybszy First Load, a podział na core / strony / moduły ułatwia utrzymanie i rozwój.

W tym projekcie rozwiązanie jest **optymalne**, bo: używa natywnego `import()` (bez bundlera), nie zmienia backendu ani struktury katalogów, zachowuje separację fetch/render i daje skalowalny wzorzec na kolejne strony i moduły.
