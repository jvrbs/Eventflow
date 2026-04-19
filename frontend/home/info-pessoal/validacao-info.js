// Get form elements
const inputNome = document.getElementById('nome');
const inputDataNascimento = document.getElementById('dataNascimento');
const inputIdade = document.getElementById('idade');
const msgValidacao = document.getElementById('mensagemValidacao');
const formInfo = document.getElementById('formInfo');

// Age limits: min 16, max 80
const IDADE_MINIMA = 16;
const IDADE_MAXIMA = 80;

// Format date for input type="date"
function formatarDataParaInput(data) {
    if (!data) return '';
    
    // Return if already formatted
    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return data;
    }
    
    // Convert other formats
    const d = new Date(data);
    
    if (isNaN(d.getTime())) {
        return '';
    }
    
    // Use toISOString to avoid timezone issues
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

// Calculate age handling timezone
function calcularIdade(dataNascimento) {
    let ano, mes, dia;
    
    // Check YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)) {
        [ano, mes, dia] = dataNascimento.split('-').map(Number);
    } else {
        // Convert to Date and extract values
        const d = new Date(dataNascimento);
        if (isNaN(d.getTime())) {
            return 0;
        }
        // Use UTC to avoid timezone issues
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

// Update age when birth date changes
inputDataNascimento.addEventListener('change', () => {
    const dataDigitada = inputDataNascimento.value;
    inputIdade.value = calcularIdade(dataDigitada);
});

// Validate on form submission
formInfo.addEventListener('submit', function(event) {
    const idade = parseInt(inputIdade.value, 10);
    msgValidacao.textContent = ""; // Clear previous messages

    if (idade < IDADE_MINIMA) {
        event.preventDefault(); // Prevent submission
        msgValidacao.textContent = `A idade mínima para cadastro é ${IDADE_MINIMA} anos.`;
    } else if (idade > IDADE_MAXIMA) {
        event.preventDefault(); // Prevent submission
        msgValidacao.textContent = `Por favor, verifique a idade informada (máxima de ${IDADE_MAXIMA} anos).`;
    } else {
        // Success! Backend handles rest
        alert("Informações salvas com sucesso (simulado).");
    }
});