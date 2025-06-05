@echo off

:: Verificar se esta rodando como administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Executando como administrador...
    goto :main
) else (
    echo Solicitando permissoes de administrador...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"%~f0\"' -Verb RunAs"
    exit /b
)

:main
echo ===============================================
echo    DESINSTALACAO DIETETICA - ADMINISTRADOR
echo ===============================================
echo.

echo [1] Parando todos os processos relacionados...
taskkill /f /im "Dietetíca.exe" 2>nul
taskkill /f /im "dietetica.exe" 2>nul
taskkill /f /im "node.exe" 2>nul
taskkill /f /im "ng.exe" 2>nul
echo    ✓ Processos parados

timeout /t 2 /nobreak >nul

echo.
echo [2] Removendo arquivos do programa...
if exist "%USERPROFILE%\AppData\Local\Programs\dietetica" (
    echo    Removendo: %USERPROFILE%\AppData\Local\Programs\dietetica
    rmdir /s /q "%USERPROFILE%\AppData\Local\Programs\dietetica"
    if %errorlevel% == 0 (
        echo    ✓ Arquivos removidos
    ) else (
        echo    ! Erro ao remover arquivos
    )
) else (
    echo    - Pasta do programa nao encontrada
)

echo.
echo [3] Removendo atalhos da area de trabalho...
if exist "%PUBLIC%\Desktop\Dietetíca.lnk" (
    del "%PUBLIC%\Desktop\Dietetíca.lnk" 2>nul
    echo    ✓ Atalho publico removido
)

if exist "%USERPROFILE%\Desktop\Dietetíca.lnk" (
    del "%USERPROFILE%\Desktop\Dietetíca.lnk" 2>nul
    echo    ✓ Atalho do usuario removido
)

echo.
echo [4] Removendo atalhos do menu iniciar...
if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Dietetíca.lnk" (
    del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Dietetíca.lnk" 2>nul
    echo    ✓ Atalho do menu iniciar removido
)

if exist "%ALLUSERSPROFILE%\Microsoft\Windows\Start Menu\Programs\Dietetíca.lnk" (
    del "%ALLUSERSPROFILE%\Microsoft\Windows\Start Menu\Programs\Dietetíca.lnk" 2>nul
    echo    ✓ Atalho global do menu removido
)

echo.
echo [5] Limpando registro do Windows...
reg delete "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Uninstall\dietetica" /f 2>nul
reg delete "HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Uninstall\dietetica" /f 2>nul
reg delete "HKEY_LOCAL_MACHINE\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\dietetica" /f 2>nul
echo    ✓ Entradas do registro limpos

echo.
echo [6] Removendo dados temporarios...
if exist "%TEMP%\dietetica*" (
    del /f /q "%TEMP%\dietetica*" 2>nul
    echo    ✓ Arquivos temporarios removidos
)

echo.
echo [7] Limpando cache do Electron...
if exist "%APPDATA%\dietetica" (
    rmdir /s /q "%APPDATA%\dietetica" 2>nul
    echo    ✓ Cache do Electron removido
)

echo.
echo ===============================================
echo           DESINSTALACAO CONCLUIDA!
echo ===============================================
echo.
echo O Dietetica foi removido completamente do sistema.
echo Agora voce pode instalar uma nova versao.
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
