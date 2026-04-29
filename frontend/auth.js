// --- 1. CONFIGURAÇÃO E FUNÇÕES AUXILIARES ---

const API_URL = "http://localhost:8000";

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

// Validação de CPF (Alinhado com models.py)
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

// Validação de Senha Forte (Alinhado com a Regex da models.py)
function validarSenhaForte(senha) {
    const minLength = senha.length >= 8;
    const hasUpper = /[A-Z]/.test(senha);
    const hasLower = /[a-z]/.test(senha);
    const hasNumber = /\d/.test(senha);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
    
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
}

// --- 2. ELEMENTOS DO DOM ---

const formularioCadastro = document.getElementById('formCadastro');
const formularioLogin = document.getElementById('formLogin');
const msgGeral = document.getElementById('mensagem');    // Span para erros gerais
const msgSenha = document.getElementById('mensagem2');   // Span para senha fraca (se existir no HTML)
const msgLogin = document.getElementById('mensagem3');   // Span para erro de login

// --- 3. LÓGICA DE CADASTRO ---

if (formularioCadastro) {
    formularioCadastro.addEventListener('submit', async function(event) {
        event.preventDefault();

        const nome = document.getElementById('nomeCompletocadastro')?.value.trim() || '';
        const email = document.getElementById('emailCadastro')?.value.trim() || '';
        const data_nascimento = document.getElementById('dataNascimentoCadastro')?.value || '';
        const cpfRaw = document.getElementById('cpfCadastro')?.value || '';
        const telefoneRaw = document.getElementById('telefoneCadastro')?.value || '';
        const senha = document.getElementById('passwordCadastro')?.value || '';
        const confirma = document.getElementById('confirmarSenhaCadastro')?.value || '';

        // Limpa mensagens anteriores
        if (msgGeral) { msgGeral.style.display = 'none'; msgGeral.textContent = ''; }
        if (msgSenha) { msgSenha.style.display = 'none'; msgSenha.textContent = ''; }

        // 1. Validação de Nome (Mínimo 2 palavras e apenas letras)
        const partesNome = nome.split(/\s+/).filter(p => p.length > 0);
        if (partesNome.length < 2) {
            msgGeral.textContent = "Informe seu nome completo (pelo menos duas palavras).";
            msgGeral.style.display = 'block';
            return;
        }

        // 2. Validação de Idade (12 a 100 anos)
        const idade = calcularIdade(data_nascimento);
        if (idade < 12 || idade > 100) {
            msgGeral.textContent = "Idade permitida: entre 12 e 100 anos.";
            msgGeral.style.display = 'block';
            return;
        }

        // 3. Validação de CPF
        const cpfLimpo = limparNumero(cpfRaw);
        if (!validarCPF(cpfLimpo)) {
            msgGeral.textContent = "CPF inválido.";
            msgGeral.style.display = 'block';
            return;
        }

        // 4. Validação de Telefone (10 ou 11 dígitos)
        const telefoneLimpo = limparNumero(telefoneRaw);
        if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
            msgGeral.textContent = "Telefone inválido (deve ter 10 ou 11 dígitos com DDD).";
            msgGeral.style.display = 'block';
            return;
        }

        // 5. Validação de Senha Forte
        if (!validarSenhaForte(senha)) {
            const erroSenha = "A senha deve ter 8+ caracteres, incluir maiúscula, minúscula, número e caractere especial.";
            if (msgSenha) {
                msgSenha.textContent = erroSenha;
                msgSenha.style.display = 'block';
            } else {
                msgGeral.textContent = erroSenha;
                msgGeral.style.display = 'block';
            }
            return;
        }

        // 6. Confirmação de Senha
        if (senha !== confirma) {
            msgGeral.textContent = "As senhas não coincidem.";
            msgGeral.style.display = 'block';
            return;
        }

        // Envio para API
        try {
            const resposta = await fetch(`${API_URL}/cadastrar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome_completo: nome,
                    data_nascimento: data_nascimento,
                    email: email,
                    cpf: cpfLimpo,       // Envia apenas dígitos
                    telefone: telefoneLimpo, // Envia apenas dígitos
                    password: senha
                })
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                // Trata erros vindos do Pydantic ou do Banco
                msgGeral.textContent = Array.isArray(resultado.detail) 
                    ? resultado.detail[0].msg 
                    : (resultado.detail || "Erro ao cadastrar.");
                msgGeral.style.display = 'block';
                return;
            }

            window.location.href = "../login/login.html";

        } catch (erro) {
            msgGeral.textContent = "Erro ao conectar com o servidor.";
            msgGeral.style.display = 'block';
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
            msgLogin.textContent = "Preencha todos os campos.";
            msgLogin.style.display = 'block';
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
                msgLogin.textContent = resultado.detail || "Email ou senha incorretos.";
                msgLogin.style.display = 'block';
                return;
            }

            localStorage.setItem('usuario', JSON.stringify(resultado.usuario));
            window.location.href = "../home/home.html";

        } catch (erro) {
            if (msgLogin) {
                msgLogin.textContent = "Erro ao conectar com o servidor.";
                msgLogin.style.display = 'block';
            }
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