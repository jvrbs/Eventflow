import mysql.connector
import os
from dotenv import load_dotenv
import bcrypt

load_dotenv()


# ── Conexão ────────────────────────────────────────────────────────────────────

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )


# ── Usuário — buscas ───────────────────────────────────────────────────────────

def procura_usuario_por_email(email):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuario WHERE email = %s", (email,))
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
        cursor.execute("SELECT * FROM usuario WHERE cpf = %s", (cpf,))
        usuario = cursor.fetchone()
        cursor.close()
        conn.close()
        return usuario
    except mysql.connector.Error as err:
        print(f"Erro ao procurar usuário por CPF: {err}")
        return None


def procura_usuario_por_id(usuario_id: int):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuario WHERE id = %s", (usuario_id,))
        usuario = cursor.fetchone()
        cursor.close()
        conn.close()
        return usuario
    except mysql.connector.Error as err:
        print(f"Erro ao procurar usuário por ID: {err}")
        return None


# ── Usuário — escrita ──────────────────────────────────────────────────────────

def cadastra_usuario(nome_completo, data_nascimento, email, cpf, telefone, senha_cripto):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO usuario (nome, data_nascimento, email, cpf, telefone, senha_hash, perfil)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (nome_completo, data_nascimento, email, cpf, telefone, senha_cripto, 'participante'))
        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"Erro ao cadastrar usuário: {err}")
        raise


def atualiza_usuario_db(id, nome, email, telefone, data_nascimento):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
        UPDATE usuario
        SET nome = %s, email = %s, telefone = %s, data_nascimento = %s
        WHERE id = %s
        """
        cursor.execute(query, (nome, email, telefone, data_nascimento, id))
        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"Erro ao atualizar banco: {err}")
        raise


def deleta_usuario_db(usuario_id: int):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM usuario WHERE id = %s", (usuario_id,))
        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"Erro ao deletar usuário: {err}")
        raise


# ── Usuário — senha ────────────────────────────────────────────────────────────

def verifica_senha_usuario(senha, senha_hash):
    try:
        return bcrypt.checkpw(senha.encode('utf-8'), senha_hash.encode('utf-8'))
    except Exception as err:
        print(f"Erro ao verificar senha: {err}")
        return False


# ── Usuário — validação CPF ────────────────────────────────────────────────────

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


# ── Evento — buscas ────────────────────────────────────────────────────────────

def lista_eventos_ativos():
    """Retorna todos os eventos com status 'ativo'. Rota pública."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM evento WHERE status = 'ativo' ORDER BY data_hora ASC"
        )
        eventos = cursor.fetchall()
        cursor.close()
        conn.close()
        return eventos
    except mysql.connector.Error as err:
        print(f"Erro ao listar eventos: {err}")
        return []


def busca_evento_por_id(evento_id: int):
    """Retorna um evento pelo ID independente do status."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM evento WHERE id = %s", (evento_id,))
        evento = cursor.fetchone()
        cursor.close()
        conn.close()
        return evento
    except mysql.connector.Error as err:
        print(f"Erro ao buscar evento por ID: {err}")
        return None


# ── Evento — escrita ───────────────────────────────────────────────────────────

def cria_evento_db(organizador_id, nome, descricao, data_hora, local, capacidade, categoria):
    """Insere um novo evento e retorna o ID gerado."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO evento (organizador_id, nome, descricao, data_hora, local, capacidade, categoria)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (organizador_id, nome, descricao, data_hora, local, capacidade, categoria))
        conn.commit()
        evento_id = cursor.lastrowid   # captura o ID gerado pelo AUTO_INCREMENT
        cursor.close()
        conn.close()
        return evento_id
    except mysql.connector.Error as err:
        print(f"Erro ao criar evento: {err}")
        raise


def atualiza_evento_db(evento_id, nome, descricao, data_hora, local, capacidade, categoria):
    """Atualiza os campos editáveis de um evento."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
        UPDATE evento
        SET nome = %s, descricao = %s, data_hora = %s,
            local = %s, capacidade = %s, categoria = %s
        WHERE id = %s
        """
        cursor.execute(query, (nome, descricao, data_hora, local, capacidade, categoria, evento_id))
        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"Erro ao atualizar evento: {err}")
        raise


def cancela_evento_db(evento_id: int):
    """Muda o status do evento para 'cancelado'. Nunca deleta."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE evento SET status = 'cancelado' WHERE id = %s", (evento_id,)
        )
        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"Erro ao cancelar evento: {err}")
        raise