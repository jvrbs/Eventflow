// 1. ELEMENTOS DO DOM
const btnMenu = document.getElementById('btnMenu');
const headerPill = document.getElementById('headerPill');
const overlay = document.getElementById('overlay');

// 2. CONTROLE DE ACESSO E PERFIL (O coração da Home)
document.addEventListener('DOMContentLoaded', () => {
    // Busca o usuário que salvamos no auth.js
    const dadosUsuario = localStorage.getItem('usuario'); 

    // Se não houver ninguém logado, manda de volta pro login
    if (!dadosUsuario) {
        window.location.href = '../login/login.html';
        return;
    }

    const usuario = JSON.parse(dadosUsuario);

    // FLUXO POR PERFIL: Define o que mostrar na tela
    if (usuario.perfil === "organizador") {
        console.log("Modo Organizador: Painel de gestão carregado.");
        // Futuramente: mostrarBotaoCriarEvento();
    } else {
        console.log("Modo Participante: Lista de eventos carregada.");
        // Futuramente: carregarEventosEInscricoes();
    }
});

// 3. MENU HAMBÚRGUER (Aparência)
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