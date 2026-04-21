from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    UsuarioCadastro, UsuarioLogin, UsuarioAtualizacao,
    EventoCriar, EventoAtualizar, EventoCancelar,
)
from database import (
    procura_usuario_por_email,
    procura_usuario_por_cpf,
    procura_usuario_por_id,
    cadastra_usuario,
    verifica_senha_usuario,
    validar_cpf,
    atualiza_usuario_db,
    deleta_usuario_db,
    lista_eventos_ativos,
    busca_evento_por_id,
    cria_evento_db,
    atualiza_evento_db,
    cancela_evento_db,
)
import bcrypt
import re
from datetime import date, datetime
import os

app = FastAPI()

# CORS corrigido
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- HELPERS ----------------

def _exige_organizador(usuario_id: int):
    usuario = procura_usuario_por_id(usuario_id)
    if not usuario:
        raise HTTPException(404, "Usuário não encontrado.")
    if usuario["perfil"] != "organizador":
        raise HTTPException(403, "Apenas organizadores podem realizar esta ação.")
    return usuario


def _exige_dono_do_evento(evento_id: int, usuario_id: int):
    _exige_organizador(usuario_id)
    evento = busca_evento_por_id(evento_id)
    if not evento:
        raise HTTPException(404, "Evento não encontrado.")
    if evento["organizador_id"] != usuario_id:
        raise HTTPException(403, "Sem permissão.")
    return evento


# ---------------- TESTE ----------------

@app.get("/")
def inicio():
    return {"mensagem": "EventFlow rodando!"}


# ---------------- CADASTRO ----------------

@app.post("/cadastrar", status_code=201)
def cadastro(dados: UsuarioCadastro):

    if not re.match(r"^[A-Za-zÀ-ÿ\s]{3,}$", dados.nome_completo):
        raise HTTPException(400, "Nome inválido.")

    hoje = date.today()
    idade = hoje.year - dados.data_nascimento.year - (
        (hoje.month, hoje.day) < (dados.data_nascimento.month, dados.data_nascimento.day)
    )

    if idade < 12 or idade > 100:
        raise HTTPException(400, "Idade inválida.")

    if not validar_cpf(dados.cpf):
        raise HTTPException(400, "CPF inválido.")

    if procura_usuario_por_email(dados.email):
        raise HTTPException(409, "Email já cadastrado.")

    if procura_usuario_por_cpf(dados.cpf):
        raise HTTPException(409, "CPF já cadastrado.")

    senha_hash = bcrypt.hashpw(
        dados.password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

    cadastra_usuario(
        dados.nome_completo,
        dados.data_nascimento,
        dados.email,
        dados.cpf,
        dados.telefone,
        senha_hash
    )

    return {"mensagem": "Usuário cadastrado com sucesso!"}


# ---------------- LOGIN ----------------

@app.post("/login")
def login(dados: UsuarioLogin):

    usuario = procura_usuario_por_email(dados.email)

    if not usuario or not verifica_senha_usuario(dados.password, usuario['senha_hash']):
        raise HTTPException(401, "Email ou senha incorretos.")

    return {
        "mensagem": "Login realizado com sucesso!",
        "usuario": {
            "id": usuario['id'],
            "nome": usuario['nome'],
            "email": usuario['email'],
            "cpf": usuario['cpf'],
            "telefone": usuario['telefone'],
            "data_nascimento": str(usuario['data_nascimento']),
        }
    }


# ---------------- ATUALIZAR PERFIL ----------------

@app.put("/atualizar-perfil/{usuario_id}")
def atualizar_perfil(usuario_id: int, dados: UsuarioAtualizacao):

    if not re.match(r"^[A-Za-zÀ-ÿ\s]{3,}$", dados.nome_completo):
        raise HTTPException(400, "Nome inválido.")

    hoje = date.today()
    idade = hoje.year - dados.data_nascimento.year - (
        (hoje.month, hoje.day) < (dados.data_nascimento.month, dados.data_nascimento.day)
    )

    if idade < 12 or idade > 100:
        raise HTTPException(400, "Data de nascimento inválida.")

    usuario_existente = procura_usuario_por_email(dados.email)
    if usuario_existente and usuario_existente['id'] != usuario_id:
        raise HTTPException(409, "Email já em uso.")

    atualiza_usuario_db(
        usuario_id,
        dados.nome_completo,
        dados.email,
        dados.telefone,
        dados.data_nascimento
    )

    return {"mensagem": "Dados atualizados com sucesso!"}


# ---------------- DELETE ----------------

@app.delete("/deletar-conta/{usuario_id}")
def deletar_conta(usuario_id: int):

    if not procura_usuario_por_id(usuario_id):
        raise HTTPException(404, "Usuário não encontrado.")

    deleta_usuario_db(usuario_id)

    return {"mensagem": "Conta deletada com sucesso."}


# ---------------- EVENTOS ----------------

@app.post("/eventos", status_code=201)
def criar_evento(dados: EventoCriar):

    _exige_organizador(dados.usuario_id)

    if dados.data_hora <= datetime.now():
        raise HTTPException(400, "Data deve ser futura.")

    evento_id = cria_evento_db(
        dados.usuario_id,
        dados.nome,
        dados.descricao,
        dados.data_hora,
        dados.local,
        dados.capacidade,
        dados.categoria
    )

    return {"mensagem": "Evento criado com sucesso!", "evento_id": evento_id}


@app.get("/eventos")
def listar_eventos():
    return lista_eventos_ativos()


@app.get("/eventos/{evento_id}")
def detalhe_evento(evento_id: int):

    evento = busca_evento_por_id(evento_id)

    if not evento:
        raise HTTPException(404, "Evento não encontrado.")

    return evento


@app.put("/eventos/{evento_id}")
def editar_evento(evento_id: int, dados: EventoAtualizar):

    evento = _exige_dono_do_evento(evento_id, dados.usuario_id)

    if evento["status"] == "cancelado":
        raise HTTPException(400, "Evento cancelado.")

    if dados.data_hora <= datetime.now():
        raise HTTPException(400, "Data deve ser futura.")

    atualiza_evento_db(
        evento_id,
        dados.nome,
        dados.descricao,
        dados.data_hora,
        dados.local,
        dados.capacidade,
        dados.categoria
    )

    return {"mensagem": "Evento atualizado com sucesso!"}


@app.patch("/eventos/{evento_id}/cancelar")
def cancelar_evento(evento_id: int, dados: EventoCancelar):

    evento = _exige_dono_do_evento(evento_id, dados.usuario_id)

    if evento["status"] == "cancelado":
        raise HTTPException(409, "Evento já cancelado.")

    cancela_evento_db(evento_id)

    return {"mensagem": "Evento cancelado com sucesso."}