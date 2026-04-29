const API_URL = "http://localhost:8000";

const btnMenu = document.getElementById('btnMenu');
const headerPill = document.getElementById('headerPill');
const overlay = document.getElementById('overlay');

// ── Hambúrguer ─────────────────────────────────────────────────────────────────

if (btnMenu) {
    btnMenu.addEventListener('click', () => {
        headerPill.classList.toggle('expandido');
        if (overlay) overlay.classList.toggle('active');
    });
}

if (overlay) {
    overlay.addEventListener('click', () => {
        headerPill.classList.remove('expandido');
        overlay.classList.remove('active');
    });
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatarData(dataHora) {
    const data = new Date(dataHora);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function getCategoriaGradient(categoria) {
    const gradients = {
        'Música':     'linear-gradient(135deg, #4B0082 0%, #FF6B00 100%)',
        'Teatro':     'linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)',
        'Tecnologia': 'linear-gradient(135deg, #0f3460 0%, #533483 100%)',
        'Esportes':   'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
        'Arte':       'linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)',
        'Gastronomia':'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    };
    return gradients[categoria] || 'linear-gradient(135deg, #4B0082 0%, #7B2FBE 100%)';
}

function calcularVagasRestantes(evento, inscricoesAtivas) {
    return Math.max(0, evento.capacidade - inscricoesAtivas);
}

// ── Renderização ───────────────────────────────────────────────────────────────

function renderizarCard(evento, inscricaoId, usuarioId, perfil) {
    const estaInscrito = inscricaoId !== null;
    const estaLotado   = evento.vagas_restantes !== undefined && evento.vagas_restantes <= 0 && !estaInscrito;
    const eCancelado   = evento.status === 'cancelado';

    let rodape = '';

    if (perfil === 'organizador') {
        rodape = `
            <span class="vagas-label">${evento.capacidade} vagas</span>
            <button class="btn-ticket btn-gerenciar"
                    onclick="abrirGerenciarEvento(${evento.id})">
                Gerenciar
            </button>`;
    } else if (eCancelado) {
        rodape = `<span class="tag-cancelado">Cancelado</span>`;
    } else if (estaInscrito) {
        rodape = `
            <span class="vagas-label inscrito-label">✓ Inscrito</span>
            <button class="btn-ticket btn-cancelar-inscricao"
                    data-inscricao-id="${inscricaoId}"
                    data-usuario-id="${usuarioId}"
                    data-evento-id="${evento.id}"
                    onclick="cancelarInscricao(this)">
                Cancelar
            </button>`;
    } else if (estaLotado) {
        rodape = `<span class="tag-lotado">Lotado</span>`;
    } else {
        const vagasExibir = evento.vagas_restantes ?? evento.capacidade;
        rodape = `
            <span class="vagas-label">${vagasExibir} vagas</span>
            <button class="btn-ticket btn-inscrever"
                    data-evento-id="${evento.id}"
                    data-usuario-id="${usuarioId}"
                    onclick="inscrever(this)">
                Inscrever-se
            </button>`;
    }

    return `
        <article class="event-card" data-evento-id="${evento.id}">
            <div class="card-thumb"
                 style="background: ${getCategoriaGradient(evento.categoria)};">
                <span class="tag">${evento.categoria}</span>
            </div>
            <div class="card-body">
                <span class="event-date">${formatarData(evento.data_hora)}</span>
                <h3 class="event-title">${evento.nome}</h3>
                <p class="event-local">📍 ${evento.local}</p>
            </div>
            <div class="card-footer">
                ${rodape}
            </div>
        </article>`;
}

function renderizarGrid(eventos, inscricoesMap, usuarioId, perfil) {
    const grid = document.querySelector('.events-grid');
    if (!grid) return;

    if (!eventos.length) {
        grid.innerHTML = `<p class="sem-eventos">Nenhum evento disponível no momento.</p>`;
        return;
    }

    grid.innerHTML = eventos.map(ev => {
        const inscricaoId = inscricoesMap[ev.id] ?? null;
        return renderizarCard(ev, inscricaoId, usuarioId, perfil);
    }).join('');
}

// ── Ações de inscrição ─────────────────────────────────────────────────────────

async function inscrever(btn) {
    const eventoId  = parseInt(btn.dataset.eventoId);
    const usuarioId = parseInt(btn.dataset.usuarioId);

    btn.disabled    = true;
    btn.textContent = "Inscrevendo...";

    try {
        const resp = await fetch(`${API_URL}/inscricoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: usuarioId, evento_id: eventoId })
        });

        const dados = await resp.json();

        if (!resp.ok) {
            exibirToast(dados.detail || "Erro ao se inscrever.", "erro");
            btn.disabled    = false;
            btn.textContent = "Inscrever-se";
            return;
        }

        exibirToast("Inscrição realizada com sucesso!", "sucesso");
        atualizarCardAposInscricao(eventoId, dados.inscricao_id, usuarioId);

    } catch {
        exibirToast("Erro de conexão.", "erro");
        btn.disabled    = false;
        btn.textContent = "Inscrever-se";
    }
}

async function cancelarInscricao(btn) {
    const inscricaoId = parseInt(btn.dataset.inscricaoId);
    const usuarioId   = parseInt(btn.dataset.usuarioId);
    const eventoId    = parseInt(btn.dataset.eventoId);

    btn.disabled    = true;
    btn.textContent = "Cancelando...";

    try {
        const resp = await fetch(
            `${API_URL}/inscricoes/${inscricaoId}?usuario_id=${usuarioId}`,
            { method: 'DELETE' }
        );

        const dados = await resp.json();

        if (!resp.ok) {
            exibirToast(dados.detail || "Erro ao cancelar inscrição.", "erro");
            btn.disabled    = false;
            btn.textContent = "Cancelar";
            return;
        }

        exibirToast("Inscrição cancelada.", "aviso");
        atualizarCardAposCancelamento(eventoId, usuarioId);

    } catch {
        exibirToast("Erro de conexão.", "erro");
        btn.disabled    = false;
        btn.textContent = "Cancelar";
    }
}

// ── Atualização pontual do card (sem re-fetch completo) ────────────────────────

function atualizarCardAposInscricao(eventoId, inscricaoId, usuarioId) {
    // TAREFA PESSOA 2: Atualizar o estado global para que o filtro não "limpe" a inscrição
    _inscricoesMap[eventoId] = inscricaoId; 
    
    // Agora chama o filtro para redesenhar a tela com os dados novos
    aplicarFiltros();
}

function atualizarCardAposCancelamento(eventoId, usuarioId) {
    // TAREFA PESSOA 2: Remover do mapa global
    delete _inscricoesMap[eventoId];
    
    // Redesenha a tela refletindo que não está mais inscrito
    aplicarFiltros();
}

// ── Filtro e busca ─────────────────────────────────────────────────────────────

let _todosEventos      = [];
let _inscricoesMap     = {};
let _usuarioId         = null;
let _perfil            = null;
let _filtroCategoria   = 'Tudo';
let _termoBusca        = '';

function aplicarFiltros() {
    let resultado = [..._todosEventos];

    if (_filtroCategoria !== 'Tudo') {
        resultado = resultado.filter(e => e.categoria === _filtroCategoria);
    }

    if (_termoBusca.trim()) {
        const termo = _termoBusca.toLowerCase();
        resultado = resultado.filter(e =>
            e.nome.toLowerCase().includes(termo) ||
            (e.local && e.local.toLowerCase().includes(termo)) ||
            (e.categoria && e.categoria.toLowerCase().includes(termo))
        );
    }

    renderizarGrid(resultado, _inscricoesMap, _usuarioId, _perfil);
}

// ── Inicialização principal ────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    const raw = localStorage.getItem('usuario');
    if (!raw) { window.location.href = '../login/login.html'; return; }

    const usuario = JSON.parse(raw);
    _usuarioId    = usuario.id;
    _perfil       = usuario.perfil;

    // Botão "Criar Evento" só para organizadores
    if (_perfil === 'organizador') {
        const criarBtn = document.getElementById('btnCriarEvento');
        if (criarBtn) criarBtn.style.display = 'inline-flex';
    }

    // Buscar eventos e inscrições em paralelo
    try {
        const [resEventos, resInscricoes] = await Promise.all([
            fetch(`${API_URL}/eventos`),
            _perfil === 'participante'
                ? fetch(`${API_URL}/inscricoes/usuario/${_usuarioId}`)
                : Promise.resolve(null)
        ]);

        _todosEventos = resEventos.ok ? await resEventos.json() : [];

        let inscricoes = [];
        if (resInscricoes && resInscricoes.ok) {
            inscricoes = await resInscricoes.json();
        }

        // Mapa: evento_id → inscricao_id
        _inscricoesMap = {};
        inscricoes.forEach(i => { _inscricoesMap[i.evento_id] = i.inscricao_id; });

        // Injetar vagas_restantes (backend não retorna, calculamos via capacidade)
        // (backend pode retornar conta_inscritos via JOIN futuramente)
        _todosEventos.forEach(ev => {
            if (ev.vagas_restantes === undefined) {
                ev.vagas_restantes = ev.capacidade; // fallback sem contagem real
            }
        });

        aplicarFiltros();

    } catch {
        exibirToast("Erro ao carregar eventos.", "erro");
    }

    // ── Filtros de categoria ─────────────────────────────────────────────────

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            _filtroCategoria = btn.textContent.trim();
            aplicarFiltros();
        });
    });

    // ── Busca inline ─────────────────────────────────────────────────────────

    const inputBusca = document.querySelector('.input-busca-inline');
    if (inputBusca) {
        inputBusca.addEventListener('input', e => {
            _termoBusca = e.target.value;
            aplicarFiltros();
        });
    }

    // ── Botão explorar (scroll suave) ────────────────────────────────────────

    const btnExplorar = document.querySelector('.btn-explorar');
    if (btnExplorar) {
        btnExplorar.addEventListener('click', () => {
            document.querySelector('.events-container')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
});

// ── Organizador: abrir gerenciar evento (stub) ─────────────────────────────────

function abrirGerenciarEvento(eventoId) {
    // Redireciona para página de gestão (a ser desenvolvida)
    window.location.href = `gerenciar-evento/gerenciar.html?id=${eventoId}`;
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function exibirToast(mensagem, tipo = 'sucesso') {
    let toast = document.getElementById('toast-eventflow');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-eventflow';
        document.body.appendChild(toast);
    }

    const cores = { sucesso: '#388e3c', erro: '#d32f2f', aviso: '#f57c00' };
    toast.textContent  = mensagem;
    toast.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: ${cores[tipo] || cores.sucesso}; color: #fff;
        padding: 14px 28px; border-radius: 50px; font-weight: 600;
        box-shadow: 0 8px 20px rgba(0,0,0,0.25); z-index: 9999;
        opacity: 1; transition: opacity 0.5s ease;
        white-space: nowrap; font-size: 0.95rem;
    `;

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}