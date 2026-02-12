/**
 * Strona logowania/rejestracji – ładowana tylko na /auth.html (code splitting).
 */

import { apiRequest, setToken, setRole, setUsername, updateAuthLink } from '../core.js';

function clearErrors(prefix) {
    document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => {
        if (el.classList.contains('error-message')) el.textContent = '';
    });
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = message;
}

async function handleLogin(e) {
    e.preventDefault();
    clearErrors('login');

    const usernameOrEmail = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ usernameOrEmail, password })
        });

        const token = data.token || data.Token;
        if (!token) {
            showError('login-error', 'Błąd: nie otrzymano tokena z serwera.');
            return;
        }

        setToken(token);
        setRole(data.role || data.Role || 'User');
        setUsername(data.userName || data.UserName || '');
        updateAuthLink();

        const currentPath = window.location.pathname;
        const redirectPath = currentPath.includes('/pages/') ? '../index.html' : (currentPath.endsWith('/') || currentPath === '/' ? 'index.html' : './index.html');
        window.location.href = redirectPath;
    } catch (error) {
        showError('login-error', error.message || 'Błąd logowania. Sprawdź dane.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    clearErrors('register');

    const userName = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;

    if (userName.length < 3) {
        showError('register-username-error', 'Nazwa użytkownika musi mieć minimum 3 znaki');
        return;
    }
    if (!email.includes('@')) {
        showError('register-email-error', 'Nieprawidłowy adres email');
        return;
    }
    if (password.length < 6) {
        showError('register-password-error', 'Hasło musi mieć minimum 6 znaków');
        return;
    }
    if (password !== passwordConfirm) {
        showError('register-password-confirm-error', 'Hasła nie są identyczne');
        return;
    }

    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ userName, email, password })
        });

        const token = data.token || data.Token;
        if (!token) {
            showError('register-error', 'Błąd: nie otrzymano tokena z serwera.');
            return;
        }

        setToken(token);
        setRole(data.role || data.Role || 'User');
        setUsername(data.userName || data.UserName || userName);
        updateAuthLink();

        const currentPath = window.location.pathname;
        const redirectPath = currentPath.includes('/pages/') ? '../index.html' : (currentPath.endsWith('/') || currentPath === '/' ? 'index.html' : './index.html');
        window.location.href = redirectPath;
    } catch (error) {
        showError('register-error', error.message || 'Błąd rejestracji. Spróbuj ponownie.');
    }
}

export function init() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            tabButtons.forEach(b => b.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            btn.classList.add('active');
            const form = document.getElementById(`${tab}-form`);
            if (form) form.classList.add('active');
        });
    });

    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const registerForm = document.getElementById('register-form');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
}
