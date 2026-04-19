from pydantic import BaseModel, EmailStr
from datetime import date

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