import mysql.connector
import os
from dotenv import load_dotenv
import bcrypt

load_dotenv()


# CONEXÃO

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )


# BUSCAS

def procura_usuario_por_email(email):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = "SELECT * FROM usuario WHERE email = %s"
        cursor.execute(query, (email,))
        usuario = cursor.fetchone()

        cursor.close()
        conn.close()

        return usuario

    except mysql.connector.Error as err:
        print(f"Erro ao procurar usuário por email: {err}")
        return None


def procura_usuario_por_cpf(cpf):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = "SELECT * FROM usuario WHERE cpf = %s"
        cursor.execute(query, (cpf,))
        usuario = cursor.fetchone()

        cursor.close()
        conn.close()

        return usuario

    except mysql.connector.Error as err:
        print(f"Erro ao procurar usuário por CPF: {err}")
        return None



# CADASTRO

def cadastra_usuario(nome_completo, data_nascimento, email, cpf, telefone, senha_cripto):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
        INSERT INTO usuario (nome, data_nascimento, email, cpf, telefone, senha_hash, perfil)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(query, (
            nome_completo,
            data_nascimento,
            email,
            cpf,
            telefone,
            senha_cripto,
            'participante'
        ))

        conn.commit()
        cursor.close()
        conn.close()

    except mysql.connector.Error as err:
        print(f"Erro ao cadastrar usuário: {err}")
        raise



# SENHA

def verifica_senha_usuario(senha, senha_hash):
    try:
        return bcrypt.checkpw(
            senha.encode('utf-8'),
            senha_hash.encode('utf-8')
        )
    except Exception as err:
        print(f"Erro ao verificar senha: {err}")
        return False



# VALIDAÇÃO CPF

def validar_cpf(cpf: str) -> bool:
    cpf = ''.join(filter(str.isdigit, cpf))

    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False

    for i in range(9, 11):
        soma = sum(int(cpf[num]) * ((i + 1) - num) for num in range(0, i))
        digito = ((soma * 10) % 11) % 10
        if int(cpf[i]) != digito:
            return False

    return True