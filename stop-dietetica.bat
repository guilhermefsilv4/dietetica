@echo off
echo ===========================================
echo    DIETETICA - Parando Aplicacao
echo ===========================================
echo.

echo Finalizando processos do backend e frontend...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im serve.exe >nul 2>&1

echo Liberando portas 3000 e 4200...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":4200"') do taskkill /f /pid %%a >nul 2>&1

echo.
echo ===========================================
echo    APLICACAO FINALIZADA COM SUCESSO!
echo ===========================================
echo.
pause
