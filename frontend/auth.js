const formulario = document.getElementById('formCadastro');

formulario.addEventListener('submit', function(evento) {
    

    const senha = document.getElementById('senhaCadastro').value;
    const confirma = document.getElementById('confirmarSenhaCadastro').value;

    if (senha !== confirma) {
        evento.preventDefault(); 
        
        alert("As senhas não coincidem! Por favor, verifique.");
    } else {
        alert("Cadastro realizado! Redirecionando para o login...");
    }
});