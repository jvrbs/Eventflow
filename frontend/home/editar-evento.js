/**
 * editar-evento.js
 * Pré-carrega dados do evento via GET /eventos/:id e envia
 * as alterações via PUT /eventos/:id.
 * Protege a rota: só organizadores e apenas o dono do evento.
 */

const API_BASE = 'http://localhost:8000';

let eventoOriginal = null;

/* ---- Inicialização ---- */
document.addEventListener('DOMContentLoaded', async () => {
    const usuario = getUsuarioLogado('../login/login.html');
    if (!usuario) return;

    if (usuario.perfil !== 'organizador') {
        window.location.href = '../home/home.html';
        return;
    }

    const id = getIdDaUrl();
    if (!id) {
        exibirErroCarregar('ID de evento inválido. Volte para seus eventos.');
        return;
    }

    await carregarEvento(id, usuario.id);
});

/* ---- Lê ?id= da URL ---- */
function getIdDaUrl() {
    return new URLSearchParams(window.location.search).get('id');
}

/* ---- Carrega evento da API e preenche formulário ---- */
async function carregarEvento(id, organizadorId) {
    try {
        const resposta = await fetch(`${API_BASE}/eventos/${id}`);

        if (!resposta.ok) {
            const err = await resposta.json().catch(() => ({}));
            throw new Error(err.detail || 'Evento não encontrado.');
        }

        const evento = await resposta.json();

        // Verifica se o organizador logado é o dono
        if (String(evento.organizador_id) !== String(organizadorId)) {
            exibirErroCarregar('Você não tem permissão para editar este evento.');
            return;
        }

        // Verifica se o evento pode ser editado (não cancelado/encerrado)
        if (evento.status === 'cancelado' || evento.cancelado) {
            exibirErroCarregar('Eventos cancelados não podem ser editados.');
            return;
        }

        eventoOriginal = evento;
        preencherFormulario(evento);

        // Mostra formulário, oculta skeleton
        document.getElementById('skeletonForm').style.display   = 'none';
        document.getElementById('cardFormulario').style.display = 'block';

        inicializarContadores();
        document.getElementById('formEditarEvento').addEventListener('submit', aoSubmeter);

    } catch (err) {
        exibirErroCarregar(err.message || 'Erro ao carregar evento.');
    }
}

/* ---- Preenche os campos do formulário ---- */
function preencherFormulario(evento) {
    setValue('nomeEvento',       evento.nome);
    setValue('descricaoEvento',  evento.descricao);
    setValue('localEvento',      evento.local);
    setValue('capacidadeEvento', evento.capacidade);

    // Categoria
    const sel = document.getElementById('categoriaEvento');
    if (sel && evento.categoria) sel.value = evento.categoria;

    // datetime-local precisa do formato "YYYY-MM-DDTHH:MM"
    if (evento.data_hora) {
        const d = new Date(evento.data_hora);
        if (!isNaN(d)) {
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            const inputData = document.getElementById('dataHoraEvento');
            if (inputData) inputData.value = d.toISOString().slice(0, 16);
        }
    }
}

function setValue(id, valor) {
    const el = document.getElementById(id);
    if (el) el.value = valor ?? '';
}

/* ---- Contadores de caracteres ---- */
function inicializarContadores() {
    vincularContador('nomeEvento',      'contNome');
    vincularContador('descricaoEvento', 'contDesc');
}

function vincularContador(inputId, contadorId) {
    const input    = document.getElementById(inputId);
    const contador = document.getElementById(contadorId);
    if (!input || !contador) return;
    // Atualiza imediatamente com o valor pré-preenchido
    contador.textContent = input.value.length;
    input.addEventListener('input', () => {
        contador.textContent = input.value.length;
    });
}

/* ---- Mensagens ---- */
function exibirErroCarregar(texto) {
    const el = document.getElementById('msgErroCarregar');
    if (!el) return;
    el.textContent = texto;
    el.className   = 'msg-feedback erro';
    document.getElementById('skeletonForm').style.display = 'none';
}

function exibirMensagem(texto, tipo) {
    const el = document.getElementById('msgFeedback');
    if (!el) return;
    el.textContent = texto;
    el.className   = `msg-feedback ${tipo}`;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function limparMensagem() {
    const el = document.getElementById('msgFeedback');
    if (el) el.className = 'msg-feedback';
}

/* ---- Validação ---- */
function validarFormulario(dados) {
    if (!dados.nome || dados.nome.trim().length < 3) {
        return 'O nome do evento deve ter pelo menos 3 caracteres.';
    }
    if (!dados.descricao || dados.descricao.trim().length < 10) {
        return 'A descrição deve ter pelo menos 10 caracteres.';
    }
    if (!dados.data_hora) {
        return 'Informe a data e hora do evento.';
    }
    if (!dados.local || dados.local.trim().length < 3) {
        return 'Informe o local do evento (mínimo 3 caracteres).';
    }
    if (!dados.categoria) {
        return 'Selecione uma categoria.';
    }
    const cap = Number(dados.capacidade);
    if (!cap || cap < 1 || cap > 100000) {
        return 'A capacidade deve ser entre 1 e 100.000.';
    }
    // Valida que capacidade não é menor que os inscritos atuais
    if (eventoOriginal?.inscritos && cap < eventoOriginal.inscritos) {
        return `A capacidade não pode ser menor que o número de inscritos (${eventoOriginal.inscritos}).`;
    }
    return null;
}

/* ---- Submit ---- */
async function aoSubmeter(event) {
    event.preventDefault();
    limparMensagem();

    const id = getIdDaUrl();
    const btnSalvar = document.getElementById('btnSalvar');

    const dados = {
        nome:       document.getElementById('nomeEvento')?.value.trim(),
        descricao:  document.getElementById('descricaoEvento')?.value.trim(),
        data_hora:  document.getElementById('dataHoraEvento')?.value,
        local:      document.getElementById('localEvento')?.value.trim(),
        categoria:  document.getElementById('categoriaEvento')?.value,
        capacidade: document.getElementById('capacidadeEvento')?.value,
    };

    const erro = validarFormulario(dados);
    if (erro) {
        exibirMensagem(erro, 'erro');
        return;
    }

    dados.capacidade = Number(dados.capacidade);

    btnSalvar.disabled    = true;
    btnSalvar.textContent = 'Salvando...';

    try {
        const resposta = await fetch(`${API_BASE}/eventos/${id}`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(dados),
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            exibirMensagem(resultado.detail || 'Erro ao salvar.', 'erro');
            return;
        }

        exibirMensagem('Evento atualizado com sucesso! Redirecionando...', 'sucesso');
        setTimeout(() => {
            window.location.href = 'gerenciar-eventos.html';
        }, 1500);

    } catch (err) {
        exibirMensagem('Erro ao conectar com o servidor.', 'erro');
    } finally {
        btnSalvar.disabled    = false;
        btnSalvar.textContent = '💾 Salvar Alterações';
    }
}