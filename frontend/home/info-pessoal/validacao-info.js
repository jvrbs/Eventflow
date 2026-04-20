// Captura dos elementos do formulário
const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const inputTelefone = document.getElementById('telefone');
const inputDataNascimento = document.getElementById('dataNascimento');
const inputIdade = document.getElementById('idade');
const msgValidacao = document.getElementById('mensagemValidacao');
const formInfo = document.getElementById('formInfo');

// Limites de idade (Sincronizado com o cadastro)
const IDADE_MINIMA = 12;
const IDADE_MAXIMA = 120;

// MÁSCARA DE TELEFONE: (00) 00000-0000
inputTelefone.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos
    
    // Aplica a formatação
    if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 5) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
        value = value.replace(/^(\d*)/, '($1');
    }
    e.target.value = value;
});

// Função para exibir mensagens com o estilo que criamos no CSS
function exibirMensagem(texto, tipo) {
    msgValidacao.textContent = texto;
    msgValidacao.className = "mensagem-validacao " + (tipo === 'erro' ? 'msg-erro' : 'msg-sucesso');
    msgValidacao.style.display = 'block';
}

// Preencher dados ao carregar a página
function preencherDadosUsuario() {
    // getUsuarioLogado deve estar no session.js
    const usuario = typeof getUsuarioLogado === 'function' ? getUsuarioLogado('../../login/login.html') : JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario) return;

    if (usuario.nome_completo || usuario.nome) inputNome.value = usuario.nome_completo || usuario.nome;
    if (usuario.email) inputEmail.value = usuario.email;
    if (usuario.telefone) {
        inputTelefone.value = usuario.telefone;
        // Dispara o evento input para aplicar a máscara no dado que vem do banco
        inputTelefone.dispatchEvent(new Event('input'));
    }
    
    if (usuario.data_nascimento) {
        const dataFormatada = usuario.data_nascimento.split('T')[0]; // Garante formato YYYY-MM-DD
        inputDataNascimento.value = dataFormatada;
        inputIdade.value = calcularIdade(dataFormatada);
    }
}

preencherDadosUsuario();

// Cálculo de idade
function calcularIdade(dataNascimento) {
    if (!dataNascimento) return 0;
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    
    let idade = hoje.getFullYear() - nascimento.getUTCFullYear();
    const mes = hoje.getMonth() - nascimento.getUTCMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getUTCDate())) {
        idade--;
    }
    return idade;
}

// Atualiza idade quando a data muda
inputDataNascimento.addEventListener('change', () => {
    inputIdade.value = calcularIdade(inputDataNascimento.value);
});

// Validação no envio
formInfo.addEventListener('submit', async function(event) {
    event.preventDefault(); 
    
    const idade = parseInt(inputIdade.value, 10);
    const email = inputEmail.value.trim();
    const nome = inputNome.value.trim();
    const telefone = inputTelefone.value.replace(/\D/g, ''); 

    // 1. Validações de Frontend
    if (nome.length < 3) {
        exibirMensagem("O nome deve ter no mínimo 3 caracteres.", "erro");
        return;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
        exibirMensagem("Por favor, insira um e-mail válido.", "erro");
        return;
    }

    if (idade < IDADE_MINIMA || idade > IDADE_MAXIMA) {
        exibirMensagem(`Idade permitida: entre ${IDADE_MINIMA} e ${IDADE_MAXIMA} anos.`, "erro");
        return;
    }

    // 2. Preparação do Envio
    const btnSalvar = formInfo.querySelector('.btn-salvar');
    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    const dadosAtualizados = {
        nome_completo: nome,
        email: email,
        telefone: telefone,
        data_nascimento: inputDataNascimento.value
    };

    try {
        // Recupera o usuário para pegar o ID
        const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));
        if (!usuarioLogado || !usuarioLogado.id) {
            throw new Error("Usuário não identificado. Faça login novamente.");
        }

        // 3. Chamada para o Backend (FastAPI)
        const resposta = await fetch(`http://localhost:8000/atualizar-perfil/${usuarioLogado.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosAtualizados)
        });

        const resultado = await resposta.json();

        if (resultado.erro) {
            exibirMensagem(resultado.erro, "erro");
        } else {
            exibirMensagem("Informações atualizadas com sucesso!", "sucesso");
            
            // Atualiza o localStorage para manter a sessão em dia
            const novoUsuario = { ...usuarioLogado, ...dadosAtualizados };
            localStorage.setItem('usuario', JSON.stringify(novoUsuario));
        }

    } catch (erro) {
        exibirMensagem(erro.message || "Erro ao conectar com o servidor.", "erro");
    } finally {
        // Reativa o botão independente de sucesso ou erro
        btnSalvar.disabled = false;
        btnSalvar.textContent = "Salvar Alterações";
    }
});