// Display user profile initials and greeting
document.addEventListener('DOMContentLoaded', function() {
    // 1. Busca o usuário com proteção de redirecionamento
    const usuario = getUsuarioLogado('../../login/login.html');

    // 2. Captura os elementos com Optional Chaining para evitar erros se não existirem
    const boasVindas = document.querySelector('.avatar-topo h2');
    const avatarInput = document.getElementById('avatarInput');
    const avatarError = document.getElementById('avatarError');
    const btnRemoverAvatar = document.getElementById('btnRemoverAvatar');

    // ── Lógica Dinâmica de Renderização do Avatar ────────────────────────────
    function renderizarAvatar(userObj) {
        const avatarImg = document.querySelector('.avatar-image');
        if (!avatarImg) return;

        if (userObj && userObj.avatar_url) {
            // Garante o fallback de host se a url for relativa
            const urlCompleta = userObj.avatar_url.startsWith('http') 
                ? userObj.avatar_url 
                : `http://localhost:8000${userObj.avatar_url}`;
            
            avatarImg.innerHTML = `<img src="${urlCompleta}" alt="Foto de Perfil">`;

            // Exibe o botão de remoção pois há avatar
            if (btnRemoverAvatar) btnRemoverAvatar.style.display = 'inline-block';
        } else if (userObj && userObj.nome_completo) {
            const nomeParaExibir = userObj.nome_completo.trim();
            const primeiraLetra = nomeParaExibir.charAt(0).toUpperCase();
            avatarImg.textContent = primeiraLetra;

            // Oculta o botão de remoção pois não há avatar
            if (btnRemoverAvatar) btnRemoverAvatar.style.display = 'none';
        } else {
            avatarImg.textContent = "?";

            // Oculta o botão de remoção no estado de fallback
            if (btnRemoverAvatar) btnRemoverAvatar.style.display = 'none';
        }
    }

    // 3. Blindagem contra Null/Undefined (Null Pointer Protection)
    if (usuario && usuario.nome_completo) {
        const nomeParaExibir = usuario.nome_completo.trim();
        const primeiroNome = nomeParaExibir.split(' ')[0];

        if (boasVindas) boasVindas.textContent = `Olá, ${primeiroNome}!`;
        renderizarAvatar(usuario);
    } else {
        // Fallback: Caso o nome venha nulo, a página não quebra
        renderizarAvatar(null);
        if (boasVindas) boasVindas.textContent = "Olá, Usuário!";
        console.warn("Dados do usuário incompletos no LocalStorage.");
    }

    // ── Lógica de Upload do Avatar ───────────────────────────────────────────
    if (avatarInput && usuario && usuario.id) {
        avatarInput.addEventListener('change', async function(e) {
            const arquivo = e.target.files[0];
            if (!arquivo) return;

            // Esconder qualquer erro persistente anterior
            if (avatarError) {
                avatarError.style.display = 'none';
                avatarError.textContent = '';
            }

            // 1. Validação de formato no frontend
            const formatosValidos = ['image/jpeg', 'image/png'];
            if (!formatosValidos.includes(arquivo.type)) {
                exibirErro("Apenas imagens JPEG ou PNG são aceitas.");
                avatarInput.value = '';
                return;
            }

            // 2. Validação de tamanho no frontend (2MB)
            const limiteTamanho = 2 * 1024 * 1024;
            if (arquivo.size > limiteTamanho) {
                exibirErro("A imagem não pode exceder o tamanho de 2MB.");
                avatarInput.value = '';
                return;
            }

            // Criação do FormData para payload multipart/form-data
            const formData = new FormData();
            formData.append('file', arquivo);

            try {
                // Feedback visual de carregamento
                const avatarImgDiv = document.querySelector('.avatar-image');
                if (avatarImgDiv) avatarImgDiv.style.opacity = '0.4';
                avatarInput.disabled = true;

                const resposta = await fetch(`http://localhost:8000/usuarios/${usuario.id}/avatar`, {
                    method: 'PATCH',
                    body: formData
                });

                const resultado = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(resultado.detail || "Não foi possível enviar a imagem.");
                }

                // Upload bem sucedido: Atualiza o localStorage do usuário com a nova URL
                usuario.avatar_url = resultado.avatar_url;
                localStorage.setItem('usuario', JSON.stringify(usuario));

                // Re-renderiza o avatar imediatamente sem refresh de tela
                renderizarAvatar(usuario);

            } catch (erro) {
                console.error("Erro no envio:", erro);
                exibirErro(erro.message || "Erro de conexão com o servidor.");
            } finally {
                // Remove feedback visual e reseta estados
                const avatarImgDiv = document.querySelector('.avatar-image');
                if (avatarImgDiv) avatarImgDiv.style.opacity = '1';
                avatarInput.disabled = false;
                avatarInput.value = ''; // Permite subir o mesmo arquivo se o usuário quiser tentar de novo
            }
        });
    }

    // ── Lógica de Remoção do Avatar ──────────────────────────────────────────
    if (btnRemoverAvatar && usuario && usuario.id) {
        btnRemoverAvatar.addEventListener('click', async function() {
            // Esconde erros anteriores
            if (avatarError) {
                avatarError.style.display = 'none';
                avatarError.textContent = '';
            }

            // Feedback visual durante a requisição
            btnRemoverAvatar.disabled = true;
            btnRemoverAvatar.textContent = 'Removendo...';

            try {
                const avatarImgDiv = document.querySelector('.avatar-image');
                if (avatarImgDiv) avatarImgDiv.style.opacity = '0.4';

                const resposta = await fetch(`http://localhost:8000/usuarios/${usuario.id}/avatar`, {
                    method: 'DELETE'
                });

                const resultado = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(resultado.detail || "Não foi possível remover a imagem.");
                }

                // Remove avatar_url do objeto e atualiza o localStorage
                usuario.avatar_url = null;
                localStorage.setItem('usuario', JSON.stringify(usuario));

                // Re-renderiza sem avatar (mostra inicial do nome ou "?")
                renderizarAvatar(usuario);

            } catch (erro) {
                console.error("Erro ao remover avatar:", erro);
                exibirErro(erro.message || "Erro de conexão com o servidor.");

                // Restaura o botão em caso de erro
                btnRemoverAvatar.disabled = false;
                btnRemoverAvatar.textContent = 'Remover foto';
            } finally {
                const avatarImgDiv = document.querySelector('.avatar-image');
                if (avatarImgDiv) avatarImgDiv.style.opacity = '1';
            }
        });
    }

    function exibirErro(mensagem) {
        if (avatarError) {
            avatarError.textContent = mensagem;
            avatarError.style.display = 'block';
            
            // Oculta o erro automaticamente após 6 segundos
            setTimeout(() => {
                avatarError.style.display = 'none';
                avatarError.textContent = '';
            }, 6000);
        }
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

// Evento do botão de confirmação final
document.getElementById('btnFinalExcluir')?.addEventListener('click', async () => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));
    if (!usuarioLogado || !usuarioLogado.id) {
        fecharModal();
        logout('../../login/login.html');
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

        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '../../login/login.html';

    } catch (erro) {
        const msgErro = document.querySelector('.modal-content p');
        if (msgErro) msgErro.textContent = "Erro ao conectar com o servidor.";
    } finally {
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = "Confirmar Exclusão";
    }
});