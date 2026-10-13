# 🛒 Sistema de Gestão de Vendas e Itinerários — PI UNIVESP

> **Projeto Integrador** desenvolvido para a **UNIVESP** (Universidade Virtual do Estado de São Paulo).

Uma aplicação web completa para gestão de vendas itinerantes e presenciais, permitindo o controle centralizado de **clientes**, **produtos**, **locais de venda** (como WhatsApp, Feiras, Loja Online, Centro de São Roque, etc.) e o registro detalhado das **vendas**.

---

## 📌 Sumário
- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Pré-requisitos](#-pré-requisitos)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)
  - [1. Clonar o Repositório](#1-clonar-o-repositório)
  - [2. Configurar e Executar o Backend](#2-configurar-e-executar-o-backend)
  - [3. Configurar e Executar o Frontend](#3-configurar-e-executar-o-frontend)
- [Endereços de Acesso](#-endereços-de-acesso)
- [Licença](#-licença)

---

## 🚀 Sobre o Projeto

O objetivo deste sistema é auxiliar na gestão operacional e financeira de vendas itinerantes e multiponto. Ele permite acompanhar as origens das vendas e o desempenho de cada canal/local comercializado.

### Principais Funcionalidades:
- **Gestão de Clientes:** Cadastro, edição e listagem de clientes.
- **Gestão de Produtos:** Controle de catálogo de produtos com valores e descrições.
- **Locais de Venda (Canais/Itinerários):** Cadastro das origens das vendas (ex: WhatsApp, Loja Física, Feiras, Redes Sociais).
- **Registro de Vendas:** Lançamento de vendas associando cliente, forma de pagamento, produtos e o local de venda correspondente.

---

## 🛠️ Tecnologias Utilizadas

O projeto está estruturado em arquitetura desacoplada (separação entre API Backend e Interface Frontend):

### **Backend**
- **Node.js** com **Express**
- **SQLite3** (Banco de dados embutido em arquivo local `database.sqlite`, dispensando instalação e configuração de servidores externos de banco de dados)
- **CORS** e **Body-Parser**

### **Frontend**
- **React.js** (criado e empacotado via **Vite**)
- **JavaScript (ES6+)**
- **Axios / Fetch API** para comunicação com o backend
- **CSS / Tailwind CSS** (para estilização rápida e responsiva)

---

## 📂 Estrutura do Repositório

O projeto adota a estrutura de monorepo simplificado com pastas separadas para backend e frontend:

```text
.
├── backend/                  # API REST em Node.js/Express
│   ├── src/
│   │   ├── config/          # Configuração do banco SQLite (database.js)
│   │   ├── controllers/     # Lógica de negócio (clientes, produtos, locais, vendas)
│   │   ├── routes/          # Definição das rotas/endpoints HTTP
│   │   └── server.js        # Ponto de entrada do servidor
│   ├── database.sqlite      # Arquivo do banco de dados local (gerado automaticamente)
│   └── package.json
│
├── frontend/                 # Aplicação React SPA
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas da aplicação (Clientes, Produtos, Locais, Vendas)
│   │   ├── services/        # Configuração de integração com a API
│   │   ├── App.jsx          # Componente principal e rotas
│   │   └── main.jsx         # Bootstrapping do React
│   ├── index.html
│   └── package.json
│
└── README.md                 # Documentação do projeto
```

---

## 📋 Pré-requisitos

Antes de iniciar, você precisará ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão **18** ou superior recomendada)
- Gerenciador de pacotes **npm** (instalado junto com o Node.js)
- [Git](https://git-scm.com/) (opcional, para clonar o repositório)

> **Nota sobre o Banco de Dados:** Não é necessário instalar PostgreSQL, MySQL ou qualquer SGBD. O **SQLite** cria e gerencia o arquivo `database.sqlite` automaticamente ao inicializar o backend pela primeira vez.

---

## 💻 Como Rodar o Projeto

### 1. Clonar o Repositório
```bash
git clone https://github.com/AlefCristian/Sistema-de-Gestao-de-Itinierarios-PI-Univesp-2026
cd Sistema-de-Gestao-de-Itinierarios-PI-Univesp-2026
```

---

### 2. Configurar e Executar o Backend

1. Abra o terminal e entre no diretório do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor:
   ```bash
   npm start
   ```
   *(Caso exista o script de desenvolvimento configurado, você também pode usar `npm run dev`).*

4. O servidor iniciará por padrão na porta `3000` (exibindo no console a mensagem de confirmação e criação do banco).

---

### 3. Configurar e Executar o Frontend

1. Abra **um novo terminal** (mantenha o backend rodando no primeiro) e navegue para a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie a aplicação de desenvolvimento via Vite:
   ```bash
   npm run dev
   ```

4. O terminal exibirá o endereço local para acesso no navegador.

---

## 🌐 Endereços de Acesso

Após inicializar ambas as aplicações:

- **Frontend (Interface Web):** `http://localhost:5173` *(ou a porta indicada pelo Vite no terminal)*
- **Backend (API REST):** `http://localhost:3000/api`
  - Endpoint de Teste/Healthcheck: `http://localhost:3000/api/health`
  - Locais de Venda: `http://localhost:3000/api/locais-venda`

---

## 🎓 Universidade Virtual do Estado de São Paulo (UNIVESP)
**Curso:** Engenharia / Tecnologia da Informação  
**Disciplina:** Projeto Integrador  

---

## 📄 Licença
Este projeto foi desenvolvido com fins acadêmicos para apresentação no Projeto Integrador da UNIVESP.