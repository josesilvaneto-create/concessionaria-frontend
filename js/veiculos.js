const API_BASE_URL = 'https://concessionaria-backend-5.onrender.com/api';

// Estado global dos filtros
let filtrosAtuais = {};
let todosVeiculos = [];

// Carregar veículos
async function carregarVeiculos() {
    try {
        mostrarLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/veiculos`);
        const data = await response.json();
        
        if (response.ok) {
            todosVeiculos = data.veiculos;
            exibirVeiculos(todosVeiculos);
            preencherFiltros(todosVeiculos);
        } else {
            throw new Error(data.error || 'Erro ao carregar veículos');
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('veiculos-container').innerHTML = `
            <div class="error-message">
                <p>Erro ao carregar veículos: ${error.message}</p>
            </div>
        `;
    } finally {
        mostrarLoading(false);
    }
}

// Exibir veículos na grid
function exibirVeiculos(veiculos) {
    const container = document.getElementById('veiculos-container');
    const noVehicles = document.getElementById('no-vehicles');
    
    if (veiculos.length === 0) {
        container.classList.add('hidden');
        noVehicles.classList.remove('hidden');
        return;
    }
    
    noVehicles.classList.add('hidden');
    container.classList.remove('hidden');
    
    container.innerHTML = veiculos.map(veiculo => `
        <div class="vehicle-card">
            <div class="vehicle-image">
                <span>${veiculo.marca} ${veiculo.modelo}</span>
            </div>
            <div class="vehicle-info">
                <h3>${veiculo.marca} ${veiculo.modelo}</h3>
                <div class="vehicle-price">R$ ${formatarPreco(veiculo.preco)}</div>
                <div class="vehicle-details">
                    <p><strong>Ano:</strong> ${veiculo.ano}</p>
                    <p><strong>KM:</strong> ${veiculo.quilometragem.toLocaleString()} km</p>
                    <p><strong>Combustível:</strong> ${veiculo.combustivel}</p>
                    <p><strong>Cor:</strong> ${veiculo.cor}</p>
                    ${veiculo.descricao ? `<p><strong>Descrição:</strong> ${veiculo.descricao}</p>` : ''}
                </div>
                <div class="vehicle-actions">
                    <button class="btn btn-primary" onclick="visualizarVeiculo(${veiculo.id})">
                        Ver Detalhes
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Preencher opções de filtros
function preencherFiltros(veiculos) {
    const marcas = [...new Set(veiculos.map(v => v.marca))].sort();
    const selectMarca = document.getElementById('filter-marca');
    
    selectMarca.innerHTML = '<option value="">Todas as marcas</option>' +
        marcas.map(marca => `<option value="${marca}">${marca}</option>`).join('');
}

// Aplicar filtros
function aplicarFiltros() {
    const marca = document.getElementById('filter-marca').value;
    const combustivel = document.getElementById('filter-combustivel').value;
    const precoMax = document.getElementById('filter-preco-max').value;
    
    filtrosAtuais = { marca, combustivel, precoMax };
    
    let veiculosFiltrados = todosVeiculos;
    
    if (marca) {
        veiculosFiltrados = veiculosFiltrados.filter(v => v.marca === marca);
    }
    
    if (combustivel) {
        veiculosFiltrados = veiculosFiltrados.filter(v => v.combustivel === combustivel);
    }
    
    if (precoMax) {
        veiculosFiltrados = veiculosFiltrados.filter(v => v.preco <= parseFloat(precoMax));
    }
    
    exibirVeiculos(veiculosFiltrados);
}

// Limpar filtros
function limparFiltros() {
    document.getElementById('filter-marca').value = '';
    document.getElementById('filter-combustivel').value = '';
    document.getElementById('filter-preco-max').value = '';
    
    filtrosAtuais = {};
    exibirVeiculos(todosVeiculos);
}

// Mostrar/ocultar loading
function mostrarLoading(mostrar) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.toggle('hidden', !mostrar);
    }
}

// Formatar preço
function formatarPreco(preco) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(preco);
}

// Cadastrar veículo com melhor tratamento de erro
async function cadastrarVeiculo(veiculoData) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            return { success: false, error: 'Usuário não autenticado. Faça login novamente.' };
        }

        console.log('🔐 Token:', token ? 'Presente' : 'Ausente');
        console.log('📤 Enviando para API:', veiculoData);

        const response = await fetch(`${API_BASE_URL}/veiculos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(veiculoData)
        });

        console.log('📥 Status da resposta:', response.status);
        
        const data = await response.json();
        console.log('📄 Dados da resposta:', data);

        if (response.ok) {
            return { success: true, veiculo: data.veiculo };
        } else {
            return { 
                success: false, 
                error: data.error || `Erro ${response.status}: ${response.statusText}` 
            };
        }
    } catch (error) {
        console.error('❌ Erro ao cadastrar veículo:', error);
        return { 
            success: false, 
            error: `Erro de conexão: ${error.message}. Verifique se o backend está online.`
        };
    }
}

// Visualizar veículo
function visualizarVeiculo(id) {
    alert(`Visualizando veículo ${id}`);
}

// Inicializar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de veículos
    if (document.getElementById('veiculos-container')) {
        carregarVeiculos();
        
        // Configurar eventos dos botões de filtro
        const applyFiltersBtn = document.getElementById('apply-filters');
        const clearFiltersBtn = document.getElementById('clear-filters');
        
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', aplicarFiltros);
        }
        
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', limparFiltros);
        }
    }
});


