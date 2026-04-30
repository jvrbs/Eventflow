from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    UsuarioCadastro, UsuarioLogin, UsuarioAtualizacao,
    EventoCriar, EventoAtualizar, EventoCancelar,
    InscricaoCriar,
)
from database import (
    # usuário
    procura_usuario_por_email,
    procura_usuario_por_cpf,
    procura_usuario_por_id,
    cadastra_usuario,
    verifica_senha_usuario,
    validar_cpf,
    atualiza_usuario_db,
    deleta_usuario_db,
    # evento
    lista_eventos_ativos,
    busca_evento_por_id,
    cria_evento_db,
    atualiza_evento_db,
    cancela_evento_db,
    # inscrição
    conta_inscritos_ativos,
    busca_inscricao_por_usuario_evento,
    busca_inscricao_por_id,
    cria_inscricao_db,
    reativa_inscricao_db,
    cancela_inscricao_db,
    lista_inscricoes_por_usuario,
)
import bcrypt
import re
from datetime import date, datetime

app = FastAPI()

# ── CORS ───────────────────────────────────────────────────────────────────────

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

# ── Helpers internos ───────────────────────────────────────────────────────────

def _exige_organizador(usuario_id: int):
    usuario = procura_usuario_por_id(usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    if usuario["perfil"] != "organizador":
        raise HTTPException(status_code=403, detail="Apenas organizadores podem realizar esta ação.")
    return usuario


def _exige_dono_do_evento(evento_id: int, usuario_id: int):
    _exige_organizador(usuario_id)
    evento = busca_evento_por_id(evento_id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
    if evento["organizador_id"] != usuario_id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para alterar este evento.")
    return evento


# ── Rota de teste ──────────────────────────────────────────────────────────────

@app.get("/")
def inicio():
    return {"mensagem": "EventFlow rodando!"}


# ── Usuário ────────────────────────────────────────────────────────────────────

# backend/main.py

@app.post("/cadastrar", status_code=201)
def cadastro(dados: UsuarioCadastro):
    # 1. Verifica se email já existe
    if procura_usuario_por_email(dados.email):
        raise HTTPException(
            status_code=409, 
            detail="Este e-mail já está cadastrado no sistema."
        )

    # 2. Verifica se CPF já existe
    if procura_usuario_por_cpf(dados.cpf):
        raise HTTPException(
            status_code=409, 
            detail="Este CPF já está cadastrado no sistema."
        )

    # 3. Validação extra de CPF (caso o Pydantic não tenha validado o dígito verificador)
    if not validar_cpf(dados.cpf):
        raise HTTPException(
            status_code=400, 
            detail="O CPF fornecido é inválido."
        )

    # Criptografia da senha
    senha_cripto = bcrypt.hashpw(
        dados.password.encode('utf-8'), bcrypt.gensalt()
    ).decode('utf-8')

    try:
        cadastra_usuario(
            dados.nome_completo, 
            dados.data_nascimento, 
            dados.email,
            dados.cpf, 
            dados.telefone, 
            senha_cripto
        )
    except Exception as e:
        # Fallback para erros inesperados de banco de dados
        raise HTTPException(status_code=500, detail="Erro interno ao salvar o usuário.")
    
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
            "telefone": usuario['telefone'],
            "perfil": usuario['perfil'],
        }
    }


@app.put("/atualizar-perfil/{usuario_id}")
def atualizar_perfil(usuario_id: int, dados: UsuarioAtualizacao):
    # Validações de nome, email, telefone e idade automáticas via models.py.

    # Verifica se o e-mail novo já pertence a OUTRO usuário
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


# ── Eventos ────────────────────────────────────────────────────────────────────

@app.post("/eventos", status_code=201)
def criar_evento(dados: EventoCriar):
    _exige_organizador(dados.usuario_id)

    # A models.py garante que nome, local e categoria não sejam vazios e capacidade > 0.
    if dados.data_hora <= datetime.now():
        raise HTTPException(status_code=400, detail="A data do evento deve ser futura.")

    evento_id = cria_evento_db(
        dados.usuario_id, 
        dados.nome, 
        dados.descricao,
        dados.data_hora, 
        dados.local, 
        dados.capacidade, 
        dados.categoria,
    )
    
    return {"mensagem": "Evento criado com sucesso!", "evento_id": evento_id}


@app.get("/eventos")
def listar_eventos():
    return lista_eventos_ativos()


@app.get("/eventos/{evento_id}")
def detalhe_evento(evento_id: int):
    evento = busca_evento_por_id(evento_id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
    return evento


@app.put("/eventos/{evento_id}")
def editar_evento(evento_id: int, dados: EventoAtualizar):
    evento = _exige_dono_do_evento(evento_id, dados.usuario_id)

    if evento["status"] == "cancelado":
        raise HTTPException(status_code=400, detail="Não é possível editar um evento cancelado.")

    if dados.data_hora <= datetime.now():
        raise HTTPException(status_code=400, detail="A data do evento deve ser futura.")

    atualiza_evento_db(
        evento_id, 
        dados.nome, 
        dados.descricao,
        dados.data_hora, 
        dados.local, 
        dados.capacidade, 
        dados.categoria,
    )
    
    return {"mensagem": "Evento atualizado com sucesso!"}


@app.patch("/eventos/{evento_id}/cancelar")
def cancelar_evento(evento_id: int, dados: EventoCancelar):
    evento = _exige_dono_do_evento(evento_id, dados.usuario_id)

    if evento["status"] == "cancelado":
        raise HTTPException(status_code=409, detail="Evento já está cancelado.")

    cancela_evento_db(evento_id)
    return {"mensagem": "Evento cancelado com sucesso."}


# ── Inscrições ─────────────────────────────────────────────────────────────────

@app.post("/inscricoes", status_code=201)
def inscrever(dados: InscricaoCriar):
    # Verifica se usuário existe
    usuario = procura_usuario_por_id(dados.usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    # Verifica se evento existe e está ativo
    evento = busca_evento_por_id(dados.evento_id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
    if evento["status"] == "cancelado":
        raise HTTPException(status_code=400, detail="Não é possível se inscrever em um evento cancelado.")

    # Verifica se já existe inscrição para esse par usuário+evento
    inscricao_existente = busca_inscricao_por_usuario_evento(dados.usuario_id, dados.evento_id)

    if inscricao_existente:
        if inscricao_existente["status"] == "ativa":
            raise HTTPException(status_code=409, detail="Você já está inscrito neste evento.")
        # Se estava cancelada, reativa em vez de duplicar o registro
        if conta_inscritos_ativos(dados.evento_id) >= evento["capacidade"]:
            raise HTTPException(status_code=409, detail="Evento lotado. Não há vagas disponíveis.")
        reativa_inscricao_db(inscricao_existente["id"])
        return {"mensagem": "Inscrição reativada com sucesso!", "inscricao_id": inscricao_existente["id"]}

    # Verifica vagas disponíveis
    if conta_inscritos_ativos(dados.evento_id) >= evento["capacidade"]:
        raise HTTPException(status_code=409, detail="Evento lotado. Não há vagas disponíveis.")

    inscricao_id = cria_inscricao_db(dados.usuario_id, dados.evento_id)
    return {"mensagem": "Inscrição realizada com sucesso!", "inscricao_id": inscricao_id}


@app.delete("/inscricoes/{inscricao_id}")
def cancelar_inscricao(inscricao_id: int, usuario_id: int):
    inscricao = busca_inscricao_por_id(inscricao_id)
    if not inscricao:
        raise HTTPException(status_code=404, detail="Inscrição não encontrada.")

    # Garante que o usuário só cancela a própria inscrição
    if inscricao["usuario_id"] != usuario_id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para cancelar esta inscrição.")

    if inscricao["status"] == "cancelada":
        raise HTTPException(status_code=409, detail="Inscrição já está cancelada.")

    cancela_inscricao_db(inscricao_id)
    return {"mensagem": "Inscrição cancelada com sucesso."}


@app.get("/inscricoes/usuario/{usuario_id}")
def listar_inscricoes_usuario(usuario_id: int):
    if not procura_usuario_por_id(usuario_id):
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return lista_inscricoes_por_usuario(usuario_id)