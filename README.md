# Movie Mood Picker

Aplikacja webowa do wyboru filmów i seriali z integracją TMDB, ulubionymi oraz logowaniem.

---

## Wymagania

- **.NET 8 SDK** – backend (ASP.NET Core)
- **Przeglądarka** z obsługą ES modules
- (Opcjonalnie) **Klucz API TMDB** – [themoviedb.org](https://www.themoviedb.org/settings/api) – do pobierania danych o filmach

---

## Instalacja i uruchomienie

### 1. Sklonowanie / pobranie projektu

```bash
git clone <url-repozytorium>
cd new_web_proj
```

### 2. Konfiguracja backendu

Uwaga: Plik appsettings.Development.json nie jest w repozytorium (dodany do .gitignore).
Każdy, kto klonuje projekt, musi utworzyć własny plik z kluczami, inaczej backend nie wystartuje.

W katalogu `backend/MovieMood.Api` skonfiguruj plik **`appsettings.Development.json`**:

- **JWT** – ustaw `Jwt:Key` na dowolny, długi, bezpieczny ciąg (np. wygenerowany klucz). Bez tego API nie wystartuje.
- **TMDB** – jeśli chcesz korzystać z danych o filmach, ustaw `Tmdb:ApiKey` na swój klucz z TMDB.

Przykład:

```{
    "Logging": {
      "LogLevel": {
        "Default": "Information",
        "Microsoft.AspNetCore": "Warning"
      }
    },
    "Jwt": {
      "Key": "tu-wstaw-wlasny-dlugi-bezpieczny-klucz-min-32-znaki"
    },
    "Tmdb": {
      "ApiKey": "u-wstaw-swoj-klucz-TMDB"
    }
  }
```

Jak zdobyć klucz TMDB:

Zarejestruj się lub zaloguj na https://www.themoviedb.org/
.

Przejdź do swojego profilu → Settings → API.

Kliknij Create lub Request API Key.

Wypełnij wymagane pola (np. nazwa projektu, opis) (dowolne wartości).

Po utworzeniu klucza, skopiuj go (string znaków).

### 3. Uruchomienie API (backend)

```bash
cd backend/MovieMood.Api
dotnet restore
dotnet run
```

API działa pod adresem: **http://localhost:5272**  
Swagger (w trybie Development): **http://localhost:5272/swagger**

### 4. Uruchomienie frontendu

Frontend to statyczne pliki HTML/CSS/JS. Muszą być serwowane przez serwer HTTP (np. ze względu na moduły ES).

**Opcja A – rozszerzenie Live Server (VS Code)**  
Otwórz folder `frontend` w edytorze i uruchom „Go Live” – strona będzie zwykle pod `http://localhost:5500` lub `http://127.0.0.1:5500`.

**Opcja B – Python**

```bash
cd frontend
python3 -m http.server 8080
```

Otwórz w przeglądarce: **http://localhost:8080**

**Opcja C – npx serve (Node.js)**

```bash
cd frontend
npx serve -l 3000
```

Otwórz: **http://localhost:3000**

### 5. Użycie aplikacji

1. Upewnij się, że backend działa na **http://localhost:5272**.
2. Otwórz w przeglądarce adres serwera frontendu (np. `http://localhost:5500`, `http://localhost:8080` lub `http://localhost:3000`).
3. Frontend łączy się z API pod `http://localhost:5272/api` (adres jest ustawiony w `frontend/js/core.js`).

Jeśli uruchamiasz frontend na innym porcie lub hoście, sprawdź w backendzie listę dozwolonych originów CORS w `Program.cs` – domyślnie dozwolone są m.in. `localhost:3000`, `localhost:8080`, `localhost:5500`.

---

## Struktura projektu

- **`backend/MovieMood.Api`** – API ASP.NET Core (auth JWT, filmy, ulubione, SQLite)
- **`frontend/`** – strona główna, strony Filmy/Ulubione/Logowanie, CSS, JS (moduły), PWA (manifest, service worker)
