@echo off
echo =====================================================
echo   Instalando Dietetica - Aplicacion de Escritorio
echo =====================================================
echo.

echo Instalando dependencias del proyecto principal...
call npm install
if %errorlevel% neq 0 (
    echo Error al instalar dependencias principales
    pause
    exit /b 1
)

echo.
echo Instalando dependencias del backend...
cd backend-sqlite
call npm install
if %errorlevel% neq 0 (
    echo Error al instalar dependencias del backend
    pause
    exit /b 1
)
cd ..

echo.
echo Instalando Electron...
call npm install --save-dev electron electron-builder
if %errorlevel% neq 0 (
    echo Error al instalar Electron
    pause
    exit /b 1
)

echo.
echo =====================================================
echo   Instalacion completada exitosamente!
echo =====================================================
echo.
echo Para ejecutar la aplicacion:
echo   npm run start
echo.
echo Para construir para Windows:
echo   npm run build-win
echo.
pause
