/**
 * Entry point – minimalny kod startowy + routing (code splitting).
 * Ładuje tylko core i na podstawie ścieżki dynamicznie importuje moduł strony.
 * Moduł szczegółów filmu (modal, galeria, trailer, rekomendacje) ładuje się
 * dopiero po kliknięciu „Więcej szczegółów” (w pages/movies.js).
 */

import './sw-registration.js';
import { updateAuthLink, isAuthenticated, apiRequest } from './core.js';
import { setFavoriteMovieIds } from './services/favorites-service.js';

function isMoviesPage(pathname) {
    return pathname.includes('movies.html') || pathname.includes('/pages/movies') || pathname.endsWith('/movies');
}

function isFavoritesPage(pathname) {
    return pathname.includes('favorites.html') || pathname.includes('/pages/favorites') || pathname.endsWith('/favorites');
}

function isAuthPage(pathname) {
    return pathname.includes('auth.html') || pathname.includes('/pages/auth') || pathname.endsWith('/auth');
}

document.addEventListener('DOMContentLoaded', () => {
    updateAuthLink();
    if (isAuthenticated()) {
        apiRequest('/favorites')
            .then((list) => setFavoriteMovieIds((list || []).map((f) => f.movieId ?? f.MovieId).filter(Boolean)))
            .catch(() => {});
    }

    // Strona główna: klik w typ kontekstu → strona gatunków
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

    // Strona gatunków: type z URL lub localStorage; render kart; klik → movies
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
        const typeLabel = typeof getContentTypeLabel === 'function' ? getContentTypeLabel(contentType) : contentType;

        const titleEl = document.getElementById('genres-title');
        if (titleEl) titleEl.textContent = `Gatunki: ${typeLabel}`;

        const backLink = document.getElementById('genre-back-link');
        if (backLink) backLink.innerHTML = `<a href="../index.html">← Strona główna</a>`;

        const filmFrameSrc = window.location.pathname.includes('/pages/') ? '../images/film-frame-3.png' : 'images/film-frame-3.png';
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
                window.location.href = base + 'movies.html?type=' + encodeURIComponent(type) + '&genre=' + encodeURIComponent(genre);
            });
        });
    }

    // Code splitting: ładowanie modułu strony tylko gdy jest potrzebny
    const pathname = window.location.pathname;

    if (isMoviesPage(pathname)) {
        import('./pages/movies.js').then(m => m.init());
        return;
    }

    if (isFavoritesPage(pathname)) {
        import('./pages/favorites.js').then(m => m.init());
        return;
    }

    if (isAuthPage(pathname)) {
        import('./pages/auth.js').then(m => m.init());
    }
});
