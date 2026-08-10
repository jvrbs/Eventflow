EventFlow

O EventFlow é uma aplicação web para gerenciamento e participação em eventos. A plataforma permite que usuários criem uma conta, visualizem eventos disponíveis, realizem inscrições e acompanhem os eventos dos quais participam.

O sistema também possui suporte a diferentes tipos de usuário. Participantes podem se inscrever em eventos, enquanto organizadores possuem permissões adicionais para criar, editar e cancelar seus próprios eventos.

O projeto foi desenvolvido utilizando HTML, CSS e JavaScript no frontend, uma API REST construída com FastAPI no backend e MySQL para persistência dos dados.

⸻

Funcionalidades

Usuários

* Cadastro de usuários
* Login
* Atualização de informações pessoais
* Exclusão de conta
* Upload de foto de perfil
* Alteração da foto de perfil
* Remoção da foto de perfil
* Validação de CPF
* Validação de telefone
* Validação de nome completo
* Validação de idade
* Validação de senha
* Diferenciação entre participantes e organizadores

As senhas são armazenadas utilizando bcrypt, evitando armazenamento em texto puro.

⸻

Participantes

Usuários com perfil de participante podem:

* Visualizar eventos disponíveis
* Consultar detalhes de eventos
* Realizar inscrições
* Cancelar inscrições
* Reativar uma inscrição anteriormente cancelada
* Visualizar os eventos em que estão inscritos
* Consultar eventos cancelados
* Gerenciar informações da própria conta

O sistema também verifica automaticamente a capacidade máxima de cada evento antes de permitir uma nova inscrição.

⸻

Organizadores

Usuários com perfil de organizador possuem permissões específicas para gerenciamento de eventos.

Eles podem:

* Criar eventos
* Editar seus próprios eventos
* Cancelar eventos
* Definir capacidade máxima
* Definir categoria
* Definir local
* Definir data e horário
* Adicionar descrição ao evento

O backend possui validações que impedem que um organizador altere eventos pertencentes a outro usuário.

⸻

Tecnologias utilizadas

Frontend

* HTML5
* CSS3
* JavaScript
* Fetch API
* LocalStorage

Backend

* Python
* FastAPI
* Pydantic
* Uvicorn
* bcrypt
* python-multipart
* python-dotenv

Banco de dados

* MySQL
* mysql-connector-python

⸻

Estrutura geral

Eventflow/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── requirements.txt
│   └── uploads/
│
├── frontend/
│   ├── inicial/
│   ├── login/
│   ├── cadastro/
│   ├── home/
│   │   ├── conta/
│   │   ├── info-pessoal/
│   │   └── meus-eventos/
│   ├── img/
│   └── session.js
│
└── README.md

O frontend se comunica com a API através de requisições HTTP utilizando fetch.

⸻

Arquitetura do backend

O backend está dividido principalmente em três arquivos.

main.py

Responsável pela criação da aplicação FastAPI e definição das rotas da API.

Também concentra regras relacionadas a:

* autenticação
* autorização
* gerenciamento de eventos
* inscrições
* upload de arquivos
* validação de permissões

models.py

Contém os modelos utilizados pelo Pydantic para validar os dados recebidos pela API.

Entre as validações existentes estão:

* formato de e-mail
* CPF
* telefone
* nome completo
* idade
* senha
* capacidade dos eventos
* campos obrigatórios

database.py

Responsável pela comunicação com o banco MySQL.

Contém operações relacionadas às entidades:

* usuários
* eventos
* inscrições

As consultas são realizadas utilizando mysql-connector-python.

⸻

Principais entidades

Usuário

Representa uma pessoa cadastrada no sistema.

Alguns dos dados armazenados são:

id
nome
data_nascimento
email
cpf
telefone
senha_hash
perfil
avatar_url

Os usuários podem possuir dois tipos de perfil:

participante
organizador

Por padrão, novos usuários são cadastrados como participantes.

⸻

Evento

Representa um evento disponibilizado na plataforma.

Entre suas principais informações estão:

id
organizador_id
nome
descricao
data_hora
local
capacidade
categoria
status

Um evento pode possuir status como:

ativo
cancelado

⸻

Inscrição

Relaciona um usuário a um evento.

Principais informações:

id
usuario_id
evento_id
status
inscrito_em

As inscrições podem ser:

ativa
cancelada

Ao cancelar uma inscrição, o registro não é necessariamente removido do banco. O status é alterado para cancelada, possibilitando posteriormente a reativação da inscrição.

⸻

API

O backend utiliza uma API REST desenvolvida com FastAPI.

Usuários

POST /cadastrar
POST /login
PUT /atualizar-perfil/{usuario_id}
DELETE /deletar-conta/{usuario_id}

Avatar

PATCH /usuarios/{usuario_id}/avatar
DELETE /usuarios/{usuario_id}/avatar

Os formatos aceitos atualmente para avatar são:

JPEG
PNG

O tamanho máximo permitido é de 2 MB.

⸻

Eventos

GET /eventos
GET /eventos/{evento_id}
POST /eventos
PUT /eventos/{evento_id}
PATCH /eventos/{evento_id}/cancelar

Somente usuários com perfil de organizador podem criar eventos.

Além disso, apenas o organizador responsável pelo evento pode editá-lo ou cancelá-lo.

Eventos também precisam possuir uma data futura.

⸻

Inscrições

POST /inscricoes
DELETE /inscricoes/{inscricao_id}
GET /inscricoes/usuario/{usuario_id}

Antes de realizar uma inscrição, a API verifica:

* existência do usuário
* existência do evento
* status do evento
* capacidade máxima
* existência de inscrição anterior

Caso uma inscrição cancelada já exista, ela pode ser reativada.

⸻

Validação de dados

O projeto possui validações tanto no frontend quanto no backend.

Entre as principais estão:

CPF

O CPF é armazenado somente com números:

00000000000

Os dígitos verificadores também são validados.

Telefone

São aceitos telefones contendo entre:

10 e 11 dígitos

Nome

O nome deve:

* conter pelo menos duas palavras
* possuir apenas letras

Idade

O sistema verifica a idade informada através da data de nascimento.

Senha

As senhas precisam possuir:

* pelo menos 8 caracteres
* letra maiúscula
* letra minúscula
* número
* caractere especial

⸻

Segurança

As senhas não são armazenadas diretamente no banco.

Antes da persistência, elas são processadas utilizando:

bcrypt

O hash resultante é armazenado no campo:

senha_hash

A aplicação também realiza verificações de autorização no backend para impedir, por exemplo, que um organizador altere um evento criado por outro usuário.

Atualmente a sessão do frontend utiliza localStorage. O projeto ainda não utiliza autenticação baseada em JWT.

⸻

Configuração do projeto

1. Clonar o repositório

git clone https://github.com/jvrbs/Eventflow.git
cd Eventflow

⸻

2. Criar ambiente virtual

Dentro da pasta do backend:

cd backend
python -m venv venv

No Windows:

venv\Scripts\activate

No Linux/macOS:

source venv/bin/activate

⸻

3. Instalar dependências

pip install -r requirements.txt

⸻

4. Configurar o banco de dados

O backend utiliza variáveis de ambiente para realizar a conexão com o MySQL.

Crie um arquivo:

.env

dentro da pasta backend.

Exemplo:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=eventflow

A aplicação utiliza essas variáveis para criar a conexão com o banco.

⸻

5. Executar o backend

Dentro da pasta backend:

uvicorn main:app --reload

Por padrão, a API estará disponível em:

http://localhost:8000

⸻

Documentação da API

Uma vantagem do FastAPI é a geração automática da documentação da API.

Com o servidor em execução:

Swagger UI

http://localhost:8000/docs

ReDoc

http://localhost:8000/redoc

Nessas páginas é possível visualizar e testar as rotas do backend.

⸻

Executando o frontend

O frontend é desenvolvido utilizando HTML, CSS e JavaScript puro.

Pode ser executado utilizando uma extensão como Live Server no VS Code.

Uma das origens atualmente permitidas pelo CORS do backend é:

http://127.0.0.1:5500

Por isso, utilizar o Live Server nessa porta facilita o desenvolvimento local.

⸻

Fluxo da aplicação

Um fluxo comum dentro do EventFlow é:

Cadastro
   ↓
Login
   ↓
Página inicial
   ↓
Visualização dos eventos
   ↓
Detalhes do evento
   ↓
Inscrição
   ↓
Meus Eventos

Para organizadores:

Login
   ↓
Página inicial
   ↓
Criar evento
   ↓
Gerenciar evento
   ↓
Editar ou cancelar evento

⸻

Melhorias futuras

Algumas possíveis evoluções para o projeto são:

* autenticação com JWT
* refresh tokens
* recuperação de senha
* confirmação de e-mail
* painel administrativo
* busca avançada de eventos
* filtros por categoria e localização
* paginação da API
* testes automatizados
* Docker
* deploy do frontend e backend
* armazenamento de imagens em serviço externo
* documentação OpenAPI mais detalhada

⸻

Status

O EventFlow está em desenvolvimento e já possui o fluxo principal de gerenciamento de usuários, eventos e inscrições implementado.

⸻

Autores

Projeto desenvolvido como aplicação acadêmica para estudo e prática de desenvolvimento web full stack.

Principais áreas trabalhadas no projeto:

* desenvolvimento frontend
* APIs REST
* validação de dados
* banco de dados relacional
* autenticação
* regras de negócio
* integração frontend/backend