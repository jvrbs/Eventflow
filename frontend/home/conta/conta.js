// Display user profile initials and greeting
document.addEventListener('DOMContentLoaded', function() {
    // 1. Busca o usuário com proteção de redirecionamento
    const usuario = getUsuarioLogado('../../login/login.html');

    // 2. Captura os elementos com Optional Chaining para evitar erros se não existirem
    const avatarImg = document.querySelector('.avatar-image');
    const boasVindas = document.querySelector('.avatar-topo h2');

    // 3. TAREFA PESSOA 2: Blindagem contra Null/Undefined (Null Pointer Protection)
    if (usuario && usuario.nome_completo) {
        const nomeParaExibir = usuario.nome_completo.trim();
        const primeiraLetra = nomeParaExibir.charAt(0).toUpperCase();
        const primeiroNome = nomeParaExibir.split(' ')[0];

        if (avatarImg) avatarImg.textContent = primeiraLetra;
        if (boasVindas) boasVindas.textContent = `Olá, ${primeiroNome}!`;
    } else {
        // Fallback: Caso o nome venha nulo, a página não quebra
        if (avatarImg) avatarImg.textContent = "?";
        if (boasVindas) boasVindas.textContent = "Olá, Usuário!";
        console.warn("Dados do usuário incompletos no LocalStorage.");
    }
});

// --- LÓGICA DO MODAL DE EXCLUSÃO (Customizado sem alert) ---

const modal = document.getElementById('modalExcluir');

// Abre o modal quando clicar no link de excluir
function abrirModalExcluir(event) {
    if (event) event.preventDefault();
    if (modal) modal.style.display = 'flex';
}

// Fecha o modal
function fecharModal() {
    if (modal) modal.style.display = 'none';
}

// Fecha se o usuário clicar fora da caixa branca (na área escura)
window.onclick = function(event) {
    if (event.target == modal) {
        fecharModal();
    }
}

// Evento do botão de confirmação final (Preparado para o CRUD futuro)
document.getElementById('btnFinalExcluir')?.addEventListener('click', () => {
    // TAREFA PESSOA 3: Aqui será inserido o fetch(..., { method: 'DELETE' })
    console.log("Ação de exclusão disparada. Aguardando integração com API.");
    
    // Por enquanto, apenas fecha o modal
    fecharModal();
});