// Elementos da interface
const authButtons = document.getElementById('auth-buttons');
const userMenu = document.getElementById('user-menu');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

// Verificar estado de autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                showUserMenu(JSON.parse(user));
            } else {
                clearAuthData();
                showAuthButtons();
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            clearAuthData();
            showAuthButtons();
        }
    } else {
        showAuthButtons();
    }
}

function showAuthButtons() {
    if (authButtons) authButtons.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
}

function showUserMenu(user) {
    if (authButtons) authButtons.classList.add('hidden');
    if (userMenu) userMenu.classList.remove('hidden');
    if (userName) userName.textContent = user.nome;
}

function clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

async function handleLogout() {
    try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Erro no logout:', error);
    } finally {
        clearAuthData();
        showAuthButtons();
        window.location.href = 'index.html';
    }
}

// Função de login
async function login(email, senha) {
    try {
        console.log('🔐 Tentando login para:', email);
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('❌ Erro no login:', error);
        return { success: false, error: 'Erro de conexão com o servidor' };
    }
}

// Função de cadastro
async function cadastrar(nome, email, senha) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Erro no cadastro:', error);
        return { success: false, error: 'Erro de conexão' };
    }
}

function requireAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

