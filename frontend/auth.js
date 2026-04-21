// --- FUNÇÕES AUXILIARES (As ferramentas do topo) ---

function limparNumero(valor) {
    return valor.replace(/\D/g, '');
}

// TAREFA PESSOA 2: Função de idade precisa e acessível
function calcularIdade(dataNasc) {
    if (!dataNasc) return -1;
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    
    // CORREÇÃO FUSO HORÁRIO: Garante que a data seja tratada no fuso local
    nascimento.setMinutes(nascimento.getMinutes() + nascimento.getTimezoneOffset());

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
}

function validarCPF(cpf) {
    // ... seu código de CPF atual está perfeito aqui ...
    var Soma = 0; var Resto;
    var strCPF = String(cpf).replace(/[^\d]/g, '');
    if (strCPF.length !== 11) return false;
    if (['00000000000','11111111111','22222222222','33333333333','44444444444','55555555555','66666666666','77777777777','88888888888','99999999999'].indexOf(strCPF) !== -1) return false;
    for (var i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;
    if ((Resto == 10) || (Resto == 11)) Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10))) return false;
    Soma = 0;
    for (var i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;
    if ((Resto == 10) || (Resto == 11)) Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11))) return false;
    return true;
}

function validarTelefone(tel) {
    const numero = limparNumero(tel);
    return numero.length >= 10 && numero.length <= 11;
}

// --- ELEMENTOS DO DOM ---
const formularioCadastro = document.getElementById('formCadastro');
const formularioLogin = document.getElementById('formLogin');
const mensagem = document.getElementById('mensagem');
const mensagem2 = document.getElementById('mensagem2');

// --- CADASTRO ---
if (formularioCadastro) {
    formularioCadastro.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Pegando valores e tratando possíveis nulos (Blindagem)
        const senha = document.getElementById('passwordCadastro')?.value || '';
        const confirma = document.getElementById('confirmarSenhaCadastro')?.value || '';
        const data_nascimento = document.getElementById('dataNascimentoCadastro')?.value || '';
        const nome = document.getElementById('nomeCompletocadastro')?.value.trim() || '';
        const email = document.getElementById('emailCadastro')?.value.trim() || '';
        const cpf = limparNumero(document.getElementById('cpfCadastro')?.value || '');
        const telefone = limparNumero(document.getElementById('telefoneCadastro')?.value || '');

        if(mensagem) mensagem.style.display = 'none';
        if(mensagem2) mensagem2.style.display = 'none';

        // Validação Nome
        const regexNome = /^[A-Za-zÀ-ÿ\s]{3,}$/;
        if (!regexNome.test(nome)) {
            mensagem.textContent = "Nome inválido.";
            mensagem.style.display = 'block';
            return;
        }

        // Validação Data (Usando a ferramenta do topo)
        const idade = calcularIdade(data_nascimento);
        if (!data_nascimento || idade < 0) {
            mensagem.textContent = "Data de nascimento inválida.";
            mensagem.style.display = 'block';
            return;
        }
        if (idade < 12) {
            mensagem.textContent = "Você deve ter pelo menos 12 anos.";
            mensagem.style.display = 'block';
            return;
        }
        if (idade > 100) {
            mensagem.textContent = "Data de nascimento inválida (máximo 100 anos).";
            mensagem.style.display = 'block';
            return;
        }

        // Validação CPF, Telefone e Senha (Seu código original continua aqui...)
        if (!validarCPF(cpf)) {
            mensagem.textContent = "CPF inválido.";
            mensagem.style.display = 'block';
            return;
        }
        if (!validarTelefone(telefone)) {
            mensagem.textContent = "Telefone inválido.";
            mensagem.style.display = 'block';
            return;
        }
        if (senha !== confirma) {
            mensagem.textContent = "As senhas não coincidem.";
            mensagem.style.display = 'block';
            return;
        }

        const regexSenha = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!regexSenha.test(senha)) {
            mensagem2.textContent = "Senha fraca.";
            mensagem2.style.display = 'block';
            return;
        }

        // Envio para o servidor
        // PARA:
        try {
            const resposta = await fetch("http://localhost:8000/cadastrar", {
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
                mensagem.textContent = resultado.detail || "Erro ao cadastrar.";
                mensagem.style.display = 'block';
                return;
            }

            window.location.href = "../login/login.html";

        } catch (erro) {
            mensagem.textContent = "Erro ao conectar com o servidor.";
            mensagem.style.display = 'block';
        }
    });
}

// LOGIN

if (formularioLogin) {
    formularioLogin.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('emailLogin').value.trim();
        const senha = document.getElementById('passwordLogin').value.trim();
        const mensagem3 = document.getElementById('mensagem3');
        const botao = formularioLogin.querySelector('button');

        if(mensagem3) mensagem3.style.display = 'none';

        if (!email || !senha) {
            mensagem3.textContent = "Preencha todos os campos.";
            mensagem3.style.display = 'block';
            return;
        }

        botao.disabled = true;
        botao.textContent = "Entrando...";

        try {
            const resposta = await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: senha })
            });

            if (!resposta.ok) throw new Error();

            const resultado = await resposta.json();

            if (!resposta.ok) {
                mensagem3.textContent = resultado.detail || "Email ou senha incorretos.";
                mensagem3.style.display = 'block';
                return;
            }

            if (resultado.token) localStorage.setItem('token', resultado.token);
            localStorage.setItem('usuario', JSON.stringify(resultado.usuario));
            window.location.href = "../home/home.html";

        } catch (erro) {
            if(mensagem3) {
                mensagem3.textContent = "Erro ao fazer login.";
                mensagem3.style.display = 'block';
            }
        } finally {
            botao.disabled = false;
            botao.textContent = "Entrar";
        }
    });
}