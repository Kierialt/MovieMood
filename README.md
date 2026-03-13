# Dokumentacja projektu Movie Mood Picker

**Wersja dokumentu:** 1.0  
**Data:** 2026  
**Język:** polski  

**Działająca aplikacja (wdrożenie na Render):** [https://moviemood-4.onrender.com](https://moviemood-4.onrender.com)

---

## 1. Wprowadzenie

### 1.1 Opis projektu

**Movie Mood Picker** to aplikacja webowa (oraz cross-platformowa w formie PWA) służąca do wyszukiwania filmów i seriali telewizyjnych na podstawie wybranego typu treści i gatunku. Użytkownik wybiera, czy interesują go filmy, seriale czy animacje, następnie wybiera gatunek (np. komedia, dramat, science fiction), a aplikacja prezentuje listę rekomendacji z bazy The Movie Database (TMDB). Zalogowani użytkownicy mogą zapisywać pozycje w sekcji „Ulubione” i przeglądać rozbudowane szczegóły (obsada, trailery, galeria zdjęć, rekomendacje).

### 1.2 Cel projektu

Celem projektu jest dostarczenie prostego, czytelnego narzędzia do **wyboru filmu lub serialu „na wieczór”** — bez konieczności przeglądania wielu serwisów. Aplikacja łączy dane z zewnętrznego API (TMDB), własną bazę użytkowników i ulubionych oraz nowoczesny interfejs responsywny, działający na komputerach i urządzeniach mobilnych.

### 1.3 Problem, który rozwiązuje

Użytkownicy często stoją przed dylematem: **co obejrzeć?** Przeglądanie katalogów streamingowych bywa czasochłonne, a rekomendacje rozproszone. Movie Mood Picker:

- **Upraszcza wybór** — użytkownik wybiera typ (filmy/seriale/animacje) i gatunek, po czym otrzymuje listę popularnych tytułów.
- **Centralizuje informacje** — w jednym miejscu można zobaczyć opis, ocenę, obsadę, trailery i zdjęcia (dane z TMDB).
- **Pozwala gromadzić ulubione** — zalogowani użytkownicy budują własną listę ulubionych, dostępną z poziomu aplikacji.
- **Działa także offline (w ograniczonym zakresie)** — dzięki PWA zapisane strony i shell aplikacji mogą być dostępne bez połączenia; przy braku sieci wyświetlana jest strona „Jesteś offline”.

---

## 2. Funkcjonalności

Poniżej opisane są wszystkie dostępne funkcje aplikacji. W miejscach, gdzie warto dołączyć zrzut ekranu, umieszczono adnotację **„wstaw zdjęcie”** wraz z krótkim opisem, co pokazać.

### 2.1 Strona główna

- **Wyświetlanie** nazwy aplikacji (Movie Mood Picker), nawigacji (Strona Główna, Filmy, Ulubione, Zaloguj się) oraz sekcji hero z krótkim opisem działania.
- **Wybieranie typu kontekstu** — trzy karty: **Movies** (filmy), **TV Shows** (seriale), **Animations** (animacje). Kliknięcie w kartę zapisuje wybór i przenosi na stronę wyboru gatunku.
- **Wstaw zdjęcie:** Zrzut ekranu strony głównej z widocznymi trzema kartami (Movies, TV Shows, Animations) oraz nagłówkiem i nawigacją.

### 2.2 Wybór gatunku

- Po wyborze typu (filmy/seriale/animacje) użytkownik trafia na stronę z listą **gatunków** (np. Komedia, Dramat, Sci-Fi). Gatunki są zdefiniowane osobno dla filmów i seriali (zgodnie z API TMDB).
- Każda karta gatunku zawiera emoji, nazwę i krótki opis. Kliknięcie w kartę zapisuje wybrany gatunek i przenosi na listę filmów/seriali.
- **Wstaw zdjęcie:** Ekran wyboru gatunków dla jednego z typów (np. „Gatunki: Filmy”) z siatką kart gatunków.

### 2.3 Lista filmów / seriali / animacji

- Lista wyników w formie **siatki kart**. Każda karta zawiera: plakat (lub placeholder), tytuł, krótki opis, ocenę (gwiazdki).
- **Paginacja nieskończona (infinite scroll)** — przy przewijaniu do dołu automatycznie ładowane są kolejne strony wyników z API.
- Przycisk **„Zmień gatunek”** — powrót do wyboru gatunku bez zmiany typu (filmy/seriale/animacje).
- Dla **zalogowanych** użytkowników na każdej karcie dostępny jest przycisk **„Dodaj do ulubionych”** (ikona serca). Po dodaniu przycisk zmienia się na „W ulubionych” / „Usuń z ulubionych”.
- Przycisk **„Więcej szczegółów”** — otwiera modal ze szczegółami (opis, metadane, obsada, trailery, galeria, rekomendacje).
- **Wstaw zdjęcie:** Widok siatki filmów z widocznymi kartami, przyciskami „Więcej szczegółów” i „Dodaj do ulubionych” (np. na desktopie).

### 2.4 Modal „Więcej szczegółów”

- Otwierany po kliknięciu „Więcej szczegółów” na karcie filmu/serialu.
- Zawiera: tytuł, plakat, ocenę, rok produkcji, czas trwania (jeśli dostępny), certyfikację wiekową, opis, gatunki, języki, kraje produkcji, budżet i przychody (dla filmów, jeśli API zwraca).
- Sekcje: **Reżyseria i obsada** (reżyser + do 5 aktorów), **Trailery** (linki do YouTube), **Galeria zdjęć** (backdropy z TMDB), **Rekomendacje** (podobne tytuły).
- W modalu można dodać lub usunąć pozycję z ulubionych (dla zalogowanych).
- Zamykanie: klik w overlay, przycisk X lub klawisz Escape.
- **Wstaw zdjęcie:** Otwarty modal ze szczegółami filmu z widocznymi sekcjami (obsada, trailery, galeria).

### 2.5 Rejestracja i logowanie

- **Rejestracja:** formularz z polami: nazwa użytkownika (min. 3 znaki), adres e-mail, hasło (min. 6 znaków), potwierdzenie hasła. Walidacja po stronie klienta i serwera. Po udanej rejestracji użytkownik jest od razu zalogowany (otrzymuje token JWT) i przekierowany na stronę główną.
- **Logowanie:** formularz z polami: nazwa użytkownika lub e-mail, hasło. Po poprawnym logowaniu zapisywany jest token JWT w localStorage; w nagłówku zamiast „Zaloguj się” pojawia się awatar (pierwsza litera nicku) i opcja „Wyloguj się”.
- **Wstaw zdjęcie:** Strona auth z widocznymi zakładkami „Zaloguj się” i „Zarejestruj się” oraz formularzem logowania.

### 2.6 Ulubione

- Dostępne tylko dla **zalogowanych** użytkowników. W menu nawigacji link „Ulubione” prowadzi do strony z listą zapisanych pozycji.
- Lista wyświetlana w formie siatki kart (analogicznie do listy filmów): plakat, tytuł, opis, ocena, przycisk **„Usuń z ulubionych”**.
- Dla niezalogowanych wyświetlany jest komunikat zachęcający do logowania (z linkiem do strony auth).
- **Wstaw zdjęcie:** Strona „Ulubione” z kilkoma kartami filmów i przyciskami „Usuń z ulubionych”.

### 2.7 PWA (Progressive Web App)

- Aplikacja może być **zainstalowana** na urządzeniu (ikona na ekranie głównym) i uruchamiana w trybie standalone (bez paska adresu przeglądarki).
- **Działanie offline:** zasoby statyczne (CSS, JS, obrazy) są cache’owane; przy braku sieci nawigacja może wyświetlić zapisaną stronę lub dedykowaną stronę „Jesteś offline” z linkiem do strony głównej. Żądania do API nie są cache’owane (zawsze sieć).
- **Wstaw zdjęcie (opcjonalnie):** Ekran „Zainstaluj aplikację” w przeglądarce lub ikona aplikacji na ekranie głównym urządzenia mobilnego; ewentualnie strona offline.

### 2.8 Nawigacja i stan użytkownika

- Spójna nawigacja na wszystkich podstronach: Strona Główna, Filmy, Ulubione, Zaloguj się / Awatar + Wyloguj.
- Po wylogowaniu token i dane użytkownika są usuwane z localStorage; na stronie Ulubione użytkownik jest przekierowany do strony logowania.
- Wybrany typ treści i gatunek są zapisywane w localStorage, co pozwala po powrocie na listę filmów zachować ostatni wybór.

---

## 3. Technologie i narzędzia

Poniżej wymieniono technologie i narzędzia użyte podczas produkcji projektu.

### 3.1 Backend

- **ASP.NET Core 8** — framework aplikacji webowej API.
- **Entity Framework Core** — ORM do obsługi bazy danych (modele, migracje, zapytania).
- **SQLite** — baza danych (plik `movie_mood.db`); opcjonalnie w środowisku produkcyjnym (np. Render) montowany jest Persistent Disk z ścieżką do pliku bazy.
- **JWT (JSON Web Tokens)** — uwierzytelnianie użytkowników; generowanie tokenów po logowaniu/rejestracji, weryfikacja w endpointach chronionych (np. ulubione).
- **BCrypt** — hashowanie haseł (biblioteka BCrypt.Net-Next).
- **HttpClient** — komunikacja z zewnętrznym API TMDB (Discover, Details, Credits, Videos, Images, Recommendations).
- **Swagger (OpenAPI)** — dokumentacja API w trybie Development.

### 3.2 Frontend

- **HTML5** — struktura stron (index, movies, favorites, auth, genres, offline).
- **CSS3** — style (zmienne CSS, flexbox, grid, media queries, gradienty, cienie, przejścia). Brak zewnętrznych frameworków CSS.
- **JavaScript (ES modules)** — logika aplikacji; moduły: core (API, auth, helpers), main (routing, code splitting), strony (movies, favorites, auth), moduł movie-detail (modal), komponenty (FavoriteButton), serwisy (favorites-service), konfiguracja gatunków (genre-config).
- **Fetch API** — wywołania do backendu (z nagłówkiem Authorization dla JWT).
- **localStorage** — przechowywanie tokena JWT, nazwy użytkownika, roli oraz wybranego typu treści i gatunku.

### 3.3 PWA i wdrożenie

- **Service Worker** — cache’owanie zasobów (Cache First dla statyków, Network First dla stron HTML), strona offline.
- **Web App Manifest** — nazwa, ikony (192×192, 512×512), theme_color, display: standalone.
- **Docker** — wieloetapowy obraz (build: .NET SDK 8, runtime: aspnet 8), port 8080, serwowanie API + plików statycznych z wwwroot.
- **Render** — platforma wdrożeniowa (Web Service w kontenerze Docker); zmienne środowiskowe dla JWT i TMDB, opcjonalnie Persistent Disk dla bazy.

### 3.4 Zewnętrzne API i zasoby

- **The Movie Database (TMDB)** — API do pobierania list filmów/seriali (Discover), szczegółów, obsady, trailerów, zdjęć i rekomendacji. Obrazy plakatów: `https://image.tmdb.org/t/p/w500/...`.

### 3.5 Narzędzia wspomagające rozwój

- **Cursor** — edytor / IDE używany podczas implementacji i refaktoryzacji (podpowiedzi, generowanie kodu, nawigacja).
- **ChatGPT** (lub inne narzędzia oparte na LLM) — wsparcie przy pisaniu dokumentacji, sprawdzaniu składni, propozycjach rozwiązań (jeśli były używane).
- **Git** — kontrola wersji; repozytorium z projektem.
- **Live Server / Python http.server / npx serve** — serwowanie frontendu w trakcie developmentu (obsługa ES modules).
- **Przeglądarka (Chrome/Edge/Firefox/Safari)** — testowanie UI, DevTools (Application: Service Worker, Cache Storage, Network).

---

## 4. Architektura

### 4.1 Schemat połączeń: Frontend ↔ Backend ↔ Baza danych

Opis przepływu danych:

1. **Przeglądarka (Frontend)** — ładuje HTML/CSS/JS z serwera (w produkcji z tego samego hosta co API, katalog wwwroot). Wszystkie wywołania do API są wysyłane pod względną ścieżkę `/api/...` (w dev pod `http://localhost:5272/api`).
2. **Backend (ASP.NET Core)** — nasłuchuje na porcie 5272 (dev) lub 8080 (Docker). Ścieżki `/api/*` obsługiwane są przez kontrolery; ścieżki niezgodne z API i niebędące plikami statycznymi są przekierowywane do `index.html` (SPA-like fallback).
3. **Baza danych (SQLite)** — używana przez backend do: użytkowników (Users), ulubionych (Favorites), historii nastrojów (MoodHistory — model istnieje, może być rozwijany w przyszłości). Połączenie konfigurowane przez `ConnectionStrings:DefaultConnection`.
4. **TMDB** — backend wysyła żądania HTTP do TMDB (Discover, Details, Credits, Videos, Images, Recommendations); odpowiedzi są mapowane na DTO i zwracane do frontendu. Frontend nie komunikuje się z TMDB bezpośrednio.

**Wstaw zdjęcie:** Schemat blokowy: [Przeglądarka] ↔ [Backend API (Kontrolery → Serwisy/Db)] ↔ [SQLite] oraz [Backend] ↔ [TMDB API]. Można wykonać np. w draw.io lub Word (SmartArt).

### 4.2 Warstwy backendu

- **Kontrolery (Controllers)**  
  - **AuthController** (`/api/auth`) — rejestracja (POST register), logowanie (POST login). Walidacja wejścia, sprawdzanie duplikatów użytkownika, hashowanie hasła (BCrypt), wystawianie JWT.  
  - **MoviesController** (`/api/movies`) — GET lista filmów/seriali (query: type, genre, page), GET szczegóły (id/details), GET credits, videos, images, recommendations. Brak autoryzacji; dane z TmdbService.  
  - **FavoritesController** (`/api/favorites`) — chroniony atrybutem [Authorize]. GET lista ulubionych użytkownika, POST dodanie, DELETE po id lub po movieId. Identyfikacja użytkownika z tokena JWT (claim sub).

- **Serwisy (Services)**  
  - **JwtTokenService** — tworzenie tokena JWT (sub = userId, claim roli itd.) z użyciem klucza z konfiguracji (Jwt:Key).  
  - **TmdbService** — HttpClient do TMDB; metody: GetDiscoverAsync, GetDetailsAsync, GetCreditsAsync, GetVideosAsync, GetImagesAsync, GetRecommendationsAsync. Obsługa api_key oraz Bearer (access token). Konfiguracja: Tmdb:ApiKey, Tmdb:BaseUrl.

- **Konfiguracja (Config/Options)**  
  - **GenreConfig** — słowniki gatunków dla filmów i seriali (ID TMDB ↔ nazwa), walidacja typu (movie/tv/animation) i gatunku.  
  - **JwtOptions**, **TmdbOptions** — sekcje z appsettings/zmiennych środowiskowych.

- **Dane (Data)**  
  - **AppDbContext** — DbSet: Users, Favorites, MoodHistory. Konfiguracja relacji (User–Favorites, User–MoodHistory), indeksy unikalne na UserName i Email.

- **Modele (Models)**  
  - User (Id, UserName, Email, PasswordHash, Role, CreatedAt), Favorite (Id, UserId, MovieId, Title, PosterPath, Overview, Rating, AddedAt), MoodHistory (gotowy pod przyszłe rozszerzenia), UserRole (stałe ról).

- **DTO (Dtos)**  
  - Request/Response dla auth (RegisterRequest, LoginRequest, AuthResponse), filmów (MovieResponse, MovieDetailResponse, credits, videos, images, recommendations), ulubionych (FavoriteCreateRequest, FavoriteResponse).

### 4.3 Logika działania (skrót)

- **Rejestracja/Logowanie:** Frontend wysyła dane do `/api/auth/register` lub `/api/auth/login`. Backend weryfikuje dane, dla rejestracji sprawdza unikalność email/nazwy i haszuje hasło, następnie generuje JWT i zwraca token + userName, role itd. Frontend zapisuje token i dane w localStorage i aktualizuje link „Zaloguj się” na awatar + „Wyloguj się”.
- **Lista filmów:** Frontend odczytuje z URL lub localStorage typ i gatunek, wywołuje GET `/api/movies?type=...&genre=...&page=...`. Backend wywołuje TmdbService.GetDiscoverAsync i zwraca wyniki. Frontend renderuje karty, obsługuje infinite scroll (kolejne strony) oraz przyciski „Dodaj do ulubionych” (wymagany token) i „Więcej szczegółów”.
- **Szczegóły filmu:** Po kliknięciu „Więcej szczegółów” frontend lazy-loaduje moduł movie-detail, wywołuje `/api/movies/{id}/details`, credits, videos, images, recommendations i wypełnia modal.
- **Ulubione:** Żądania do `/api/favorites` z nagłówkiem Authorization: Bearer {token}. Backend odczytuje userId z JWT i zwraca/dodaje/usuwaje tylko wpisy tego użytkownika.

---

## 5. Interfejs użytkownika

### 5.1 Estetyka

- **Paleta kolorów:** Ciepłe neutrale (tło: #f6f4f0, powierzchnie: #ffffff, #fdfcfa), tekst główny #2c2925, drugoplanowy #7a756e. Akcenty: gradient od slate przez fiołek do ciepłego piasku (#5c6b7a → #7b7a9e → #a68b6b); dodatkowo akcenty głębokie, średnie i ciepłe. Błędy: #c75c5c, sukces: #6b8f71.
- **Typografia:** „Segoe UI”, system-ui, -apple-system, sans-serif; rozmiar bazowy 16px, line-height 1.65; wygładzanie czcionek (antialiased).
- **Elementy:** Zaokrąglone karty (border-radius 14px/10px), miękkie cienie (shadow-soft, shadow-medium, shadow-hover), gradient na logo (tekst wypełniony gradientem). Przyciski i karty mają stany hover z płynnym przejściem (0.25s ease).
- **Spójność:** Ten sam header/footer i nawigacja na wszystkich stronach; formularze (logowanie/rejestracja) w jednym widoku z zakładkami.

### 5.2 Responsywność

- Układ dostosowany do różnych szerokości ekranu: **flexbox** i **CSS Grid** (np. siatka filmów, karty gatunków, karty typu treści). Breakpointy w media queries zmieniają liczbę kolumn i rozmiary (np. mniejsze paddingi, mniejsze fonty na małych ekranach).
- Nawigacja w headerze z **flex-wrap** — na wąskich ekranach linki mogą przechodzić do nowej linii. Logo i menu pozostają czytelne na mobile.
- Modal szczegółów filmu — przewijany, z możliwością zamknięcia na małych ekranach (overlay, przycisk zamykania).
- **Wstaw zdjęcie:** Zrzut ekranu listy filmów na wąskim ekranie (np. 375px) oraz ten sam widok na desktopie — w celu pokazania responsywności.

### 5.3 Dostępność

- **Semantyczny HTML:** nagłówki (h1–h4), main, header, footer, nav, section, article, przyciski i linki używane zgodnie z przeznaczeniem.
- **Modal:** role="dialog", aria-labelledby wskazujące na tytuł, aria-modal="true", aria-hidden do ukrywania gdy zamknięty. Zamykanie klawiszem Escape i kliknięciem w overlay.
- **Formularze:** etykiety powiązane z polami (id/for lub aria-label); komunikaty błędów wyświetlane w tekście (np. pod formularzem).
- **Kontrast:** Tekst na tle spełnia wymagania czytelności; kolory błędów i sukcesu są odróżnialne.
- **Język:** atrybut lang="pl" w HTML; manifest i treści w języku polskim.

---

## 6. Proces produkcji

Opis etapów z zaznaczeniem użytych narzędzi.

### 6.1 Projektowanie

- **Zakres:** Określenie funkcji: wybór typu (filmy/seriale/animacje), wybór gatunku, lista z TMDB, szczegóły w modalu, rejestracja/logowanie JWT, ulubione per użytkownik, PWA.
- **Narzędzia:** Notatki, ewentualnie dokument w edytorze (Cursor), dyskusje / ChatGPT przy doprecyzowaniu wymagań i struktury API.

### 6.2 Implementacja

- **Backend:**  
  - Utworzenie projektu ASP.NET Core Web API, konfiguracja DbContext (SQLite), modele User, Favorite, MoodHistory, migracje EF.  
  - Implementacja AuthController (rejestracja, logowanie, BCrypt, JWT), FavoritesController (CRUD z [Authorize]), MoviesController (proxy do TMDB).  
  - Konfiguracja CORS, JWT Bearer, opcji Jwt i Tmdb z appsettings/zmiennych środowiskowych.  
  - **Narzędzia:** Cursor, .NET CLI (dotnet run, dotnet publish), przeglądarka (Swagger do testów API).

- **Frontend:**  
  - HTML stron: index, genres, movies, favorites, auth, offline.  
  - CSS: zmienne, layout, karty, formularze, modal, responsywność.  
  - JavaScript: moduły ES (core, main, pages, movie-detail, FavoriteButton, favorites-service, genre-config), code splitting (dynamiczny import dla movies/favorites/auth).  
  - Integracja z API (fetch, token w localStorage, nagłówek Authorization).  
  - **Narzędzia:** Cursor, Live Server / Python http.server / npx serve, DevTools.

- **PWA:**  
  - Service Worker (cache statyków i stron, brak cache API), offline.html, manifest.json, ikony, rejestracja SW w main.js.  
  - **Narzędzia:** Cursor, dokumentacja PWA, DevTools (Application).

- **Wdrożenie:**  
  - Dockerfile (multi-stage, port 8080), konfiguracja wwwroot z kopią frontendu, fallback do index.html.  
  - Instrukcja Render (DEPLOY_RENDER.md): Web Service Docker, zmienne środowiskowe, Persistent Disk.  
  - **Narzędzia:** Cursor, Docker (lokalna weryfikacja), Render Dashboard.

### 6.3 Testowanie

- **Manualne:**  
  - Rejestracja i logowanie (poprawne i błędne dane), wylogowanie, dostęp do ulubionych bez/ z tokenem.  
  - Wybór typu i gatunku, ładowanie listy, infinite scroll, „Zmień gatunek”.  
  - Dodawanie i usuwanie ulubionych z listy i z modala.  
  - Otwieranie i zamykanie modala szczegółów (overlay, Escape), sprawdzenie sekcji: obsada, trailery, galeria, rekomendacje.  
  - Responsywność na różnych szerokościach; PWA: instalacja, tryb offline (DevTools Network Offline), strona offline.  
  - **Narzędzia:** Przeglądarka (Chrome/Edge/Firefox), DevTools, ewentualnie emulator urządzeń.

- **Automatyczne:**  
  - W projekcie nie są zdefiniowane zautomatyzowane testy jednostkowe ani E2E (brak xUnit/NUnit dla backendu, brak Jest/Cypress/Playwright dla frontendu). Scenariusze testowe dla przyszłych testów automatyzowanych opisano w rozdziale 7.

### 6.4 Wdrożenie

- **Lokalnie:** Backend: `dotnet run` w katalogu MovieMood.Api; frontend: serwer statyczny (Live Server / Python / npx serve). Opcjonalnie jedna aplikacja: frontend skopiowany do wwwroot, `dotnet run` — aplikacja pod jednym portem.
- **Render:** Połączenie repozytorium Git, wybór Docker, konfiguracja zmiennych Jwt__Key i Tmdb__ApiKey, opcjonalnie Persistent Disk dla SQLite. Push do repozytorium uruchamia build i deploy.
- **Narzędzia:** Git, Render Dashboard, ewentualnie Docker lokalnie.

---

## 7. Testowanie

### 7.1 Scenariusze testowe (manualne)

- **Auth:**  
  - Rejestracja z poprawnymi danymi → konto utworzone, przekierowanie na stronę główną, widoczny awatar.  
  - Rejestracja z duplikatem email/nazwy → komunikat o konflikcie.  
  - Rejestracja z hasłem &lt; 6 znaków lub niezgodne potwierdzenie → komunikaty błędów.  
  - Logowanie poprawnymi danymi → token zapisany, awatar w nagłówku.  
  - Logowanie błędnymi danymi → komunikat „Nieprawidłowe dane logowania”.  
  - Wylogowanie → token usunięty, link „Zaloguj się” widoczny; na stronie Ulubione przekierowanie do auth.

- **Filmy/Seriale:**  
  - Wybór typu (Movies/TV/Animations) → przekierowanie na gatunki.  
  - Wybór gatunku → lista wyników, nagłówek i licznik („Znaleziono X filmów/seriali”).  
  - Infinite scroll → ładowanie kolejnych stron bez błędu.  
  - „Zmień gatunek” → powrót do listy gatunków, po ponownym wyborze lista się odświeża.

- **Szczegóły:**  
  - „Więcej szczegółów” → modal się otwiera, ładują się szczegóły, obsada, trailery, galeria, rekomendacje.  
  - Zamknięcie: X, overlay, Escape → modal się zamyka.

- **Ulubione:**  
  - Zalogowany: dodanie filmu z listy → przycisk zmienia stan; wejście na stronę Ulubione → film na liście.  
  - Usunięcie z listy ulubionych lub z modala → pozycja znika z Ulubionych i przycisk na karcie wraca do „Dodaj do ulubionych”.  
  - Niezalogowany: wejście na Ulubione → komunikat „Zaloguj się”.

- **PWA:**  
  - Po załadowaniu strony w DevTools → Application: Service Worker zarejestrowany, Cache Storage wypełniony.  
  - Network → Offline → odświeżenie → strona z cache lub offline.html.  
  - Instalacja (jeśli dostępna) → ikona na pulpicie, uruchomienie w standalone.

### 7.2 Testy automatyczne (obecny stan i propozycje)

- **Obecny stan:** W repozytorium nie ma zdefiniowanych testów jednostkowych ani E2E. API można testować ręcznie przez Swagger lub narzędzia typu Postman/curl.
- **Propozycje na przyszłość:**  
  - **Backend:** Testy jednostkowe (xUnit/NUnit) dla AuthController (rejestracja, logowanie, walidacja), FavoritesController (dodawanie/usuwanie dla użytkownika), TmdbService (mock HttpClient). Testy integracyjne z testową bazą SQLite.  
  - **Frontend:** Testy jednostkowe (Jest) dla core.js (apiRequest, getToken/setToken), favorites-service, walidacji formularzy w auth.js. Testy E2E (np. Playwright/Cypress): pełny flow rejestracja → wybór gatunku → lista → dodanie do ulubionych → strona Ulubione.

---

## 8. Wnioski i możliwości rozwoju

### 8.1 Osiągnięcia

- Działająca aplikacja webowa z wyborem typu treści (filmy/seriale/animacje) i gatunku oraz listą wyników z TMDB.
- Pełna ścieżka użytkownika: rejestracja, logowanie JWT, lista ulubionych z dodawaniem i usuwaniem.
- Rozbudowany modal szczegółów: metadane, obsada, trailery, galeria, rekomendacje.
- Responsywny interfejs z spójną estetyką i podstawami dostępności.
- PWA: instalowalność, cache i strona offline.
- Wdrożenie jako jedna aplikacja (API + frontend z wwwroot) w Dockerze na Render z opcjonalnym trwałym dyskiem dla bazy.

### 8.2 Możliwości rozwoju

- **Testy:** Wprowadzenie testów jednostkowych i integracyjnych dla backendu oraz testów E2E dla kluczowych ścieżek (rejestracja, ulubione, przeglądanie filmów).
- **Funkcje:**  
  - Wykorzystanie modelu MoodHistory (np. „historia wyborów” lub „nastrój” użytkownika).  
  - Wyszukiwarka po tytule (TMDB search).  
  - Filtry (np. rok, ocena) w discover.  
  - Powiadomienia PWA (Web Push) przy nowych rekomendacjach lub premierach.
- **UX:** Ciemny motyw (preferencja użytkownika), poprawa dostępności (np. pełna nawigacja klawiaturą, aria-live dla dynamicznych treści).
- **Infrastruktura:** Opcjonalna migracja z SQLite na PostgreSQL przy skalowaniu; rate limiting i zabezpieczenia API; monitoring i logowanie błędów (np. Serilog, integracja z zewnętrznym serwisem).
- **Dokumentacja:** Uzupełnienie tego dokumentu o zrzuty ekranu w miejscach oznaczonych „wstaw zdjęcie” oraz ewentualne diagramy architektury (np. schemat Frontend–Backend–DB–TMDB).

---

**Koniec dokumentacji.**

Dokument jest gotowy do wklejenia do edytora tekstu (np. Word) i uzupełnienia o zrzuty ekranu oraz ewentualne fragmenty kodu w wybranych sekcjach.
