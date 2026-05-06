// Get logged-in user from localStorage or redirect to login
function getUsuarioLogado(redirectSePath = '../login/login.html') {
    const raw = localStorage.getItem('usuario');

    if (!raw) {
        window.location.href = redirectSePath;
        return null;
    }

    const usuario = JSON.parse(raw);
    const duasHoras = 2 * 60 * 60 * 1000; // 7.200.000 ms

    // Verifica se "logado_em" não existe (sessões antigas) ou se já expirou
    if (!usuario.logado_em || (Date.now() - usuario.logado_em) > duasHoras) {
        logout(redirectSePath);
        return null;
    }

    return usuario;
}

// Clear session and redirect
function logout(redirectPath = '../login/login.html') {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = redirectPath;
}