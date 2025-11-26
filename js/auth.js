// js/auth.js

// ADICIONAR ESTAS LINHAS NO INÍCIO DO ARQUIVO
const API_BASE_URL = 'https://concessionaria-backend-5.onrender.com/api';
const API_URL = 'https://concessionaria-backend-5.onrender.com/api';

// Função para pegar o token
function getToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
}

// Função para pegar ID do usuário
function getCurrentUserId() {
    return localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
}

// SUA FUNÇÃO DE LOGIN EXISTENTE (mantenha ela, só adicione as linhas acima)
async function login(email, password) {
    try {
        console.log('Tentando login para:', email);
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro no login');
        }

        const data = await response.json();
        
        // Salvar token e informações do usuário
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user_email', data.user.email);
        
        console.log('Login bem-sucedido:', data.user.email);
        
        // Redirecionar para a página de veículos
        window.location.href = 'veiculos.html';
        
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro no login: ' + error.message);
    }
}

// ... resto do seu código auth.js existente ...
