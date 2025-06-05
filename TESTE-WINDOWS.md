# Guia de Teste - Windows

## 📦 **Arquivo para Teste**
- **Arquivo**: `dist/Dietetíca Setup 1.0.0.exe` (98MB)
- **Arquitetura**: x64 (64-bit)
- **Data**: Junho 2025

## ✅ **Correções Implementadas**
1. **Detecção de ambiente corrigida** - agora detecta corretamente desenvolvimento vs produção
2. **Caminhos de arquivos corrigidos** - funciona tanto em dev quanto em produção
3. **Arquivos de banco incluídos** - `dietetica_dev.db` e `dietetica_prod.db` estão empacotados
4. **Logs de debug adicionados** - para facilitar identificação de problemas
5. **Tratamento de erros melhorado** - captura exceções e logs detalhados

## 🛠️ **Como Testar no Windows**

### **Pré-requisitos**
1. **Node.js** instalado (https://nodejs.org/)
2. Windows 10 ou superior

### **Instalação**
1. Baixar `Dietetíca Setup 1.0.0.exe`
2. Executar como **Administrador**
3. Seguir o assistente de instalação

### **Teste Básico**
1. **Abrir a aplicação** (ícone no desktop ou menu iniciar)
2. **Verificar se a janela aparece** com a tela de configuração
3. **Testar seleção de banco**:
   - Clicar em "🔧 Desarrollo" para banco de desenvolvimento
   - Clicar em "🚀 Producción" para banco de produção
4. **Aguardar inicialização** (pode levar 30-60 segundos)
5. **Verificar se abre a aplicação Angular** 

## 📋 **Checklist de Teste**

### **✅ Inicialização**
- [ ] App abre sem crashar
- [ ] Janela aparece na tela
- [ ] Interface em espanhol argentino
- [ ] Botões respondem ao clique

### **✅ Backend**
- [ ] Backend inicia sem erros
- [ ] Porta 3000 é ocupada
- [ ] Banco de dados conecta

### **✅ Frontend**
- [ ] Frontend compila sem erros
- [ ] Porta 4200 é ocupada
- [ ] Interface Angular carrega

### **✅ Funcionalidade**
- [ ] Ambos bancos (dev/prod) funcionam
- [ ] Dados são carregados corretamente
- [ ] Aplicação responde normalmente

## 🔧 **Resolução de Problemas**

### **Problema: "App não abre"**
```bash
# Verificar se Node.js está instalado
node --version

# Se não estiver, instalar de https://nodejs.org/
```

### **Problema: "Janela não aparece"**
1. Verificar se não há erro de antivírus
2. Executar como administrador
3. Verificar se portas 3000 e 4200 estão livres

### **Problema: "Erro de banco de dados"**
- Verificar logs no console (F12)
- Verificar se arquivos .db estão presentes
- Tentar ambos os ambientes (dev/prod)

### **Problema: "Erro de porta ocupada"**
```cmd
# Verificar quais portas estão em uso
netstat -an | findstr ":3000"
netstat -an | findstr ":4200"

# Fechar outros programas que usem essas portas
```

## 📊 **Logs para Debug**

Se houver problemas, verificar:
1. **Console do Electron** (F12 na tela de configuração)
2. **Logs do sistema** no Event Viewer
3. **Linha de comando** onde a app foi executada

### **Logs Esperados**
```
=== ELECTRON APP DEBUG ===
Is development: false
Is packaged: true
...
Creating window...
Loading setup from: [caminho]
Setup page loaded successfully
Window ready, showing...
```

## 📝 **Relatório de Teste**

Depois do teste, reportar:
1. **Status**: ✅ Funcionou / ❌ Não funcionou
2. **Problemas encontrados**: [descrever]
3. **Logs de erro**: [copiar logs]
4. **Configuração**: Versão do Windows, Node.js, antivírus

## 🚀 **Se Tudo Funcionar**

A aplicação deve:
1. ✅ Abrir com tela de seleção de banco
2. ✅ Iniciar backend e frontend automaticamente
3. ✅ Mostrar a aplicação Angular funcionando
4. ✅ Permitir usar tanto banco dev quanto prod

**Esta versão está otimizada para Windows e inclui todas as correções necessárias!** 
