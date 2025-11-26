// js/photo-upload.js

class PhotoUpload {
    constructor(veiculoId, onPhotoAdded) {
        this.veiculoId = veiculoId;
        this.onPhotoAdded = onPhotoAdded;
        this.uploading = false;
    }

    createUploadButton() {
        const container = document.createElement('div');
        container.className = 'photo-upload';
        container.style.marginTop = '10px';

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        input.id = `photo-upload-${this.veiculoId}`;
        
        const label = document.createElement('label');
        label.htmlFor = `photo-upload-${this.veiculoId}`;
        label.className = 'upload-button';
        label.textContent = '📷 Adicionar Foto';
        label.style.cssText = `
            display: inline-block;
            padding: 8px 16px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            text-align: center;
        `;

        input.addEventListener('change', (event) => this.handlePhotoUpload(event));

        container.appendChild(input);
        container.appendChild(label);
        
        return container;
    }

    async handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas arquivos de imagem');
            return;
        }

        this.setUploading(true);
        
        try {
            // 1. Fazer upload para storage
            const imageUrl = await uploadToStorage(file);
            
            // 2. Salvar no banco
            await addVeiculoFoto({
                veiculo_id: this.veiculoId,
                url: imageUrl,
                created_by: getCurrentUserId()
            });
            
            event.target.value = '';
            
            if (this.onPhotoAdded) {
                this.onPhotoAdded();
            }
            
            alert('Foto adicionada com sucesso!');
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            alert('Erro ao adicionar foto: ' + error.message);
        } finally {
            this.setUploading(false);
        }
    }

    setUploading(uploading) {
        this.uploading = uploading;
        const button = document.querySelector(`label[for="photo-upload-${this.veiculoId}"]`);
        if (button) {
            button.textContent = uploading ? '📤 Enviando...' : '📷 Adicionar Foto';
            button.style.backgroundColor = uploading ? '#6c757d' : '#007bff';
            button.style.cursor = uploading ? 'not-allowed' : 'pointer';
        }
    }
}

class PhotoGallery {
    constructor(veiculoId) {
        this.veiculoId = veiculoId;
        this.fotos = [];
    }

    async render() {
        const container = document.createElement('div');
        container.className = 'photo-gallery';
        container.style.margin = '15px 0';

        const title = document.createElement('h4');
        title.textContent = 'Fotos do Veículo';
        title.style.margin = '0 0 10px 0';
        title.style.fontSize = '16px';

        const content = document.createElement('div');
        
        container.appendChild(title);
        container.appendChild(content);

        await this.loadFotos(content);
        
        return container;
    }

    async loadFotos(container) {
        try {
            this.fotos = await getVeiculoFotos(this.veiculoId) || [];
            this.renderFotos(container);
        } catch (error) {
            console.error('Erro ao carregar fotos:', error);
            container.innerHTML = '<p style="color: #999; font-style: italic;">Erro ao carregar fotos</p>';
        }
    }

    renderFotos(container) {
        if (this.fotos.length === 0) {
            container.innerHTML = '<p style="color: #999; font-style: italic;">Nenhuma foto adicionada ainda.</p>';
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'fotos-grid';
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 8px;
            margin: 10px 0;
        `;

        this.fotos.forEach(foto => {
            const fotoItem = this.createFotoItem(foto);
            grid.appendChild(fotoItem);
        });

        container.innerHTML = '';
        container.appendChild(grid);
    }

    createFotoItem(foto) {
        const item = document.createElement('div');
        item.className = 'foto-item';
        item.style.cssText = `
            position: relative;
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
            height: 80px;
        `;

        const img = document.createElement('img');
        img.src = foto.url;
        img.alt = `Veículo ${this.veiculoId}`;
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '×';
        deleteBtn.style.cssText = `
            position: absolute;
            top: 2px;
            right: 2px;
            background: red;
            color: white;
            border: none;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            cursor: pointer;
            font-size: 12px;
            line-height: 1;
        `;
        
        deleteBtn.addEventListener('click', () => this.handleDeleteFoto(foto.id));

        item.appendChild(img);
        item.appendChild(deleteBtn);
        
        return item;
    }

    async handleDeleteFoto(fotoId) {
        if (confirm('Tem certeza que deseja excluir esta foto?')) {
            try {
                await deleteVeiculoFoto(fotoId);
                this.fotos = this.fotos.filter(foto => foto.id !== fotoId);
                this.renderFotos(this.container);
                alert('Foto excluída com sucesso!');
            } catch (error) {
                console.error('Erro ao excluir foto:', error);
                alert('Erro ao excluir foto');
            }
        }
    }
}