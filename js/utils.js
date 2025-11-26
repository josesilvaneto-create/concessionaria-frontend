// Utilitários gerais para o frontend

// Formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Validar e-mail
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remove notificação existente
    const notificacaoExistente = document.getElementById('global-notification');
    if (notificacaoExistente) {
        notificacaoExistente.remove();
    }

    // Cria nova notificação
    const notificacao = document.createElement('div');
    notificacao.id = 'global-notification';
    notificacao.className = `notification notification-${tipo}`;
    notificacao.textContent = mensagem;
    
    // Estilos da notificação
    Object.assign(notificacao.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '4px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        maxWidth: '300px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    });

    // Cores por tipo
    const cores = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    notificacao.style.backgroundColor = cores[tipo] || cores.info;

    document.body.appendChild(notificacao);

    // Remove após 5 segundos
    setTimeout(() => {
        if (notificacao.parentNode) {
            notificacao.parentNode.removeChild(notificacao);
        }
    }, 5000);
}

// Debounce para otimizar pesquisas/filtros
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Carregar dados do usuário
function getUsuarioLogado() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Verificar se usuário está autenticado
function estaAutenticado() {
    return !!localStorage.getItem('token');
}

// Redirecionar se não autenticado
function requerAutenticacao() {
    if (!estaAutenticado()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Sair
function sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Adicionar estilos para notificações
const estilosNotificacao = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease-out;
    }
    
    .notification-success {
        background-color: #27ae60;
    }
    
    .notification-error {
        background-color: #e74c3c;
    }
    
    .notification-warning {
        background-color: #f39c12;
    }
    
    .notification-info {
        background-color: #3498db;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

// Injetar estilos na página
if (!document.querySelector('#notification-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'notification-styles';
    styleSheet.textContent = estilosNotificacao;
    document.head.appendChild(styleSheet);
}
// MOCK UPLOAD - Substitua por um serviço real
async function uploadToStorage(file) {
    try {
        console.log('Fazendo upload do arquivo:', file.name);
        
        // Mock: retorna uma URL fake para teste
        const mockImageUrl = `https://picsum.photos/400/300?random=${Math.random()}`;
        
        // Simula delay de upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return mockImageUrl;
    } catch (error) {
        console.error('Erro no upload:', error);
        throw new Error('Falha no upload da imagem');
    }
}

// BUSCAR FOTOS DE UM VEÍCULO
async function getVeiculoFotos(veiculoId) {
    const response = await fetch(`${API_URL}/veiculo_fotos?veiculo_id=eq.${veiculoId}`);
    return response.json();
}

// ADICIONAR NOVA FOTO
async function addVeiculoFoto(fotoData) {
    const response = await fetch(`${API_URL}/veiculo_fotos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(fotoData)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
    }
    
    return response.json();
}

// DELETAR FOTO
async function deleteVeiculoFoto(fotoId) {
    const response = await fetch(`${API_URL}/veiculo_fotos?id=eq.${fotoId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Prefer': 'return=representation'
        }
    });
    return response.json();
}
