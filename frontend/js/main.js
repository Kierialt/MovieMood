// API Configuration
const API_BASE_URL = 'http://localhost:5272/api';

// Test - sprawdzenie czy skrypt się ładuje
console.log('✅ Skrypt main.js załadowany!');
console.log('API_BASE_URL:', API_BASE_URL);

// Utility functions
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');
const isAuthenticated = () => !!getToken();

// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        console.log('Wysyłanie żądania do:', `${API_BASE_URL}${endpoint}`);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        console.log('Odpowiedź status:', response.status, response.statusText);
        const data = await response.json().catch((err) => {
            console.error('Błąd parsowania JSON:', err);
            return {};
        });

        if (!response.ok) {
            console.error('Błąd API:', data);
            throw new Error(data.message || data.title || `HTTP error! status: ${response.status}`);
        }

        console.log('Otrzymane dane:', data);
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Update auth link in navigation
function updateAuthLink() {
    const authLinks = document.querySelectorAll('#auth-link');
    authLinks.forEach(link => {
        if (isAuthenticated()) {
            link.textContent = 'Wyloguj się';
            link.href = '#';
            link.onclick = (e) => {
                e.preventDefault();
                logout();
            };
        } else {
            link.textContent = 'Zaloguj się';
            // Sprawdzamy aktualną ścieżkę, aby poprawnie ustawić href
            const currentPath = window.location.pathname;
            const isInPagesFolder = currentPath.includes('/pages/') || 
                                   currentPath.endsWith('/pages') ||
                                   currentPath.includes('pages.html') ||
                                   currentPath.includes('movies.html') ||
                                   currentPath.includes('favorites.html') ||
                                   currentPath.includes('auth.html');
            // Zawsze ustawiamy poprawny href na podstawie aktualnej lokalizacji
            link.href = isInPagesFolder ? 'auth.html' : 'pages/auth.html';
            link.onclick = null;
        }
    });
}

// Logout function
function logout() {
    removeToken();
    updateAuthLink();
    if (window.location.pathname.includes('favorites.html')) {
        // Jesteśmy w folderze pages, więc auth.html jest w tym samym folderze
        window.location.href = 'auth.html';
    } else {
        window.location.reload();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM załadowany. Aktualna ścieżka:', window.location.pathname);
    console.log('URL:', window.location.href);
    
    updateAuthLink();

    // Handle mood selection on index page
    const moodCards = document.querySelectorAll('.mood-card');
    console.log('Znaleziono kart nastroju:', moodCards.length);
    
    moodCards.forEach((card, index) => {
        const mood = card.dataset.mood;
        console.log(`Karta ${index + 1}: nastrój =`, mood);
        
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const selectedMood = card.dataset.mood;
            console.log('Kliknięto kartę nastroju:', selectedMood);
            
            // Sprawdź, czy jesteś na stronie głównej czy w folderze pages
            const currentPath = window.location.pathname;
            let basePath;
            
            if (currentPath.includes('/pages/')) {
                basePath = './';
            } else if (currentPath.endsWith('/') || currentPath === '/') {
                basePath = 'pages/';
            } else {
                basePath = 'pages/';
            }
            
            // Sprawdź, czy nastrój się zmienił
            const previousMood = localStorage.getItem('selectedMood');
            localStorage.setItem('selectedMood', selectedMood);
            
            // Jeśli nastrój się zmienił, resetuj stronę do 1
            if (previousMood && previousMood !== selectedMood) {
                console.log('Nastrój się zmienił z', previousMood, 'na', selectedMood, '- resetowanie strony do 1');
                localStorage.removeItem('currentPage');
            }
            
            console.log('Zapisano nastrój w localStorage:', selectedMood);
            
            // Zawsze zaczynaj od strony 1 przy wyborze nastroju
            const url = `${basePath}movies.html?mood=${encodeURIComponent(selectedMood)}&page=1`;
            console.log('Aktualna ścieżka:', currentPath);
            console.log('Base path:', basePath);
            console.log('Pełny URL przekierowania:', url);
            
            // Użyj window.location.assign zamiast href, aby zachować parametry
            window.location.assign(url);
        });
    });

    // Handle auth tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            tabButtons.forEach(b => b.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${tab}-form`).classList.add('active');
        });
    });

    // Handle login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Handle register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Handle movies page
    const pathname = window.location.pathname;
    const isMoviesPage = pathname.includes('movies.html') || pathname.includes('/pages/movies') || pathname.endsWith('/movies');
    console.log('Sprawdzanie ścieżki dla movies:', pathname, 'jest stroną movies?', isMoviesPage);
    
    if (isMoviesPage) {
        console.log('Wywoływanie loadMovies()...');
        loadMovies();
        document.getElementById('change-mood-btn')?.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    } else {
        console.log('Nie jesteś na stronie movies');
    }

    // Handle favorites page
    const favoritesPathname = window.location.pathname;
    const isFavoritesPage = favoritesPathname.includes('favorites.html') || favoritesPathname.includes('/pages/favorites') || favoritesPathname.endsWith('/favorites');
    console.log('Sprawdzanie ścieżki dla favorites:', favoritesPathname, 'jest stroną favorites?', isFavoritesPage);
    
    if (isFavoritesPage) {
        console.log('Wywoływanie loadFavorites()...');
        loadFavorites();
    }
});

// Auth handlers
async function handleLogin(e) {
    e.preventDefault();
    clearErrors('login');

    const usernameOrEmail = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ usernameOrEmail, password })
        });

        // Obsługa zarówno camelCase jak i PascalCase (C# może zwracać Token lub token)
        const token = data.token || data.Token;
        if (!token) {
            console.error('Brak tokena w odpowiedzi:', data);
            showError('login-error', 'Błąd: nie otrzymano tokena z serwera.');
            return;
        }

        setToken(token);
        updateAuthLink();
        
        // Przekierowanie na stronę główną - używamy bezwzględnej ścieżki
        const currentPath = window.location.pathname;
        let redirectPath;
        
        if (currentPath.includes('/pages/')) {
            redirectPath = '../index.html';
        } else if (currentPath.endsWith('/') || currentPath === '/') {
            redirectPath = 'index.html';
        } else {
            redirectPath = './index.html';
        }
        
        console.log('Przekierowanie do:', redirectPath, 'z:', currentPath);
        window.location.href = redirectPath;
    } catch (error) {
        console.error('Błąd logowania:', error);
        showError('login-error', error.message || 'Błąd logowania. Sprawdź dane.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    clearErrors('register');

    const userName = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;

    // Validation
    if (userName.length < 3) {
        showError('register-username-error', 'Nazwa użytkownika musi mieć minimum 3 znaki');
        return;
    }

    if (!email.includes('@')) {
        showError('register-email-error', 'Nieprawidłowy adres email');
        return;
    }

    if (password.length < 6) {
        showError('register-password-error', 'Hasło musi mieć minimum 6 znaków');
        return;
    }

    if (password !== passwordConfirm) {
        showError('register-password-confirm-error', 'Hasła nie są identyczne');
        return;
    }

    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ userName, email, password })
        });

        // Obsługa zarówno camelCase jak i PascalCase (C# może zwracać Token lub token)
        const token = data.token || data.Token;
        if (!token) {
            console.error('Brak tokena w odpowiedzi:', data);
            showError('register-error', 'Błąd: nie otrzymano tokena z serwera.');
            return;
        }

        setToken(token);
        updateAuthLink();
        
        // Przekierowanie na stronę główną - używamy bezwzględnej ścieżki
        const currentPath = window.location.pathname;
        let redirectPath;
        
        if (currentPath.includes('/pages/')) {
            redirectPath = '../index.html';
        } else if (currentPath.endsWith('/') || currentPath === '/') {
            redirectPath = 'index.html';
        } else {
            redirectPath = './index.html';
        }
        
        console.log('Przekierowanie do:', redirectPath, 'z:', currentPath);
        window.location.href = redirectPath;
    } catch (error) {
        console.error('Błąd rejestracji:', error);
        showError('register-error', error.message || 'Błąd rejestracji. Spróbuj ponownie.');
    }
}




function clearErrors(prefix) {
    const errorElements = document.querySelectorAll(`[id^="${prefix}"]`);
    errorElements.forEach(el => {
        if (el.classList.contains('error-message')) {
            el.textContent = '';
        }
    });
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Movies page functions
async function loadMovies() {
    console.log('loadMovies() wywołana!');
    const urlParams = new URLSearchParams(window.location.search);
    const moodFromUrl = urlParams.get('mood');
    const moodFromStorage = localStorage.getItem('selectedMood');
    
    // Użyj nastrój z URL, jeśli istnieje, w przeciwnym razie z localStorage, w przeciwnym razie domyślny
    const selectedMood = moodFromUrl || moodFromStorage || 'Happy';
    
    // Sprawdź, czy nastrój się zmienił - porównaj z poprzednim nastrojem w localStorage
    const previousMood = moodFromStorage;
    const moodChanged = previousMood && previousMood !== selectedMood;
    
    console.log('Sprawdzanie zmiany nastroju - poprzedni:', previousMood, 'aktualny:', selectedMood, 'zmieniony?', moodChanged);
    
    // Pobierz stronę z URL
    const pageFromUrl = urlParams.get('page');
    let page;
    
    if (moodChanged) {
        // Jeśli nastrój się zmienił, zawsze zacznij od strony 1
        console.log('Wykryto zmianę nastroju z', previousMood, 'na', selectedMood, '- resetowanie strony do 1');
        localStorage.removeItem('currentPage');
        page = 1;
        // Zaktualizuj URL, aby zawierał page=1
        const newUrl = `${window.location.pathname}?mood=${encodeURIComponent(selectedMood)}&page=1`;
        window.history.replaceState({}, '', newUrl);
    } else if (!pageFromUrl) {
        // Jeśli nie ma strony w URL i nastrój się nie zmienił, użyj z localStorage lub 1
        const pageFromStorage = localStorage.getItem('currentPage');
        page = parseInt(pageFromStorage) || 1;
    } else {
        // Użyj strony z URL (dla tego samego nastroju)
        page = parseInt(pageFromUrl) || 1;
    }
    
    console.log('Parametry - mood:', selectedMood, 'page:', page, 'moodChanged:', moodChanged);
    
    if (!moodFromUrl && moodFromStorage && !moodChanged) {
        console.log('Używam nastroju z localStorage:', moodFromStorage);
        // Opcjonalnie: zaktualizuj URL bez przeładowania strony
        const newUrl = `${window.location.pathname}?mood=${encodeURIComponent(moodFromStorage)}&page=${page}`;
        window.history.replaceState({}, '', newUrl);
    } else if (!moodFromUrl && !moodFromStorage) {
        console.warn('Brak parametru mood w URL i localStorage, używam domyślnego: Happy');
    }

    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const moviesGrid = document.getElementById('movies-grid');
    const pagination = document.getElementById('pagination');
    const moodTitle = document.getElementById('mood-title');
    const moodBadge = document.getElementById('mood-badge');

    console.log('Elementy DOM:', { loadingEl, errorEl, moviesGrid, pagination });

    if (loadingEl) loadingEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
    if (moviesGrid) {
        moviesGrid.innerHTML = '';
        moviesGrid.style.display = 'grid'; // Upewnij się, że grid jest widoczny
    }
    if (pagination) pagination.style.display = 'none';

    const moodNames = {
        'Happy': '😊 Happy',
        'Sad': '😢 Sad',
        'Romantic': '💕 Romantic',
        'Scary': '👻 Scary'
    };

    if (moodTitle) {
        moodTitle.textContent = `Filmy dla nastroju: ${moodNames[selectedMood] || selectedMood}`;
    }
    if (moodBadge) {
        moodBadge.textContent = moodNames[selectedMood] || selectedMood;
    }

    try {
        console.log('Ładowanie filmów dla nastroju:', selectedMood, 'strona:', page);
        const data = await apiRequest(`/movies?mood=${selectedMood}&page=${page}`);
        console.log('Otrzymane dane z API:', data);

        loadingEl.style.display = 'none';

        if (data.results && data.results.length > 0) {
            console.log('Znaleziono', data.results.length, 'filmów');
            console.log('Przykładowy film:', data.results[0]);
            console.log('Element moviesGrid:', moviesGrid);
            
            // Ukryj loading przed renderowaniem
            if (loadingEl) {
                loadingEl.style.display = 'none';
                console.log('Loading ukryty. Display:', window.getComputedStyle(loadingEl).display);
            }
            
            // Pokaż grid
            if (moviesGrid) {
                moviesGrid.style.display = 'grid';
            }
            
            renderMovies(data.results, moviesGrid);
            console.log('Filmy zrenderowane. Liczba elementów w grid:', moviesGrid.children.length);
            
            // Sprawdź widoczność elementów
            if (moviesGrid) {
                const computedStyle = window.getComputedStyle(moviesGrid);
                console.log('Grid CSS - display:', computedStyle.display, 'visibility:', computedStyle.visibility, 'opacity:', computedStyle.opacity);
                console.log('Grid height:', computedStyle.height, 'width:', computedStyle.width);
                
                // Sprawdź pierwszy element filmu
                if (moviesGrid.children.length > 0) {
                    const firstMovie = moviesGrid.children[0];
                    const movieStyle = window.getComputedStyle(firstMovie);
                    console.log('Pierwszy film - display:', movieStyle.display, 'visibility:', movieStyle.visibility, 'height:', movieStyle.height);
                    console.log('Pierwszy film HTML:', firstMovie.outerHTML.substring(0, 200));
                }
            }
            
            if (data.totalPages > 1) {
                renderPagination(data.page, data.totalPages, selectedMood);
                pagination.style.display = 'flex';
            }
        } else {
            console.warn('Brak wyników w odpowiedzi:', data);
            if (loadingEl) {
                loadingEl.style.display = 'none';
            }
            if (moviesGrid) {
                moviesGrid.innerHTML = '<p class="empty-state">Brak filmów dla tego nastroju.</p>';
                moviesGrid.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Błąd podczas ładowania filmów:', error);
        loadingEl.style.display = 'none';
        errorEl.textContent = error.message || 'Błąd podczas ładowania filmów. Sprawdź konsolę przeglądarki.';
        errorEl.style.display = 'block';
    }
}

function renderMovies(movies, container) {
    console.log('renderMovies() wywołana z', movies.length, 'filmami');
    console.log('Container:', container);
    
    if (!container) {
        console.error('Container nie istnieje!');
        return;
    }
    
    container.innerHTML = '';

    movies.forEach((movie, index) => {
        console.log(`Renderowanie filmu ${index + 1}:`, movie);
        
        // Obsługa zarówno camelCase jak i PascalCase (C# może zwracać różne formaty)
        const movieId = movie.movieId || movie.MovieId || '';
        const title = movie.title || movie.Title || 'Bez tytułu';
        const overview = movie.overview || movie.Overview || '';
        const posterPath = movie.posterPath || movie.PosterPath || '';
        const rating = movie.rating || movie.Rating || 0;
        
        const movieCard = document.createElement('article');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            ${posterPath 
                ? `<img src="https://image.tmdb.org/t/p/w500${posterPath}" alt="${title}" class="movie-poster" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                : ''
            }
            <div class="movie-poster-placeholder" style="display: ${posterPath ? 'none' : 'flex'}">
                🎬
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${title}</h3>
                <p class="movie-overview">${overview || 'Brak opisu'}</p>
                <div class="movie-rating">
                    <span class="star">⭐</span>
                    <span>${rating ? rating.toFixed(1) : 'N/A'}</span>
                </div>
                <div class="movie-actions">
                    <button class="btn-favorite" data-movie-id="${movieId}" data-title="${title}" data-poster="${posterPath || ''}" data-overview="${overview || ''}" data-rating="${rating || 0}">
                        <span>❤️</span> Dodaj do ulubionych
                    </button>
                </div>
            </div>
        `;

        const favoriteBtn = movieCard.querySelector('.btn-favorite');
        favoriteBtn.addEventListener('click', () => handleAddFavorite(movieId, title, posterPath, overview, rating, favoriteBtn));

        container.appendChild(movieCard);
    });
}

function renderPagination(currentPage, totalPages, mood) {
    console.log('renderPagination() wywołana:', { currentPage, totalPages, mood });
    
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    if (!pageInfo || !prevBtn || !nextBtn) {
        console.error('Elementy paginacji nie znalezione!', { pageInfo, prevBtn, nextBtn });
        return;
    }

    pageInfo.textContent = `Strona ${currentPage} z ${totalPages}`;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    console.log('Przyciski paginacji - prev disabled:', prevBtn.disabled, 'next disabled:', nextBtn.disabled);

    // Usuń stare event listenery - zastąp przyciski nowymi
    const paginationContainer = prevBtn.parentElement;
    const oldPrevBtn = prevBtn;
    const oldNextBtn = nextBtn;
    
    // Stwórz nowe przyciski
    const newPrevBtn = document.createElement('button');
    newPrevBtn.id = 'prev-page';
    newPrevBtn.className = 'btn-pagination';
    newPrevBtn.textContent = '← Poprzednia';
    newPrevBtn.disabled = currentPage === 1;
    
    const newNextBtn = document.createElement('button');
    newNextBtn.id = 'next-page';
    newNextBtn.className = 'btn-pagination';
    newNextBtn.textContent = 'Następna →';
    newNextBtn.disabled = currentPage === totalPages;
    
    // Zastąp stare przyciski nowymi
    paginationContainer.replaceChild(newPrevBtn, oldPrevBtn);
    paginationContainer.replaceChild(newNextBtn, oldNextBtn);

    // Określ ścieżkę - jeśli jesteśmy w folderze pages, użyj względnej ścieżki
    const currentPath = window.location.pathname;
    const basePath = currentPath.includes('/pages/') ? './' : 'pages/';
    const moviesPath = `${basePath}movies.html`;
    
    console.log('Ścieżka paginacji:', moviesPath);

    // Dodaj event listenery do nowych przycisków
    newPrevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Kliknięto "Poprzednia"');
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            console.log('Przechodzenie do strony:', newPage);
            // Zapisz nastrój i stronę w localStorage
            localStorage.setItem('selectedMood', mood);
            localStorage.setItem('currentPage', newPage.toString());
            const newUrl = `${moviesPath}?mood=${encodeURIComponent(mood)}&page=${newPage}`;
            console.log('Nowy URL:', newUrl);
            window.location.href = newUrl;
        } else {
            console.log('Jesteś już na pierwszej stronie');
        }
    });

    newNextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Kliknięto "Następna"');
        if (currentPage < totalPages) {
            const newPage = currentPage + 1;
            console.log('Przechodzenie do strony:', newPage);
            // Zapisz nastrój i stronę w localStorage
            localStorage.setItem('selectedMood', mood);
            localStorage.setItem('currentPage', newPage.toString());
            const newUrl = `${moviesPath}?mood=${encodeURIComponent(mood)}&page=${newPage}`;
            console.log('Nowy URL:', newUrl);
            window.location.href = newUrl;
        } else {
            console.log('Jesteś już na ostatniej stronie');
        }
    });
    
    console.log('Event listenery paginacji dodane do nowych przycisków');
}

async function handleAddFavorite(movieId, title, posterPath, overview, rating, button) {
    if (!isAuthenticated()) {
        alert('Musisz być zalogowany, aby dodać film do ulubionych.');
        const authPath = window.location.pathname.includes('pages') ? 'auth.html' : 'pages/auth.html';
        window.location.href = authPath;
        return;
    }

    button.disabled = true;
    button.textContent = 'Dodawanie...';

    try {
        await apiRequest('/favorites', {
            method: 'POST',
            body: JSON.stringify({
                movieId,
                title,
                posterPath: posterPath || '',
                overview: overview || '',
                rating: rating || 0
            })
        });

        button.classList.add('favorited');
        button.innerHTML = '<span>✓</span> Dodano do ulubionych';
    } catch (error) {
        if (error.message.includes('już w ulubionych') || error.message.includes('already')) {
            button.classList.add('favorited');
            button.innerHTML = '<span>✓</span> Już w ulubionych';
        } else {
            alert('Błąd podczas dodawania do ulubionych: ' + error.message);
            button.disabled = false;
            button.innerHTML = '<span>❤️</span> Dodaj do ulubionych';
        }
    }
}

// Favorites page functions
async function loadFavorites() {
    console.log('loadFavorites() wywołana!');
    const authRequired = document.getElementById('auth-required');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const favoritesGrid = document.getElementById('favorites-grid');
    const emptyState = document.getElementById('empty-favorites');

    console.log('Elementy DOM favorites:', { authRequired, loadingEl, errorEl, favoritesGrid, emptyState });

    if (!isAuthenticated()) {
        console.log('Użytkownik nie jest zalogowany - pokazuję komunikat');
        if (authRequired) authRequired.style.display = 'block';
        if (loadingEl) loadingEl.style.display = 'none';
        return;
    }

    console.log('Użytkownik jest zalogowany - ładowanie ulubionych');
    if (authRequired) authRequired.style.display = 'none';
    if (loadingEl) loadingEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
    if (favoritesGrid) {
        favoritesGrid.innerHTML = '';
        favoritesGrid.style.display = 'grid';
    }
    if (emptyState) emptyState.style.display = 'none';

    try {
        console.log('Wysyłanie żądania do /favorites');
        const favorites = await apiRequest('/favorites');
        console.log('Otrzymane ulubione:', favorites);

        if (loadingEl) loadingEl.style.display = 'none';

        if (favorites && Array.isArray(favorites) && favorites.length > 0) {
            console.log('Znaleziono', favorites.length, 'ulubionych filmów');
            renderFavorites(favorites, favoritesGrid);
        } else {
            console.log('Brak ulubionych filmów');
            if (emptyState) emptyState.style.display = 'block';
        }
    } catch (error) {
        console.error('Błąd podczas ładowania ulubionych:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.textContent = error.message || 'Błąd podczas ładowania ulubionych. Sprawdź konsolę przeglądarki.';
            errorEl.style.display = 'block';
        }
    }
}

function renderFavorites(favorites, container) {
    container.innerHTML = '';

    favorites.forEach(favorite => {
        const movieCard = document.createElement('article');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            ${favorite.posterPath 
                ? `<img src="https://image.tmdb.org/t/p/w500${favorite.posterPath}" alt="${favorite.title}" class="movie-poster" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                : ''
            }
            <div class="movie-poster-placeholder" style="display: ${favorite.posterPath ? 'none' : 'flex'}">
                🎬
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${favorite.title}</h3>
                <p class="movie-overview">${favorite.overview || 'Brak opisu'}</p>
                <div class="movie-rating">
                    <span class="star">⭐</span>
                    <span>${favorite.rating ? favorite.rating.toFixed(1) : 'N/A'}</span>
                </div>
                <div class="movie-actions">
                    <button class="btn-favorite favorited" data-favorite-id="${favorite.id}">
                        <span>🗑️</span> Usuń z ulubionych
                    </button>
                </div>
            </div>
        `;

        const deleteBtn = movieCard.querySelector('.btn-favorite');
        deleteBtn.addEventListener('click', () => handleDeleteFavorite(favorite.id, movieCard));

        container.appendChild(movieCard);
    });
}

async function handleDeleteFavorite(favoriteId, cardElement) {
    if (!confirm('Czy na pewno chcesz usunąć ten film z ulubionych?')) {
        return;
    }

    try {
        await apiRequest(`/favorites/${favoriteId}`, {
            method: 'DELETE'
        });

        cardElement.remove();
        
        const favoritesGrid = document.getElementById('favorites-grid');
        if (favoritesGrid.children.length === 0) {
            document.getElementById('empty-favorites').style.display = 'block';
        }
    } catch (error) {
        alert('Błąd podczas usuwania z ulubionych: ' + error.message);
    }
}
