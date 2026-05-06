// --- 1. CONFIGURAÇÃO E FUNÇÕES AUXILIARES ---

const API_URL = "http://localhost:8000";

// Função para alternar visibilidade da senha (Feat 1)
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
// Expõe globalmente para os botões do HTML
window.toggleSenha = toggleSenha;

// Remove caracteres não numéricos (útil para CPF e Telefone)
function limparNumero(valor) {
    return valor.replace(/\D/g, '');
}

// Função de idade com correção de fuso horário
function calcularIdade(dataNasc) {
    if (!dataNasc) return -1;
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    
    // Ajuste para evitar erro de fuso horário no JavaScript
    nascimento.setMinutes(nascimento.getMinutes() + nascimento.getTimezoneOffset());

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
}

// Validação de CPF (UX - Feedback rápido)
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

// Validação de Senha Forte
function validarSenhaForte(senha) {
    const minLength = senha.length >= 8;
    const hasUpper = /[A-Z]/.test(senha);
    const hasLower = /[a-z]/.test(senha);
    const hasNumber = /\d/.test(senha);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
    
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
}

// Função centralizada para exibir erros no DOM
function exibirErro(elemento, texto) {
    if (elemento) {
        elemento.textContent = texto;
        elemento.style.display = 'block';
        // Scroll suave para o erro caso a página seja longa
        elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// --- FUNÇÃO DE ESTADO DO CAMPO (Feat 2) ---
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

    // Procura ou cria o elemento de mensagem de erro inline dentro do .input-group
    let msgEl = container.querySelector('.field-msg');
    if (!isValid && mensagem) {
        if (!msgEl) {
            msgEl = document.createElement('span');
            msgEl.className = 'field-msg';
            container.appendChild(msgEl);
        }
        msgEl.textContent = mensagem;
        msgEl.style.display = 'block';
    } else {
        if (msgEl) {
            msgEl.textContent = '';
            msgEl.style.display = 'none';
        }
    }
}

// Validadores Individuais (Feat 2)
function validarNomeField() {
    const el = document.getElementById('nomeCompletocadastro');
    if (!el) return true;
    const val = el.value.trim();
    const isValid = val.split(/\s+/).filter(p => p.length > 0).length >= 2;
    setFieldState(el, isValid, isValid ? '' : "Informe seu nome completo (pelo menos duas palavras).");
    return isValid;
}

// Validador de Data de Nascimento
function validarDataNascField() {
    const el = document.getElementById('dataNascimentoCadastro');
    if (!el) return true;
    const val = el.value;
    if (!val) {
        setFieldState(el, false, "Data de nascimento é obrigatória.");
        return false;
    }
    const idade = calcularIdade(val);
    const isValid = idade >= 12 && idade <= 100;
    setFieldState(el, isValid, isValid ? '' : "Idade permitida: entre 12 e 100 anos.");
    return isValid;
}

// Validador de Email
function validarEmailField() {
    const el = document.getElementById('emailCadastro');
    if (!el) return true;
    const val = el.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(val);
    setFieldState(el, isValid, isValid ? '' : "Informe um e-mail válido.");
    return isValid;
}

// Validador de CPF
function validarCpfField() {
    const el = document.getElementById('cpfCadastro');
    if (!el) return true;
    const val = el.value;
    const cleanCpf = limparNumero(val);
    const isValid = validarCPF(cleanCpf);
    setFieldState(el, isValid, isValid ? '' : "CPF inválido.");
    return isValid;
}

// Validador de Telefone
function validarTelefoneField() {
    const el = document.getElementById('telefoneCadastro');
    if (!el) return true;
    const clean = limparNumero(el.value);
    const isValid = clean.length >= 10 && clean.length <= 11;
    setFieldState(el, isValid, isValid ? '' : "Telefone inválido (mínimo 10 dígitos com DDD).");
    return isValid;
}

// Validador de Senha
function validarSenhaField() {
    const el = document.getElementById('passwordCadastro');
    if (!el) return true;
    const val = el.value;
    const isValid = validarSenhaForte(val);
    setFieldState(el, isValid, isValid ? '' : "A senha deve ter 8+ caracteres, incluir maiúscula, minúscula, número e caractere especial.");
    return isValid;
}

// Validador de Confirmação de Senha
function validarConfirmaSenhaField() {
    const el = document.getElementById('confirmarSenhaCadastro');
    const senhaEl = document.getElementById('passwordCadastro');
    if (!el || !senhaEl) return true;
    const val = el.value;
    const senhaVal = senhaEl.value;
    const isValid = val === senhaVal && val.length > 0;
    setFieldState(el, isValid, isValid ? '' : "As senhas não coincidem.");
    return isValid;
}

// --- 2. ELEMENTOS DO DOM ---

const formularioCadastro = document.getElementById('formCadastro');
const formularioLogin = document.getElementById('formLogin');
const msgGeral = document.getElementById('mensagem');     
const msgSenha = document.getElementById('mensagem2');   
const msgLogin = document.getElementById('mensagem3');   

// --- 3. LÓGICA DE CADASTRO ---

if (formularioCadastro) {
    // Lista de mapeamento para as validações em tempo real (Feat 2)
    const fieldsToValidate = [
        { id: 'nomeCompletocadastro', validator: validarNomeField },
        { id: 'dataNascimentoCadastro', validator: validarDataNascField },
        { id: 'emailCadastro', validator: validarEmailField },
        { id: 'cpfCadastro', validator: validarCpfField },
        { id: 'telefoneCadastro', validator: validarTelefoneField },
        { id: 'passwordCadastro', validator: () => {
            const v1 = validarSenhaField();
            const conf = document.getElementById('confirmarSenhaCadastro');
            if (conf && conf.value.length > 0) {
                validarConfirmaSenhaField();
            }
            return v1;
        }},
        { id: 'confirmarSenhaCadastro', validator: validarConfirmaSenhaField }
    ];

    // Registra os listeners de 'input' e 'blur' para cada campo de cadastro (Feat 2)
    fieldsToValidate.forEach(({ id, validator }) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', validator);
            el.addEventListener('blur', validator);
        }
    });

    formularioCadastro.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Executa todas as validações no submit para atualizar os estados visuais (Feat 2)
        let formValido = true;
        let primeiroInvalido = null;

        fieldsToValidate.forEach(({ id, validator }) => {
            const valido = validator();
            if (!valido) {
                formValido = false;
                const el = document.getElementById(id);
                if (!primeiroInvalido && el) {
                    primeiroInvalido = el;
                }
            }
        });

        // Aproveita os estados calculados: se houver classe field-error ou formulário inválido, bloqueia
        const hasError = formularioCadastro.querySelector('.field-error');
        if (!formValido || hasError) {
            if (primeiroInvalido) {
                primeiroInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
                primeiroInvalido.focus();
            }
            return;
        }

        const nome = document.getElementById('nomeCompletocadastro')?.value.trim() || '';
        const email = document.getElementById('emailCadastro')?.value.trim() || '';
        const data_nascimento = document.getElementById('dataNascimentoCadastro')?.value || '';
        const cpfRaw = document.getElementById('cpfCadastro')?.value || '';
        const telefoneRaw = document.getElementById('telefoneCadastro')?.value || '';
        const senha = document.getElementById('passwordCadastro')?.value || '';

        // Limpa mensagens gerais anteriores se houverem
        if (msgGeral) { msgGeral.style.display = 'none'; msgGeral.textContent = ''; }
        if (msgSenha) { msgSenha.style.display = 'none'; msgSenha.textContent = ''; }

        const cpfLimpo = limparNumero(cpfRaw);
        const telefoneLimpo = limparNumero(telefoneRaw);

        // --- ENVIO PARA API ---
        try {
            const resposta = await fetch(`${API_URL}/cadastrar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome_completo: nome,
                    data_nascimento: data_nascimento,
                    email: email,
                    cpf: cpfLimpo,       
                    telefone: telefoneLimpo, 
                    password: senha
                })
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                // Tratamento dinâmico de erros do Backend
                let mensagemFinal = "Erro ao processar cadastro.";

                if (resultado.detail) {
                    if (Array.isArray(resultado.detail)) {
                        // Erros de validação automática do FastAPI/Pydantic
                        mensagemFinal = resultado.detail.map(err => err.msg).join(" | ");
                    } else {
                        // Erros manuais (HTTPException) do main.py
                        mensagemFinal = resultado.detail;
                    }
                }
                
                exibirErro(msgGeral, mensagemFinal);
                return;
            }

            // Sucesso: Redireciona
            window.location.href = "../login/login.html";

        } catch (erro) {
            exibirErro(msgGeral, "Não foi possível conectar ao servidor.");
        }
    });
}

// --- 4. LÓGICA DE LOGIN ---

if (formularioLogin) {
    formularioLogin.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('emailLogin').value.trim();
        const senha = document.getElementById('passwordLogin').value.trim();
        const botao = formularioLogin.querySelector('button');

        if (msgLogin) { msgLogin.style.display = 'none'; msgLogin.textContent = ''; }

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

            // MODIFICADO: Salva os dados com o timestamp do login atual e redireciona
            localStorage.setItem('usuario', JSON.stringify({
                ...resultado.usuario,
                logado_em: Date.now()
            }));
            window.location.href = "../home/home.html";

        } catch (erro) {
            exibirErro(msgLogin, "Erro ao conectar com o servidor.");
        } finally {
            botao.disabled = false;
            botao.textContent = "Entrar";
        }
    });
}

// --- 5. FUNÇÃO DE LOGOUT ---

function logout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../login/login.html";
}