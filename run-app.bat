@echo off
echo =====================================================
echo   Iniciando Dietetica - Aplicacion de Escritorio
echo =====================================================
echo.

echo Verificando dependencias...
if not exist "node_modules" (
    echo No se encontraron dependencias. Ejecutando instalacion...
    call install-electron.bat
    if %errorlevel% neq 0 (
        echo Error en la instalacion
        pause
        exit /b 1
    )
)

echo.
echo Iniciando aplicacion...
call npm run start

pause
