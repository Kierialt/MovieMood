/**
 * Core – współdzielona konfiguracja API, auth i helpers.
 * Importowany przez main.js oraz moduły stron i moduły funkcjonalne (np. movie-detail).
 */

// Na deployu (np. Render) front i API są na tej samej domenie – używamy origin. Lokalnie: localhost:5272.
export const API_BASE_URL = (typeof window !== 'undefined' && window.location?.origin)
    ? `${window.location.origin}/api`
    : 'http://localhost:5272/api';

export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');
export const getRole = () => localStorage.getItem('userRole') || 'User';
export const setRole = (role) => { if (role) localStorage.setItem('userRole', role); };
export const removeRole = () => localStorage.removeItem('userRole');
export const getUsername = () => localStorage.getItem('username') || '';
export const setUsername = (username) => { if (username) localStorage.setItem('username', username); };
export const removeUsername = () => localStorage.removeItem('username');
export const isAuthenticated = () => !!getToken();

export async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || data.title || `HTTP ${response.status}`);
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

export function updateAuthLink() {
    const authLinks = document.querySelectorAll('#auth-link');
    authLinks.forEach(link => {
        if (isAuthenticated()) {
            const username = getUsername();
            const letter = username ? username.charAt(0).toUpperCase() : '?';
            link.href = '#';
            link.innerHTML = `<span class="user-avatar-wrapper"><span class="user-avatar" title="${username || 'Użytkownik'}">${letter}</span><span class="user-avatar-label">Wyloguj się</span></span>`;
            link.onclick = (e) => { e.preventDefault(); logout(); };
        } else {
            link.textContent = 'Zaloguj się';
            link.innerHTML = 'Zaloguj się';
            const p = window.location.pathname;
            const inPages = p.includes('/pages/') || p.endsWith('/pages') || /pages\.html|movies\.html|favorites\.html|auth\.html/.test(p);
            link.href = inPages ? 'auth.html' : 'pages/auth.html';
            link.onclick = null;
        }
    });
}

export function logout() {
    removeToken();
    removeRole();
    removeUsername();
    updateAuthLink();
    if (window.location.pathname.includes('favorites.html')) {
        window.location.href = 'auth.html';
    } else {
        window.location.reload();
    }
}
