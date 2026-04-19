const btnMenu = document.getElementById('btnMenu');
const headerPill = document.getElementById('headerPill');

// Check user login on home page
if (window.location.pathname.includes('home.html')) {
    const usuario = getUsuarioLogado();
}

if (btnMenu) {
    btnMenu.addEventListener('click', () => {
        // Toggle pill expansion
        headerPill.classList.toggle('expandido');
    });
}