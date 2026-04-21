/**
 * evento-detalhe.js
 * Carrega e exibe os detalhes de um evento a partir de GET /eventos/:id
 * Exibe botão de inscrição apenas para participantes (Sprint 2 implementa a lógica).
 */

const API_BASE = 'http://localhost:8000';

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

const CLASSE_BADGE = {
    'Música':      'badge-musica',
    'Teatro':      'badge-teatro',
    'Esportes':    'badge-esportes',
    'Tecnologia':  'badge-tecnologia',
    'Gastronomia': 'badge-gastronomia',
    'Arte':        'badge-arte',
    'Negócios':    'badge-negocios',
};

/**
 * Formata ISO → "DD/MM/AAAA às HH:MM"
 */
function formatarDataHora(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Lê ?id= da URL
 */
function getIdDaUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

/**
 * Exibe mensagem de erro principal
 */
function exibirErroGeral(texto) {
    const el = document.getElementById('msgErro');
    if (!el) return;
    el.textContent = texto;
    el.className = 'msg-feedback erro';
}

/**
 * Popula a página com os dados do evento
 */
function preencherPagina(evento) {
    // Título da aba
    document.title = `${evento.nome} — EventFlow`;

    // Hero
    const hero = document.getElementById('detalheHero');
    if (hero) {
        hero.style.background = CATEGORIA_GRADIENTES[evento.categoria] || CATEGORIA_GRADIENTES['Outros'];
    }

    // Badge categoria
    const elBadge = document.getElementById('detalheCategoria');
    if (elBadge) {
        elBadge.textContent = evento.categoria || 'Evento';
        elBadge.className   = `badge ${CLASSE_BADGE[evento.categoria] || 'badge-outros'}`;
    }

    setText('detalheNome',        evento.nome);
    setText('detalheData',        `📅 ${formatarDataHora(evento.data_hora)}`);
    setText('detalheLocal',       `📍 ${evento.local || 'Local a definir'}`);
    setText('detalheDescricao',   evento.descricao || 'Sem descrição disponível.');
    setText('detalheCapacidade',  evento.capacidade ?? '—');
    setText('detalheOrganizador', evento.organizador_nome || evento.organizador_id || '—');

    // Vagas
    const vagasDisp = evento.vagas_disponiveis ?? (evento.capacidade - (evento.inscritos ?? 0));
    const semVagas  = vagasDisp <= 0;
    const elVagas   = document.getElementById('detalheVagas');
    if (elVagas) {
        elVagas.textContent = semVagas ? 'Esgotado' : vagasDisp;
        elVagas.style.color = semVagas ? '#c62828' : '#2e7d32';
    }

    // Barra de ocupação
    if (evento.capacidade) {
        const ocupados  = evento.capacidade - (vagasDisp < 0 ? 0 : vagasDisp);
        const pct       = Math.min(100, Math.round((ocupados / evento.capacidade) * 100));
        const fill      = document.getElementById('ocupacaoFill');
        const label     = document.getElementById('ocupacaoLabel');
        if (fill) {
            fill.style.width = `${pct}%`;
            if (semVagas) fill.classList.add('lotado');
        }
        if (label) label.textContent = `${pct}% preenchido`;
    }

    // Botão de inscrição — só para participantes; Sprint 2 faz a lógica real
    const usuario   = JSON.parse(localStorage.getItem('usuario') || 'null');
    const btnInscrever = document.getElementById('btnInscrever');
    const msgInscricao = document.getElementById('msgInscricao');

    if (semVagas) {
        if (msgInscricao) {
            msgInscricao.textContent = 'Este evento está esgotado.';
            msgInscricao.className   = 'msg-feedback aviso';
        }
    } else if (usuario && usuario.perfil === 'participante') {
        if (btnInscrever) btnInscrever.style.display = 'flex';
    } else if (usuario && usuario.perfil === 'organizador') {
        if (msgInscricao) {
            msgInscricao.textContent = 'Organizadores não podem se inscrever em eventos.';
            msgInscricao.className   = 'msg-feedback aviso';
        }
    } else {
        // Não logado — redireciona pelo session.js ao carregar
        if (btnInscrever) btnInscrever.style.display = 'flex';
    }
}

/**
 * Utilidade para setText seguro
 */
function setText(id, valor) {
    const el = document.getElementById(id);
    if (el) el.textContent = valor ?? '—';
}

/**
 * Placeholder de inscrição — Sprint 2 implementa
 */
function aoClicarInscrever() {
    const msgInscricao = document.getElementById('msgInscricao');
    if (msgInscricao) {
        msgInscricao.textContent = 'Funcionalidade de inscrição chegará na Sprint 2! 🚀';
        msgInscricao.className   = 'msg-feedback aviso';
    }
}
window.aoClicarInscrever = aoClicarInscrever; // expõe para o onclick inline

/**
 * Inicialização
 */
async function init() {
    // Garante sessão
    const usuario = getUsuarioLogado('../login/login.html');
    if (!usuario) return;

    const id = getIdDaUrl();
    if (!id) {
        exibirErroGeral('Evento não encontrado. Verifique o link.');
        document.getElementById('skeletonDetalhe').style.display = 'none';
        return;
    }

    try {
        const resposta = await fetch(`${API_BASE}/eventos/${id}`);

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}));
            throw new Error(erro.detail || 'Evento não encontrado.');
        }

        const evento = await resposta.json();

        // Oculta skeleton e mostra conteúdo
        const skeleton  = document.getElementById('skeletonDetalhe');
        const conteudo  = document.getElementById('conteudoEvento');
        if (skeleton) skeleton.style.display = 'none';
        if (conteudo) conteudo.style.display  = 'block';

        preencherPagina(evento);

    } catch (err) {
        document.getElementById('skeletonDetalhe').style.display = 'none';
        exibirErroGeral(err.message || 'Não foi possível carregar o evento.');
    }
}

document.addEventListener('DOMContentLoaded', init);