// FUNÇÕES AUXILIARES

// Remove tudo que não é número
function limparNumero(valor) {
    return valor.replace(/\D/g, '');
}

// Validação real de CPF
function validarCPF(cpf) {
    var Soma = 0;
    var Resto;

    var strCPF = String(cpf).replace(/[^\d]/g, '');

    if (strCPF.length !== 11)
        return false;

    if ([
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999',
        ].indexOf(strCPF) !== -1)
        return false;

    for (var i = 1; i <= 9; i++)
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);

    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)) 
        Resto = 0;

    if (Resto != parseInt(strCPF.substring(9, 10)))
        return false;

    Soma = 0;

    for (var i = 1; i <= 10; i++)
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);

    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)) 
        Resto = 0;

    if (Resto != parseInt(strCPF.substring(10, 11)))
        return false;

    return true;
}

// Validação simples telefone (10 ou 11 dígitos)
function validarTelefone(tel) {
    const numero = limparNumero(tel);
    return numero.length >= 10 && numero.length <= 11;
}


// ELEMENTOS DO DOM
// CORREÇÃO: Definindo os elementos para que o script possa manipulá-los
const formularioCadastro = document.getElementById('formCadastro');
const formularioLogin = document.getElementById('formLogin'); // Certifique-se que o id no login.html seja este
const mensagem = document.getElementById('mensagem');
const mensagem2 = document.getElementById('mensagem2');


// CADASTRO

if (formularioCadastro) {
    formularioCadastro.addEventListener('submit', async function(event) {
        event.preventDefault();

        const senha = document.getElementById('passwordCadastro').value;
        const confirma = document.getElementById('confirmarSenhaCadastro').value;
        const data_nascimento = document.getElementById('dataNascimentoCadastro').value;
        const nome = document.getElementById('nomeCompletocadastro').value.trim();
        const email = document.getElementById('emailCadastro').value.trim();
        const cpfInput = document.getElementById('cpfCadastro').value;
        const telefoneInput = document.getElementById('telefoneCadastro').value;

        const cpf = limparNumero(cpfInput);
        const telefone = limparNumero(telefoneInput);

        if(mensagem) mensagem.style.display = 'none';
        if(mensagem2) mensagem2.style.display = 'none';

        
        // NOME
        
        const regexNome = /^[A-Za-zÀ-ÿ\s]{3,}$/;

        if (!regexNome.test(nome)) {
            mensagem.textContent = "Nome inválido.";
            mensagem.style.display = 'block';
            return;
        }

// DATA (Mínimo 12 anos, Máximo 120 anos)
        
        const dataNascimento = new Date(data_nascimento);
        const hoje = new Date();
        
        // Cálculo da idade
        let idade = hoje.getFullYear() - dataNascimento.getFullYear();
        const m = hoje.getMonth() - dataNascimento.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < dataNascimento.getDate())) {
            idade--;
        }

        // Validação básica de data válida e no passado
        if (!data_nascimento || isNaN(dataNascimento.getTime()) || dataNascimento > hoje) {
            mensagem.textContent = "Data de nascimento inválida.";
            mensagem.style.display = 'block';
            return;
        }

        // Validação de intervalo de idade
        if (idade < 12) {
            mensagem.textContent = "Você deve ter pelo menos 12 anos.";
            mensagem.style.display = 'block';
            return;
        }

        if (idade > 120) {
            mensagem.textContent = "Data de nascimento inválida (máximo 120 anos).";
            mensagem.style.display = 'block';
            return;
        }

        
        // CPF
        
        if (!validarCPF(cpf)) {
            mensagem.textContent = "CPF inválido.";
            mensagem.style.display = 'block';
            return;
        }

        
        // TELEFONE
        
        if (!validarTelefone(telefone)) {
            mensagem.textContent = "Telefone inválido.";
            mensagem.style.display = 'block';
            return;
        }

        
        // SENHA
        
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

        const dados = {
            nome_completo: nome,
            data_nascimento: data_nascimento,
            email: email,
            cpf: cpf,
            telefone: telefone,
            password: senha
        };

        try {
            const resposta = await fetch("http://localhost:8000/cadastrar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (resultado.erro) {
                mensagem.textContent = resultado.erro;
                mensagem.style.display = 'block';
            } else {
                window.location.href = "../login/login.html";
            }

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

            if (resultado.erro) {
                mensagem3.textContent = resultado.erro;
                mensagem3.style.display = 'block';
            } else {
                
                if (resultado.token) {
                    localStorage.setItem('token', resultado.token);
                }

                localStorage.setItem('usuario', JSON.stringify(resultado.usuario));

                window.location.href = "../home/home.html";
            }

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