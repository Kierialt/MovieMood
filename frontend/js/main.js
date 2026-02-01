// API Configuration
const API_BASE_URL = 'http://localhost:5272/api';

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
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

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
    updateAuthLink();

    // Handle mood selection on index page
    const moodCards = document.querySelectorAll('.mood-card');
    moodCards.forEach(card => {
        card.addEventListener('click', () => {
            const mood = card.dataset.mood;
            window.location.href = `pages/movies.html?mood=${mood}`;
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
    if (window.location.pathname.includes('movies.html')) {
        loadMovies();
        document.getElementById('change-mood-btn')?.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }

    // Handle favorites page
    if (window.location.pathname.includes('favorites.html')) {
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

        setToken(data.token);
        updateAuthLink();
        window.location.href = '../index.html';
    } catch (error) {
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

        setToken(data.token);
        updateAuthLink();
        window.location.href = '../index.html';
    } catch (error) {
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
    const urlParams = new URLSearchParams(window.location.search);
    const mood = urlParams.get('mood') || 'Happy';
    const page = parseInt(urlParams.get('page')) || 1;

    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const moviesGrid = document.getElementById('movies-grid');
    const pagination = document.getElementById('pagination');
    const moodTitle = document.getElementById('mood-title');
    const moodBadge = document.getElementById('mood-badge');

    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    moviesGrid.innerHTML = '';
    pagination.style.display = 'none';

    const moodNames = {
        'Happy': '😊 Happy',
        'Sad': '😢 Sad',
        'Romantic': '💕 Romantic',
        'Scary': '👻 Scary'
    };

    moodTitle.textContent = `Filmy dla nastroju: ${moodNames[mood] || mood}`;
    if (moodBadge) {
        moodBadge.textContent = moodNames[mood] || mood;
    }

    try {
        const data = await apiRequest(`/movies?mood=${mood}&page=${page}`);

        loadingEl.style.display = 'none';

        if (data.results && data.results.length > 0) {
            renderMovies(data.results, moviesGrid);
            
            if (data.totalPages > 1) {
                renderPagination(data.page, data.totalPages, mood);
                pagination.style.display = 'flex';
            }
        } else {
            moviesGrid.innerHTML = '<p class="empty-state">Brak filmów dla tego nastroju.</p>';
        }
    } catch (error) {
        loadingEl.style.display = 'none';
        errorEl.textContent = error.message || 'Błąd podczas ładowania filmów.';
        errorEl.style.display = 'block';
    }
}

function renderMovies(movies, container) {
    container.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('article');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            ${movie.posterPath 
                ? `<img src="https://image.tmdb.org/t/p/w500${movie.posterPath}" alt="${movie.title}" class="movie-poster" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                : ''
            }
            <div class="movie-poster-placeholder" style="display: ${movie.posterPath ? 'none' : 'flex'}">
                🎬
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-overview">${movie.overview || 'Brak opisu'}</p>
                <div class="movie-rating">
                    <span class="star">⭐</span>
                    <span>${movie.rating ? movie.rating.toFixed(1) : 'N/A'}</span>
                </div>
                <div class="movie-actions">
                    <button class="btn-favorite" data-movie-id="${movie.movieId}" data-title="${movie.title}" data-poster="${movie.posterPath || ''}" data-overview="${movie.overview || ''}" data-rating="${movie.rating || 0}">
                        <span>❤️</span> Dodaj do ulubionych
                    </button>
                </div>
            </div>
        `;

        const favoriteBtn = movieCard.querySelector('.btn-favorite');
        favoriteBtn.addEventListener('click', () => handleAddFavorite(movie.movieId, movie.title, movie.posterPath, movie.overview, movie.rating, favoriteBtn));

        container.appendChild(movieCard);
    });
}

function renderPagination(currentPage, totalPages, mood) {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    pageInfo.textContent = `Strona ${currentPage} z ${totalPages}`;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    prevBtn.onclick = () => {
        window.location.href = `movies.html?mood=${mood}&page=${currentPage - 1}`;
    };

    nextBtn.onclick = () => {
        window.location.href = `movies.html?mood=${mood}&page=${currentPage + 1}`;
    };
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
        if (error.message.includes('уже в избранном') || error.message.includes('already')) {
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
    const authRequired = document.getElementById('auth-required');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const favoritesGrid = document.getElementById('favorites-grid');
    const emptyState = document.getElementById('empty-favorites');

    if (!isAuthenticated()) {
        authRequired.style.display = 'block';
        loadingEl.style.display = 'none';
        return;
    }

    authRequired.style.display = 'none';
    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    favoritesGrid.innerHTML = '';
    emptyState.style.display = 'none';

    try {
        const favorites = await apiRequest('/favorites');

        loadingEl.style.display = 'none';

        if (favorites && favorites.length > 0) {
            renderFavorites(favorites, favoritesGrid);
        } else {
            emptyState.style.display = 'block';
        }
    } catch (error) {
        loadingEl.style.display = 'none';
        errorEl.textContent = error.message || 'Błąd podczas ładowania ulubionych.';
        errorEl.style.display = 'block';
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
