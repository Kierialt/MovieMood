/**
 * Konfiguracja gatunków TMDB: filmy i seriale.
 * Używane do wyświetlania kart gatunków i zapytań discover (with_genres).
 */

const MOVIE_GENRES = [
    { id: 28, name: 'Action', description: 'Opis gatunku — placeholder.' },
    { id: 12, name: 'Adventure', description: 'Opis gatunku — placeholder.' },
    { id: 16, name: 'Animation', description: 'Opis gatunku — placeholder.' },
    { id: 35, name: 'Comedy', description: 'Opis gatunku — placeholder.' },
    { id: 80, name: 'Crime', description: 'Opis gatunku — placeholder.' },
    { id: 99, name: 'Documentary', description: 'Opis gatunku — placeholder.' },
    { id: 18, name: 'Drama', description: 'Opis gatunku — placeholder.' },
    { id: 10751, name: 'Family', description: 'Opis gatunku — placeholder.' },
    { id: 14, name: 'Fantasy', description: 'Opis gatunku — placeholder.' },
    { id: 36, name: 'History', description: 'Opis gatunku — placeholder.' },
    { id: 27, name: 'Horror', description: 'Opis gatunku — placeholder.' },
    { id: 10402, name: 'Music', description: 'Opis gatunku — placeholder.' },
    { id: 9648, name: 'Mystery', description: 'Opis gatunku — placeholder.' },
    { id: 10749, name: 'Romance', description: 'Opis gatunku — placeholder.' },
    { id: 878, name: 'Science Fiction', description: 'Opis gatunku — placeholder.' },
    { id: 53, name: 'Thriller', description: 'Opis gatunku — placeholder.' },
    { id: 10770, name: 'TV Movie', description: 'Opis gatunku — placeholder.' },
    { id: 10752, name: 'War', description: 'Opis gatunku — placeholder.' },
    { id: 37, name: 'Western', description: 'Opis gatunku — placeholder.' }
];

const TV_GENRES = [
    { id: 10759, name: 'Action & Adventure', description: 'Opis gatunku — placeholder.' },
    { id: 16, name: 'Animation', description: 'Opis gatunku — placeholder.' },
    { id: 35, name: 'Comedy', description: 'Opis gatunku — placeholder.' },
    { id: 80, name: 'Crime', description: 'Opis gatunku — placeholder.' },
    { id: 99, name: 'Documentary', description: 'Opis gatunku — placeholder.' },
    { id: 18, name: 'Drama', description: 'Opis gatunku — placeholder.' },
    { id: 10751, name: 'Family', description: 'Opis gatunku — placeholder.' },
    { id: 10762, name: 'Kids', description: 'Opis gatunku — placeholder.' },
    { id: 9648, name: 'Mystery', description: 'Opis gatunku — placeholder.' },
    { id: 10763, name: 'News', description: 'Opis gatunku — placeholder.' },
    { id: 10764, name: 'Reality', description: 'Opis gatunku — placeholder.' },
    { id: 10765, name: 'Sci-Fi & Fantasy', description: 'Opis gatunku — placeholder.' },
    { id: 10766, name: 'Soap', description: 'Opis gatunku — placeholder.' },
    { id: 10767, name: 'Talk', description: 'Opis gatunku — placeholder.' },
    { id: 10768, name: 'War & Politics', description: 'Opis gatunku — placeholder.' },
    { id: 37, name: 'Western', description: 'Opis gatunku — placeholder.' }
];

/** Zwraca listę gatunków dla danego typu: "movie" | "tv". */
function getGenres(contentType) {
    return (contentType || '').toLowerCase() === 'tv' ? TV_GENRES : MOVIE_GENRES;
}

/** Zwraca nazwę gatunku po ID i typie. */
function getGenreName(contentType, genreId) {
    const list = getGenres(contentType);
    const g = list.find(x => x.id === parseInt(genreId, 10));
    return g ? g.name : String(genreId);
}

/** Zwraca poprawną nazwę typu do wyświetlenia. */
function getContentTypeLabel(contentType) {
    return (contentType || '').toLowerCase() === 'tv' ? 'TV Shows' : 'Movies';
}
