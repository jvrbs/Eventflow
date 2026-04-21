/**
 * gerenciar-eventos.js
 * Lista eventos do organizador logado, permite editar e cancelar.
 * Cancelamento usa modal de confirmação — zero alert/confirm.
 */

const API_BASE = 'http://localhost:8000';

// ID do evento que está em processo de cancelamento
let eventoParaCancelar = null;

const CATEGORIA_CORES = {
    'Música':      'cor-musica',
    'Teatro':      'cor-teatro',
    'Esportes':    'cor-esportes',
    'Tecnologia':  'cor-tecnologia',
    'Gastronomia': 'cor-gastronomia',
    'Arte':        'cor-arte',
    'Negócios':    'cor-negocios',
};

/* ---- Proteção de perfil ---- */
document.addEventListener('DOMContentLoaded', () => {
    const usuario = getUsuarioLogado('../login/login.html');
    if (!usuario) return;

    if (usuario.perfil !== 'organizador') {
        window.location.href = '../home/home.html';
        return;
    }

    carregarEventos(usuario.id);
});

/* ---- Utilitários ---- */
function formatarDataHora(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusEvento(evento) {
    if (evento.status === 'cancelado' || evento.cancelado) return 'cancelado';
    const dataEvento = new Date(evento.data_hora);
    if (dataEvento < new Date()) return 'encerrado';
    return 'ativo';
}

function labelStatus(status) {
    const mapa = {
        'ativo':     'Ativo',
        'cancelado': 'Cancelado',
        'encerrado': 'Encerrado',
    };
    return mapa[status] || status;
}

function classeCorCategoria(evento) {
    if (statusEvento(evento) === 'cancelado') return 'cor-cancelado';
    return CATEGORIA_CORES[evento.categoria] || 'cor-outros';
}

/* ---- Renderização ---- */
function gerarItemEvento(evento) {
    const status    = statusEvento(evento);
    const corClasse = classeCorCategoria(evento);
    const vagasDisp = evento.vagas_disponiveis ?? (evento.capacidade - (evento.inscritos ?? 0));

    const podeEditar    = status === 'ativo';
    const podeCancelar  = status === 'ativo';

    const btnEditar = podeEditar
        ? `<a href="editar-evento.html?id=${evento.id}" class="btn-secondary" style="padding:8px 18px;font-size:0.88rem;">
               ✏️ Editar
           </a>`
        : '';

    const btnCancelar = podeCancelar
        ? `<button class="btn-danger" onclick="abrirModalCancelar(${evento.id}, '${escaparString(evento.nome)}')">
               🚫 Cancelar
           </button>`
        : '';

    return `
    <div class="evento-item" id="evento-item-${evento.id}">
        <div class="evento-item-cor ${corClasse}"></div>

        <div class="evento-item-dados">
            <div class="evento-item-nome">${evento.nome}</div>
            <div class="evento-item-meta">
                <span>📅 ${formatarDataHora(evento.data_hora)}</span>
                <span>📍 ${evento.local || '—'}</span>
                <span>🎟️ ${vagasDisp >= 0 ? vagasDisp : '—'} vagas</span>
            </div>
            <span class="status-badge status-${status}">${labelStatus(status)}</span>
        </div>

        <div class="evento-item-acoes">
            ${btnEditar}
            ${btnCancelar}
        </div>
    </div>`;
}

/**
 * Escapa aspas simples para uso em atributos onclick
 */
function escaparString(str) {
    return (str || '').replace(/'/g, "\\'");
}

/* ---- Carga da API ---- */
async function carregarEventos(organizadorId) {
    const skeletons   = document.getElementById('skeletons');
    const listaEl     = document.getElementById('listaEventos');
    const estadoVazio = document.getElementById('estadoVazio');
    const msgFeedback = document.getElementById('msgFeedback');

    try {
        const resposta = await fetch(`${API_BASE}/eventos?organizador_id=${organizadorId}`);

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}));
            throw new Error(erro.detail || 'Erro ao carregar eventos.');
        }

        const eventos = await resposta.json();

        if (skeletons) skeletons.style.display = 'none';

        // Filtra apenas os eventos do organizador (segurança dupla no frontend)
        const meus = eventos.filter(e =>
            String(e.organizador_id) === String(organizadorId)
        );

        if (!meus.length) {
            if (estadoVazio) estadoVazio.style.display = 'block';
            return;
        }

        if (listaEl) listaEl.innerHTML = meus.map(gerarItemEvento).join('');

    } catch (err) {
        if (skeletons) skeletons.style.display = 'none';
        if (msgFeedback) {
            msgFeedback.textContent = err.message || 'Não foi possível carregar seus eventos.';
            msgFeedback.className   = 'msg-feedback erro';
        }
    }
}

/* ---- Modal de cancelamento ---- */
function abrirModalCancelar(id, nome) {
    eventoParaCancelar = id;
    const modal = document.getElementById('modalCancelar');
    const nomeEl = document.getElementById('nomeEventoCancelar');
    const msgErro = document.getElementById('msgModalErro');

    if (nomeEl)  nomeEl.textContent  = nome;
    if (msgErro) msgErro.className   = 'msg-feedback';
    if (modal)   modal.classList.add('aberto');
}

function fecharModalCancelar() {
    eventoParaCancelar = null;
    const modal = document.getElementById('modalCancelar');
    if (modal) modal.classList.remove('aberto');
}
window.fecharModalCancelar = fecharModalCancelar; // expõe para onclick inline
window.abrirModalCancelar  = abrirModalCancelar;

// Fecha ao clicar no fundo escuro
document.getElementById('modalCancelar')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) fecharModalCancelar();
});

// Confirma cancelamento
document.getElementById('btnConfirmarCancelar')?.addEventListener('click', async () => {
    if (!eventoParaCancelar) return;

    const btnConfirmar = document.getElementById('btnConfirmarCancelar');
    const msgErro      = document.getElementById('msgModalErro');

    btnConfirmar.disabled    = true;
    btnConfirmar.textContent = 'Cancelando...';

    try {
        const resposta = await fetch(`${API_BASE}/eventos/${eventoParaCancelar}/cancelar`, {
            method: 'PATCH',
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            if (msgErro) {
                msgErro.textContent = resultado.detail || 'Erro ao cancelar evento.';
                msgErro.className   = 'msg-feedback erro';
            }
            return;
        }

        fecharModalCancelar();

        // Atualiza visualmente o item na lista sem recarregar a página
        const itemEl = document.getElementById(`evento-item-${eventoParaCancelar}`);
        if (itemEl) {
            // Atualiza a faixa de cor
            const cor = itemEl.querySelector('.evento-item-cor');
            if (cor) { cor.className = 'evento-item-cor cor-cancelado'; }

            // Atualiza badge de status
            const badge = itemEl.querySelector('.status-badge');
            if (badge) {
                badge.textContent = 'Cancelado';
                badge.className   = 'status-badge status-cancelado';
            }

            // Remove botões de ação
            const acoes = itemEl.querySelector('.evento-item-acoes');
            if (acoes) acoes.innerHTML = '';
        }

        // Mensagem de sucesso no topo
        const msgFeedback = document.getElementById('msgFeedback');
        if (msgFeedback) {
            msgFeedback.textContent = 'Evento cancelado com sucesso.';
            msgFeedback.className   = 'msg-feedback sucesso';
            msgFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

    } catch (err) {
        if (msgErro) {
            msgErro.textContent = 'Erro ao conectar com o servidor.';
            msgErro.className   = 'msg-feedback erro';
        }
    } finally {
        btnConfirmar.disabled    = false;
        btnConfirmar.textContent = 'Confirmar Cancelamento';
    }
});