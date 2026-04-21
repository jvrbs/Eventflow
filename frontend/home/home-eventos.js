/**
 * home-eventos.js
 * Responsável por buscar eventos da API e renderizar os cards na home.
 * Também gerencia busca por texto e filtro por categoria.
 */

const API_BASE = 'http://localhost:8000';

// Mapa de cor de fundo por categoria (fallback para imagem real)
const CATEGORIA_GRADIENTES = {
    'Música':      'linear-gradient(135deg, #4a0080 0%, #7b1fa2 100%)',
    'Teatro':      'linear-gradient(135deg, #ad1457 0%, #e91e63 100%)',
    'Esportes':    'linear-gradient(135deg, #1b5e20 0%, #43a047 100%)',
    'Tecnologia':  'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)',
    'Gastronomia': 'linear-gradient(135deg, #e65100 0%, #fb8c00 100%)',
    'Arte':        'linear-gradient(135deg, #bf360c 0%, #ff5722 100%)',
    'Negócios':    'linear-gradient(135deg, #4a148c 0%, #9c27b0 100%)',
    'Outros':      'linear-gradient(135deg, #37474f 0%, #78909c 100%)',
};

const CATEGORIA_EMOJIS = {
    'Música':      '🎵',
    'Teatro':      '🎭',
    'Esportes':    '⚽',
    'Tecnologia':  '💻',
    'Gastronomia': '🍽️',
    'Arte':        '🎨',
    'Negócios':    '💼',
    'Outros':      '📅',
};

// Todos os eventos carregados da API
let todosEventos = [];

/**
 * Formata data ISO para "DD/MM/AAAA às HH:MM"
 */
function formatarDataHora(isoString) {
    if (!isoString) return '—';
    const d = new Date(isoString);
    if (isNaN(d)) return isoString;
    const dia  = String(d.getDate()).padStart(2, '0');
    const mes  = String(d.getMonth() + 1).padStart(2, '0');
    const ano  = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min  = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} às ${hora}:${min}`;
}

/**
 * Retorna a classe CSS de badge para cada categoria
 */
function classBadge(categoria) {
    const mapa = {
        'Música':      'badge-musica',
        'Teatro':      'badge-teatro',
        'Esportes':    'badge-esportes',
        'Tecnologia':  'badge-tecnologia',
        'Gastronomia': 'badge-gastronomia',
        'Arte':        'badge-arte',
        'Negócios':    'badge-negocios',
    };
    return mapa[categoria] || 'badge-outros';
}

/**
 * Gera o HTML de um card de evento
 */
function gerarCardEvento(evento) {
    const gradiente = CATEGORIA_GRADIENTES[evento.categoria] || CATEGORIA_GRADIENTES['Outros'];
    const emoji     = CATEGORIA_EMOJIS[evento.categoria] || '📅';
    const badge     = classBadge(evento.categoria);
    const dataFmt   = formatarDataHora(evento.data_hora);
    const vagasDisp = evento.vagas_disponiveis ?? (evento.capacidade - (evento.inscritos ?? 0));
    const semVagas  = vagasDisp <= 0;

    return `
    <article class="event-card" tabindex="0" role="button"
             onclick="window.location.href='evento-detalhe.html?id=${evento.id}'"
             onkeydown="if(event.key==='Enter') window.location.href='evento-detalhe.html?id=${evento.id}'"
             aria-label="Ver detalhes: ${evento.nome}">
        <div class="card-thumb" style="background:${gradiente};">
            <span class="tag">${evento.categoria || 'Evento'}</span>
            <span class="card-emoji" aria-hidden="true">${emoji}</span>
        </div>
        <div class="card-body">
            <span class="event-date">📅 ${dataFmt}</span>
            <h3 class="event-title">${evento.nome}</h3>
            <p class="event-local">📍 ${evento.local || 'Local a definir'}</p>
        </div>
        <div class="card-footer">
            <span class="vagas ${semVagas ? 'sem-vagas' : ''}">
                ${semVagas ? '🔴 Esgotado' : `🟢 ${vagasDisp} vaga${vagasDisp !== 1 ? 's' : ''}`}
            </span>
            <button class="btn-ticket" aria-label="Ver evento ${evento.nome}">
                Ver evento
            </button>
        </div>
    </article>`;
}

/**
 * Renderiza a lista filtrada de eventos no grid
 */
function renderizarEventos(lista) {
    const grid       = document.getElementById('eventsGrid');
    const estadoVazio = document.getElementById('estadoVazio');

    if (!grid) return;

    if (!lista || lista.length === 0) {
        grid.innerHTML = '';
        if (estadoVazio) estadoVazio.style.display = 'block';
        return;
    }

    if (estadoVazio) estadoVazio.style.display = 'none';
    grid.innerHTML = lista.map(gerarCardEvento).join('');
}

/**
 * Aplica filtros de texto e categoria sobre todosEventos
 */
function aplicarFiltros() {
    const campoBusca      = document.getElementById('campoBusca');
    const btnAtivo        = document.querySelector('.filter-btn.active');
    const termoBusca      = (campoBusca?.value || '').toLowerCase().trim();
    const categoriaSelecionada = btnAtivo?.dataset.categoria || 'todos';

    let resultado = [...todosEventos];

    // Filtro por categoria
    if (categoriaSelecionada !== 'todos') {
        resultado = resultado.filter(e =>
            (e.categoria || '').toLowerCase() === categoriaSelecionada.toLowerCase()
        );
    }

    // Filtro por texto: busca em nome, local e descrição
    if (termoBusca) {
        resultado = resultado.filter(e =>
            (e.nome        || '').toLowerCase().includes(termoBusca) ||
            (e.local       || '').toLowerCase().includes(termoBusca) ||
            (e.descricao   || '').toLowerCase().includes(termoBusca)
        );
    }

    renderizarEventos(resultado);
}

/**
 * Busca eventos da API e inicializa os controles
 */
async function carregarEventos() {
    const grid    = document.getElementById('eventsGrid');
    const msgErro = document.getElementById('msgErroHome');

    try {
        const resposta = await fetch(`${API_BASE}/eventos`);

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}));
            throw new Error(erro.detail || 'Erro ao carregar eventos.');
        }

        todosEventos = await resposta.json();
        renderizarEventos(todosEventos);

    } catch (err) {
        if (grid)    grid.innerHTML = '';
        if (msgErro) {
            msgErro.textContent = err.message || 'Não foi possível conectar ao servidor.';
            msgErro.style.display = 'block';
        }
    }
}

// ---------- Inicialização ----------

document.addEventListener('DOMContentLoaded', () => {
    carregarEventos();

    // Filtros de categoria
    const filtros = document.getElementById('filtrosCategorias');
    if (filtros) {
        filtros.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            filtros.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            aplicarFiltros();
        });
    }

    // Campo de busca com debounce
    const campoBusca = document.getElementById('campoBusca');
    if (campoBusca) {
        let debounceTimer;
        campoBusca.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(aplicarFiltros, 280);
        });
    }
});