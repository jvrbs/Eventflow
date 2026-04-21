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


<<<<<<< HEAD
# ── Usuário — buscas ───────────────────────────────────────────────────────────
=======
# ── Usuário ────────────────────────────────────────────────────────────────────
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769

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


<<<<<<< HEAD
# ── Usuário — escrita ──────────────────────────────────────────────────────────

=======
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
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


<<<<<<< HEAD
# ── Usuário — senha ────────────────────────────────────────────────────────────

=======
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
def verifica_senha_usuario(senha, senha_hash):
    try:
        return bcrypt.checkpw(senha.encode('utf-8'), senha_hash.encode('utf-8'))
    except Exception as err:
        print(f"Erro ao verificar senha: {err}")
        return False


<<<<<<< HEAD
# ── Usuário — validação CPF ────────────────────────────────────────────────────

=======
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
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


<<<<<<< HEAD
# ── Evento — buscas ────────────────────────────────────────────────────────────

def lista_eventos_ativos():
    """Retorna todos os eventos com status 'ativo'. Rota pública."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM evento WHERE status = 'ativo' ORDER BY data_hora ASC"
        )
=======
# ── Evento ─────────────────────────────────────────────────────────────────────

def lista_eventos_ativos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM evento WHERE status = 'ativo' ORDER BY data_hora ASC")
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
        eventos = cursor.fetchall()
        cursor.close()
        conn.close()
        return eventos
    except mysql.connector.Error as err:
        print(f"Erro ao listar eventos: {err}")
        return []


def busca_evento_por_id(evento_id: int):
<<<<<<< HEAD
    """Retorna um evento pelo ID independente do status."""
=======
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
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


<<<<<<< HEAD
# ── Evento — escrita ───────────────────────────────────────────────────────────

def cria_evento_db(organizador_id, nome, descricao, data_hora, local, capacidade, categoria):
    """Insere um novo evento e retorna o ID gerado."""
=======
def cria_evento_db(organizador_id, nome, descricao, data_hora, local, capacidade, categoria):
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO evento (organizador_id, nome, descricao, data_hora, local, capacidade, categoria)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (organizador_id, nome, descricao, data_hora, local, capacidade, categoria))
        conn.commit()
<<<<<<< HEAD
        evento_id = cursor.lastrowid   # captura o ID gerado pelo AUTO_INCREMENT
=======
        evento_id = cursor.lastrowid
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
        cursor.close()
        conn.close()
        return evento_id
    except mysql.connector.Error as err:
        print(f"Erro ao criar evento: {err}")
        raise


def atualiza_evento_db(evento_id, nome, descricao, data_hora, local, capacidade, categoria):
<<<<<<< HEAD
    """Atualiza os campos editáveis de um evento."""
=======
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
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
<<<<<<< HEAD
    """Muda o status do evento para 'cancelado'. Nunca deleta."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE evento SET status = 'cancelado' WHERE id = %s", (evento_id,)
        )
=======
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE evento SET status = 'cancelado' WHERE id = %s", (evento_id,))
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"Erro ao cancelar evento: {err}")
        raise


<<<<<<< HEAD

# ── Inscrição — buscas ─────────────────────────────────────────────────────────

def conta_inscritos_ativos(evento_id: int) -> int:
    """Retorna quantas inscrições ativas existem para um evento."""
=======
# ── Inscrição ──────────────────────────────────────────────────────────────────

def conta_inscritos_ativos(evento_id: int) -> int:
    """Retorna quantas inscrições ativas o evento possui."""
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT COUNT(*) FROM inscricao WHERE evento_id = %s AND status = 'ativa'",
            (evento_id,)
        )
        total = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return total
    except mysql.connector.Error as err:
        print(f"Erro ao contar inscritos: {err}")
        return 0


<<<<<<< HEAD
def busca_inscricao_ativa(usuario_id: int, evento_id: int):
    """Retorna a inscrição ativa do usuário no evento, ou None."""
=======
def busca_inscricao_por_usuario_evento(usuario_id: int, evento_id: int):
    """Verifica se já existe inscrição (ativa ou cancelada) para esse par usuário+evento."""
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
<<<<<<< HEAD
            """
            SELECT * FROM inscricao
            WHERE usuario_id = %s AND evento_id = %s AND status = 'ativa'
            """,
=======
            "SELECT * FROM inscricao WHERE usuario_id = %s AND evento_id = %s",
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
            (usuario_id, evento_id)
        )
        inscricao = cursor.fetchone()
        cursor.close()
        conn.close()
        return inscricao
    except mysql.connector.Error as err:
<<<<<<< HEAD
        print(f"Erro ao buscar inscrição ativa: {err}")
=======
        print(f"Erro ao buscar inscrição: {err}")
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
        return None


def busca_inscricao_por_id(inscricao_id: int):
<<<<<<< HEAD
    """Retorna qualquer inscrição pelo ID."""
=======
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM inscricao WHERE id = %s", (inscricao_id,))
        inscricao = cursor.fetchone()
        cursor.close()
        conn.close()
        return inscricao
    except mysql.connector.Error as err:
        print(f"Erro ao buscar inscrição por ID: {err}")
        return None


<<<<<<< HEAD
def lista_inscricoes_por_usuario(usuario_id: int):
    """
    Retorna as inscrições ATIVAS do usuário com dados do evento via JOIN.
    Ordena pelo próximo evento primeiro.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                i.id            AS inscricao_id,
                i.status        AS inscricao_status,
                i.criado_em     AS inscrito_em,
                e.id            AS evento_id,
                e.nome          AS evento_nome,
                e.descricao     AS evento_descricao,
                e.data_hora     AS evento_data_hora,
                e.local         AS evento_local,
                e.capacidade    AS evento_capacidade,
                e.categoria     AS evento_categoria,
                e.status        AS evento_status
            FROM inscricao i
            INNER JOIN evento e ON e.id = i.evento_id
            WHERE i.usuario_id = %s
              AND i.status = 'ativa'
            ORDER BY e.data_hora ASC
            """,
            (usuario_id,)
        )
        inscricoes = cursor.fetchall()
        cursor.close()
        conn.close()
        return inscricoes
    except mysql.connector.Error as err:
        print(f"Erro ao listar inscrições do usuário: {err}")
        return []


# ── Inscrição — escrita ─────────────────────────────────────────────────────────

def cria_inscricao_db(usuario_id: int, evento_id: int) -> int:
    """
    Insere uma inscrição ativa e retorna o ID gerado.
    Lança exceção se a constraint UNIQUE for violada
    (usuário já inscrito — tratado na rota).
    """
=======
def cria_inscricao_db(usuario_id: int, evento_id: int):
    """Insere uma nova inscrição e retorna o ID gerado."""
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
<<<<<<< HEAD
            "INSERT INTO inscricao (usuario_id, evento_id, status) VALUES (%s, %s, 'ativa')",
=======
            "INSERT INTO inscricao (usuario_id, evento_id) VALUES (%s, %s)",
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
            (usuario_id, evento_id)
        )
        conn.commit()
        inscricao_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return inscricao_id
    except mysql.connector.Error as err:
        print(f"Erro ao criar inscrição: {err}")
        raise


<<<<<<< HEAD
=======
def reativa_inscricao_db(inscricao_id: int):
    """Reativa uma inscrição previamente cancelada."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE inscricao SET status = 'ativa' WHERE id = %s",
            (inscricao_id,)
        )
        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"Erro ao reativar inscrição: {err}")
        raise


>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
def cancela_inscricao_db(inscricao_id: int):
    """Muda o status da inscrição para 'cancelada'. Nunca deleta."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE inscricao SET status = 'cancelada' WHERE id = %s",
            (inscricao_id,)
        )
        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"Erro ao cancelar inscrição: {err}")
<<<<<<< HEAD
        raise
=======
        raise


def lista_inscricoes_por_usuario(usuario_id: int):
    """
    Retorna todas as inscrições ativas do usuário,
    já com os dados do evento embutidos (JOIN).
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT
            i.id            AS inscricao_id,
            i.inscrito_em,
            i.status        AS inscricao_status,
            e.id            AS evento_id,
            e.nome          AS evento_nome,
            e.data_hora,
            e.local,
            e.categoria,
            e.status        AS evento_status
        FROM inscricao i
        JOIN evento e ON e.id = i.evento_id
        WHERE i.usuario_id = %s AND i.status = 'ativa'
        ORDER BY e.data_hora ASC
        """
        cursor.execute(query, (usuario_id,))
        inscricoes = cursor.fetchall()
        cursor.close()
        conn.close()
        return inscricoes
    except mysql.connector.Error as err:
        print(f"Erro ao listar inscrições: {err}")
        return []
>>>>>>> 9d03a2bc07b150d266542ccebeb10c04f6081769
