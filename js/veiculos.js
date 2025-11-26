// js/veiculos.js
document.addEventListener('DOMContentLoaded', function() {
    carregarVeiculos();
});

async function carregarVeiculos() {
    try {
        const veiculos = await fetchVeiculos();
        exibirVeiculos(veiculos);
    } catch (error) {
        console.error('Erro ao carregar veículos:', error);
        document.getElementById('veiculos-container').innerHTML = 
            '<p>Erro ao carregar veículos. Tente novamente.</p>';
    }
}

async function fetchVeiculos() {
    const response = await fetch(`${API_URL}/veiculos?select=*`);
    if (!response.ok) {
        throw new Error('Erro ao buscar veículos');
    }
    return response.json();
}

async function exibirVeiculos(veiculos) {
    const container = document.getElementById('veiculos-container');
    container.innerHTML = '';

    for (const veiculo of veiculos) {
        const veiculoCard = await criarCardVeiculo(veiculo);
        container.appendChild(veiculoCard);
    }
}

async function criarCardVeiculo(veiculo) {
    const card = document.createElement('div');
    card.className = 'veiculo-card';
    card.style.cssText = `
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        margin: 10px 0;
        background-color: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;

    // Carrega a primeira foto
    const fotos = await getVeiculoFotos(veiculo.id);
    const primeiraFoto = fotos && fotos.length > 0 ? fotos[0].url : null;

    card.innerHTML = `
        <div style="text-align: center; margin-bottom: 15px;">
            ${primeiraFoto ? 
                `<img src="${primeiraFoto}" alt="${veiculo.marca} ${veiculo.modelo}" style="width: 100%; max-width: 300px; height: 200px; object-fit: cover; border-radius: 4px;">` :
                `<div style="width: 100%; height: 200px; background-color: #f8f9fa; display: flex; align-items: center; justify-content: center; border-radius: 4px; color: #6c757d;">📷 Sem imagem</div>`
            }
        </div>

        <h3 style="margin: 0 0 10px 0; color: #333;">${veiculo.marca} ${veiculo.modelo}</h3>
        
        <div style="margin-bottom: 10px;">
            <p style="margin: 5px 0; font-size: 14px;"><strong>Ano:</strong> ${veiculo.ano}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Preço:</strong> R$ ${veiculo.preco}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>KM:</strong> ${veiculo.quilometragem} km</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Combustível:</strong> ${veiculo.combustivel}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Cor:</strong> ${veiculo.cor}</p>
        </div>

        <div class="fotos-section" style="margin: 15px 0;"></div>

        <div class="actions" style="display: flex; gap: 10px; margin-top: 15px;">
            <button class="detalhes-button" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Ver Detalhes</button>
        </div>
    `;

    // Adiciona galeria de fotos
    const fotosSection = card.querySelector('.fotos-section');
    const gallery = new PhotoGallery(veiculo.id);
    const galleryElement = await gallery.render();
    fotosSection.appendChild(galleryElement);

    // Adiciona botão de upload
    const upload = new PhotoUpload(veiculo.id, () => {
        // Recarrega o card quando foto é adicionada
        card.remove();
        carregarVeiculos();
    });
    const uploadButton = upload.createUploadButton();
    fotosSection.appendChild(uploadButton);

    return card;
}
