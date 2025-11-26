// js/auth.js

// Definir a URL da API no início do arquivo
const API_BASE_URL = 'https://concessionaria-backend-5.onrender.com/api';

// Função de login corrigida
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

// Função de registro/cadastro
async function register(nome, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro no registro');
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
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_id');
    window.location.href = 'login.html';
}

// Verificar se usuário está autenticado
function checkAuth() {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Event listeners para formulários de login
document.addEventListener('DOMContentLoaded', function() {
    // Formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            login(email, password);
        });
    }

    // Formulário de registro
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

    // Verificar autenticação em páginas protegidas
    const protectedPages = ['veiculos.html', 'cadastro-veiculo.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        if (!checkAuth()) {
            window.location.href = 'login.html';
        }
    }
});
