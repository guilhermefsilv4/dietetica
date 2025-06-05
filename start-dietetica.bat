@echo off
echo ===========================================
echo    DIETETICA - Iniciando Aplicacao
echo ===========================================
echo.

echo [1/4] Matando processos existentes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im serve.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":4200"') do taskkill /f /pid %%a >nul 2>&1
echo Processos finalizados!

echo.
echo [2/4] Navegando para o diretorio da aplicacao...
cd /d "%~dp0"
echo Diretorio: %CD%

echo.
echo [3/4] Iniciando o backend na porta 3000...
start "Backend-Dietetica" cmd /k "npm run backend:serve"
timeout /t 3 >nul

echo.
echo [4/4] Iniciando o frontend na porta 4200...
start "Frontend-Dietetica" cmd /k "npm run serve:build"
timeout /t 3 >nul

echo.
echo ===========================================
echo    APLICACAO INICIADA COM SUCESSO!
echo ===========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:4200
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

start http://localhost:4200

echo.
echo Aplicacao rodando! Feche este terminal para parar os servicos.
echo Ou pressione Ctrl+C para finalizar.
pause
