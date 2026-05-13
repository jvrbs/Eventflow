// Captura dos elementos
const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const inputTelefone = document.getElementById('telefone');
const inputDataNascimento = document.getElementById('dataNascimento');
const inputIdade = document.getElementById('idade');
const msgValidacaoGeral = document.getElementById('mensagemValidacao');
const formInfo = document.getElementById('formInfo');

const IDADE_MINIMA = 12;
const IDADE_MAXIMA = 100; // Atualizado para 100 para espelhar o cadastro

// --- FUNÇÕES AUXILIARES ---

function limparNumero(valor) {
    return valor.replace(/\D/g, '');
}

function calcularIdade(dataNasc) {
    if (!dataNasc) return -1;
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    nascimento.setMinutes(nascimento.getMinutes() + nascimento.getTimezoneOffset());

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    return idade;
}

// Máscara de Telefone (Mantida)
inputTelefone.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 10) value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    else if (value.length > 5) value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    else if (value.length > 2) value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    else if (value.length > 0) value = value.replace(/^(\d*)/, '($1');
    e.target.value = value;
});

// --- SISTEMA DE VALIDAÇÃO VISUAL (Igual ao auth.js) ---

function setFieldState(inputEl, isValid, mensagem) {
    if (!inputEl) return;
    const container = inputEl.closest('.form-group');
    if (!container) return;

    if (isValid) {
        inputEl.classList.remove('field-error');
        inputEl.classList.add('field-ok');
    } else {
        inputEl.classList.remove('field-ok');
        inputEl.classList.add('field-error');
    }

    let msgEl = container.querySelector('.field-msg');
    if (!isValid && mensagem) {
        if (!msgEl) {
            msgEl = document.createElement('span');
            msgEl.className = 'field-msg';
            container.appendChild(msgEl);
        }
        msgEl.textContent = mensagem;
        msgEl.style.display = 'block';
    } else if (msgEl) {
        msgEl.style.display = 'none';
    }
}

// --- VALIDADORES INDIVIDUAIS ---

const validators = {
    nome: (el) => {
        const isValid = el.value.trim().split(/\s+/).filter(p => p.length > 0).length >= 2;
        setFieldState(el, isValid, isValid ? '' : "Informe seu nome completo (mínimo 2 palavras).");
        return isValid;
    },
    email: (el) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
        setFieldState(el, isValid, isValid ? '' : "E-mail inválido.");
        return isValid;
    },
    telefone: (el) => {
        const clean = limparNumero(el.value);
        const isValid = clean.length >= 10 && clean.length <= 11;
        setFieldState(el, isValid, isValid ? '' : "Telefone inválido (10 ou 11 dígitos).");
        return isValid;
    },
    dataNascimento: (el) => {
        const idade = calcularIdade(el.value);
        const isValid = idade >= IDADE_MINIMA && idade <= IDADE_MAXIMA;
        setFieldState(el, isValid, isValid ? '' : `Idade permitida: ${IDADE_MINIMA} a ${IDADE_MAXIMA} anos.`);
        if (isValid) inputIdade.value = idade;
        return isValid;
    }
};

// --- LISTENERS EM TEMPO REAL ---

[inputNome, inputEmail, inputTelefone, inputDataNascimento].forEach(el => {
    if (el) {
        el.addEventListener('input', () => validators[el.id](el));
        el.addEventListener('blur', () => validators[el.id](el));
    }
});

function exibirMensagemGeral(texto, tipo) {
    if (!msgValidacaoGeral) return;
    msgValidacaoGeral.textContent = texto;
    msgValidacaoGeral.className = "mensagem-validacao " + (tipo === 'erro' ? 'msg-erro' : 'msg-sucesso');
    msgValidacaoGeral.style.display = 'block';
}

// --- CARREGAMENTO DE DADOS ---

function preencherDadosUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) return;

    inputNome.value = usuario.nome_completo || "";
    inputEmail.value = usuario.email || "";
    if (usuario.telefone) {
        inputTelefone.value = usuario.telefone;
        inputTelefone.dispatchEvent(new Event('input'));
    }
    if (usuario.data_nascimento) {
        const dataFormatada = usuario.data_nascimento.split('T')[0];
        inputDataNascimento.value = dataFormatada;
        inputIdade.value = calcularIdade(dataFormatada);
    }
}

preencherDadosUsuario();

// --- SUBMIT ---

formInfo.addEventListener('submit', async function(event) {
    event.preventDefault(); 
    
    let formValido = true;
    let primeiroInvalido = null;

    // Executa todos os validadores
    [inputNome, inputEmail, inputTelefone, inputDataNascimento].forEach(el => {
        if (!validators[el.id](el)) {
            formValido = false;
            if (!primeiroInvalido) primeiroInvalido = el;
        }
    });

    if (!formValido) {
        primeiroInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
        primeiroInvalido.focus();
        return;
    }

    const btnSalvar = formInfo.querySelector('.btn-salvar');
    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";
    if (msgValidacaoGeral) msgValidacaoGeral.style.display = 'none';

    try {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));
        if (!usuarioLogado || !usuarioLogado.id) throw new Error("Sessão expirada.");

        const resposta = await fetch(`http://localhost:8000/atualizar-perfil/${usuarioLogado.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome_completo: inputNome.value.trim(),
                email: inputEmail.value.trim(),
                telefone: limparNumero(inputTelefone.value),
                data_nascimento: inputDataNascimento.value
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            let mensagem = resultado.detail;
            if (Array.isArray(resultado.detail)) {
                mensagem = resultado.detail.map(err => err.msg).join(" | ");
            }
            exibirMensagemGeral(mensagem, "erro");
            return;
        }

        exibirMensagemGeral("Informações atualizadas!", "sucesso");
        
        // Atualiza storage local
        localStorage.setItem('usuario', JSON.stringify({
            ...usuarioLogado,
            nome_completo: inputNome.value.trim(),
            email: inputEmail.value.trim(),
            telefone: limparNumero(inputTelefone.value),
            data_nascimento: inputDataNascimento.value
        }));
    } catch (erro) {
        exibirMensagemGeral(erro.message || "Erro de conexão.", "erro");
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = "Salvar Alterações";
    }
});