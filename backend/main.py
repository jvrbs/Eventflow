from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
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
    salva_avatar_db,  # <-- Nova importação inserida aqui
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
import os
import shutil
from datetime import date, datetime

app = FastAPI()

# ── Servir Arquivos de Uploads Estaticamente ───────────────────────────────────

# Configuração dinâmica da pasta de uploads para não quebrar independente de onde o servidor for iniciado
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

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

@app.post("/cadastrar", status_code=201)
def cadastro(dados: UsuarioCadastro):
    if procura_usuario_por_email(dados.email):
        raise HTTPException(
            status_code=409, 
            detail="Este e-mail já está cadastrado no sistema."
        )

    if procura_usuario_por_cpf(dados.cpf):
        raise HTTPException(
            status_code=409, 
            detail="Este CPF já está cadastrado no sistema."
        )

    if not validar_cpf(dados.cpf):
        raise HTTPException(
            status_code=400, 
            detail="O CPF fornecido é inválido."
        )

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
            "avatar_url": usuario.get('avatar_url')  # <-- Atualizado para retornar a URL do avatar no login
        }
    }


@app.put("/atualizar-perfil/{usuario_id}")
def atualizar_perfil(usuario_id: int, dados: UsuarioAtualizacao):
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


# ── NOVO: Upload do Avatar ───────────────────────────────────────────────────

@app.patch("/usuarios/{usuario_id}/avatar")
async def atualizar_avatar(usuario_id: int, file: UploadFile = File(...)):
    # 1. Verifica se o usuário de fato existe
    usuario = procura_usuario_por_id(usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    # 2. Validação do formato do arquivo (JPEG ou PNG)
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=400, 
            detail="Formato de arquivo inválido. São permitidas apenas imagens JPEG e PNG."
        )

    # 3. Validação do tamanho máximo de arquivo (2MB)
    content = await file.read()
    tamanho_arquivo = len(content)
    await file.seek(0)  # Volta o ponteiro para o início para poder salvar depois # Reseta o ponteiro de leitura para salvar o arquivo corretamente

    if tamanho_arquivo > 2097152:
        raise HTTPException(
            status_code=400, 
            detail="Arquivo muito grande. O tamanho máximo permitido é de 2MB."
        )

    # 4. Criação dinâmica do caminho e salvamento físico
    extensao = "jpg" if file.content_type == "image/jpeg" else "png"
    nome_arquivo = f"{usuario_id}.{extensao}"
    
    avatar_dir = os.path.join(UPLOAD_DIR, "avatars")
    os.makedirs(avatar_dir, exist_ok=True)
    caminho_salvamento = os.path.join(avatar_dir, nome_arquivo)

    # Limpeza de lixo físico (se mudou a extensão de png para jpg ou vice-versa, deleta a antiga)
    ext_oposta = "png" if extensao == "jpg" else "jpg"
    arquivo_antigo = os.path.join(avatar_dir, f"{usuario_id}.{ext_oposta}")
    if os.path.exists(arquivo_antigo):
        try:
            os.remove(arquivo_antigo)
        except Exception:
            pass

    try:
        with open(caminho_salvamento, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception:
        raise HTTPException(status_code=500, detail="Erro interno ao salvar o arquivo no disco.")

    # 5. URL relativa pública que o frontend irá requisitar
    avatar_url = f"/uploads/avatars/{nome_arquivo}"

    # 6. Atualização no Banco de Dados
    try:
        salva_avatar_db(usuario_id, avatar_url)
    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao persistir a URL do avatar no banco de dados.")

    return {
        "mensagem": "Avatar atualizado com sucesso!",
        "avatar_url": avatar_url
    }


# ── Eventos ────────────────────────────────────────────────────────────────────

@app.post("/eventos", status_code=201)
def criar_evento(dados: EventoCriar):
    _exige_organizador(dados.usuario_id)

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
    usuario = procura_usuario_por_id(dados.usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    evento = busca_evento_por_id(dados.evento_id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
    if evento["status"] == "cancelado":
        raise HTTPException(status_code=400, detail="Não é possível se inscrever em um evento cancelado.")

    inscricao_existente = busca_inscricao_por_usuario_evento(dados.usuario_id, dados.evento_id)

    if inscricao_existente:
        if inscricao_existente["status"] == "ativa":
            raise HTTPException(status_code=409, detail="Você já está inscrito neste evento.")
        if conta_inscritos_ativos(dados.evento_id) >= evento["capacidade"]:
            raise HTTPException(status_code=409, detail="Evento lotado. Não há vagas disponíveis.")
        reativa_inscricao_db(inscricao_existente["id"])
        return {"mensagem": "Inscrição reativada com sucesso!", "inscricao_id": inscricao_existente["id"]}

    if conta_inscritos_ativos(dados.evento_id) >= evento["capacidade"]:
        raise HTTPException(status_code=409, detail="Evento lotado. Não há vagas disponíveis.")

    inscricao_id = cria_inscricao_db(dados.usuario_id, dados.evento_id)
    return {"mensagem": "Inscrição realizada com sucesso!", "inscricao_id": inscricao_id}


@app.delete("/inscricoes/{inscricao_id}")
def cancelar_inscricao(inscricao_id: int, usuario_id: int):
    inscricao = busca_inscricao_por_id(inscricao_id)
    if not inscricao:
        raise HTTPException(status_code=404, detail="Inscrição não encontrada.")

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