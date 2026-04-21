// --- 1. CONFIGURAÇÃO E FUNÇÕES AUXILIARES ---

const API_URL = "http://localhost:8000";

// Remove caracteres não numéricos (útil para CPF e Telefone)
function limparNumero(valor) {
    return valor.replace(/\D/g, '');
}

// TAREFA PESSOA 2: Função de idade com correção de fuso horário
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

// Validação de CPF (Regra de negócio do backend)
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

// --- 2. ELEMENTOS DO DOM ---

const formularioCadastro = document.getElementById('formCadastro');
const formularioLogin = document.getElementById('formLogin');
const msgGeral = document.getElementById('mensagem');    // Span para erros gerais
const msgSenha = document.getElementById('mensagem2');   // Span para senha fraca
const msgLogin = document.getElementById('mensagem3');   // Span para erro de login

// --- 3. LÓGICA DE CADASTRO ---

if (formularioCadastro) {
    formularioCadastro.addEventListener('submit', async function(event) {
        event.preventDefault();

        const nome = document.getElementById('nomeCompletocadastro')?.value.trim() || '';
        const email = document.getElementById('emailCadastro')?.value.trim() || '';
        const data_nascimento = document.getElementById('dataNascimentoCadastro')?.value || '';
        const cpf = limparNumero(document.getElementById('cpfCadastro')?.value || '');
        const telefone = limparNumero(document.getElementById('telefoneCadastro')?.value || '');
        const senha = document.getElementById('passwordCadastro')?.value || '';
        const confirma = document.getElementById('confirmarSenhaCadastro')?.value || '';

        // Limpa mensagens anteriores
        if (msgGeral) msgGeral.style.display = 'none';
        if (msgSenha) msgSenha.style.display = 'none';

        // Validações de Frontend
        if (nome.length < 3) {
            msgGeral.textContent = "Nome inválido (mínimo 3 caracteres).";
            msgGeral.style.display = 'block';
            return;
        }

        const idade = calcularIdade(data_nascimento);
        if (idade < 12 || idade > 100) {
            msgGeral.textContent = "Idade permitida: entre 12 e 100 anos.";
            msgGeral.style.display = 'block';
            return;
        }

        if (!validarCPF(cpf)) {
            msgGeral.textContent = "CPF inválido.";
            msgGeral.style.display = 'block';
            return;
        }

        if (senha !== confirma) {
            msgGeral.textContent = "As senhas não coincidem.";
            msgGeral.style.display = 'block';
            return;
        }

        // Envio para API FastAPI
        try {
            const resposta = await fetch(`${API_URL}/cadastrar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome_completo: nome,
                    data_nascimento: data_nascimento,
                    email: email,
                    cpf: cpf,
                    telefone: telefone,
                    password: senha
                })
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                msgGeral.textContent = resultado.detail || "Erro ao cadastrar.";
                msgGeral.style.display = 'block';
                return;
            }

            // Sucesso: Redireciona para login
            window.location.href = "../login/login.html";

        } catch (erro) {
            msgGeral.textContent = "Erro ao conectar com o servidor.";
            msgGeral.style.display = 'block';
        }
    });
}

// --- 4. LÓGICA DE LOGIN (INTEGRADO COM PERFIL) ---

if (formularioLogin) {
    formularioLogin.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('emailLogin').value.trim();
        const senha = document.getElementById('passwordLogin').value.trim();
        const botao = formularioLogin.querySelector('button');

        if (msgLogin) msgLogin.style.display = 'none';

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

            // REGRAS DO PROMPT: Salvar usuário e definir fluxo por perfil
            localStorage.setItem('usuario', JSON.stringify(resultado.usuario));

            // Redirecionamento unificado (a home tratará o que exibir via JS)
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
    localStorage.removeItem('usuario');
    window.location.href = "../../inicial/index.html";
}