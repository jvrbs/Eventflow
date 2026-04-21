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
document.getElementById('btnFinalExcluir')?.addEventListener('click', async () => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));
    if (!usuarioLogado || !usuarioLogado.id) {
        fecharModal();
        logout('../../inicial/index.html');
        return;
    }

    const btnConfirmar = document.getElementById('btnFinalExcluir');
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = "Excluindo...";

    try {
        const resposta = await fetch(`http://localhost:8000/deletar-conta/${usuarioLogado.id}`, {
            method: "DELETE"
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            const msgErro = document.querySelector('.modal-content p');
            if (msgErro) msgErro.textContent = resultado.detail || "Erro ao deletar conta. Tente novamente.";
            return;
        }

        localStorage.removeItem('usuario');
        window.location.href = '../../inicial/index.html';

    } catch (erro) {
        const msgErro = document.querySelector('.modal-content p');
        if (msgErro) msgErro.textContent = "Erro ao conectar com o servidor.";
    } finally {
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = "Confirmar Exclusão";
    }
});