from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import UsuarioCadastro, UsuarioLogin, UsuarioAtualizacao
from database import (
    procura_usuario_por_email,
    procura_usuario_por_cpf,
    cadastra_usuario,
    verifica_senha_usuario,
    validar_cpf,
    atualiza_usuario_db,
    procura_usuario_por_id,   
    deleta_usuario_db          
)
import bcrypt
import re
from datetime import date
import os

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:8000",
    "http://127.0.0.1:5500"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def inicio():
    return {"mensagem": "EventFlow rodando!"}


@app.post("/cadastrar", status_code=201)
def cadastro(dados: UsuarioCadastro):
    if not re.match(r"^[A-Za-zÀ-ÿ\s]{3,}$", dados.nome_completo):
        raise HTTPException(status_code=400, detail="Nome inválido. Use apenas letras e no mínimo 3 caracteres.")

    hoje = date.today()
    idade = hoje.year - dados.data_nascimento.year - (
        (hoje.month, hoje.day) < (dados.data_nascimento.month, dados.data_nascimento.day)
    )
    if idade < 12:
        raise HTTPException(status_code=400, detail="A idade mínima para cadastro é de 12 anos.")
    if idade > 120:
        raise HTTPException(status_code=400, detail="Data de nascimento inválida.")

    if not validar_cpf(dados.cpf):
        raise HTTPException(status_code=400, detail="CPF inválido.")

    if procura_usuario_por_email(dados.email):
        raise HTTPException(status_code=409, detail="Este email já está cadastrado no sistema.")

    if procura_usuario_por_cpf(dados.cpf):
        raise HTTPException(status_code=409, detail="Este CPF já está cadastrado no sistema.")

    senha_cripto = bcrypt.hashpw(
        dados.password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

    cadastra_usuario(
        dados.nome_completo,
        dados.data_nascimento,
        dados.email,
        dados.cpf,
        dados.telefone,
        senha_cripto
    )
    return {"mensagem": "Usuário cadastrado com sucesso!"}


@app.post("/login")
def login(dados: UsuarioLogin):
    usuario = procura_usuario_por_email(dados.email)

    if not usuario or not verifica_senha_usuario(dados.password, usuario['senha_hash']):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos.")

    return {
        "mensagem": "Login realizado com sucesso!",
        "usuario": {
            "id": usuario['id'],
            "nome_completo": usuario['nome'],
            "email": usuario['email'],
            "data_nascimento": str(usuario['data_nascimento']),
            "cpf": usuario['cpf'],
            "telefone": usuario['telefone']
        }
    }


@app.put("/atualizar-perfil/{usuario_id}")
def atualizar_perfil(usuario_id: int, dados: UsuarioAtualizacao):
    if not re.match(r"^[A-Za-zÀ-ÿ\s]{3,}$", dados.nome_completo):
        raise HTTPException(status_code=400, detail="Nome inválido.")

    hoje = date.today()
    idade = hoje.year - dados.data_nascimento.year - (
        (hoje.month, hoje.day) < (dados.data_nascimento.month, dados.data_nascimento.day)
    )
    if idade < 12 or idade > 120:
        raise HTTPException(status_code=400, detail="Data de nascimento fora do intervalo permitido.")

    usuario_existente = procura_usuario_por_email(dados.email)
    if usuario_existente and usuario_existente['id'] != usuario_id:
        raise HTTPException(status_code=409, detail="Este e-mail já está sendo usado por outra conta.")

    atualiza_usuario_db(
        usuario_id,
        dados.nome_completo,
        dados.email,
        dados.telefone,
        dados.data_nascimento
    )
    return {"mensagem": "Dados atualizados com sucesso!"}


@app.delete("/deletar-conta/{usuario_id}", status_code=200)
def deletar_conta(usuario_id: int):
    if not procura_usuario_por_id(usuario_id):
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    deleta_usuario_db(usuario_id)
    return {"mensagem": "Conta deletada com sucesso."}