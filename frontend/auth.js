function limparNumero(valor) {
    return valor.replace(/\D/g, '');
}

function calcularIdade(dataNasc) {
    if (!dataNasc) return -1;

    const hoje = new Date();
    const nascimento = new Date(dataNasc);

    nascimento.setMinutes(nascimento.getMinutes() + nascimento.getTimezoneOffset());

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }

    return idade;
}

const formularioCadastro = document.getElementById('formCadastro');
const formularioLogin = document.getElementById('formLogin');

// ---------------- CADASTRO ----------------

if (formularioCadastro) {
    formularioCadastro.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nome = document.getElementById('nomeCompletocadastro').value.trim();
        const email = document.getElementById('emailCadastro').value.trim();
        const cpf = limparNumero(document.getElementById('cpfCadastro').value);
        const telefone = limparNumero(document.getElementById('telefoneCadastro').value);
        const data_nascimento = document.getElementById('dataNascimentoCadastro').value;
        const senha = document.getElementById('passwordCadastro').value;
        const confirma = document.getElementById('confirmarSenhaCadastro').value;

        if (senha !== confirma) {
            alert("Senhas não coincidem");
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/cadastrar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome_completo: nome,
                    email,
                    cpf,
                    telefone,
                    data_nascimento,
                    password: senha
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.detail);
                return;
            }

            window.location.href = "../login/login.html";

        } catch {
            alert("Erro ao conectar com servidor");
        }
    });
}

// ---------------- LOGIN ----------------

if (formularioLogin) {
    formularioLogin.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('emailLogin').value.trim();
        const password = document.getElementById('passwordLogin').value.trim();

        try {
            const res = await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.detail);
                return;
            }

            localStorage.setItem("usuario", JSON.stringify(data.usuario));

            window.location.href = "../home/home.html";

        } catch {
            alert("Erro ao fazer login");
        }
    });
}