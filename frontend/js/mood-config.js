/**
 * Konfiguracja nastrojów → wyświetlanie i mapowanie na TMDB (backend).
 * Aby dodać nowy nastrój: dodaj wpis do MOOD_CONFIG i w backendzie do MoodGenreConfig.MoodToGenreIds.
 */
const MOOD_CONFIG = [
    { id: 'Happy', label: 'Happy', emoji: '😊', description: 'Szukasz czegoś wesołego i lekkiego?' },
    { id: 'Romantic', label: 'Romantic', emoji: '💕', description: 'Chcesz poczuć miłość w powietrzu?' },
    { id: 'Scary', label: 'Scary', emoji: '👻', description: 'Gotowy na dreszczyk emocji?' },
    { id: 'Funny', label: 'Funny', emoji: '😂', description: 'Chcesz się porządnie pośmiać?' },
    { id: 'CalmCozy', label: 'Calm / Cozy', emoji: '🛋️', description: 'Rodzinne, animowane lub spokojne dramaty' },
    { id: 'InspiredTravel', label: 'Inspired / Travel', emoji: '✈️', description: 'Przygoda i dokumenty' },
    { id: 'MotivatedSport', label: 'Motivated / Sport', emoji: '🏃', description: 'Sport i biografie' },
    { id: 'NatureAnimals', label: 'Nature / Animals', emoji: '🌿', description: 'Dokumenty o naturze i zwierzętach' },
    { id: 'SadEmotional', label: 'Sad / Emotional', emoji: '😢', description: 'Dramat i wojna' },
    { id: 'ExcitedAction', label: 'Excited / Action', emoji: '🔥', description: 'Akcja, przygoda, sci‑fi' }
];

/** Zwraca etykietę do wyświetlenia (emoji + label). */
function getMoodDisplayLabel(moodId) {
    const mood = MOOD_CONFIG.find(m => m.id === moodId);
    return mood ? `${mood.emoji} ${mood.label}` : moodId;
}

/** Zwraca listę ID nastrojów (do walidacji / domyślnego). */
function getMoodIds() {
    return MOOD_CONFIG.map(m => m.id);
}
