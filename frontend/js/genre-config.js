/**
 * Konfiguracja gatunków TMDB: filmy i seriale.
 * Używane do wyświetlania kart gatunków i zapytań discover (with_genres).
 */

const MOVIE_GENRES = [
    { id: 28, name: 'Action', description: 'Dynamiczne filmy pełne pościgów, walk, eksplozji i adrenaliny.', emoji: '💥' },
    { id: 12, name: 'Adventure', description: 'Historie o podróżach, odkrywaniu nowych światów i wielkich przygodach.', emoji: '🗺️' },
    { id: 16, name: 'Animation', description: 'Animowane filmy dla dzieci i dorosłych, pełne kreatywności i wyobraźni.', emoji: '🎨' },
    { id: 35, name: 'Comedy', description: 'Lekkie i zabawne filmy, których celem jest rozbawić widza.', emoji: '😂' },
    { id: 80, name: 'Crime', description: 'Opowieści o przestępstwach, mafii, śledztwach i świecie kryminalnym.', emoji: '🕵️' },
    { id: 99, name: 'Documentary', description: 'Filmy oparte na faktach, pokazujące prawdziwe historie i wydarzenia.', emoji: '📽️' },
    { id: 18, name: 'Drama', description: 'Emocjonalne historie skupione na relacjach, problemach i życiu bohaterów.', emoji: '🎭' },
    { id: 10751, name: 'Family', description: 'Filmy dla całej rodziny, ciepłe, bezpieczne i uniwersalne.', emoji: '👨‍👩‍👧‍👦' },
    { id: 14, name: 'Fantasy', description: 'Magiczne światy, mityczne istoty i niezwykłe moce.', emoji: '✨' },
    { id: 36, name: 'History', description: 'Filmy inspirowane prawdziwymi wydarzeniami historycznymi.', emoji: '📜' },
    { id: 27, name: 'Horror', description: 'Produkcje, które mają straszyć i budować napięcie.', emoji: '👻' },
    { id: 10402, name: 'Music', description: 'Filmy związane z muzyką, artystami i światem dźwięków.', emoji: '🎵' },
    { id: 9648, name: 'Mystery', description: 'Zagadki, tajemnice i historie, które trzymają w niepewności do końca.', emoji: '🔍' },
    { id: 10749, name: 'Romance', description: 'Opowieści o miłości, związkach i emocjonalnych relacjach.', emoji: '💕' },
    { id: 878, name: 'Science Fiction', description: 'Futurystyczne wizje, technologia, kosmos i pytania o przyszłość.', emoji: '🚀' },
    { id: 53, name: 'Thriller', description: 'Filmy pełne napięcia, zwrotów akcji i niepokoju.', emoji: '😱' },
    { id: 10770, name: 'TV Movie', description: 'Filmy produkowane głównie z myślą o telewizji.', emoji: '📺' },
    { id: 10752, name: 'War', description: 'Historie osadzone w realiach wojny, walk i konfliktów zbrojnych.', emoji: '⚔️' },
    { id: 37, name: 'Western', description: 'Filmy o Dzikim Zachodzie, kowbojach i życiu na pograniczu.', emoji: '🤠' }    
];

const TV_GENRES = [
    { id: 10759, name: 'Action & Adventure', description: 'Dynamiczne seriale pełne akcji, przygód i niebezpiecznych misji.', emoji: '💥' },
{ id: 16, name: 'Animation', description: 'Animowane seriale dla dzieci i dorosłych, w różnych stylach i światach.', emoji: '🎨' },
{ id: 35, name: 'Comedy', description: 'Lekkie i zabawne seriale, idealne na relaks i poprawę humoru.', emoji: '😂' },
{ id: 80, name: 'Crime', description: 'Seriale kryminalne o przestępstwach, śledztwach i świecie prawa.', emoji: '🕵️' },
{ id: 99, name: 'Documentary', description: 'Seriale dokumentalne oparte na faktach i prawdziwych historiach.', emoji: '📽️' },
{ id: 18, name: 'Drama', description: 'Seriale skupione na emocjach, relacjach i życiu bohaterów.', emoji: '🎭' },
{ id: 10751, name: 'Family', description: 'Seriale odpowiednie dla całej rodziny, ciepłe i uniwersalne.', emoji: '👨‍👩‍👧‍👦' },
{ id: 10762, name: 'Kids', description: 'Programy i seriale stworzone specjalnie dla dzieci.', emoji: '🧒' },
{ id: 9648, name: 'Mystery', description: 'Tajemnicze seriale pełne zagadek i nieoczywistych odpowiedzi.', emoji: '🔍' },
{ id: 10763, name: 'News', description: 'Programy informacyjne i serwisy wiadomości.', emoji: '📰' },
{ id: 10764, name: 'Reality', description: 'Reality shows pokazujące prawdziwe życie, rywalizację i emocje.', emoji: '📺' },
{ id: 10765, name: 'Sci-Fi & Fantasy', description: 'Seriale osadzone w futurystycznych lub magicznych światach.', emoji: '🚀' },
{ id: 10766, name: 'Soap', description: 'Seriale obyczajowe z długimi, emocjonalnymi historiami.', emoji: '🧼' },
{ id: 10767, name: 'Talk', description: 'Talk-showy z rozmowami, wywiadami i dyskusjami.', emoji: '💬' },
{ id: 10768, name: 'War & Politics', description: 'Seriale o wojnie, polityce i konfliktach na dużą skalę.', emoji: '⚔️' },
{ id: 37, name: 'Western', description: 'Seriale inspirowane Dzikim Zachodem i jego surowym klimatem.', emoji: '🤠' }
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
