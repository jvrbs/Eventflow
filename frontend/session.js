// Get logged-in user from localStorage or redirect to login
function getUsuarioLogado(redirectSePath = '../login/login.html') {
    const raw = localStorage.getItem('usuario');

    if (!raw) {
        window.location.href = redirectSePath;
        return null;
    }

    return JSON.parse(raw);
}

// Clear session and redirect
function logout(redirectPath = '../inicial/index.html') {
    localStorage.removeItem('usuario');
    window.location.href = redirectPath;
}