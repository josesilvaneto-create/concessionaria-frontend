
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

// Exibir veículos na grid (COM IMAGENS)
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
    
    let html = '';
    
    veiculos.forEach(veiculo => {
        const imagemUrl = veiculo.foto_url || veiculo.imagem_principal || 'https://via.placeholder.com/300x200/2c3e50/ffffff?text=Sem+Imagem';
        
        html += `
        <div class="vehicle-card">
            <div class="vehicle-image" style="background-image: url('${imagemUrl}'); background-size: cover; background-position: center;">
                
                    ${veiculo.imagens && veiculo.imagens.length > 1 ? 
                        `<small>+${veiculo.imagens.length - 1} foto(s)</small>` : ''}
                </div>
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
                    <button class="btn btn-primary ver-detalhes-btn" data-id="${veiculo.id}">
                        Ver Detalhes
                    </button>
                    ${isMeuVeiculo(veiculo) ? `
                        <button class="btn btn-outline adicionar-foto-btn" data-id="${veiculo.id}">
                            Adicionar Foto
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Configurar eventos dos botões
    const botoesDetalhes = document.querySelectorAll('.ver-detalhes-btn');
    botoesDetalhes.forEach(botao => {
        botao.addEventListener('click', function() {
            const veiculoId = this.getAttribute('data-id');
            verDetalhesVeiculo(veiculoId);
        });
    });

    // Configurar eventos dos botões de adicionar foto
    const botoesFoto = document.querySelectorAll('.adicionar-foto-btn');
    botoesFoto.forEach(botao => {
        botao.addEventListener('click', function() {
            const veiculoId = this.getAttribute('data-id');
            abrirUploadFoto(veiculoId);
        });
    });
}

// Verificar se o veículo pertence ao usuário logado
function isMeuVeiculo(veiculo) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return veiculo.criado_por === user.id;
}

// Abrir modal para upload de foto
function abrirUploadFoto(veiculoId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            uploadFotoVeiculo(veiculoId, file);
        }
    });
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

// Upload de foto para veículo (VERSÃO CORRIGIDA)
async function uploadFotoVeiculo(veiculoId, file) {
    try {
        // Verificar se o usuário está logado
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar logado para adicionar fotos.');
            return;
        }

        // Verificar tamanho do arquivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB.');
            return;
        }

        console.log('📤 Iniciando upload para veículo:', veiculoId);

        // 1. Fazer upload da imagem (mock por enquanto)
        const imageUrl = await fazerUploadImagem(file);
        console.log('✅ Imagem uploadada, URL:', imageUrl);

        // 2. Atualizar o veículo com a URL da foto
        const response = await fetch(`${API_BASE_URL}/veiculos?id=eq.${veiculoId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                foto_url: imageUrl
            })
        });

        console.log('📥 Status da resposta:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro do servidor:', errorText);
            throw new Error(`Erro ${response.status} ao salvar foto`);
        }

        const data = await response.json();
        console.log('✅ Foto salva com sucesso:', data);

        alert('✅ Foto adicionada com sucesso!');
        // Recarregar a lista de veículos
        carregarVeiculos();
        
    } catch (error) {
        console.error('❌ Erro no upload:', error);
        alert('❌ Erro ao adicionar foto: ' + error.message);
    }
}

// Função para fazer upload da imagem (MOCK - substitua por serviço real)
async function fazerUploadImagem(file) {
    // EM PRODUÇÃO: Substitua por upload para Cloudinary, AWS S3, etc.
    // Por enquanto, usamos uma imagem placeholder
    
    console.log('🖼️ Processando arquivo:', file.name, file.type, file.size);
    
    // Simula upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retorna URL de imagem mock
    const mockImageUrl = `https://picsum.photos/400/300?random=${Math.random()}&vehicle=${Date.now()}`;
    
    console.log('📸 URL da imagem gerada:', mockImageUrl);
    return mockImageUrl;
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

// Ver detalhes do veículo
function verDetalhesVeiculo(id) {
    console.log('Buscando detalhes do veículo:', id);
    
    fetch(`${API_BASE_URL}/veiculos/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Veículo não encontrado');
            }
            return response.json();
        })
        .then(data => {
            if (data.veiculo) {
                const veiculo = data.veiculo;
                const detalhes = `🚗 DETALHES DO VEÍCULO

Marca: ${veiculo.marca}
Modelo: ${veiculo.modelo}
Ano: ${veiculo.ano}
Preço: R$ ${formatarPreco(veiculo.preco)}
Quilometragem: ${veiculo.quilometragem.toLocaleString()} km
Combustível: ${veiculo.combustivel}
Cor: ${veiculo.cor}
${veiculo.descricao ? 'Descrição: ' + veiculo.descricao : ''}`;
                
                alert(detalhes);
            } else {
                alert('Veículo não encontrado!');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar detalhes:', error);
            alert('Erro ao carregar detalhes do veículo');
        });
}

// Cadastrar veículo
async function cadastrarVeiculo(veiculoData) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            return { success: false, error: 'Usuário não autenticado. Faça login novamente.' };
        }

        const response = await fetch(`${API_BASE_URL}/veiculos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(veiculoData)
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, veiculo: data.veiculo };
        } else {
            return { 
                success: false, 
                error: data.error || `Erro ${response.status}` 
            };
        }
    } catch (error) {
        console.error('Erro ao cadastrar veículo:', error);
        return { 
            success: false, 
            error: 'Erro de conexão com o servidor'
        };
    }
}

// Inicializar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('veiculos-container')) {
        carregarVeiculos();
        
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


