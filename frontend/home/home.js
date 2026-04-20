const btnMenu = document.getElementById('btnMenu');
const headerPill = document.getElementById('headerPill');
const overlay = document.getElementById('overlay');

// Check user login on home page
if (window.location.pathname.includes('home.html')) {
    const usuario = getUsuarioLogado();
}

if (btnMenu) {
    btnMenu.addEventListener('click', () => {
        headerPill.classList.toggle('expandido');
        if (overlay) overlay.classList.toggle('active');
    });
}

// Fecha ao clicar no overlay
if (overlay) {
    overlay.addEventListener('click', () => {
        headerPill.classList.remove('expandido');
        overlay.classList.remove('active');
    });
}