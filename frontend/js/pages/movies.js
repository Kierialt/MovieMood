/**
 * Strona listy filmów/seriali – ładowana tylko na /movies.html (code splitting).
 * Zawiera: loadMovies, infinite scroll, render kart, przycisk „Więcej szczegółów” (lazy ładuje movie-detail).
 */

import { apiRequest, isAuthenticated } from '../core.js';

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

async function onDetailsClick(movieId, apiType) {
    const { openMovieDetailModal } = await import('../modules/movie-detail.js');
    openMovieDetailModal(movieId, apiType);
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

function renderMovies(movies, container, append = false, contentType = 'movie') {
    if (!container) return;
    if (!append) container.innerHTML = '';

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
        detailsBtn.addEventListener('click', () => onDetailsClick(movieId, apiType));

        container.appendChild(movieCard);
    });
}

export function init() {
    loadMovies();
    document.getElementById('change-genre-btn')?.addEventListener('click', () => {
        const urlParams = new URLSearchParams(window.location.search);
        let type = (urlParams.get('type') || localStorage.getItem('contentType') || 'movie').toLowerCase();
        if (type !== 'movie' && type !== 'tv' && type !== 'animation') type = 'movie';
        const pathname = window.location.pathname;
        const href = (pathname.includes('/pages/') || pathname.endsWith('movies.html'))
            ? 'genres.html?type=' + encodeURIComponent(type)
            : 'pages/genres.html?type=' + encodeURIComponent(type);
        window.location.href = href;
    });
    window.addEventListener('popstate', () => {
        if (window.location.pathname.includes('movies.html')) loadMovies();
    });
}
