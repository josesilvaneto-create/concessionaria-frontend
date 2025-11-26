// js/config.js
const API_BASE_URL = 'https://concessionaria-backend-5.onrender.com/api';

function getToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
}

function getCurrentUserId() {
    return localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
}
