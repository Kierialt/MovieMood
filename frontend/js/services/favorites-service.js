/**
 * Serwis ulubionych – jedna logika dodawania i stanu ulubionych (movieId).
 * Używany przez FavoriteButton i stronę ulubionych do synchronizacji stanu.
 */

import { apiRequest } from '../core.js';

const favoriteMovieIds = new Set();

const FAVORITES_CHANGED = 'favoritesChanged';

/**
 * Dodaje film do ulubionych (API + stan lokalny). Po sukcesie emituje favoritesChanged.
 * @param {number|string} movieId
 * @param {{ title: string, posterPath?: string, overview?: string, rating?: number }} payload
 * @returns {Promise<void>}
 */
export async function addToFavorites(movieId, payload) {
    await apiRequest('/favorites', {
        method: 'POST',
        body: JSON.stringify({
            movieId,
            title: payload.title || '',
            posterPath: payload.posterPath || '',
            overview: payload.overview || '',
            rating: payload.rating ?? 0
        })
    });
    favoriteMovieIds.add(String(movieId));
    window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED, { detail: { movieId: String(movieId), inFavorites: true } }));
}

/**
 * Sprawdza, czy film jest w ulubionych (stan lokalny).
 * @param {number|string} movieId
 * @returns {boolean}
 */
export function isInFavorites(movieId) {
    return favoriteMovieIds.has(String(movieId));
}

/**
 * Ustawia zestaw ID ulubionych (np. po załadowaniu listy z API).
 * @param {Array<number|string>} ids
 */
export function setFavoriteMovieIds(ids) {
    favoriteMovieIds.clear();
    (ids || []).forEach((id) => favoriteMovieIds.add(String(id)));
}

/**
 * Subskrypcja zmian ulubionych – komponenty mogą nasłuchiwać i odświeżać UI.
 * @param {(detail: { movieId: string, inFavorites: boolean }) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeFavoritesChanged(callback) {
    const handler = (e) => callback(e.detail);
    window.addEventListener(FAVORITES_CHANGED, handler);
    return () => window.removeEventListener(FAVORITES_CHANGED, handler);
}

export { FAVORITES_CHANGED };
