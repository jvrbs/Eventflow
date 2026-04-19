from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import UsuarioCadastro, UsuarioLogin
from database import (
    procura_usuario_por_email,
    procura_usuario_por_cpf,
    cadastra_usuario,
    verifica_senha_usuario,
    validar_cpf
)
import bcrypt
import re
from datetime import date
from fastapi import FastAPI, HTTPException


app = FastAPI()


# CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Em produção, restringir
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ROTA TESTE

@app.get("/")
def inicio():
    return {"mensagem": "EventFlow rodando!"}



# CADASTRO
@app.post("/cadastrar")
def cadastro(dados: UsuarioCadastro):
    try:
        # 1. VALIDAÇÃO DE NOME (Mínimo 3 caracteres e apenas letras)
        # O padrão do seu JS é: /^[A-Za-zÀ-ÿ\s]{3,}$/
        if not re.match(r"^[A-Za-zÀ-ÿ\s]{3,}$", dados.nome_completo):
            return {"erro": "Nome inválido. Use apenas letras e no mínimo 3 caracteres."}

        # 2. VALIDAÇÃO DE IDADE (Mínimo 12 anos, Máximo 120 anos)
        hoje = date.today()
        idade = hoje.year - dados.data_nascimento.year - (
            (hoje.month, hoje.day) < (dados.data_nascimento.month, dados.data_nascimento.day)
        )

        if idade < 12:
            return {"erro": "A idade mínima para cadastro é de 12 anos."}
        
        if idade > 120:
            return {"erro": "Data de nascimento inválida (limite de 120 anos excedido)."}

        # 3. VALIDAÇÃO DE CPF (Algoritmo oficial)
        if not validar_cpf(dados.cpf):
            return {"erro": "CPF inválido."}

        # 4. VERIFICAÇÃO DE DUPLICIDADE NO BANCO
        # Email duplicado
        if procura_usuario_por_email(dados.email):
            return {"erro": "Este email já está cadastrado no sistema."}

        # CPF duplicado
        if procura_usuario_por_cpf(dados.cpf):
            return {"erro": "Este CPF já está cadastrado no sistema."}

        # 5. CRIPTOGRAFAR SENHA
        senha_cripto = bcrypt.hashpw(
            dados.password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        # 6. SALVAR NO BANCO DE DADOS
        cadastra_usuario(
            dados.nome_completo,
            dados.data_nascimento,
            dados.email,
            dados.cpf,
            dados.telefone,
            senha_cripto
        )

        return {"mensagem": "Usuário cadastrado com sucesso!"}

    except Exception as e:
        # Em produção, você pode logar o erro 'e' para análise interna
        return {"erro": f"Erro interno no servidor: {str(e)}"}


# LOGIN

@app.post("/login")
def login(dados: UsuarioLogin):
    try:
        usuario = procura_usuario_por_email(dados.email)

        if not usuario:
            return {"erro": "Email ou senha incorretos"}

        if not verifica_senha_usuario(dados.password, usuario['senha_hash']):
            return {"erro": "Email ou senha incorretos"}

        return {
            "mensagem": "Login realizado com sucesso!",
            "usuario": {
                "id": usuario['id'],
                "nome_completo": usuario['nome'],
                "email": usuario['email'],
                "data_nascimento": usuario['data_nascimento'],
                "cpf": usuario['cpf'],
                "telefone": usuario['telefone']
            }
        }

    except Exception as e:
        return {"erro": f"Erro ao fazer login: {str(e)}"}