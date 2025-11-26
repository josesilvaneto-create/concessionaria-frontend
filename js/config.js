// js/config.js
const API_URL = 'https://concessionaria-backend-5.onrender.com/api';

// Função para pegar o token
function getToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
}

// Função para pegar ID do usuário
function getCurrentUserId() {
    return localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
}
