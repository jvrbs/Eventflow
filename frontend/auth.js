const formulario = document.getElementById('formCadastro');

formulario.addEventListener('submit', function(event) {
    // 1. ISSO É O MAIS IMPORTANTE:
    // Impede o formulário de tentar ir para o "action", evitando o erro 405
    event.preventDefault(); 

    const senha = document.getElementById('senhaCadastro').value;
    const confirma = document.getElementById('confirmarSenhaCadastro').value;

    if (senha !== confirma) {
        alert("As senhas não coincidem!");
    } else {
        alert("Cadastro realizado com sucesso!");
        
        // 2. O Redirecionamento Manual:
        // Como você está na pasta /cadastro/, se o login estiver uma pasta atrás:
        window.location.href = "../login/login.html"; 
        
        // Se estiverem na mesma pasta, use apenas:
        // window.location.href = "login.html";
    }
});