const btnMenu    = document.getElementById('btnMenu');
const headerPill = document.getElementById('headerPill');
const overlay    = document.getElementById('overlay');

// ── Botão flutuante "Criar Evento" apenas para organizadores ──────────────────
const usuario = getUsuarioLogado();

if (usuario && usuario.perfil === 'organizador') {
    const fab = document.createElement('a');
    fab.href      = 'criar-evento.html';
    fab.id        = 'fabCriarEvento';
    fab.textContent = '+ Criar Evento';
    // CSS variables não funcionam em inline style — usa hex direto
    fab.style.cssText = `
        position: fixed;
        bottom: 32px;
        right: 32px;
        z-index: 900;
        background: #FF6B00;
        color: #fff;
        font-weight: 800;
        font-size: 0.95rem;
        padding: 14px 24px;
        border-radius: 50px;
        text-decoration: none;
        box-shadow: 0 6px 20px rgba(255,107,0,0.45);
        transition: transform 0.2s, filter 0.2s;
        display: inline-block;
    `;
    fab.addEventListener('mouseenter', () => {
        fab.style.transform = 'translateY(-3px)';
        fab.style.filter    = 'brightness(1.1)';
    });
    fab.addEventListener('mouseleave', () => {
        fab.style.transform = '';
        fab.style.filter    = '';
    });
    document.body.appendChild(fab);
}

// ── Menu hambúrguer ───────────────────────────────────────────────────────────
if (btnMenu) {
    btnMenu.addEventListener('click', () => {
        headerPill.classList.toggle('expandido');
        if (overlay) overlay.classList.toggle('active');
    });
}

if (overlay) {
    overlay.addEventListener('click', () => {
        headerPill.classList.remove('expandido');
        overlay.classList.remove('active');
    });
}