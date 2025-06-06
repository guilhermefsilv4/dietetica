@echo off
chcp 65001 >nul
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                          DIETETICA - LOCAL                           ║
echo ║                     Aplicação Angular + Express                      ║
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.

echo [INFO] Verificando ambiente...

:: Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js não encontrado! Por favor, instale o Node.js primeiro.
    echo        Download: https://nodejs.org/
    pause
    exit /b 1
)

:: Verificar se NPM está disponível
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] NPM não encontrado! Reinstale o Node.js.
    pause
    exit /b 1
)

echo [INFO] Node.js e NPM encontrados ✓

:: Verificar e instalar dependências do Angular
echo.
echo [1/4] Verificando dependências do frontend (Angular)...
if not exist "node_modules" (
    echo [INFO] Instalando dependências do Angular...
    call npm install --silent
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependências do Angular!
        pause
        exit /b 1
    )
    echo [INFO] Dependências do Angular instaladas ✓
) else (
    echo [INFO] Dependências do Angular já instaladas ✓
)

:: Verificar e instalar dependências do Backend
echo.
echo [2/4] Verificando dependências do backend (Express)...
if not exist "backend-sqlite\node_modules" (
    echo [INFO] Instalando dependências do Backend...
    cd backend-sqlite
    call npm install --silent
    cd ..
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependências do Backend!
        pause
        exit /b 1
    )
    echo [INFO] Dependências do Backend instaladas ✓
) else (
    echo [INFO] Dependências do Backend já instaladas ✓
)

:: Gerar build de produção
echo.
echo [3/4] Gerando build de produção do Angular...
call npm run build:prod --silent
if errorlevel 1 (
    echo [ERRO] Falha ao gerar build do Angular!
    echo [INFO] Tentando build básico...
    call npm run build --silent
    if errorlevel 1 (
        echo [ERRO] Falha total no build!
        pause
        exit /b 1
    )
)
echo [INFO] Build gerado com sucesso ✓

:: Verificar se o build foi criado
if not exist "dist\dietetica\browser\index.html" (
    echo [ERRO] Build não encontrado em dist\dietetica\browser\
    echo [INFO] Verifique se o build foi gerado corretamente.
    pause
    exit /b 1
)

:: Iniciar servidor
echo.
echo [4/4] Iniciando servidor da aplicação...
echo.
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                            APLICAÇÃO ATIVA                           ║
echo ║                                                                      ║
echo ║    🌐 URL: http://localhost:3000                                     ║
echo ║    🏠 Modo: Local (Offline)                                         ║
echo ║    💾 Banco: SQLite                                                  ║
echo ║                                                                      ║
echo ║    ⚠️  Para parar o servidor: Pressione Ctrl+C                      ║
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.
echo [INFO] Aguarde... O navegador pode ser aberto automaticamente.
echo.

:: Tentar abrir o navegador (opcional)
timeout /t 2 /nobreak >nul
start http://localhost:3000 >nul 2>&1

:: Iniciar o servidor
cd backend-sqlite
node src/index.js

:: Se chegou aqui, o servidor foi interrompido
echo.
echo [INFO] Servidor parado.
pause
