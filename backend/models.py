from pydantic import BaseModel, EmailStr, field_validator
from datetime import date, datetime


# ── Usuário ────────────────────────────────────────────────────────────────────

class UsuarioCadastro(BaseModel):
    nome_completo: str
    data_nascimento: date
    email: EmailStr
    cpf: str
    telefone: str
    password: str

class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str

class UsuarioAtualizacao(BaseModel):
    nome_completo: str
    email: EmailStr
    telefone: str
    data_nascimento: date


# ── Evento ─────────────────────────────────────────────────────────────────────

class EventoCriar(BaseModel):
<<<<<<< HEAD
    usuario_id: int          # quem está criando — substituído por JWT na Sprint 2
=======
    usuario_id: int
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
    nome: str
    descricao: str | None = None
    data_hora: datetime
    local: str
    capacidade: int
    categoria: str

    @field_validator("nome", "local", "categoria")
    @classmethod
    def nao_vazio(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Campo não pode ser vazio.")
        return v.strip()

    @field_validator("capacidade")
    @classmethod
    def capacidade_positiva(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Capacidade deve ser maior que zero.")
        return v


class EventoAtualizar(BaseModel):
<<<<<<< HEAD
    usuario_id: int          # quem está editando — substituído por JWT na Sprint 2
=======
    usuario_id: int
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
    nome: str
    descricao: str | None = None
    data_hora: datetime
    local: str
    capacidade: int
    categoria: str

    @field_validator("nome", "local", "categoria")
    @classmethod
    def nao_vazio(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Campo não pode ser vazio.")
        return v.strip()

    @field_validator("capacidade")
    @classmethod
    def capacidade_positiva(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Capacidade deve ser maior que zero.")
        return v


class EventoCancelar(BaseModel):
<<<<<<< HEAD
    usuario_id: int          # quem está cancelando — substituído por JWT na Sprint 2


    ## Cole este trecho dentro de models.py, após a classe EventoCancelar
=======
    usuario_id: int
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769


# ── Inscrição ──────────────────────────────────────────────────────────────────

class InscricaoCriar(BaseModel):
<<<<<<< HEAD
    usuario_id: int   # quem está se inscrevendo — substituído por JWT na Sprint 2
    evento_id:  int


class InscricaoCancelar(BaseModel):
    usuario_id: int   # quem está cancelando — substituído por JWT na Sprint 2
=======
    usuario_id: int
    evento_id: int
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
