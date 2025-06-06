# 🏠 Guia de Execução Local - Dietetica

Este guia explica como rodar sua aplicação **Angular + Express + SQLite** totalmente local no Windows, sem necessidade de internet.

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior) instalado
- **Windows** com PowerShell ou CMD
- **NPM** (vem com o Node.js)

## 🚀 Execução Rápida (Recomendada)

### Opção 1: Usando o arquivo .bat (Mais Fácil)

1. **Duplo clique** no arquivo `start-app.bat` na raiz do projeto
2. O script irá:
   - Verificar e instalar todas as dependências
   - Gerar o build de produção do Angular
   - Iniciar o servidor Express
3. Aguarde até ver a mensagem "Aplicação disponível em: http://localhost:3000"
4. Abra seu navegador e acesse: `http://localhost:3000`

### Opção 2: Linha de comando

```bash
# Na raiz do projeto
npm run build-and-serve
```

## 🔧 Execução Manual (Passo a Passo)

### 1. Instalar Dependências

```bash
# Instalar dependências do Angular (na raiz)
npm install

# Instalar dependências do Backend
cd backend-sqlite
npm install
cd ..
```

### 2. Gerar Build de Produção do Angular

```bash
# Na raiz do projeto
npm run build:prod
```

### 3. Iniciar o Servidor

```bash
# Navegar para o backend
cd backend-sqlite

# Iniciar servidor
npm run serve
```

### 4. Acessar a Aplicação

Abra seu navegador e acesse: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
dietetica/
├── src/                          # Código fonte Angular
├── dist/                         # Build compilado do Angular
│   └── dietetica/
│       └── browser/              # Arquivos estáticos servidos
├── backend-sqlite/               # Backend Express
│   ├── src/
│   │   ├── index.js             # Servidor principal (MODIFICADO)
│   │   └── database/            # Banco SQLite
│   └── package.json             # Dependências do backend
├── package.json                 # Dependências do Angular
└── start-app.bat               # Script de inicialização (NOVO)
```

## 🔧 Alterações Realizadas

### Backend (backend-sqlite/src/index.js)
- ✅ Adicionado `express.static()` para servir arquivos do Angular
- ✅ Adicionada rota catch-all (`*`) para suportar roteamento do Angular
- ✅ Configurado para servir a aplicação na porta 3000

### Scripts NPM Adicionados

**Raiz do projeto (package.json):**
- `build:prod` - Build de produção do Angular
- `serve:backend` - Inicia apenas o backend
- `build-and-serve` - Build + servidor em um comando
- `install:all` - Instala dependências de ambos os projetos

**Backend (backend-sqlite/package.json):**
- `serve` - Inicia servidor sem definir NODE_ENV
- `build-and-serve` - Build do Angular + servidor

## 🌐 Como Funciona

1. **Angular**: Compilado para arquivos estáticos em `dist/dietetica/browser/`
2. **Express**: Serve os arquivos estáticos do Angular na rota raiz (`/`)
3. **API**: Todas as rotas `/api/*` continuam funcionando normalmente
4. **Roteamento**: Angular Router funciona com fallback para `index.html`
5. **SQLite**: Banco de dados local, sem necessidade de internet

## 📊 Verificação de Funcionamento

### ✅ Checklist de Teste

- [ ] Acesso à aplicação: `http://localhost:3000`
- [ ] Navegação entre páginas funciona
- [ ] APIs funcionam (teste alguma funcionalidade)
- [ ] Banco de dados responde
- [ ] Nenhum erro no console do navegador

### 🔍 Troubleshooting

**Erro "Cannot GET /":**
- Verifique se o build foi gerado: `dist/dietetica/browser/`
- Execute novamente: `npm run build:prod`

**Erro de porta ocupada:**
- Altere a porta no arquivo `backend-sqlite/src/index.js` (linha ~8)
- Ou feche outros processos na porta 3000

**Erro de dependências:**
- Execute: `npm run install:all`
- Ou instale manualmente cada pasta

## 🎯 Comandos Úteis

```bash
# Apenas rebuild do Angular
npm run build:prod

# Apenas iniciar backend (se build já existe)
npm run serve:backend

# Instalar tudo do zero
npm run install:all

# Desenvolvimento (Angular + Backend separados)
npm start                    # Angular dev server (porta 4200)
cd backend-sqlite && npm run dev  # Backend dev (porta 3000)
```

## 🛡️ Modo Offline

A aplicação roda **100% offline** após o primeiro build:
- ✅ Sem necessidade de conexão com internet
- ✅ Banco SQLite local
- ✅ Todos os assets compilados
- ✅ API local funcionando

---

## 🏁 Resumo Final

Para rodar sua aplicação localmente:

1. **Duplo clique** em `start-app.bat` OU
2. Execute `npm run build-and-serve` no terminal
3. Acesse `http://localhost:3000` no navegador
4. Pronto! Sua aplicação está rodando localmente! 🎉

**Porta utilizada:** 3000  
**Acesso:** http://localhost:3000  
**Modo:** Produção (otimizado)  
**Internet:** Não necessária 
