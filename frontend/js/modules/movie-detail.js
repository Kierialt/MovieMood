/**
 * Moduł szczegółów filmu/serialu – ładowany dopiero po otwarciu modala (lazy).
 * Zawiera: modal, fetch szczegółów, obsada, trailer, galeria, rekomendacje.
 */

import { apiRequest } from '../core.js';

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

const movieDetailModalState = {
    open: false,
    escapeHandler: null,
    movieId: null,
    contentType: null
};

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
            if (id && contentType) {
                closeMovieDetailModal();
                openMovieDetailModal(id, contentType);
            }
        });
    });
}

function bindMovieDetailModalButtons(contentEl) {
    const closeBtn = contentEl.querySelector('.movie-detail-close');
    const goBtn = contentEl.querySelector('.movie-detail-go');
    if (closeBtn) closeBtn.addEventListener('click', closeMovieDetailModal);
    if (goBtn) goBtn.addEventListener('click', () => closeMovieDetailModal());
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

export function openMovieDetailModal(movieId, contentType) {
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

export function closeMovieDetailModal() {
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
