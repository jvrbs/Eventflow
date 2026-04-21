from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    UsuarioCadastro, UsuarioLogin, UsuarioAtualizacao,
<<<<<<< HEAD
    EventoCriar, EventoAtualizar, EventoCancelar, InscricaoCriar, InscricaoCancelar,
=======
    EventoCriar, EventoAtualizar, EventoCancelar,
    InscricaoCriar,
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
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
<<<<<<< HEAD
=======
    # evento
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
    lista_eventos_ativos,
    busca_evento_por_id,
    cria_evento_db,
    atualiza_evento_db,
    cancela_evento_db,
<<<<<<< HEAD
    conta_inscritos_ativos,              
    busca_inscricao_ativa,               
    busca_inscricao_por_id,              
    lista_inscricoes_por_usuario,        
    cria_inscricao_db,                   
    cancela_inscricao_db,
    )
=======
    # inscrição
    conta_inscritos_ativos,
    busca_inscricao_por_usuario_evento,
    busca_inscricao_por_id,
    cria_inscricao_db,
    reativa_inscricao_db,
    cancela_inscricao_db,
    lista_inscricoes_por_usuario,
)
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
import bcrypt
import re
from datetime import date, datetime
import os

app = FastAPI()

<<<<<<< HEAD
# CORS corrigido
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
=======
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
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
# ---------------- HELPERS ----------------
=======
# ── Helpers internos ───────────────────────────────────────────────────────────
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769

def _exige_organizador(usuario_id: int):
    usuario = procura_usuario_por_id(usuario_id)
    if not usuario:
<<<<<<< HEAD
        raise HTTPException(404, "Usuário não encontrado.")
    if usuario["perfil"] != "organizador":
        raise HTTPException(403, "Apenas organizadores podem realizar esta ação.")
=======
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    if usuario["perfil"] != "organizador":
        raise HTTPException(status_code=403, detail="Apenas organizadores podem realizar esta ação.")
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
    return usuario


def _exige_dono_do_evento(evento_id: int, usuario_id: int):
    _exige_organizador(usuario_id)
    evento = busca_evento_por_id(evento_id)
    if not evento:
<<<<<<< HEAD
        raise HTTPException(404, "Evento não encontrado.")
    if evento["organizador_id"] != usuario_id:
        raise HTTPException(403, "Sem permissão.")
    return evento


# ---------------- TESTE ----------------
=======
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
    if evento["organizador_id"] != usuario_id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para alterar este evento.")
    return evento


# ── Rota de teste ──────────────────────────────────────────────────────────────
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769

@app.get("/")
def inicio():
    return {"mensagem": "EventFlow rodando!"}


<<<<<<< HEAD
# ---------------- CADASTRO ----------------
=======
# ── Usuário ────────────────────────────────────────────────────────────────────
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769

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

<<<<<<< HEAD
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

=======
    senha_cripto = bcrypt.hashpw(
        dados.password.encode('utf-8'), bcrypt.gensalt()
    ).decode('utf-8')

    cadastra_usuario(dados.nome_completo, dados.data_nascimento, dados.email,
                     dados.cpf, dados.telefone, senha_cripto)
    return {"mensagem": "Usuário cadastrado com sucesso!"}


>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
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
<<<<<<< HEAD
            "data_nascimento": str(usuario['data_nascimento']),
=======
            "perfil": usuario['perfil'],
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
        }
    }


<<<<<<< HEAD
# ---------------- ATUALIZAR PERFIL ----------------

=======
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
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

<<<<<<< HEAD
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
=======
    atualiza_usuario_db(usuario_id, dados.nome_completo, dados.email,
                        dados.telefone, dados.data_nascimento)
    return {"mensagem": "Dados atualizados com sucesso!"}


@app.delete("/deletar-conta/{usuario_id}", status_code=200)
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
def deletar_conta(usuario_id: int):

    if not procura_usuario_por_id(usuario_id):
<<<<<<< HEAD
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

=======
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    deleta_usuario_db(usuario_id)
    return {"mensagem": "Conta deletada com sucesso."}


# ── Eventos ────────────────────────────────────────────────────────────────────

@app.post("/eventos", status_code=201)
def criar_evento(dados: EventoCriar):
    _exige_organizador(dados.usuario_id)

    if dados.data_hora <= datetime.now():
        raise HTTPException(status_code=400, detail="A data do evento deve ser futura.")

    evento_id = cria_evento_db(
        dados.usuario_id, dados.nome, dados.descricao,
        dados.data_hora, dados.local, dados.capacidade, dados.categoria,
    )
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
    return {"mensagem": "Evento criado com sucesso!", "evento_id": evento_id}


@app.get("/eventos")
def listar_eventos():
    return lista_eventos_ativos()


@app.get("/eventos/{evento_id}")
def detalhe_evento(evento_id: int):
<<<<<<< HEAD

    evento = busca_evento_por_id(evento_id)

    if not evento:
        raise HTTPException(404, "Evento não encontrado.")

=======
    evento = busca_evento_por_id(evento_id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
    return evento


@app.put("/eventos/{evento_id}")
def editar_evento(evento_id: int, dados: EventoAtualizar):
<<<<<<< HEAD

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

=======
    evento = _exige_dono_do_evento(evento_id, dados.usuario_id)

    if evento["status"] == "cancelado":
        raise HTTPException(status_code=400, detail="Não é possível editar um evento cancelado.")

    if dados.data_hora <= datetime.now():
        raise HTTPException(status_code=400, detail="A data do evento deve ser futura.")

    atualiza_evento_db(
        evento_id, dados.nome, dados.descricao,
        dados.data_hora, dados.local, dados.capacidade, dados.categoria,
    )
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
    return {"mensagem": "Evento atualizado com sucesso!"}


@app.patch("/eventos/{evento_id}/cancelar")
def cancelar_evento(evento_id: int, dados: EventoCancelar):
<<<<<<< HEAD

    evento = _exige_dono_do_evento(evento_id, dados.usuario_id)

    if evento["status"] == "cancelado":
        raise HTTPException(409, "Evento já cancelado.")

    cancela_evento_db(evento_id)

    return {"mensagem": "Evento cancelado com sucesso."}



# ---------------- INSCRIÇÕES ----------------
 
@app.post("/inscricoes", status_code=201)
def inscrever(dados: InscricaoCriar):
    """
    Participante se inscreve em um evento.
 
    Regras:
    - Apenas usuários com perfil 'participante' podem se inscrever.
    - O evento precisa existir e estar com status 'ativo'.
    - Não pode haver inscrição ativa prévia do mesmo usuário no mesmo evento.
    - A inscrição é bloqueada quando inscrições ativas >= capacidade do evento.
    """
 
    # 1. Valida participante
    usuario = procura_usuario_por_id(dados.usuario_id)
    if not usuario:
        raise HTTPException(404, "Usuário não encontrado.")
    if usuario["perfil"] != "participante":
        raise HTTPException(403, "Apenas participantes podem se inscrever em eventos.")
 
    # 2. Valida evento
    evento = busca_evento_por_id(dados.evento_id)
    if not evento:
        raise HTTPException(404, "Evento não encontrado.")
    if evento["status"] != "ativo":
        raise HTTPException(400, "Inscrições disponíveis somente em eventos ativos.")
 
    # 3. Verifica inscrição duplicada
    if busca_inscricao_ativa(dados.usuario_id, dados.evento_id):
        raise HTTPException(409, "Você já está inscrito neste evento.")
 
    # 4. Controle de vagas
    inscritos = conta_inscritos_ativos(dados.evento_id)
    if inscritos >= evento["capacidade"]:
        raise HTTPException(409, "Evento esgotado. Não há vagas disponíveis.")
 
    # 5. Cria inscrição
    inscricao_id = cria_inscricao_db(dados.usuario_id, dados.evento_id)
 
    return {
        "mensagem": "Inscrição realizada com sucesso!",
        "inscricao_id": inscricao_id,
        "vagas_restantes": evento["capacidade"] - inscritos - 1,
    }
 
 
@app.delete("/inscricoes/{inscricao_id}")
def cancelar_inscricao(inscricao_id: int, dados: InscricaoCancelar):
    """
    Participante cancela a própria inscrição.
 
    Regras:
    - A inscrição precisa existir e estar ativa.
    - Apenas o próprio participante pode cancelar (dados.usuario_id == inscricao.usuario_id).
    """
 
    inscricao = busca_inscricao_por_id(inscricao_id)
 
    if not inscricao:
        raise HTTPException(404, "Inscrição não encontrada.")
 
    if inscricao["status"] != "ativa":
        raise HTTPException(409, "Esta inscrição já foi cancelada.")
 
    if inscricao["usuario_id"] != dados.usuario_id:
        raise HTTPException(403, "Sem permissão para cancelar esta inscrição.")
 
    cancela_inscricao_db(inscricao_id)
 
    return {"mensagem": "Inscrição cancelada com sucesso."}
 
 
@app.get("/inscricoes/usuario/{usuario_id}")
def listar_inscricoes_usuario(usuario_id: int):
    """
    Lista todas as inscrições ATIVAS do participante, com dados do evento.
    """
 
    usuario = procura_usuario_por_id(usuario_id)
    if not usuario:
        raise HTTPException(404, "Usuário não encontrado.")
 
    inscricoes = lista_inscricoes_por_usuario(usuario_id)
    return inscricoes
=======
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
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
