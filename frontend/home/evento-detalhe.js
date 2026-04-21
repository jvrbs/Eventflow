/**
 * criar-evento.js
 */

const API_BASE = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', () => {
    const usuario = getUsuarioLogado('../login/login.html');
    if (!usuario) return;

    if (usuario.perfil !== 'organizador') {
        window.location.href = '../home/home.html';
        return;
    }

    inicializarFormulario();
});

function inicializarFormulario() {
    vincularContador('nomeEvento',      'contNome');
    vincularContador('descricaoEvento', 'contDesc');

    const inputData = document.getElementById('dataHoraEvento');
    if (inputData) {
        const agora = new Date();
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
    input.addEventListener('input', () => { contador.textContent = input.value.length; });
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

function validarFormulario(dados) {
    if (!dados.nome || dados.nome.trim().length < 3)
        return 'O nome do evento deve ter pelo menos 3 caracteres.';
    if (!dados.descricao || dados.descricao.trim().length < 10)
        return 'A descrição deve ter pelo menos 10 caracteres.';
    if (!dados.data_hora)
        return 'Informe a data e hora do evento.';
    if (new Date(dados.data_hora) <= new Date())
        return 'A data do evento deve ser no futuro.';
    if (!dados.local || dados.local.trim().length < 3)
        return 'Informe o local do evento (mínimo 3 caracteres).';
    if (!dados.categoria)
        return 'Selecione uma categoria para o evento.';
    const cap = Number(dados.capacidade);
    if (!cap || cap < 1 || cap > 100000)
        return 'A capacidade deve ser um número entre 1 e 100.000.';
    return null;
}

async function aoSubmeter(event) {
    event.preventDefault();
    limparMensagem();

    const btnCriar = document.getElementById('btnCriar');

    const dados = {
        nome:       document.getElementById('nomeEvento')?.value.trim(),
        descricao:  document.getElementById('descricaoEvento')?.value.trim(),
        data_hora:  document.getElementById('dataHoraEvento')?.value,
        local:      document.getElementById('localEvento')?.value.trim(),
        categoria:  document.getElementById('categoriaEvento')?.value,
        capacidade: document.getElementById('capacidadeEvento')?.value,
    };

    const erro = validarFormulario(dados);
    if (erro) { exibirMensagem(erro, 'erro'); return; }

    dados.capacidade = Number(dados.capacidade);

    btnCriar.disabled    = true;
    btnCriar.textContent = 'Publicando...';

    try {
        const usuario  = JSON.parse(localStorage.getItem('usuario'));
        const resposta = await fetch(`${API_BASE}/eventos`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                ...dados,
                usuario_id: usuario.id,   // ← campo correto que o backend espera
            }),
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            exibirMensagem(resultado.detail || 'Erro ao criar evento.', 'erro');
            return;
        }

        exibirMensagem('Evento criado com sucesso! Redirecionando...', 'sucesso');
        setTimeout(() => { window.location.href = '../home/home.html'; }, 1500);

    } catch {
        exibirMensagem('Erro ao conectar com o servidor. Tente novamente.', 'erro');
    } finally {
        btnCriar.disabled    = false;
        btnCriar.textContent = '✨ Publicar Evento';
    }
}