// Captura os elementos
const inputNome = document.getElementById('nome');
const inputDataNascimento = document.getElementById('dataNascimento');
const inputIdade = document.getElementById('idade');
const msgValidacao = document.getElementById('mensagemValidacao');
const formInfo = document.getElementById('formInfo');

// Define os limites de idade (mínimo 16, máximo 120)
const IDADE_MINIMA = 16;
const IDADE_MAXIMA = 80;

// Função para calcular a idade
function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const dataNasc = new Date(dataNascimento);
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const m = hoje.getMonth() - dataNasc.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < dataNasc.getDate())) {
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