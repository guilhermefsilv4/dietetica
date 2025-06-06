@echo off
echo ================================
echo     DIETETICA - Aplicacao Local
echo ================================
echo.

echo [1/3] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias do Angular...
    call npm install
    if errorlevel 1 (
        echo Erro ao instalar dependencias do Angular!
        pause
        exit /b 1
    )
)

if not exist "backend-sqlite\node_modules" (
    echo Instalando dependencias do Backend...
    cd backend-sqlite
    call npm install
    cd ..
    if errorlevel 1 (
        echo Erro ao instalar dependencias do Backend!
        pause
        exit /b 1
    )
)

echo [2/3] Gerando build de producao do Angular...
call npm run build:prod
if errorlevel 1 (
    echo Erro ao gerar build do Angular!
    pause
    exit /b 1
)

echo [3/3] Iniciando servidor...
echo.
echo ================================
echo Aplicacao disponivel em:
echo http://localhost:3000
echo ================================
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

cd backend-sqlite
call npm run serve

pause
