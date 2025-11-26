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
            
            // Carregar fotos para cada veículo
            for (let veiculo of todosVeiculos) {
                veiculo.fotos = await carregarFotosVeiculo(veiculo.id);
            }
            
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

// Carregar fotos de um veículo específico
async function carregarFotosVeiculo(veiculoId) {
    try {
        const response = await fetch(`${API_BASE_URL}/veiculo_fotos?veiculo_id=eq.${veiculoId}&order=ordem.asc`);
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Erro ao carregar fotos:', error);
        return [];
    }
}

// Exibir veículos na grid (COM MÚLTIPLAS FOTOS)
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
        const fotos = veiculo.fotos || [];
        const primeiraFoto = fotos.length > 0 ? fotos[0].url : 'https://via.placeholder.com/300x200/2c3e50/ffffff?text=Sem+Imagem';
        
        html += `
        <div class="vehicle-card" data-veiculo-id="${veiculo.id}" data-fotos='${JSON.stringify(fotos)}'>
            <div class="vehicle-image" style="background-image: url('${primeiraFoto}'); background-size: cover; background-position: center;">
                <div class="image-overlay">
                    <span>${veiculo.marca} ${veiculo.modelo}</span>
                    ${fotos.length > 1 ? `<small>+${fotos.length - 1} foto(s)</small>` : ''}
                </div>
                ${fotos.length > 0 ? `
                    <div class="fotos-indicadores">
                        ${fotos.map((foto, index) => 
                            `<span class="indicador ${index === 0 ? 'ativo' : ''}" data-index="${index}"></span>`
                        ).join('')}
                    </div>
                ` : ''}
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
                
                <!-- Galeria de fotos -->
                ${fotos.length > 0 ? `
                    <div class="mini-galeria">
                        <h4>Fotos do Veículo (${fotos.length}/3)</h4>
                        <div class="mini-fotos">
                            ${fotos.map((foto, index) => `
                                <div class="mini-foto-item">
                                    <img src="${foto.url}" alt="Foto ${index + 1}">
                                    ${isMeuVeiculo(veiculo) ? `<button class="btn-excluir-foto" data-foto-id="${foto.id}">×</button>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="vehicle-actions">
                    <button class="btn btn-primary ver-detalhes-btn" data-id="${veiculo.id}">
                        Ver Detalhes
                    </button>
                    ${isMeuVeiculo(veiculo) ? `
                        <button class="btn btn-outline adicionar-foto-btn" data-id="${veiculo.id}">
                            ${fotos.length >= 3 ? '❌ Limite de 3 fotos' : `📷 Adicionar Foto (${fotos.length}/3)`}
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Configurar eventos
    configurarEventosVeiculos();
}

// Configurar eventos dos veículos
function configurarEventosVeiculos() {
    // Botões de detalhes
    const botoesDetalhes = document.querySelectorAll('.ver-detalhes-btn');
    botoesDetalhes.forEach(botao => {
        botao.addEventListener('click', function() {
            const veiculoId = this.getAttribute('data-id');
            verDetalhesVeiculo(veiculoId);
        });
    });

    // Botões de adicionar foto
    const botoesFoto = document.querySelectorAll('.adicionar-foto-btn');
    botoesFoto.forEach(botao => {
        botao.addEventListener('click', function() {
            const veiculoId = this.getAttribute('data-id');
            const fotosAtuais = parseInt(this.textContent.match(/\((\d+)\/3\)/)?.[1]) || 0;
            
            if (fotosAtuais >= 3) {
                alert('❌ Limite máximo de 3 fotos por veículo atingido!');
                return;
            }
            
            abrirUploadFoto(veiculoId, fotosAtuais);
        });
    });

    // Botões de excluir foto
    const botoesExcluir = document.querySelectorAll('.btn-excluir-foto');
    botoesExcluir.forEach(botao => {
        botao.addEventListener('click', function() {
            const fotoId = this.getAttribute('data-foto-id');
            excluirFoto(fotoId);
        });
    });

    // Indicadores de fotos (slideshow)
    const indicadores = document.querySelectorAll('.indicador');
    indicadores.forEach(indicador => {
        indicador.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const card = this.closest('.vehicle-card');
            const fotos = JSON.parse(card.getAttribute('data-fotos') || '[]');
            
            if (fotos[index]) {
                const imagem = card.querySelector('.vehicle-image');
                imagem.style.backgroundImage = `url('${fotos[index].url}')`;
                
                // Atualizar indicadores ativos
                card.querySelectorAll('.indicador').forEach(ind => ind.classList.remove('ativo'));
                this.classList.add('ativo');
            }
        });
    });
}

// Verificar se o veículo pertence ao usuário logado
function isMeuVeiculo(veiculo) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return veiculo.criado_por === user.id;
}

// Abrir modal para upload de foto
function abrirUploadFoto(veiculoId, fotosAtuais) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.style.display = 'none';
    
    input.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const fotosRestantes = 3 - fotosAtuais;
            
            if (files.length > fotosRestantes) {
                alert(`❌ Você só pode adicionar mais ${fotosRestantes} foto(s). Selecione no máximo ${fotosRestantes} arquivo(s).`);
                files.splice(fotosRestantes);
            }
            
            files.forEach(file => {
                uploadFotoVeiculo(veiculoId, file);
            });
        }
    });
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

// Upload de foto para veículo
async function uploadFotoVeiculo(veiculoId, file) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar logado para adicionar fotos.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB.');
            return;
        }

        console.log('📤 Iniciando upload para veículo:', veiculoId);

        // 1. Fazer upload REAL da imagem
        const imageUrl = await fazerUploadImagem(file);
        console.log('✅ Imagem uploadada');

        // 2. Contar fotos atuais para definir ordem
        const fotosAtuais = await carregarFotosVeiculo(veiculoId);
        const novaOrdem = fotosAtuais.length;

        // 3. Salvar na tabela veiculo_fotos
        const response = await fetch(`${API_BASE_URL}/veiculo_fotos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                veiculo_id: veiculoId,
                url: imageUrl,
                ordem: novaOrdem,
                created_by: JSON.parse(localStorage.getItem('user') || '{}').id
            })
        });

        console.log('📥 Status da resposta:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Foto salva com sucesso:', data);

        alert('✅ Foto adicionada com sucesso!');
        carregarVeiculos();
        
    } catch (error) {
        console.error('❌ Erro no upload:', error);
        alert('❌ Erro ao adicionar foto: ' + error.message);
    }
}

// Excluir foto
async function excluirFoto(fotoId) {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/veiculo_fotos?id=eq.${fotoId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('✅ Foto excluída com sucesso!');
            carregarVeiculos();
        } else {
            throw new Error('Erro ao excluir foto');
        }
    } catch (error) {
        console.error('❌ Erro ao excluir foto:', error);
        alert('❌ Erro ao excluir foto');
    }
}

// Função para fazer upload REAL da imagem
async function fazerUploadImagem(file) {
    try {
        console.log('🖼️ Fazendo upload REAL do arquivo:', file.name, file.type, file.size);
        
        const base64Image = await converterParaBase64(file);
        console.log('📸 Imagem convertida para Base64');
        
        return base64Image;
        
    } catch (error) {
        console.error('❌ Erro no upload real:', error);
        const mockImageUrl = `https://picsum.photos/400/300?random=${Math.random()}&vehicle=${Date.now()}`;
        return mockImageUrl;
    }
}

// Função para converter arquivo para Base64
function converterParaBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        
        reader.onerror = function(error) {
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
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
