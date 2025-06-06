# 📱 Tutorial Completo - Dietetica Local

## 🎯 Resumo do que foi feito

Sua aplicação **Angular + Express + SQLite** foi configurada para rodar **100% localmente** no Windows, sem necessidade de internet após a configuração inicial.

### ✅ Modificações realizadas:

1. **Backend Express** (`backend-sqlite/src/index.js`):
   - Configurado para servir arquivos estáticos do Angular
   - Adicionada rota catch-all para suportar Angular Router
   - Mantidas todas as rotas da API funcionando

2. **Scripts NPM** adicionados nos `package.json`:
   - Build de produção otimizado
   - Comandos combinados para facilitar o uso
   - Scripts de instalação automática

3. **Arquivos de inicialização** criados:
   - `iniciar-aplicacao.cmd` - Versão completa e robusta
   - `start-app.bat` - Versão simples
   - `teste-rapido.bat` - Para testes rápidos

---

## 🚀 Como usar (Passo a Passo)

### Método 1: Mais Fácil (Recomendado)

1. **Duplo clique** no arquivo `iniciar-aplicacao.cmd`
2. O sistema irá:
   - ✅ Verificar se Node.js está instalado
   - ✅ Instalar dependências automaticamente
   - ✅ Gerar build de produção do Angular
   - ✅ Iniciar o servidor Express
   - ✅ Abrir o navegador automaticamente
3. **Pronto!** Sua aplicação estará rodando em `http://localhost:3000`

### Método 2: Linha de Comando

```bash
# Na pasta raiz do projeto
npm run build-and-serve
```

### Método 3: Manual (Passo a Passo)

```bash
# 1. Instalar dependências
npm install
cd backend-sqlite && npm install && cd ..

# 2. Gerar build de produção
npm run build:prod

# 3. Iniciar servidor
cd backend-sqlite
npm run serve
```

---

## 📋 Pré-requisitos

- **Node.js** versão 18+ instalado
- **Windows** (7, 8, 10, 11)
- **Navegador** moderno (Chrome, Firefox, Edge)

### Como instalar Node.js:
1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (recomendada)
3. Execute o instalador
4. Reinicie o computador

---

## 🔧 Estrutura Técnica

### Como funciona:
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Angular       │    │    Express       │    │    SQLite       │
│   (Frontend)    │───▶│   (Backend)      │───▶│   (Database)    │
│   dist/build    │    │   Serve Static   │    │   Local File    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Fluxo de requisições:
- **`/`** → Serve o Angular (index.html)
- **`/api/*`** → Rotas da API do Express
- **`/assets/*`** → Arquivos estáticos (CSS, JS, imagens)
- **Outras rotas** → Fallback para Angular Router

---

## 🌐 Testando a Aplicação

### Checklist de Verificação:

1. **✅ Acesso Principal**
   - Acesse: `http://localhost:3000`
   - Deve carregar a tela inicial do Angular

2. **✅ Navegação**
   - Teste navegar entre as páginas
   - URLs devem mudar corretamente

3. **✅ API Funcionando**
   - Teste funcionalidades que usam o banco
   - Verifique se dados são salvos/carregados

4. **✅ Console sem Erros**
   - Pressione F12 no navegador
   - Aba "Console" não deve ter erros críticos

5. **✅ Modo Offline**
   - Desconecte da internet
   - A aplicação deve continuar funcionando

---

## 🛠️ Comandos Úteis

### Scripts disponíveis na raiz:
```bash
npm run build:prod        # Build de produção otimizado
npm run build-and-serve   # Build + iniciar servidor
npm run serve:backend     # Apenas iniciar backend
npm run install:all       # Instalar todas as dependências
```

### Scripts do backend:
```bash
cd backend-sqlite
npm run serve            # Iniciar servidor
npm run dev              # Modo desenvolvimento
npm run start            # Modo produção
```

### Para desenvolvimento:
```bash
# Terminal 1: Angular dev server
npm start

# Terminal 2: Backend
cd backend-sqlite && npm run dev
```

---

## 🔍 Solução de Problemas

### ❌ Erro: "Cannot GET /"
**Causa:** Build do Angular não foi gerado
**Solução:**
```bash
npm run build:prod
```

### ❌ Erro: "Port 3000 is already in use"
**Causa:** Outra aplicação usando a porta 3000
**Soluções:**
1. Feche outros servidores Node.js
2. Ou altere a porta no arquivo `backend-sqlite/src/index.js` (linha 8)

### ❌ Erro: "Module not found"
**Causa:** Dependências não instaladas
**Solução:**
```bash
npm run install:all
```

### ❌ Erro: "Database locked"
**Causa:** Banco SQLite em uso por outro processo
**Solução:**
1. Feche outras instâncias da aplicação
2. Reinicie o computador se necessário

### ❌ Aplicação não carrega
**Verificações:**
1. Verifique se Node.js está instalado: `node --version`
2. Verifique se a porta 3000 está livre
3. Verifique se o build existe em `dist/dietetica/browser/`
4. Verifique o console do navegador (F12)

---

## 📦 Arquivos Importantes

### Novos arquivos criados:
- `iniciar-aplicacao.cmd` - Iniciador principal (Windows)
- `start-app.bat` - Iniciador simples
- `teste-rapido.bat` - Para testes
- `INSTRUCOES-LOCAL.md` - Guia detalhado
- `TUTORIAL-COMPLETO.md` - Este arquivo

### Arquivos modificados:
- `backend-sqlite/src/index.js` - Servidor Express
- `package.json` - Scripts do Angular
- `backend-sqlite/package.json` - Scripts do backend

---

## 🏁 Resumo Final

### Para iniciar sua aplicação:

1. **Clique duplo** em `iniciar-aplicacao.cmd`
2. **Aguarde** o processo completar
3. **Acesse** `http://localhost:3000`
4. **Pronto!** Sua aplicação está rodando offline

### Características da aplicação:

- ✅ **100% Local** - Funciona sem internet
- ✅ **Banco SQLite** - Dados persistidos localmente  
- ✅ **Interface Angular** - Moderna e responsiva
- ✅ **API Express** - Backend robusto
- ✅ **Fácil de usar** - Um clique para iniciar

### Informações técnicas:

- **URL:** http://localhost:3000
- **Porta:** 3000
- **Modo:** Produção (otimizado)
- **Banco:** SQLite (local)
- **Frontend:** Angular compilado
- **Backend:** Express + Node.js

---

## 📞 Próximos Passos

Agora sua aplicação está configurada para rodar localmente! 

**Sugestões:**
1. Teste todas as funcionalidades principais
2. Faça backup do banco SQLite regularmente
3. Considere criar um script de backup automático
4. Documente funcionalidades específicas do seu sistema

**Para distribuir para outros PCs:**
1. Copie toda a pasta do projeto
2. Execute `iniciar-aplicacao.cmd` no novo PC
3. As dependências serão instaladas automaticamente

---

**🎉 Parabéns! Sua aplicação está pronta para uso local!** 
