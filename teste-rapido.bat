@echo off
echo ===============================================
echo        TESTE RAPIDO DIETETICA - WINDOWS
echo ===============================================
echo.

echo [1/4] Verificando se app esta instalado...
wmic product where "name like 'Dietetica%%'" call uninstall /nointeractive >nul 2>&1
if %errorlevel% == 0 (
    echo      ✓ App desinstalado
) else (
    echo      - App nao estava instalado
)

echo.
echo [2/4] Construindo nova versao...
call npm run electron-build-win
if %errorlevel% neq 0 (
    echo      ✗ Erro na construcao
    pause
    exit /b 1
)
echo      ✓ Build concluido

echo.
echo [3/4] Instalando nova versao...
start /wait "Instalador" "dist\Dietetíca Setup 1.0.0.exe" /S
if %errorlevel% == 0 (
    echo      ✓ Instalacao concluida
) else (
    echo      ! Instalacao manual necessaria
)

echo.
echo [4/4] Iniciando aplicacao...
start "" "%USERPROFILE%\AppData\Local\Programs\dietetica\Dietetíca.exe"

echo.
echo ===============================================
echo                 CONCLUIDO!
echo ===============================================
echo.
echo Para desinstalar manualmente:
echo 1. Windows Settings ^> Apps ^> Dietetica ^> Uninstall
echo 2. Ou execute: "%USERPROFILE%\AppData\Local\Programs\dietetica\Uninstall Dietetíca.exe"
echo.
pause
