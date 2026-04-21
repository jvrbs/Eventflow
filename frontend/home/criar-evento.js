/**
 * criar-evento.js
 * Valida e envia o formulário de criação de evento.
 * Redireciona participantes para home.html.
 * Redireciona para home após criação bem-sucedida.
 */

const API_BASE = 'http://localhost:8000';

/* ---- Proteção de perfil ---- */
document.addEventListener('DOMContentLoaded', () => {
    const usuario = getUsuarioLogado('../login/login.html');
    if (!usuario) return;

    if (usuario.perfil !== 'organizador') {
        // Participantes não têm acesso a esta página
        window.location.href = '../home/home.html';
        return;
    }

    inicializarFormulario();
});

/* ---- Contadores de caracteres ---- */
function inicializarFormulario() {
    vincularContador('nomeEvento',      'contNome');
    vincularContador('descricaoEvento', 'contDesc');

    // Data mínima = agora
    const inputData = document.getElementById('dataHoraEvento');
    if (inputData) {
        const agora = new Date();
        // datetime-local aceita "YYYY-MM-DDTHH:MM"
        agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
        inputData.min = agora.toISOString().slice(0, 16);
    }

    const form = document.getElementById('formCriarEvento');
    if (form) form.addEventListener('submit', aoSubmeter);
}

function vincularContador(inputId, contadorId) {
    const input    = document.getElementById(inputId);
    const contador = document.getElementById(contadorId);
    if (!input || !contador) return;
    input.addEventListener('input', () => {
        contador.textContent = input.value.length;
    });
}

/* ---- Feedback ---- */
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

    const dataEvento = new Date(dados.data_hora);
    if (isNaN(dataEvento) || dataEvento <= new Date()) {
        return 'A data do evento deve ser no futuro.';
    }
    if (!dados.local || dados.local.trim().length < 3) {
        return 'Informe o local do evento (mínimo 3 caracteres).';
    }
    if (!dados.categoria) {
        return 'Selecione uma categoria para o evento.';
    }
    const capacidade = Number(dados.capacidade);
    if (!capacidade || capacidade < 1 || capacidade > 100000) {
        return 'A capacidade deve ser um número entre 1 e 100.000.';
    }
    return null; // sem erros
}

/* ---- Submit ---- */
async function aoSubmeter(event) {
    event.preventDefault();
    limparMensagem();

    const form    = document.getElementById('formCriarEvento');
    const btnCriar = document.getElementById('btnCriar');

    const dados = {
        nome:       document.getElementById('nomeEvento')?.value.trim(),
        descricao:  document.getElementById('descricaoEvento')?.value.trim(),
        data_hora:  document.getElementById('dataHoraEvento')?.value,
        local:      document.getElementById('localEvento')?.value.trim(),
        categoria:  document.getElementById('categoriaEvento')?.value,
        capacidade: document.getElementById('capacidadeEvento')?.value,
    };

    // Validação frontend
    const erroValidacao = validarFormulario(dados);
    if (erroValidacao) {
        exibirMensagem(erroValidacao, 'erro');
        return;
    }

    // Converte capacidade para número
    dados.capacidade = Number(dados.capacidade);

    btnCriar.disabled     = true;
    btnCriar.textContent  = 'Publicando...';

    try {
        const usuario  = JSON.parse(localStorage.getItem('usuario'));
        const resposta = await fetch(`${API_BASE}/eventos`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                ...dados,
                organizador_id: usuario.id,
            }),
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            exibirMensagem(resultado.detail || 'Erro ao criar evento.', 'erro');
            return;
        }

        exibirMensagem('Evento criado com sucesso! Redirecionando...', 'sucesso');
        setTimeout(() => {
            window.location.href = '../home/home.html';
        }, 1500);

    } catch (err) {
        exibirMensagem('Erro ao conectar com o servidor. Tente novamente.', 'erro');
    } finally {
        btnCriar.disabled    = false;
        btnCriar.textContent = '✨ Publicar Evento';
    }
}