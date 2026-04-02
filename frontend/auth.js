const formularioCadastro = document.getElementById('formCadastro');
const formularioLogin = document.getElementById('formLogin')
const mensagem = document.getElementById('mensagem');
const mensagem2 = document.getElementById('mensagem2')
const mensagem3 = document.getElementById('mensagem3')


if (formularioCadastro) {
    formularioCadastro.addEventListener('submit', function(event) {
    // 1. ISSO É O MAIS IMPORTANTE:
    // Impede o formulário de tentar ir para o "action", evitando o erro 405
    event.preventDefault(); 
        const senha = document.getElementById('passwordCadastro').value;
        const confirma = document.getElementById('confirmarSenhaCadastro').value;

        if (senha !== confirma) {
            mensagem.style.display = 'block';
        } else if (senha.length < 8){
            mensagem2.style.display = 'block'           
        } else {
            // 2. O Redirecionamento Manual:
            // Como você está na pasta /cadastro/, se o login estiver uma pasta atrás:
            window.location.href = "../login/login.html"; 
            
            // Se estiverem na mesma pasta, use apenas:
            // window.location.href = "login.html";
        }
    }
);}
if (formularioLogin){
formularioLogin.addEventListener('submit', function(event) {

    event.preventDefault();
        const email = document.getElementById('emailLogin').value;
        const senha = document.getElementById('passwordLogin').value;


    if (email == '' || senha == ''){
        mensagem3.style.display = 'block';
    }

        
    


});}