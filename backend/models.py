from pydantic import BaseModel, EmailStr, field_validator
from datetime import date, datetime
import re


# ── Usuário ────────────────────────────────────────────────────────────────────

class UsuarioCadastro(BaseModel):
    nome_completo: str
    data_nascimento: date
    email: EmailStr
    cpf: str
    telefone: str
    password: str

    @field_validator("email")
    @classmethod
    def normalizar_email(cls, v: EmailStr) -> str:
        return v.strip().lower()

    @field_validator("telefone")
    @classmethod
    def validar_telefone(cls, v: str) -> str:
        digitos = "".join(filter(str.isdigit, v))
        if not (10 <= len(digitos) <= 11):
            raise ValueError("Telefone deve ter 10 ou 11 dígitos numéricos.")
        return digitos
    
    @field_validator("cpf")
    @classmethod
    def validar_cpf(cls, v: str) -> str:
        cpf = re.sub(r"\D", "", v)  # remove tudo que não for número

        # Verifica tamanho e sequência repetida
        if len(cpf) != 11 or cpf == cpf[0] * 11:
            raise ValueError("CPF inválido.")

        # Validação dos dígitos verificadores
        for j in range(9, 11):
            soma = sum(int(cpf[i]) * ((j + 1) - i) for i in range(j))
            resto = (soma * 10) % 11
            if resto in (10, 11):
                resto = 0
            if resto != int(cpf[j]):
                raise ValueError("CPF inválido.")

        return cpf  # já retorna só os números limpos
    
    @field_validator("nome_completo")
    @classmethod
    def validar_nome(cls, v: str) -> str:
        nome = v.strip()

        # Divide por espaços e remove entradas vazias
        partes = [p for p in nome.split(" ") if p]

        if len(partes) < 2:
            raise ValueError("Informe nome completo com pelo menos duas palavras.")
        if not all(re.match(r"^[A-Za-zÀ-ÿ]+$", p) for p in partes):
            raise ValueError("Nome deve conter apenas letras.")

        return nome

    @field_validator("data_nascimento")
    @classmethod
    def validar_idade(cls, v: date) -> date:
        hoje = date.today()

        idade = hoje.year - v.year - ((hoje.month, hoje.day) < (v.month, v.day))

        if idade < 12:
            raise ValueError("Idade mínima é 12 anos.")
        if idade > 100:
            raise ValueError("Idade máxima é 100 anos.")

        return v
    
    @field_validator("password")
    @classmethod
    def validar_senha(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("A senha deve ter no mínimo 8 caracteres.")

        if not re.search(r"[A-Z]", v):
            raise ValueError("A senha deve conter pelo menos uma letra maiúscula.")

        if not re.search(r"[a-z]", v):
            raise ValueError("A senha deve conter pelo menos uma letra minúscula.")

        if not re.search(r"\d", v):
            raise ValueError("A senha deve conter pelo menos um número.")

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("A senha deve conter pelo menos um caractere especial.")

        return v

class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str

class UsuarioAtualizacao(BaseModel):
    nome_completo: str
    email: EmailStr
    telefone: str
    data_nascimento: date

    @field_validator("email")
    @classmethod
    def normalizar_email(cls, v: EmailStr) -> str:
        return v.strip().lower()

    @field_validator("nome_completo")
    @classmethod
    def validar_nome(cls, v: str) -> str:
        nome = v.strip()

        # Divide por espaços e remove entradas vazias
        partes = [p for p in nome.split(" ") if p]

        if len(partes) < 2:
            raise ValueError("Informe nome completo com pelo menos duas palavras.")
        if not all(re.match(r"^[A-Za-zÀ-ÿ]+$", p) for p in partes):
            raise ValueError("Nome deve conter apenas letras.")
        
        return nome
    
    @field_validator("telefone")
    @classmethod
    def validar_telefone(cls, v: str) -> str:
        digitos = "".join(filter(str.isdigit, v))
        if not (10 <= len(digitos) <= 11):
            raise ValueError("Telefone deve ter 10 ou 11 dígitos numéricos.")
        return digitos
    
    @field_validator("data_nascimento")
    @classmethod
    def validar_idade(cls, v: date) -> date:
        hoje = date.today()

        idade = hoje.year - v.year - ((hoje.month, hoje.day) < (v.month, v.day))

        if idade < 12:
            raise ValueError("Idade mínima é 12 anos.")
        if idade > 100:
            raise ValueError("Idade máxima é 100 anos.")
        return v


# ── Evento ─────────────────────────────────────────────────────────────────────

class EventoCriar(BaseModel):
    usuario_id: int
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
    usuario_id: int
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
    usuario_id: int


# ── Inscrição ──────────────────────────────────────────────────────────────────

class InscricaoCriar(BaseModel):
    usuario_id: int
    evento_id: int