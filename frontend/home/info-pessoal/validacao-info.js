// Captura dos elementos
const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const inputTelefone = document.getElementById('telefone');
const inputDataNascimento = document.getElementById('dataNascimento');
const inputIdade = document.getElementById('idade');
const msgValidacao = document.getElementById('mensagemValidacao');
const formInfo = document.getElementById('formInfo');

const IDADE_MINIMA = 12;
const IDADE_MAXIMA = 120;

// Máscara de Telefone
inputTelefone.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 10) value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    else if (value.length > 5) value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    else if (value.length > 2) value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    else if (value.length > 0) value = value.replace(/^(\d*)/, '($1');
    e.target.value = value;
});

function exibirMensagem(texto, tipo) {
    if (!msgValidacao) return;
    msgValidacao.textContent = texto;
    msgValidacao.className = "mensagem-validacao " + (tipo === 'erro' ? 'msg-erro' : 'msg-sucesso');
    msgValidacao.style.display = 'block';
}

// TAREFA PESSOA 2: Padronização do cálculo de idade
function calcularIdade(dataNascimento) {
    if (!dataNascimento) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    nascimento.setMinutes(nascimento.getMinutes() + nascimento.getTimezoneOffset());

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
}

// TAREFA PESSOA 2: Blindagem contra nulos ao preencher dados
function preencherDadosUsuario() {
    const usuario = typeof getUsuarioLogado === 'function' 
        ? getUsuarioLogado('../../login/login.html') 
        : JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario) return;

    inputNome.value = usuario.nome_completo || usuario.nome || "";
    inputEmail.value = usuario.email || "";
    if (usuario.telefone) {
        inputTelefone.value = usuario.telefone;
        inputTelefone.dispatchEvent(new Event('input'));
    }
    if (usuario.data_nascimento) {
        const dataFormatada = usuario.data_nascimento.split('T')[0];
        inputDataNascimento.value = dataFormatada;
        inputIdade.value = calcularIdade(dataFormatada);
    }
}

preencherDadosUsuario();

inputDataNascimento.addEventListener('change', () => {
    inputIdade.value = calcularIdade(inputDataNascimento.value);
});

formInfo.addEventListener('submit', async function(event) {
    event.preventDefault(); 
    
    const idade = calcularIdade(inputDataNascimento.value);
    const email = inputEmail.value.trim();
    const nome = inputNome.value.trim();
    const telefone = inputTelefone.value.replace(/\D/g, ''); 

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

    const btnSalvar = formInfo.querySelector('.btn-salvar');
    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    try {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));
        if (!usuarioLogado || !usuarioLogado.id) throw new Error("Sessão expirada.");

        const resposta = await fetch(`http://localhost:8000/atualizar-perfil/${usuarioLogado.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome_completo: nome,
                email: email,
                telefone: telefone,
                data_nascimento: inputDataNascimento.value
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
        let mensagem = "Erro ao salvar.";
        if (resultado.detail) {
            if (Array.isArray(resultado.detail)) {
                mensagem = resultado.detail.map(err => err.msg).join(" | ");
            } else {
                mensagem = resultado.detail;
            }
        }
        exibirMensagem(mensagem, "erro");
        return;
    }

        exibirMensagem("Informações atualizadas!", "sucesso");
        localStorage.setItem('usuario', JSON.stringify({
            ...usuarioLogado,
            nome_completo: nome,
            email,
            telefone,
            data_nascimento: inputDataNascimento.value
        }));
    } catch (erro) {
        exibirMensagem(erro.message || "Erro de conexão.", "erro");
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = "Salvar Alterações";
    }
});