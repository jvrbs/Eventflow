const formularioCadastro = document.getElementById('formCadastro');
const formularioLogin = document.getElementById('formLogin')
const mensagem = document.getElementById('mensagem');
const mensagem2 = document.getElementById('mensagem2')
const mensagem3 = document.getElementById('mensagem3')
const mensagem4 = document.getElementById('mensagem4')


if (formularioCadastro) {
    formularioCadastro.addEventListener('submit', function(event) {
    // 1. ISSO É O MAIS IMPORTANTE:
    // Impede o formulário de tentar ir para o "action", evitando o erro 405
    event.preventDefault(); 
    
        // Captura todos os campos do cadastro
        const nomeCompleto = document.getElementById('nomeCompletocadastro').value.trim();
        const dataNascimento = document.getElementById('dataNascimentoCadastro').value;
        const email = document.getElementById('emailCadastro').value.trim();
        const senha = document.getElementById('passwordCadastro').value;
        const confirma = document.getElementById('confirmarSenhaCadastro').value;

        // Validação: Todos os campos preenchidos?
        if (nomeCompleto === '' || dataNascimento === '' || email === '') {
            mensagem3.style.display = 'block';
            mensagem.style.display = 'none';
            mensagem2.style.display = 'none';
            return;
        }
        
        // Validação: Senhas coincidem?
        if (senha !== confirma) {
            mensagem.style.display = 'block';
            mensagem2.style.display = 'none';
            mensagem3.style.display = 'none';
            return;
        } 
        
        // Validação: Senha tem pelo menos 8 caracteres?
        if (senha.length < 8){
            mensagem2.style.display = 'block';
            mensagem.style.display = 'none';
            mensagem3.style.display = 'none';
            return;
        }
        
        // Se todas as validações passaram, envia os dados para o backend
        enviarCadastro(nomeCompleto, dataNascimento, email, senha);
    }
);}

// Função para enviar os dados de cadastro ao backend
async function enviarCadastro(nomeCompleto, dataNascimento, email, password) {
    try {
        const response = await fetch('http://localhost:8000/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome_completo: nomeCompleto,
                data_nascimento: dataNascimento,
                email: email,
                password: password
            })
        });

        const dados = await response.json();

        if (response.ok) {
            // Cadastro realizado com sucesso
            mensagem4.style.display = 'block';
            mensagem.style.display = 'none';
            mensagem2.style.display = 'none';
            mensagem3.style.display = 'none';
            
            // Aguarda um pouco antes de redirecionar
            setTimeout(() => {
                window.location.href = "../login/login.html";
            }, 2000);
        } else {
            // Erro no cadastro
            mensagem3.textContent = 'Erro: ' + (dados.erro || 'Erro ao cadastrar');
            mensagem3.style.display = 'block';
            mensagem.style.display = 'none';
            mensagem2.style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao conectar com o servidor:', error);
        mensagem3.textContent = 'Erro ao conectar com o servidor. Verifique se o backend está rodando.';
        mensagem3.style.display = 'block';
    }
}

if (formularioLogin){
    formularioLogin.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Captura todos os campos do formulário de login
        const email = document.getElementById('emailLogin').value.trim();
        const senha = document.getElementById('passwordLogin').value;

        // Validação: Email e senha não estão vazios?
        if (email === '' || senha === ''){
            mensagem3.style.display = 'block';
            return;
        }

        // Se as validações passaram, envia os dados para o backend
        enviarLogin(email, senha);
    });
}

// Função para enviar os dados de login ao backend
async function enviarLogin(email, password) {
    try {
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const dados = await response.json();

        if (response.ok) {
            // Login realizado com sucesso
            // Você pode armazenar o token ou dados no localStorage se necessário
            // localStorage.setItem('token', dados.token);
            
            // Redireciona para a página home
            window.location.href = "../home/home.html";
        } else {
            // Erro no login
            mensagem3.textContent = dados.erro || 'Email ou senha incorretos';
            mensagem3.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao conectar com o servidor:', error);
        mensagem3.textContent = 'Erro ao conectar com o servidor';
        mensagem3.style.display = 'block';
    }
}