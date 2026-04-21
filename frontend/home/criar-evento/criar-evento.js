const API_URL = "http://localhost:8000";

document.getElementById('formCriar').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Captura o botão para dar feedback de carregamento
    const btnSubmit = e.target.querySelector('.btn-primary');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario) {
        exibirToast("Erro: Usuário não identificado.", "erro");
        return;
    }

    const dados = {
        usuario_id: usuario.id,
        nome: document.getElementById('nome').value,
        categoria: document.getElementById('categoria').value,
        data_hora: document.getElementById('data_hora').value,
        local: document.getElementById('local').value,
        capacidade: parseInt(document.getElementById('capacidade').value)
    };

    // Bloqueia o botão para evitar cliques duplos (Tarefa Pessoa 2)
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Publicando...";

    try {
        const resp = await fetch(`${API_URL}/eventos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const resultado = await resp.json();

        if (resp.ok) {
            exibirToast("✨ Evento criado com sucesso!", "sucesso");
            // Espera o toast aparecer um pouco antes de voltar para a home
            setTimeout(() => {
                window.location.href = "../home.html";
            }, 2000);
        } else {
            // Pega a mensagem de erro direto do FastAPI (Pessoa 1/3)
            exibirToast(resultado.detail || "Erro ao criar evento.", "erro");
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Publicar Evento";
        }
    } catch (err) {
        exibirToast("⚠️ Erro de conexão com o servidor.", "erro");
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Publicar Evento";
    }
});

/**
 * FUNÇÃO TOAST (Substitui o alert feio)
 */
function exibirToast(mensagem, tipo = 'sucesso') {
    let toast = document.getElementById('toast-eventflow');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-eventflow';
        document.body.appendChild(toast);
    }

    // Cores baseadas na identidade visual e no tipo de alerta
    const cores = { 
        sucesso: '#388e3c', 
        erro: '#d32f2f', 
        aviso: '#f57c00' 
    };

    toast.textContent = mensagem;
    toast.style.cssText = `
        position: fixed;
        top: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: ${cores[tipo] || '#333'};
        color: #fff;
        padding: 16px 32px;
        border-radius: 50px;
        font-weight: 700;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 9999;
        opacity: 0;
        transition: all 0.5s ease;
        font-size: 0.95rem;
    `;

    // Efeito de entrada (Fade In + Slide)
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.top = '40px';
    }, 100);

    // Efeito de saída (Fade Out) após 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.top = '30px';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}