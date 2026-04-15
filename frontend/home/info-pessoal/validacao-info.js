// Captura os elementos
const inputNome = document.getElementById('nome');
const inputDataNascimento = document.getElementById('dataNascimento');
const inputIdade = document.getElementById('idade');
const msgValidacao = document.getElementById('mensagemValidacao');
const formInfo = document.getElementById('formInfo');

// Define os limites de idade (mínimo 16, máximo 80)
const IDADE_MINIMA = 16;
const IDADE_MAXIMA = 80;

// Formata a data para o formato YYYY-MM-DD (necessário para input type="date")
function formatarDataParaInput(data) {
    if (!data) return '';
    
    // Se já está no formato YYYY-MM-DD, retorna como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return data;
    }
    
    // Tenta converter de outros formatos
    const d = new Date(data);
    
    if (isNaN(d.getTime())) {
        return '';
    }
    
    // Usa toISOString para evitar problemas de timezone
    return d.toISOString().split('T')[0];
}

function preencherDadosUsuario() {
    const usuario = getUsuarioLogado('../../login/login.html');
    if (!usuario) return;

    if (usuario.nome_completo) {
        inputNome.value = usuario.nome_completo;
    }

    if (usuario.data_nascimento) {
        const dataBemFormatada = formatarDataParaInput(usuario.data_nascimento);
        inputDataNascimento.value = dataBemFormatada;
        inputIdade.value = calcularIdade(usuario.data_nascimento);
    }
}

preencherDadosUsuario();

// Função para calcular a idade sem problemas de timezone
function calcularIdade(dataNascimento) {
    let ano, mes, dia;
    
    // Se está no formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)) {
        [ano, mes, dia] = dataNascimento.split('-').map(Number);
    } else {
        // Converte para Date e depois extrai os valores
        const d = new Date(dataNascimento);
        if (isNaN(d.getTime())) {
            return 0;
        }
        // Usa UTC para evitar problemas de timezone
        ano = d.getUTCFullYear();
        mes = d.getUTCMonth() + 1;
        dia = d.getUTCDate();
    }
    
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;
    const diaAtual = hoje.getDate();
    
    let idade = anoAtual - ano;
    
    if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
        idade--;
    }
    
    return idade;
}

// Escuta a mudança na data de nascimento
inputDataNascimento.addEventListener('change', () => {
    const dataDigitada = inputDataNascimento.value;
    inputIdade.value = calcularIdade(dataDigitada);
});

// Validação no Envio do Formulário
formInfo.addEventListener('submit', function(event) {
    const idade = parseInt(inputIdade.value, 10);
    msgValidacao.textContent = ""; // Limpa mensagens anteriores

    if (idade < IDADE_MINIMA) {
        event.preventDefault(); // Impede o envio
        msgValidacao.textContent = `A idade mínima para cadastro é ${IDADE_MINIMA} anos.`;
    } else if (idade > IDADE_MAXIMA) {
        event.preventDefault(); // Impede o envio
        msgValidacao.textContent = `Por favor, verifique a idade informada (máxima de ${IDADE_MAXIMA} anos).`;
    } else {
        // Sucesso! O Java cuidará do resto
        alert("Informações salvas com sucesso (simulado).");
    }
});