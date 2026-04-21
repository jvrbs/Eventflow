-- Criação da tabela de usuários
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) DEFAULT 'participante',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca por email (otimização)
CREATE INDEX idx_email ON usuario(email);