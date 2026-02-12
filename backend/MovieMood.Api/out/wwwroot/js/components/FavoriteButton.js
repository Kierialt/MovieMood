/**
 * Ponownie wykorzystywany przycisk „Dodaj do ulubionych” – jedna implementacja dla kart i modala.
 * Przyjmuje movieId i payload; korzysta z favorites-service; aktualizuje UI w czasie rzeczywistym.
 */

import { isAuthenticated } from '../core.js';
import { addToFavorites, isInFavorites, FAVORITES_CHANGED } from '../services/favorites-service.js';

const LABEL_ADD = 'Dodać do ulubionych';
const LABEL_ADDING = 'Dodawanie...';
const LABEL_ADDED = 'W ulubionych';

function setButtonState(button, inFavorites) {
    if (!button) return;
    if (inFavorites) {
        button.disabled = true;
        button.classList.add('favorited');
        button.innerHTML = '<span>✓</span> ' + LABEL_ADDED;
        button.setAttribute('aria-label', LABEL_ADDED);
    } else {
        button.disabled = false;
        button.classList.remove('favorited');
        button.innerHTML = '<span>❤️</span> ' + LABEL_ADD;
        button.setAttribute('aria-label', LABEL_ADD);
    }
}

/**
 * Tworzy przycisk „Dodaj do ulubionych” (można wstawić w dowolny kontener).
 * @param {{
 *   movieId: number|string,
 *   title: string,
 *   posterPath?: string,
 *   overview?: string,
 *   rating?: number,
 *   className?: string
 * }} options
 * @returns {HTMLButtonElement}
 */
export function createFavoriteButton(options) {
    const { movieId, title, posterPath = '', overview = '', rating = 0, className = 'btn-favorite' } = options;
    const id = String(movieId);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('data-movie-id', id);
    button.setAttribute('aria-label', LABEL_ADD);

    const inFavorites = isInFavorites(movieId);
    setButtonState(button, inFavorites);

    const handler = (e) => {
        if (e.detail.movieId !== id) return;
        if (!document.contains(button)) {
            window.removeEventListener(FAVORITES_CHANGED, handler);
            return;
        }
        setButtonState(button, true);
    };
    window.addEventListener(FAVORITES_CHANGED, handler);

    button.addEventListener('click', async () => {
        if (!isAuthenticated()) {
            alert('Musisz być zalogowany, aby dodać film do ulubionych.');
            const authPath = window.location.pathname.includes('pages') ? 'auth.html' : 'pages/auth.html';
            window.location.href = authPath;
            return;
        }

        button.disabled = true;
        button.textContent = LABEL_ADDING;

        try {
            await addToFavorites(movieId, { title, posterPath, overview, rating });
            setButtonState(button, true);
        } catch (error) {
            const already = error.message && (error.message.includes('już w ulubionych') || error.message.includes('already'));
            if (already) {
                setButtonState(button, true);
            } else {
                alert('Ten komponent został już dodany do ulubionych: ' + (error.message || ''));
                setButtonState(button, false);
            }
        }
    });

    return button;
}
