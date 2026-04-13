from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import UsuarioCadastro, UsuarioLogin
from database import procura_usuario_por_email, cadastra_usuario, verifica_senha_usuario
import bcrypt

app = FastAPI()

# Configuração de CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def inicio():
    return {"mensagem": "EventFlow rodando!"}

@app.post("/cadastrar")
def cadastro(dados: UsuarioCadastro):
    try:
        usuario = procura_usuario_por_email(dados.email)
        if usuario:
            return {"erro": "Email já cadastrado"}
        
        senha_cripto = bcrypt.hashpw(dados.password.encode('utf-8'), bcrypt.gensalt())

        cadastra_usuario(dados.nome_completo, dados.data_nascimento, dados.email, senha_cripto)
        return {"mensagem": "Usuário cadastrado com sucesso!"}
    except Exception as e:
        return {"erro": f"Erro ao cadastrar usuário: {str(e)}"}

@app.post("/login")
def login(dados: UsuarioLogin):
    try:
        usuario = procura_usuario_por_email(dados.email)
        
        if not usuario:
            return {"erro": "Email ou senha incorretos"}
        
        # Verifica se a senha está correta
        if not verifica_senha_usuario(dados.password, usuario['senha_hash']):
            return {"erro": "Email ou senha incorretos"}
        
        # Login bem-sucedido
        return {
            "mensagem": "Login realizado com sucesso!",
            "usuario": {
                "id": usuario['id'],
                "nome": usuario['nome'],
                "email": usuario['email'],
                "data_nascimento": usuario['data_nascimento']
            }
        }
    except Exception as e:
        return {"erro": f"Erro ao fazer login: {str(e)}"}

