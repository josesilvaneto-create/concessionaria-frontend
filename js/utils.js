// js/utils.js

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
