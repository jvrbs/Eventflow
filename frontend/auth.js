// --- 1. CONFIGURAÇÃO E FUNÇÕES AUXILIARES ---

const API_URL = "http://localhost:8000";

// Função para alternar visibilidade da senha
function toggleSenha(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        btnEl.textContent = '🙈';
        btnEl.setAttribute('aria-label', 'Ocultar senha');
    } else {
        input.type = 'password';
        btnEl.textContent = '👁️';
        btnEl.setAttribute('aria-label', 'Mostrar senha');
    }
}
window.toggleSenha = toggleSenha;

// Remove tudo que não é número para envio ao banco e cálculos
function limparNumero(valor) {
    return valor.replace(/\D/g, '');
}

// Máscara de CPF: 000.000.000-00
function mascaraCPF(valor) {
    return valor
        .replace(/\D/g, '') 
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1'); 
}

// Máscara de Telefone: (00) 00000-0000
function mascaraTelefone(valor) {
    let v = valor.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);

    if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (v.length > 5) {
        v = v.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d)/, '($1) $2');
    } else if (v.length > 0) {
        v = v.replace(/^(\d)/, '($1');
    }
    return v;
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

function validarCPF(cpf) {
    const strCPF = limparNumero(cpf);
    if (strCPF.length !== 11 || /^(\d)\1{10}$/.test(strCPF)) return false;
    for (let j = 9; j <= 10; j++) {
        let soma = 0;
        for (let i = 0; i < j; i++) soma += parseInt(strCPF.charAt(i)) * ((j + 1) - i);
        let resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(strCPF.charAt(j))) return false;
    }
    return true;
}

function validarSenhaForte(senha) {
    return senha.length >= 8 && /[A-Z]/.test(senha) && /[a-z]/.test(senha) && /\d/.test(senha) && /[!@#$%^&*(),.?":{}|<>]/.test(senha);
}

function exibirErro(elemento, texto) {
    if (elemento) {
        elemento.textContent = texto;
        elemento.style.display = 'block';
        elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// --- 2. VALIDAÇÃO DE CAMPOS (UI) ---

function setFieldState(inputEl, isValid, mensagem) {
    if (!inputEl) return;
    const container = inputEl.closest('.input-group');
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

const validators = {
    nomeCompletocadastro: (el) => {
        const isValid = el.value.trim().split(/\s+/).length >= 2;
        setFieldState(el, isValid, isValid ? '' : "Informe seu nome completo.");
        return isValid;
    },
    dataNascimentoCadastro: (el) => {
        const idade = calcularIdade(el.value);
        const isValid = idade >= 12 && idade <= 100;
        setFieldState(el, isValid, isValid ? '' : "Idade permitida: 12 a 100 anos.");
        return isValid;
    },
    emailCadastro: (el) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
        setFieldState(el, isValid, isValid ? '' : "E-mail inválido.");
        return isValid;
    },
    cpfCadastro: (el) => {
        const isValid = validarCPF(el.value);
        setFieldState(el, isValid, isValid ? '' : "CPF inválido.");
        return isValid;
    },
    telefoneCadastro: (el) => {
        const clean = limparNumero(el.value);
        const isValid = clean.length >= 10 && clean.length <= 11;
        setFieldState(el, isValid, isValid ? '' : "Telefone inválido.");
        return isValid;
    },
    passwordCadastro: (el) => {
        const isValid = validarSenhaForte(el.value);
        setFieldState(el, isValid, isValid ? '' : "Senha deve ser forte.");
        const conf = document.getElementById('confirmarSenhaCadastro');
        if (conf && conf.value) validators.confirmarSenhaCadastro(conf);
        return isValid;
    },
    confirmarSenhaCadastro: (el) => {
        const senha = document.getElementById('passwordCadastro').value;
        const isValid = el.value === senha && el.value.length > 0;
        setFieldState(el, isValid, isValid ? '' : "As senhas não coincidem.");
        return isValid;
    }
};

// --- 3. LÓGICA DE CADASTRO ---

const formularioCadastro = document.getElementById('formCadastro');
const msgGeral = document.getElementById('mensagem');     
const msgSucesso = document.getElementById('mensagem4');

if (formularioCadastro) {
    // Aplicar Máscaras e Validadores
    Object.keys(validators).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        el.addEventListener('input', (e) => {
            if (id === 'cpfCadastro') e.target.value = mascaraCPF(e.target.value);
            if (id === 'telefoneCadastro') e.target.value = mascaraTelefone(e.target.value);
            validators[id](el);
        });
        el.addEventListener('blur', () => validators[id](el));
    });

    formularioCadastro.addEventListener('submit', async function(event) {
        event.preventDefault();

        let formValido = true;
        Object.keys(validators).forEach(id => {
            const el = document.getElementById(id);
            if (el && !validators[id](el)) formValido = false;
        });

        if (!formValido || formularioCadastro.querySelector('.field-error')) return;

        const btnSubmit = formularioCadastro.querySelector('button[type="submit"]');
        if (msgGeral) msgGeral.style.display = 'none';
        if (msgSucesso) msgSucesso.style.display = 'none';

        try {
            const dados = {
                nome_completo: document.getElementById('nomeCompletocadastro').value.trim(),
                data_nascimento: document.getElementById('dataNascimentoCadastro').value,
                email: document.getElementById('emailCadastro').value.trim(),
                cpf: limparNumero(document.getElementById('cpfCadastro').value),
                telefone: limparNumero(document.getElementById('telefoneCadastro').value),
                password: document.getElementById('passwordCadastro').value
            };

            const resposta = await fetch(`${API_URL}/cadastrar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                let erroMsg = resultado.detail || "Erro no cadastro.";
                if (Array.isArray(resultado.detail)) erroMsg = resultado.detail.map(e => e.msg).join(" | ");
                exibirErro(msgGeral, erroMsg);
                return;
            }

            // Sucesso
            if (msgSucesso) {
                msgSucesso.textContent = "Cadastro realizado com sucesso! Redirecionando...";
                msgSucesso.style.display = 'block';
            }
            if (btnSubmit) btnSubmit.disabled = true;

            setTimeout(() => {
                window.location.href = "../login/login.html";
            }, 2000);

        } catch (erro) {
            exibirErro(msgGeral, "Erro ao conectar com o servidor.");
        }
    });
}

// --- 4. LÓGICA DE LOGIN ---

const formularioLogin = document.getElementById('formLogin');
const msgLogin = document.getElementById('mensagem3');

if (formularioLogin) {
    formularioLogin.addEventListener('submit', async function(event) {
        event.preventDefault();
        const email = document.getElementById('emailLogin').value.trim();
        const senha = document.getElementById('passwordLogin').value.trim();
        const botao = formularioLogin.querySelector('button');

        if (msgLogin) msgLogin.style.display = 'none';

        if (!email || !senha) {
            exibirErro(msgLogin, "Preencha todos os campos.");
            return;
        }

        botao.disabled = true;
        botao.textContent = "Entrando...";

        try {
            const resposta = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: senha })
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                exibirErro(msgLogin, resultado.detail || "Email ou senha incorretos.");
                return;
            }

            localStorage.setItem('usuario', JSON.stringify({ ...resultado.usuario, logado_em: Date.now() }));
            window.location.href = "../home/home.html";

        } catch (erro) {
            exibirErro(msgLogin, "Erro ao conectar com o servidor.");
        } finally {
            botao.disabled = false;
            botao.textContent = "Entrar";
        }
    });
}

function logout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../login/login.html";
}