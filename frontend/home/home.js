const btnMenu = document.getElementById('btnMenu');
const headerPill = document.getElementById('headerPill');

const usuario = getUsuarioLogado();


btnMenu.addEventListener('click', () => {
    // Liga e desliga a expansão da pílula
    headerPill.classList.toggle('expandido');
});