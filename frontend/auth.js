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

// --- 2. ELEMENTOS DO DOM ---

const formularioCadastro = document.getElementById('formCadastro');
const formularioLogin = document.getElementById('formLogin');
const msgGeral = document.getElementById('mensagem');    
const msgSenha = document.getElementById('mensagem2');   
const msgLogin = document.getElementById('mensagem3');   

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

        // 1. Validação de Nome
        if (nome.split(/\s+/).filter(p => p.length > 0).length < 2) {
            exibirErro(msgGeral, "Informe seu nome completo (pelo menos duas palavras).");
            return;
        }

        // 2. Validação de Idade (12 a 100 anos)
        const idade = calcularIdade(data_nascimento);
        if (idade < 12 || idade > 100) {
            exibirErro(msgGeral, "Idade permitida: entre 12 e 100 anos.");
            return;
        }

        // 3. Validação de CPF
        const cpfLimpo = limparNumero(cpfRaw);
        if (!validarCPF(cpfLimpo)) {
            exibirErro(msgGeral, "CPF inválido.");
            return;
        }

        // 4. Validação de Senha Forte
        if (!validarSenhaForte(senha)) {
            const erroSenha = "A senha deve ter 8+ caracteres, incluir maiúscula, minúscula, número e caractere especial.";
            exibirErro(msgSenha || msgGeral, erroSenha);
            return;
        }

        // 5. Confirmação de Senha
        if (senha !== confirma) {
            exibirErro(msgGeral, "As senhas não coincidem.");
            return;
        }

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
                    telefone: limparNumero(telefoneRaw), 
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

            // Salva dados e redireciona
            localStorage.setItem('usuario', JSON.stringify(resultado.usuario));
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