// js/veiculos.js

// Verificar autenticação antes de carregar veículos
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se está autenticado
    const token = localStorage.getItem('auth_token');
    if (!token) {
        alert('Você precisa fazer login primeiro!');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('Usuário autenticado, carregando veículos...');
    carregarVeiculos();
});

async function carregarVeiculos() {
    try {
        const token = localStorage.getItem('auth_token');
        console.log('Token sendo usado:', token ? 'PRESENTE' : 'AUSENTE');
        
        const response = await fetch(`${API_URL}/veiculos?select=*`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Status da resposta veículos:', response.status);
        
        if (response.status === 401) {
            alert('Sessão expirada! Faça login novamente.');
            logout();
            return;
        }
        
        if (!response.ok) {
            throw new Error('Erro ao buscar veículos: ' + response.status);
        }
        
        const veiculos = await response.json();
        console.log('Veículos carregados:', veiculos.length);
        exibirVeiculos(veiculos);
        
    } catch (error) {
        console.error('Erro ao carregar veículos:', error);
        document.getElementById('veiculos-container').innerHTML = 
            '<p>Erro ao carregar veículos. ' + error.message + '</p>';
    }
}

// Função logout para veiculos.js
function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    window.location.href = 'login.html';
}

// ... restante do código existente ...
