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
    usuario_id: int          # quem está criando — substituído por JWT na Sprint 2
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
    usuario_id: int          # quem está editando — substituído por JWT na Sprint 2
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
    usuario_id: int          # quem está cancelando — substituído por JWT na Sprint 2