-- ─────────────────────────────────────────────────────────────────────────────
-- EventFlow – Schema completo
-- ─────────────────────────────────────────────────────────────────────────────

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuario (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    nome             VARCHAR(255)  NOT NULL,
    data_nascimento  DATE          NOT NULL,
    email            VARCHAR(255)  NOT NULL UNIQUE,
    cpf              VARCHAR(11)   NOT NULL UNIQUE,
    telefone         VARCHAR(11)   NOT NULL,
    senha_hash       VARCHAR(255)  NOT NULL,
    perfil           VARCHAR(50)   NOT NULL DEFAULT 'participante',
    criado_em        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca por e-mail
CREATE INDEX IF NOT EXISTS idx_email ON usuario(email);


-- Tabela de eventos
CREATE TABLE IF NOT EXISTS evento (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    organizador_id  INT           NOT NULL,
    nome            VARCHAR(255)  NOT NULL,
    descricao       TEXT,
    data_hora       DATETIME      NOT NULL,
    local           VARCHAR(255)  NOT NULL,
    capacidade      INT           NOT NULL,
    categoria       VARCHAR(100)  NOT NULL,
    status          VARCHAR(50)   NOT NULL DEFAULT 'ativo',
    criado_em       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evento_organizador
        FOREIGN KEY (organizador_id) REFERENCES usuario(id)
        ON DELETE CASCADE
);

-- Índice para filtrar eventos por status
CREATE INDEX IF NOT EXISTS idx_evento_status ON evento(status);


-- Tabela de inscrições
CREATE TABLE IF NOT EXISTS inscricao (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  INT          NOT NULL,
    evento_id   INT          NOT NULL,
    status      VARCHAR(50)  NOT NULL DEFAULT 'ativa',
    inscrito_em TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inscricao_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_inscricao_evento
        FOREIGN KEY (evento_id) REFERENCES evento(id)
        ON DELETE CASCADE
);
