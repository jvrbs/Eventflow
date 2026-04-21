# Eventflow
Convenção de nomenclatura: V{1}__{descricao_snake_case}.sql
As migrations são idempotentes — podem ser rodadas mais de uma vez sem erro.

Observações

CPF é armazenado como VARCHAR(11) sem formatação. A validação dos dígitos verificadores ocorre no frontend (auth.js) e no backend (database.py → validar_cpf).
Senhas nunca são armazenadas em texto plano — o campo senha_hash usa bcrypt ($2b$...).
O CORS está configurado com allow_origins=["*"]. Em produção, restringir para o domínio real.
A sessão do usuário é mantida via localStorage. Não há JWT implementado ainda — o campo token no login está preparado para receber um futuramente.
