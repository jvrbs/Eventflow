// api.js
const API_URL = "http://localhost:8000";

async function consumirAPI(endpoint, metodo = 'GET', corpo = null) {
    const configuracao = {
        method: metodo,
        headers: { 'Content-Type': 'application/json' }
    };

    if (corpo) configuracao.body = JSON.stringify(corpo);

    try {
        const resposta = await fetch(`${API_URL}${endpoint}`, configuracao);
        const dados = await resposta.json();

        if (!resposta.ok) {
            // Lança o erro vindo do FastAPI (401, 404, 409, etc)
            throw new Error(dados.detail || "Erro na requisição");
        }

        return dados;
    } catch (erro) {
        console.error("Falha na comunicação:", erro.message);
        throw erro; // Repassa o erro para o script que chamou a função
    }
}