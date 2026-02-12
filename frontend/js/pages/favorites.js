/**
 * Strona ulubionych – ładowana tylko na /favorites.html (code splitting).
 */

import { apiRequest, isAuthenticated } from '../core.js';

async function loadFavorites() {
    const authRequired = document.getElementById('auth-required');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const favoritesGrid = document.getElementById('favorites-grid');
    const emptyState = document.getElementById('empty-favorites');

    if (!isAuthenticated()) {
        if (authRequired) authRequired.style.display = 'block';
        if (loadingEl) loadingEl.style.display = 'none';
        return;
    }

    if (authRequired) authRequired.style.display = 'none';
    if (loadingEl) loadingEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
    if (favoritesGrid) {
        favoritesGrid.innerHTML = '';
        favoritesGrid.style.display = 'grid';
    }
    if (emptyState) emptyState.style.display = 'none';

    try {
        const favorites = await apiRequest('/favorites');
        if (loadingEl) loadingEl.style.display = 'none';

        if (favorites && Array.isArray(favorites) && favorites.length > 0) {
            renderFavorites(favorites, favoritesGrid);
        } else {
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
    if (!container) return;
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
    if (!confirm('Czy na pewno chcesz usunąć ten film z ulubionych?')) return;

    try {
        await apiRequest(`/favorites/${favoriteId}`, { method: 'DELETE' });
        cardElement.remove();
        const favoritesGrid = document.getElementById('favorites-grid');
        if (favoritesGrid && favoritesGrid.children.length === 0) {
            const emptyEl = document.getElementById('empty-favorites');
            if (emptyEl) emptyEl.style.display = 'block';
        }
    } catch (error) {
        alert('Błąd podczas usuwania z ulubionych: ' + error.message);
    }
}

export function init() {
    loadFavorites();
}
