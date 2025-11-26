// js/auth.js

const API_BASE_URL = 'https://concessionaria-backend-5.onrender.com/api';

// Função de login com debug completo
async function login(email, password) {
    try {
        console.log('🔍 INICIANDO LOGIN...');
        console.log('Email:', email);
        console.log('URL:', `${API_BASE_URL}/auth/login`);
        
        const loginData = {
            email: email,
            password: password
        };
        
        console.log('📤 Dados enviados:', loginData);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });

        console.log('📥 Status da resposta:', response.status);
        console.log('📥 Response OK:', response.ok);

        // Ler a resposta independente do status
        const responseText = await response.text();
        console.log('📥 Resposta completa:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
            console.log('📥 Dados parseados:', data);
        } catch (e) {
            console.error('❌ Erro ao parsear JSON:', e);
            throw new Error('Resposta inválida do servidor');
        }

        if (!response.ok) {
            throw new Error(data.message || data.error || `Erro ${response.status} no login`);
        }

        // Verificar se temos token e user
        if (!data.token || !data.user) {
            console.error('❌ Dados incompletos na resposta:', data);
            throw new Error('Dados de login incompletos');
        }

        console.log('✅ Login bem-sucedido!');
        console.log('Token:', data.token.substring(0, 20) + '...');
        console.log('Usuário:', data.user);

        // Salvar token e informações do usuário
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user_email', data.user.email);
        
        console.log('💾 Dados salvos no localStorage');
        
        // Redirecionar para a página de veículos
        console.log('🔄 Redirecionando para veículos...');
        window.location.href = 'veiculos.html';
        
    } catch (error) {
        console.error('❌ Erro completo no login:', error);
        alert('Erro no login: ' + error.message);
    }
}

// Função de registro
async function register(nome, email, password) {
    try {
        console.log('🔍 INICIANDO CADASTRO...');
        
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

        console.log('📥 Status cadastro:', response.status);

        const responseText = await response.text();
        console.log('📥 Resposta cadastro:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('❌ Erro ao parsear JSON:', e);
            throw new Error('Resposta inválida do servidor');
        }

        if (!response.ok) {
            throw new Error(data.message || data.error || `Erro ${response.status} no cadastro`);
        }

        alert('✅ Registro realizado com sucesso! Faça login.');
        window.location.href = 'login.html';
        
    } catch (error) {
        console.error('❌ Erro no registro:', error);
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
    console.log('🔍 Verificando autenticação - Token:', token ? 'PRESENTE' : 'NÃO ENCONTRADO');
    
    if (!token) {
        console.log('❌ Usuário não autenticado, redirecionando...');
        window.location.href = 'login.html';
        return false;
    }
    
    console.log('✅ Usuário autenticado');
    return true;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Página carregada:', window.location.pathname);

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('✅ Formulário de login encontrado');
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            console.log('🖱️ Botão login clicado');
            login(email, password);
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        console.log('✅ Formulário de registro encontrado');
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            console.log('🖱️ Botão cadastro clicado');
            register(nome, email, password);
        });
    }

    // Check auth on protected pages
    const currentPage = window.location.pathname.split('/').pop();
    console.log('📄 Página atual:', currentPage);
    
    if (currentPage === 'veiculos.html' || currentPage === 'cadastro-veiculo.html') {
        console.log('🔒 Página protegida, verificando autenticação...');
        checkAuth();
    }
});
