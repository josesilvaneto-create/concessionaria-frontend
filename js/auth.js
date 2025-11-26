// js/auth.js

const API_BASE_URL = 'https://concessionaria-backend-5.onrender.com/api';

// Função de login corrigida
async function login(email, password) {
    try {
        console.log('Tentando login para:', email);
        
        // Adicionar timestamp para evitar cache
        const timestamp = new Date().getTime();
        const url = `${API_BASE_URL}/auth/login?t=${timestamp}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        console.log('Status da resposta:', response.status);
        console.log('Response OK:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro completo:', errorText);
            throw new Error('Erro no servidor: ' + response.status);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (!data.token) {
            throw new Error('Token não recebido do servidor');
        }

        // Salvar token e informações do usuário
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user_email', data.user.email);
        
        console.log('Login bem-sucedido! Redirecionando...');
        
        // Redirecionar para a página de veículos
        window.location.href = 'veiculos.html';
        
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro no login: ' + error.message);
    }
}

// Função de registro
async function register(nome, email, password) {
    try {
        const timestamp = new Date().getTime();
        const url = `${API_BASE_URL}/auth/register?t=${timestamp}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error('Erro no cadastro: ' + response.status);
        }

        const data = await response.json();
        alert('Registro realizado com sucesso! Faça login.');
        window.location.href = 'login.html';
        
    } catch (error) {
        console.error('Erro no registro:', error);
        alert('Erro no registro: ' + error.message);
    }
}

// Função de logout
function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    window.location.href = 'login.html';
}

// Verificar autenticação
function checkAuth() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            login(email, password);
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            register(nome, email, password);
        });
    }

    // Check auth on protected pages
    if (window.location.pathname.includes('veiculos.html') || 
        window.location.pathname.includes('cadastro-veiculo.html')) {
        checkAuth();
    }
});
