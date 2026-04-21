from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    UsuarioCadastro, UsuarioLogin, UsuarioAtualizacao,
    EventoCriar, EventoAtualizar, EventoCancelar,
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
)
import bcrypt
import re
from datetime import date, datetime
import os

app = FastAPI()

# ── CORS ───────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5500").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers internos ───────────────────────────────────────────────────────────

def _exige_organizador(usuario_id: int):
    """
    Busca o usuário e lança 403 se não for organizador.
    Centraliza a verificação de perfil para não repetir em cada rota.
    """
    usuario = procura_usuario_por_id(usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    if usuario["perfil"] != "organizador":
        raise HTTPException(status_code=403, detail="Apenas organizadores podem realizar esta ação.")
    return usuario


def _exige_dono_do_evento(evento_id: int, usuario_id: int):
    """
    Busca o evento e verifica se pertence ao usuário.
    Já chama _exige_organizador internamente.
    Retorna o evento para evitar uma segunda consulta na rota.
    """
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


# ── Usuário — cadastro ─────────────────────────────────────────────────────────

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
        dados.password.encode('utf-8'), bcrypt.gensalt()
    ).decode('utf-8')

    cadastra_usuario(dados.nome_completo, dados.data_nascimento, dados.email,
                     dados.cpf, dados.telefone, senha_cripto)
    return {"mensagem": "Usuário cadastrado com sucesso!"}


# ── Usuário — login ────────────────────────────────────────────────────────────

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
        }
    }


# ── Usuário — atualizar perfil ─────────────────────────────────────────────────

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

    atualiza_usuario_db(usuario_id, dados.nome_completo, dados.email,
                        dados.telefone, dados.data_nascimento)
    return {"mensagem": "Dados atualizados com sucesso!"}


# ── Usuário — deletar conta ────────────────────────────────────────────────────

@app.delete("/deletar-conta/{usuario_id}", status_code=200)
def deletar_conta(usuario_id: int):
    if not procura_usuario_por_id(usuario_id):
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    deleta_usuario_db(usuario_id)
    return {"mensagem": "Conta deletada com sucesso."}


# ══════════════════════════════════════════════════════════════════════════════
# EVENTOS — Sprint 1 / R2
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/eventos", status_code=201)
def criar_evento(dados: EventoCriar):
    _exige_organizador(dados.usuario_id)

    if dados.data_hora <= datetime.now():
        raise HTTPException(status_code=400, detail="A data do evento deve ser futura.")

    evento_id = cria_evento_db(
        dados.usuario_id, dados.nome, dados.descricao,
        dados.data_hora, dados.local, dados.capacidade, dados.categoria,
    )
    return {"mensagem": "Evento criado com sucesso!", "evento_id": evento_id}


@app.get("/eventos")
def listar_eventos():
    """Rota pública — não exige autenticação."""
    return lista_eventos_ativos()


@app.get("/eventos/{evento_id}")
def detalhe_evento(evento_id: int):
    """Rota pública — retorna qualquer evento (ativo ou cancelado) pelo ID."""
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
        evento_id, dados.nome, dados.descricao,
        dados.data_hora, dados.local, dados.capacidade, dados.categoria,
    )
    return {"mensagem": "Evento atualizado com sucesso!"}


@app.patch("/eventos/{evento_id}/cancelar")
def cancelar_evento(evento_id: int, dados: EventoCancelar):
    evento = _exige_dono_do_evento(evento_id, dados.usuario_id)

    if evento["status"] == "cancelado":
        raise HTTPException(status_code=409, detail="Evento já está cancelado.")

    cancela_evento_db(evento_id)
    return {"mensagem": "Evento cancelado com sucesso."}