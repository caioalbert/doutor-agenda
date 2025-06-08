# Doutor Agenda - Sistema de Agendamento para Clínicas

Este projeto é uma aplicação web fullstack desenvolvida com Next.js para gerenciar agendamentos de consultas médicas em clínicas. A aplicação permite o gerenciamento de médicos, pacientes e agendamentos.

## Tecnologias Utilizadas

- **Frontend**: Next.js 15 com App Router
- **Estilização**: Tailwind CSS
- **Banco de Dados**: PostgreSQL
- **ORM**: Drizzle ORM
- **Autenticação**: Clerk
- **Pagamentos**: Stripe
- **Componentes**: Shadcn UI
- **Formulários**: React Hook Form com Zod para validação
- **Gerenciamento de Estado**: TanStack Query

## Configuração e Execução

### Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL
- Docker (opcional, para rodar o PostgreSQL em container)

### Configuração do Ambiente

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd doutor-agenda
   ```

2. Instale as dependências:
   ```bash
   npm install --legacy-peer-deps
   ```
   
   > Nota: O uso de `--legacy-peer-deps` é necessário devido a algumas incompatibilidades entre as versões das dependências.

3. Configure o banco de dados:
   
   a. Usando Docker:
   ```bash
   docker run --name postgres-doutor-agenda -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=doutor-agenda -p 5432:5432 -d postgres:latest
   ```
   
   b. Ou configure seu PostgreSQL local

4. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/doutor-agenda
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. Execute as migrações do banco de dados:
   ```bash
   npx drizzle-kit push
   ```

### Executando o Projeto

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

## Funcionalidades

### Autenticação
- Login com e-mail e senha
- Login com Google
- Criação de conta

### Gerenciamento de Clínicas
- Criação de clínica
- Configuração de clínica

### Gerenciamento de Médicos
- Criação de médicos
- Listagem de médicos
- Atualização de médicos
- Deleção de médicos

### Gerenciamento de Pacientes
- Criação de pacientes
- Edição de pacientes
- Listagem de pacientes
- Deleção de pacientes

### Gerenciamento de Agendamentos
- Criação de agendamentos
- Listagem de agendamentos
- Deleção de agendamentos

## Estrutura do Projeto

```
/src
  /app                  # Rotas e páginas da aplicação
    /(auth)             # Rotas de autenticação
    /(dashboard)        # Rotas do dashboard
      /doctors          # Gerenciamento de médicos
      /patients         # Gerenciamento de pacientes
      /appointments     # Gerenciamento de agendamentos
  /components           # Componentes reutilizáveis
  /db                   # Configuração do banco de dados e schema
  /lib                  # Utilitários e configurações
  /actions              # Server actions
```

## Observações Importantes

1. **Autenticação**: A aplicação utiliza Clerk para autenticação. Para testes completos, você precisará configurar sua conta do Clerk e as chaves de API.

2. **Pagamentos**: A integração com o Stripe está configurada, mas para testes completos você precisará configurar sua conta do Stripe e as chaves de API.

---

Este projeto foi desenvolvido como parte de um curso de desenvolvimento web fullstack.
