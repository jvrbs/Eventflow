const btnMenu = document.getElementById('btnMenu');
const headerPill = document.getElementById('headerPill');

// Verificar se o usuário está logado apenas se estiver na página home
if (window.location.pathname.includes('home.html')) {
    const usuario = getUsuarioLogado();
}

if (btnMenu) {
    btnMenu.addEventListener('click', () => {
        // Liga e desliga a expansão da pílula
        headerPill.classList.toggle('expandido');
    });
}