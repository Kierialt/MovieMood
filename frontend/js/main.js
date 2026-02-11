// API Configuration
const API_BASE_URL = 'http://localhost:5272/api';

// Test - sprawdzenie czy skrypt się ładuje
console.log('✅ Skrypt main.js załadowany!');
console.log('API_BASE_URL:', API_BASE_URL);

// Utility functions
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');
const getRole = () => localStorage.getItem('userRole') || 'User';
const setRole = (role) => { if (role) localStorage.setItem('userRole', role); };
const removeRole = () => localStorage.removeItem('userRole');
const getUsername = () => localStorage.getItem('username') || '';
const setUsername = (username) => { if (username) localStorage.setItem('username', username); };
const removeUsername = () => localStorage.removeItem('username');
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

// Update auth link in navigation (avatar with first letter when logged in)
function updateAuthLink() {
    const authLinks = document.querySelectorAll('#auth-link');
    authLinks.forEach(link => {
        if (isAuthenticated()) {
            const username = getUsername();
            const letter = username ? username.charAt(0).toUpperCase() : '?';
            link.href = '#';
            link.innerHTML = `<span class="user-avatar-wrapper"><span class="user-avatar" title="${username || 'Użytkownik'}">${letter}</span><span class="user-avatar-label">Wyloguj się</span></span>`;
            link.onclick = (e) => {
                e.preventDefault();
                logout();
            };
        } else {
            link.textContent = 'Zaloguj się';
            link.innerHTML = 'Zaloguj się';
            const currentPath = window.location.pathname;
            const isInPagesFolder = currentPath.includes('/pages/') || 
                                   currentPath.endsWith('/pages') ||
                                   currentPath.includes('pages.html') ||
                                   currentPath.includes('movies.html') ||
                                   currentPath.includes('favorites.html') ||
                                   currentPath.includes('auth.html');
            link.href = isInPagesFolder ? 'auth.html' : 'pages/auth.html';
            link.onclick = null;
        }
    });
}

// Logout function
function logout() {
    removeToken();
    removeRole();
    removeUsername();
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

    // Strona główna: klik w typ kontekstu → strona gatunków (zapis type, zawsze page=1)
    const contentTypeGrid = document.getElementById('content-type-grid');
    if (contentTypeGrid) {
        const cards = contentTypeGrid.querySelectorAll('.content-type-card');
        const basePath = window.location.pathname.includes('/pages/') ? './' : 'pages/';
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const type = (card.dataset.type || 'movie').toLowerCase();
                if (type === 'tv' || type === 'movie' || type === 'animation') {
                    localStorage.setItem('contentType', type);
                    localStorage.removeItem('contentGenre');
                    localStorage.removeItem('moviesPage');
                }
                window.location.assign(`${basePath}genres.html?type=${encodeURIComponent(type)}`);
            });
        });
    }

    // Strona gatunków: type z URL lub localStorage; render kart; klik → zapis type+genre, movies?type=&genre=&page=1
    const genreGrid = document.getElementById('genre-grid');
    if (genreGrid && typeof getGenres === 'function') {
        const urlParams = new URLSearchParams(window.location.search);
        let contentType = (urlParams.get('type') || localStorage.getItem('contentType') || 'movie').toLowerCase();
        if (contentType !== 'movie' && contentType !== 'tv' && contentType !== 'animation') contentType = 'movie';
        if (!urlParams.get('type')) {
            const genresPath = window.location.pathname.replace(/[^/]+$/, '') + 'genres.html';
            window.history.replaceState({}, '', `${genresPath}?type=${contentType}`);
        }
        const genres = getGenres(contentType);
        const typeLabel = getContentTypeLabel(contentType);

        const titleEl = document.getElementById('genres-title');
        if (titleEl) titleEl.textContent = `Gatunki: ${typeLabel}`;

        const backLink = document.getElementById('genre-back-link');
        if (backLink) {
            backLink.innerHTML = `<a href="../index.html">← Strona główna</a>`;
        }

        const filmFrameSrc = window.location.pathname.includes('/pages/') ? '../images/film-frame.png' : 'images/film-frame.png';
        genreGrid.innerHTML = genres.map(g => `
            <article class="genre-card" data-type="${contentType}" data-genre="${g.id}">
                <div class="genre-card-frame" style="background-image: url('${filmFrameSrc}');">
                    <div class="genre-card-content">
                        <div class="genre-icon">${g.emoji || '🎭'}</div>
                        <h4>${g.name}</h4>
                        <p>${g.description}</p>
                    </div>
                </div>
            </article>
        `).join('');

        genreGrid.querySelectorAll('.genre-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const type = (card.dataset.type || 'movie').toLowerCase();
                const genre = String(card.dataset.genre || '');
                if (!type || !genre) return;
                localStorage.setItem('contentType', type);
                localStorage.setItem('contentGenre', genre);
                const base = window.location.pathname.replace(/genres\.html.*$/i, '');
                const moviesUrl = base + 'movies.html?type=' + encodeURIComponent(type) + '&genre=' + encodeURIComponent(genre);
                window.location.href = moviesUrl;
            });
        });
    }

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
        loadMovies();
        document.getElementById('change-genre-btn')?.addEventListener('click', () => {
            const urlParams = new URLSearchParams(window.location.search);
            let type = (urlParams.get('type') || localStorage.getItem('contentType') || 'movie').toLowerCase();
            if (type !== 'movie' && type !== 'tv' && type !== 'animation') type = 'movie';
            // Strona movies jest zawsze w folderze pages/ — przechodzimy do genres w tym samym folderze
            const pathname = window.location.pathname;
            const href = (pathname.includes('/pages/') || pathname.endsWith('movies.html'))
                ? 'genres.html?type=' + encodeURIComponent(type)
                : 'pages/genres.html?type=' + encodeURIComponent(type);
            window.location.href = href;
        });
        window.addEventListener('popstate', () => {
            if (window.location.pathname.includes('movies.html')) loadMovies();
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
        const role = data.role || data.Role || 'User';
        setRole(role);
        const userName = data.userName || data.UserName || '';
        setUsername(userName);
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
        const role = data.role || data.Role || 'User';
        setRole(role);
        const userName = data.userName || data.UserName || userName;
        setUsername(userName);
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

// Movies page – stan infinite scroll
let moviesScrollState = {
    page: 1,
    totalPages: 1,
    type: '',
    genreId: null,
    loading: false,
    hasMore: false,
    scrollListenerAttached: false
};

function moviesCountLabel(count, type) {
    if (type === 'tv') {
        if (count === 1) return 'serial';
        if (count >= 2 && count <= 4) return 'seriale';
        return 'seriali';
    }
    if (type === 'animation') {
        if (count === 1) return 'animacja';
        if (count >= 2 && count <= 4) return 'animacje';
        return 'animacji';
    }
    if (count === 1) return 'film';
    if (count >= 2 && count <= 4) return 'filmy';
    return 'filmów';
}

function updateMoviesCount(type, totalResults) {
    const el = document.getElementById('movies-count');
    if (!el) return;
    const total = totalResults != null ? totalResults : 0;
    el.textContent = `Znaleziono ${total} ${moviesCountLabel(total, type)}`;
    el.style.display = 'block';
}

// Movies page functions
async function loadMovies() {
    const urlParams = new URLSearchParams(window.location.search);
    let type = (urlParams.get('type') || localStorage.getItem('contentType') || 'movie').toLowerCase();
    if (type !== 'movie' && type !== 'tv' && type !== 'animation') type = 'movie';
    let genreFromUrl = urlParams.get('genre');
    const genreFromStorage = localStorage.getItem('contentGenre');
    if (!genreFromUrl && genreFromStorage) genreFromUrl = genreFromStorage;
    let genreId = genreFromUrl ? parseInt(genreFromUrl, 10) : null;
    const genres = typeof getGenres === 'function' ? getGenres(type) : [];
    const defaultGenreId = type === 'animation' ? 16 : (genres.length ? genres[0].id : 28);
    if (genreId == null || !Number.isInteger(genreId) || !genres.some(g => g.id === genreId)) {
        genreId = defaultGenreId;
    }
    localStorage.setItem('contentType', type);
    localStorage.setItem('contentGenre', String(genreId));
    const search = `?type=${encodeURIComponent(type)}&genre=${encodeURIComponent(genreId)}`;
    const expectedUrl = window.location.pathname + search;
    if ((window.location.pathname + (window.location.search || '')) !== expectedUrl) {
        window.history.replaceState({}, '', expectedUrl);
    }

    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const moviesGrid = document.getElementById('movies-grid');
    const loadingMoreEl = document.getElementById('loading-more');
    const contentTitleEl = document.getElementById('content-title');
    const genreBadgeEl = document.getElementById('genre-badge');

    if (loadingEl) {
        loadingEl.textContent = type === 'tv' ? 'Ładowanie seriali...' : type === 'animation' ? 'Ładowanie animacji...' : 'Ładowanie filmów...';
        loadingEl.style.display = 'block';
    }
    if (errorEl) errorEl.style.display = 'none';
    if (loadingMoreEl) loadingMoreEl.style.display = 'none';
    if (moviesGrid) {
        moviesGrid.innerHTML = '';
        moviesGrid.style.display = 'grid';
    }

    moviesScrollState = { page: 1, totalPages: 1, type, genreId, loading: true, hasMore: false, scrollListenerAttached: moviesScrollState.scrollListenerAttached };

    const genreName = typeof getGenreName === 'function' ? getGenreName(type, genreId) : String(genreId);
    if (contentTitleEl) contentTitleEl.textContent = type === 'tv' ? 'Seriały' : type === 'animation' ? 'Animacja' : 'Filmy';
    if (genreBadgeEl) genreBadgeEl.textContent = genreName;

    const countEl = document.getElementById('movies-count');
    if (countEl) countEl.style.display = 'none';

    try {
        const data = await apiRequest(`/movies?type=${encodeURIComponent(type)}&genre=${genreId}&page=1`);
        if (loadingEl) loadingEl.style.display = 'none';
        moviesScrollState.loading = false;

        if (data.results && data.results.length > 0) {
            if (moviesGrid) moviesGrid.style.display = 'grid';
            renderMovies(data.results, moviesGrid, false, type);
            moviesScrollState.page = data.page || 1;
            moviesScrollState.totalPages = data.totalPages || 1;
            moviesScrollState.hasMore = moviesScrollState.page < moviesScrollState.totalPages;
            updateMoviesCount(type, data.totalResults);
            attachMoviesScrollListener();
        } else {
            updateMoviesCount(type, data.totalResults ?? 0);
            if (moviesGrid) {
                moviesGrid.innerHTML = '<p class="empty-state">Brak wyników dla tego gatunku.</p>';
                moviesGrid.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Błąd podczas ładowania:', error);
        moviesScrollState.loading = false;
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.textContent = error.message || 'Błąd podczas ładowania. Sprawdź konsolę przeglądarki.';
            errorEl.style.display = 'block';
        }
    }
}

function attachMoviesScrollListener() {
    if (moviesScrollState.scrollListenerAttached) return;
    moviesScrollState.scrollListenerAttached = true;
    const scrollHandler = () => {
        const threshold = 500;
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold) {
            loadMoreMovies();
        }
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
}

async function loadMoreMovies() {
    if (moviesScrollState.loading || !moviesScrollState.hasMore) return;
    const { type, genreId, page, totalPages } = moviesScrollState;
    const nextPage = page + 1;
    if (nextPage > totalPages) return;

    moviesScrollState.loading = true;
    const loadingMoreEl = document.getElementById('loading-more');
    const moviesGrid = document.getElementById('movies-grid');
    if (loadingMoreEl) loadingMoreEl.style.display = 'block';

    try {
        const data = await apiRequest(`/movies?type=${encodeURIComponent(type)}&genre=${genreId}&page=${nextPage}`);
        if (data.results && data.results.length > 0 && moviesGrid) {
            renderMovies(data.results, moviesGrid, true, type);
        }
        moviesScrollState.page = data.page || nextPage;
        moviesScrollState.totalPages = data.totalPages || totalPages;
        moviesScrollState.hasMore = moviesScrollState.page < moviesScrollState.totalPages;
    } catch (error) {
        console.error('Błąd podczas ładowania kolejnych:', error);
    } finally {
        moviesScrollState.loading = false;
        if (loadingMoreEl) loadingMoreEl.style.display = 'none';
    }
}

function renderMovies(movies, container, append = false, contentType = 'movie') {
    if (!container) return;
    if (!append) container.innerHTML = '';

    // Dla API szczegółów: animation to w TMDB nadal "movie"
    const apiType = (contentType === 'tv') ? 'tv' : 'movie';

    movies.forEach((movie) => {
        const movieId = movie.movieId || movie.MovieId || '';
        const title = movie.title || movie.Title || 'Bez tytułu';
        const overview = movie.overview || movie.Overview || '';
        const posterPath = movie.posterPath || movie.PosterPath || '';
        const rating = movie.rating || movie.Rating || 0;
        const escapedTitle = title.replace(/"/g, '&quot;');

        const movieCard = document.createElement('article');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            ${posterPath 
                ? `<img src="https://image.tmdb.org/t/p/w500${posterPath}" alt="${escapedTitle}" class="movie-poster" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
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
                    <button class="btn-favorite" data-movie-id="${movieId}" data-title="${escapedTitle}" data-poster="${posterPath || ''}" data-overview="${overview || ''}" data-rating="${rating || 0}">
                        <span>❤️</span> Dodaj do ulubionych
                    </button>
                    <button class="btn-details" data-movie-id="${movieId}" data-content-type="${apiType}">
                        Więcej szczegółów
                    </button>
                </div>
            </div>
        `;

        const favoriteBtn = movieCard.querySelector('.btn-favorite');
        favoriteBtn.addEventListener('click', () => handleAddFavorite(movieId, title, posterPath, overview, rating, favoriteBtn));

        const detailsBtn = movieCard.querySelector('.btn-details');
        detailsBtn.addEventListener('click', () => openMovieDetailModal(movieId, apiType));

        container.appendChild(movieCard);
    });
}

// ---- Modal szczegółów filmu/serialu ----
// Stan wybranego filmu: używany przez osobne fetch i aktualizację sekcji.
let movieDetailModalState = {
    open: false,
    escapeHandler: null,
    movieId: null,
    contentType: null
};

function openMovieDetailModal(movieId, contentType) {
    const modal = document.getElementById('movie-detail-modal');
    const loadingEl = document.getElementById('movie-detail-loading');
    const contentEl = document.getElementById('movie-detail-content');
    const overlay = document.getElementById('movie-detail-overlay');
    if (!modal || !loadingEl || !contentEl) return;

    movieDetailModalState.open = true;
    movieDetailModalState.movieId = movieId;
    movieDetailModalState.contentType = contentType;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    loadingEl.style.display = 'block';
    contentEl.style.display = 'none';
    contentEl.innerHTML = '';

    overlay.onclick = closeMovieDetailModal;
    const escapeHandler = (e) => { if (e.key === 'Escape') closeMovieDetailModal(); };
    movieDetailModalState.escapeHandler = escapeHandler;
    document.addEventListener('keydown', escapeHandler);

    fetchMovieDetails(movieId, contentType)
        .then((details) => {
            loadingEl.style.display = 'none';
            if (details) {
                contentEl.innerHTML = renderMovieDetailContent(details);
                contentEl.style.display = 'block';
                bindMovieDetailModalButtons(contentEl);
                loadMovieDetailExtraSections(movieId, contentType);
            } else {
                contentEl.innerHTML = '<p class="movie-detail-error">Nie udało się załadować szczegółów.</p>';
                contentEl.style.display = 'block';
            }
        })
        .catch(() => {
            loadingEl.style.display = 'none';
            contentEl.innerHTML = '<p class="movie-detail-error">Błąd podczas ładowania szczegółów.</p>';
            contentEl.style.display = 'block';
        });
}

function bindMovieDetailModalButtons(contentEl) {
    const closeBtn = contentEl.querySelector('.movie-detail-close');
    const goBtn = contentEl.querySelector('.movie-detail-go');
    if (closeBtn) closeBtn.addEventListener('click', closeMovieDetailModal);
    if (goBtn) goBtn.addEventListener('click', () => { closeMovieDetailModal(); });
}

function loadMovieDetailExtraSections(movieId, contentType) {
    const type = (contentType === 'tv') ? 'tv' : 'movie';
    const sections = [
        { key: 'credits', fetch: () => fetchMovieCredits(movieId, type), render: (data) => renderCreditsSection(data) || '<p class="movie-detail-muted">Brak danych.</p>' },
        { key: 'videos', fetch: () => fetchMovieVideos(movieId, type), render: (data) => renderTrailerSection(data) || '<p class="movie-detail-muted">Brak trailera.</p>' },
        { key: 'images', fetch: () => fetchMovieImages(movieId, type), render: (data) => renderGallerySection(data) || '<p class="movie-detail-muted">Brak zdjęć.</p>' },
        { key: 'recommendations', fetch: () => fetchMovieRecommendations(movieId, type), render: (data) => renderSimilarSection(data, type) || '<p class="movie-detail-muted">Brak rekomendacji.</p>' }
    ];
    Promise.allSettled(sections.map((s) => s.fetch().then((data) => ({ key: s.key, data, render: s.render }))))
        .then((results) => {
            if (!movieDetailModalState.open || movieDetailModalState.movieId !== movieId) return;
            results.forEach((outcome, i) => {
                const el = document.getElementById(`movie-detail-${sections[i].key}`);
                if (!el) return;
                if (outcome.status === 'fulfilled' && outcome.value) {
                    el.innerHTML = outcome.value.render(outcome.value.data);
                    if (sections[i].key === 'recommendations') bindSimilarCardsClick(el);
                } else {
                    el.innerHTML = '<p class="movie-detail-muted">Brak danych.</p>';
                }
            });
        });
}

function closeMovieDetailModal() {
    const modal = document.getElementById('movie-detail-modal');
    if (!modal) return;
    movieDetailModalState.open = false;
    movieDetailModalState.movieId = null;
    movieDetailModalState.contentType = null;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    const overlay = document.getElementById('movie-detail-overlay');
    if (overlay) overlay.onclick = null;
    if (movieDetailModalState.escapeHandler) {
        document.removeEventListener('keydown', movieDetailModalState.escapeHandler);
        movieDetailModalState.escapeHandler = null;
    }
}

async function fetchMovieDetails(movieId, contentType) {
    const type = (contentType === 'tv') ? 'tv' : 'movie';
    return apiRequest(`/movies/${encodeURIComponent(movieId)}/details?type=${encodeURIComponent(type)}`);
}

async function fetchMovieCredits(movieId, type) {
    return apiRequest(`/movies/${encodeURIComponent(movieId)}/credits?type=${encodeURIComponent(type)}`);
}

async function fetchMovieVideos(movieId, type) {
    return apiRequest(`/movies/${encodeURIComponent(movieId)}/videos?type=${encodeURIComponent(type)}`);
}

async function fetchMovieImages(movieId, type) {
    return apiRequest(`/movies/${encodeURIComponent(movieId)}/images?type=${encodeURIComponent(type)}`);
}

async function fetchMovieRecommendations(movieId, type) {
    return apiRequest(`/movies/${encodeURIComponent(movieId)}/recommendations?type=${encodeURIComponent(type)}`);
}

function escapeHtml(s) {
    if (typeof s !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

function formatMoney(n) {
    if (n == null || n <= 0) return '';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + ' mld $';
    if (n >= 1e6) return (n / 1e6).toFixed(0) + ' mln $';
    if (n >= 1e3) return (n / 1e3).toFixed(0) + ' tys. $';
    return n + ' $';
}

function renderMovieDetailContent(d) {
    const title = escapeHtml(d.title || d.Title || 'Bez tytułu');
    const overview = escapeHtml(d.overview || d.Overview || '');
    const posterPath = (d.posterPath || d.PosterPath || '').replace(/[<>"']/g, '');
    const voteAverage = d.voteAverage ?? d.VoteAverage ?? 0;
    const releaseYear = escapeHtml(d.releaseYear || d.ReleaseYear || '');
    const releaseDate = escapeHtml(d.releaseDate || d.ReleaseDate || '');
    const runtime = d.runtimeMinutes ?? d.RuntimeMinutes;
    const certification = escapeHtml(d.certification || d.Certification || '');
    const voteCount = d.voteCount ?? d.VoteCount ?? 0;
    const budget = d.budget ?? d.Budget;
    const revenue = d.revenue ?? d.Revenue;
    const countries = (d.productionCountries || d.ProductionCountries || []).map(escapeHtml).join(', ');
    const genres = (d.genres || d.Genres || []).map((g) => (typeof g === 'string' ? g : '')).filter(Boolean).map(escapeHtml).join(', ');
    const homepage = (d.homepage || d.Homepage || '').replace(/[<>"']/g, '');
    const spokenLanguages = (d.spokenLanguages || d.SpokenLanguages || []).map(escapeHtml).join(', ');

    const posterHtml = posterPath
        ? `<img src="https://image.tmdb.org/t/p/w500${posterPath}" alt="${title}" class="movie-detail-poster">`
        : '<div class="movie-detail-poster movie-detail-poster-placeholder">🎬</div>';

    const metaParts = [];
    if (certification) metaParts.push(`<span class="cert">${certification}</span>`);
    if (releaseYear) metaParts.push(`<span>Rok: ${releaseYear}</span>`);
    if (runtime) metaParts.push(`<span>Czas: ${runtime} min</span>`);
    metaParts.push(`<span>⭐ ${(typeof voteAverage === 'number' ? voteAverage : 0).toFixed(1)}</span>`);
    if (voteCount > 0) metaParts.push(`<span>${voteCount} głosów</span>`);

    const extraRows = [];
    if (releaseDate) extraRows.push(`<div class="movie-detail-row"><strong>Data premiery:</strong> ${releaseDate}</div>`);
    if (countries) extraRows.push(`<div class="movie-detail-row"><strong>Kraj produkcji:</strong> ${countries}</div>`);
    if (budget != null && budget > 0) extraRows.push(`<div class="movie-detail-row"><strong>Budżet:</strong> ${escapeHtml(formatMoney(budget))}</div>`);
    if (revenue != null && revenue > 0) extraRows.push(`<div class="movie-detail-row"><strong>Przychody:</strong> ${escapeHtml(formatMoney(revenue))}</div>`);

    const safeHomepage = homepage && /^https?:\/\//i.test(homepage) ? homepage.replace(/"/g, '&quot;') : '';
    const actionsHtml = safeHomepage
        ? `<a href="${safeHomepage}" target="_blank" rel="noopener" class="btn btn-primary movie-detail-go">Strona filmu</a><button type="button" class="btn btn-secondary movie-detail-close">Zamknij</button>`
        : `<button type="button" class="btn btn-secondary movie-detail-close" style="flex: 1;">Zamknij</button>`;

    return `
        <div class="movie-detail-layout">
            <div class="movie-detail-poster-wrap">${posterHtml}</div>
            <div class="movie-detail-body">
                <h2 id="movie-detail-title" class="movie-detail-title">${title}</h2>
                <div class="movie-detail-meta">${metaParts.join(' · ')}</div>
                ${extraRows.join('')}
                ${overview ? `<div class="movie-detail-overview">${overview}</div>` : ''}
                ${genres ? `<div class="movie-detail-genres"><strong>Gatunki:</strong> ${genres}</div>` : ''}
                ${spokenLanguages ? `<div class="movie-detail-languages"><strong>Języki:</strong> ${spokenLanguages}</div>` : ''}
                <div class="movie-detail-actions">${actionsHtml}</div>
                <section class="movie-detail-block" aria-label="Obsada i ekipa">
                    <h3 class="movie-detail-block-title">🎬 Reżyseria i obsada</h3>
                    <div id="movie-detail-credits" class="movie-detail-placeholder">Ładowanie…</div>
                </section>
                <section class="movie-detail-block" aria-label="Trailer">
                    <h3 class="movie-detail-block-title">🎞 Trailer</h3>
                    <div id="movie-detail-videos" class="movie-detail-placeholder">Ładowanie…</div>
                </section>
                <section class="movie-detail-block" aria-label="Galeria">
                    <h3 class="movie-detail-block-title">🖼 Galeria</h3>
                    <div id="movie-detail-images" class="movie-detail-placeholder">Ładowanie…</div>
                </section>
                <section class="movie-detail-block" aria-label="Podobne">
                    <h3 class="movie-detail-block-title">🎬 Podobne</h3>
                    <div id="movie-detail-recommendations" class="movie-detail-placeholder">Ładowanie…</div>
                </section>
            </div>
        </div>
    `;
}

function renderCreditsSection(data) {
    if (!data) return '';
    const director = data.director || data.Director;
    const cast = data.cast || data.Cast || [];
    const parts = [];
    if (director) parts.push(`<p class="movie-detail-credits-row"><strong>Reżyseria:</strong> ${escapeHtml(director)}</p>`);
    if (cast.length) {
        const list = cast.slice(0, 5).map((c) => {
            const name = escapeHtml(c.name || c.Name || '');
            const character = (c.character || c.Character) ? ` <span class="movie-detail-character">(${escapeHtml(c.character || c.Character)})</span>` : '';
            return `<span class="movie-detail-cast-item">${name}${character}</span>`;
        }).join(', ');
        parts.push(`<p class="movie-detail-credits-row"><strong>Obsada (top 5):</strong> ${list}</p>`);
    }
    return parts.length ? parts.join('') : '';
}

function renderTrailerSection(data) {
    if (!data) return '';
    const results = data.results || data.Results || [];
    const trailer = results.find((v) => (v.type || v.Type || '').toLowerCase() === 'trailer') || results[0];
    if (!trailer || !(trailer.key || trailer.Key)) return '';
    const key = (trailer.key || trailer.Key).replace(/[<>"']/g, '');
    return `<div class="movie-detail-trailer-wrap"><iframe class="movie-detail-trailer" src="https://www.youtube.com/embed/${key}" title="Trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
}

function renderGallerySection(data) {
    if (!data) return '';
    const backdrops = data.backdrops || data.Backdrops || [];
    const items = backdrops.slice(0, 12);
    if (!items.length) return '';
    const html = items.map((img) => {
        const path = (img.filePath || img.FilePath || '').replace(/[<>"']/g, '');
        if (!path) return '';
        return `<a href="https://image.tmdb.org/t/p/original${path}" target="_blank" rel="noopener" class="movie-detail-gallery-item"><img src="https://image.tmdb.org/t/p/w780${path}" alt="Kadr" loading="lazy"></a>`;
    }).filter(Boolean).join('');
    return `<div class="movie-detail-gallery" role="list">${html}</div>`;
}

function renderSimilarSection(data, type) {
    if (!data) return '';
    const results = data.results || data.Results || [];
    const items = results.slice(0, 12);
    if (!items.length) return '';
    const apiType = (type === 'tv') ? 'tv' : 'movie';
    const html = items.map((r) => {
        const id = r.id ?? r.Id;
        const title = escapeHtml(r.title || r.Title || r.name || r.Name || 'Bez tytułu');
        const posterPath = (r.posterPath || r.PosterPath || '').replace(/[<>"']/g, '');
        const rating = r.voteAverage ?? r.VoteAverage ?? 0;
        const posterSrc = posterPath ? `https://image.tmdb.org/t/p/w154${posterPath}` : '';
        const posterHtml = posterPath
            ? `<img src="${posterSrc}" alt="${title}" loading="lazy">`
            : '<span class="movie-detail-similar-placeholder">🎬</span>';
        return `<article class="movie-detail-similar-card" data-movie-id="${id}" data-content-type="${apiType}">${posterHtml}<span class="movie-detail-similar-title">${title}</span><span class="movie-detail-similar-rating">⭐ ${rating.toFixed(1)}</span></article>`;
    }).join('');
    return `<div class="movie-detail-similar">${html}</div>`;
}

function bindSimilarCardsClick(container) {
    if (!container) return;
    container.querySelectorAll('.movie-detail-similar-card').forEach((card) => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-movie-id');
            const contentType = card.getAttribute('data-content-type');
            if (id && contentType) { closeMovieDetailModal(); openMovieDetailModal(id, contentType); }
        });
    });
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
