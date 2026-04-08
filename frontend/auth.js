const formularioCadastro = document.getElementById('formCadastro');
const formularioLogin = document.getElementById('formLogin');
const mensagem = document.getElementById('mensagem');
const mensagem2 = document.getElementById('mensagem2');

if (formularioCadastro) {
    formularioCadastro.addEventListener('submit', async function(event) {
        event.preventDefault();

        const senha = document.getElementById('passwordCadastro').value;
        const confirma = document.getElementById('confirmarSenhaCadastro').value;

        // Esconde mensagens anteriores
        mensagem.style.display = 'none';
        mensagem2.style.display = 'none';

        if (senha !== confirma) {
            mensagem.style.display = 'block';
            return;
        }
        if (senha.length < 8) {
            mensagem2.style.display = 'block';
            return;
        }

        const dados = {
            nome_completo: document.getElementById('nomeCompletocadastro').value,
            data_nascimento: document.getElementById('dataNascimentoCadastro').value,
            email: document.getElementById('emailCadastro').value,
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
            mensagem.textContent = "Erro ao conectar com o servidor. Tente novamente.";
            mensagem.style.display = 'block';
        }
    });
}

if (formularioLogin) {
    formularioLogin.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('emailLogin').value;
        const senha = document.getElementById('passwordLogin').value;
        const mensagem3 = document.getElementById('mensagem3');

        mensagem3.style.display = 'none';

        if (email === '' || senha === '') {
            mensagem3.textContent = "Preencha o e-mail e a senha.";
            mensagem3.style.display = 'block';
            return;
        }

        const dados = {
            email: email,
            password: senha
        };

        try {
            const resposta = await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (resultado.erro) {
                mensagem3.textContent = resultado.erro;
                mensagem3.style.display = 'block';
            } else {
                window.location.href = "../home/home.html";
            }
        } catch (erro) {
            mensagem3.textContent = "Erro ao conectar com o servidor. Tente novamente.";
            mensagem3.style.display = 'block';
        }
    });
}