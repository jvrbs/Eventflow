// conta.js
document.addEventListener('DOMContentLoaded', function() {
    const usuario = getUsuarioLogado('../../login/login.html');

    if (usuario) {
        const primeiraLetra = usuario.nome_completo.charAt(0).toUpperCase();
        
        document.querySelector('.avatar-image').textContent = primeiraLetra;
        document.querySelector('.avatar-topo h2').textContent = `Olá, ${usuario.nome_completo.split(' ')[0]}!`;
    }
});