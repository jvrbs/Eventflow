document.addEventListener('DOMContentLoaded', async () => {
    const usuario = getUsuarioLogado('../../login/login.html');
    if (!usuario) return;

    // Bloqueia acesso de organizadores
    if (usuario.perfil === 'organizador') {
        window.location.href = '../home.html';
        return;
    }

    const lista = document.getElementById('listaEventos');

    try {
        const resp = await fetch(`${API_URL}/inscricoes/usuario/${usuario.id}`);

        if (!resp.ok) throw new Error("Erro ao buscar inscrições.");

        const inscricoes = await resp.json();

        if (!inscricoes.length) {
            lista.innerHTML = `<p class="sem-inscricoes">Você ainda não está inscrito em nenhum evento.</p>`;
            return;
        }

        lista.innerHTML = inscricoes.map(i => {
            const data = new Date(i.data_hora).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            const tagStatus = i.evento_status === 'cancelado'
                ? `<span class="tag-cancelado-evento">Cancelado</span>`
                : `<span class="evento-tag">${i.categoria}</span>`;

            return `
                <div class="evento-item">
                    <div class="evento-info">
                        <p class="evento-nome">${i.evento_nome}</p>
                        <p class="evento-detalhe">📅 ${data} &nbsp;|&nbsp; 📍 ${i.local}</p>
                    </div>
                    ${tagStatus}
                </div>`;
        }).join('');

    } catch (err) {
        lista.innerHTML = `<p class="sem-inscricoes">Erro ao carregar seus eventos. Tente novamente.</p>`;
    }
});