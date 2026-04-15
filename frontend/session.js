// Lê o usuário salvo no localStorage
// Retorna o objeto usuário, ou redireciona para login se não encontrar
function getUsuarioLogado(redirectSePath = '../login/login.html') {
    const raw = localStorage.getItem('usuario');

    if (!raw) {
        window.location.href = redirectSePath;
        return null;
    }

    return JSON.parse(raw);
}

// Limpa a sessão e redireciona (usar no botão "Sair")
function logout(redirectPath = '../inicial/index.html') {
    localStorage.removeItem('usuario');
    window.location.href = redirectPath;
}