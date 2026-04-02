const btnMenu = document.getElementById('btnMenu');
const headerPill = document.getElementById('headerPill');

btnMenu.addEventListener('click', () => {
    // Liga e desliga a expansão da pílula
    headerPill.classList.toggle('expandido');
});