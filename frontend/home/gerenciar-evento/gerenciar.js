const API_URL = "http://localhost:8000";
const urlParams = new URLSearchParams(window.location.search);
const eventoId = urlParams.get('id');

const usuario = JSON.parse(localStorage.getItem('usuario'));

document.addEventListener('DOMContentLoaded', async () => {
    if (!eventoId) {
        window.location.href = "../home/home.html";
        return;
    }
    await carregarDadosEvento();
});

// Busca os dados atuais do evento para preencher o formulário
async function carregarDadosEvento() {
    try {
        const resp = await fetch(`${API_URL}/eventos/${eventoId}`);
        if (!resp.ok) throw new Error("Evento não encontrado");
        
        const ev = await resp.json();

        // Preenche os campos (Pessoa 2: atenção aos IDs)
        document.getElementById('nome').value = ev.nome;
        document.getElementById('categoria').value = ev.categoria;
        document.getElementById('capacidade').value = ev.capacidade;
        document.getElementById('local').value = ev.local;
        
        // Formata a data para o input datetime-local
        const dataFmt = new Date(ev.data_hora).toISOString().slice(0, 16);
        document.getElementById('data_hora').value = dataFmt;

    } catch (err) {
        exibirToast("Erro ao carregar dados.", "erro");
    }
}

// Lógica de Salvar (PUT /eventos/{id})
document.getElementById('formGerenciar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSalvar');
    btn.disabled = true;

    const dados = {
        usuario_id: usuario.id,
        nome: document.getElementById('nome').value,
        categoria: document.getElementById('categoria').value,
        data_hora: document.getElementById('data_hora').value,
        local: document.getElementById('local').value,
        capacidade: parseInt(document.getElementById('capacidade').value)
    };

    try {
        const resp = await fetch(`${API_URL}/eventos/${eventoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (resp.ok) {
            exibirToast("✅ Alterações salvas!", "sucesso");
            setTimeout(() => window.location.href = "../home.html", 1500);
        } else {
            const erro = await resp.json();
            exibirToast(erro.detail || "Erro ao salvar.", "erro");
            btn.disabled = false;
        }
    } catch {
        exibirToast("Erro de conexão.", "erro");
        btn.disabled = false;
    }
});

const modal = document.getElementById('modalConfirmacao');
const btnAbrirModal = document.getElementById('btnCancelarEvento');
const btnConfirmarSim = document.getElementById('confirmarSim');
const btnConfirmarNao = document.getElementById('confirmarNao');

// Abre o modal
btnAbrirModal.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// Fecha se clicar em "Não"
btnConfirmarNao.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Executa o cancelamento se clicar em "Sim"
btnConfirmarSim.addEventListener('click', async () => {
    modal.style.display = 'none'; // Fecha o modal primeiro
    
    try {
        const resp = await fetch(`${API_URL}/eventos/${eventoId}/cancelar`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: usuario.id })
        });

        if (resp.ok) {
            exibirToast("🚫 Evento cancelado com sucesso.", "aviso");
            setTimeout(() => window.location.href = "../home.html", 1500);
        } else if (resp.status === 403) {
            exibirToast("❌ Você não tem permissão para cancelar este evento.", "erro");
        }
    } catch (err) {
        exibirToast("⚠️ Erro ao conectar com o servidor.", "erro");
    }
});



/**
 * SISTEMA DE TOAST PADRONIZADO (EventFlow UX)
 * Garante que Criar e Gerenciar falem a mesma língua visual.
 */
function exibirToast(mensagem, tipo = 'sucesso') {
    // Remove toast anterior se existir para não acumular
    const toastAntigo = document.getElementById('toast-eventflow');
    if (toastAntigo) toastAntigo.remove();

    const toast = document.createElement('div');
    toast.id = 'toast-eventflow';
    document.body.appendChild(toast);

    // Cores baseadas na identidade visual (Pessoa 2)
    const cores = { 
        sucesso: '#388e3c', // Verde
        erro: '#d32f2f',    // Vermelho
        aviso: '#f57c00'    // Laranja
    };

    toast.textContent = mensagem;
    
    // CSS Inline para garantir que o estilo não dependa de arquivos externos
    toast.style.cssText = `
        position: fixed;
        top: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: ${cores[tipo] || '#333'};
        color: #fff;
        padding: 16px 32px;
        border-radius: 50px;
        font-weight: 700;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        font-size: 0.95rem;
        white-space: nowrap;
    `;

    // Animação de entrada (Slide para baixo e Fade-in)
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);

    // Saída automática após 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}