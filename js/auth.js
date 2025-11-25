// Configuração da API
const API_BASE_URL = 'https://concessionaria-backend-5.onrender.com/api';

// Função de login com melhor tratamento de erro
async function login(email, senha) {
    try {
        console.log('📤 Tentando login para:', email);
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });
        
        console.log('📥 Resposta recebida:', response.status);
        
        const data = await response.json();
        console.log('📄 Dados recebidos:', data);
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error || 'Erro desconhecido' };
        }
    } catch (error) {
        console.error('❌ Erro no login:', error);
        return { 
            success: false, 
            error: `Erro de conexão: ${error.message}. Verifique se o backend está rodando.`
        };
    }
}
