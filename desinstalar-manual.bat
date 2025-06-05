@echo off
echo ===============================================
echo      DESINSTALACAO MANUAL DIETETICA
echo ===============================================
echo.

echo [1] Parando processos do Dietetica...
taskkill /f /im "Dietetíca.exe" 2>nul
taskkill /f /im "dietetica.exe" 2>nul
echo    ✓ Processos parados

echo.
echo [2] Removendo arquivos do programa...
if exist "%USERPROFILE%\AppData\Local\Programs\dietetica" (
    rmdir /s /q "%USERPROFILE%\AppData\Local\Programs\dietetica"
    echo    ✓ Arquivos removidos
) else (
    echo    - Pasta do programa nao encontrada
)

echo.
echo [3] Removendo atalhos...
if exist "%USERPROFILE%\Desktop\Dietetíca.lnk" (
    del "%USERPROFILE%\Desktop\Dietetíca.lnk"
    echo    ✓ Atalho da area de trabalho removido
)

if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Dietetíca.lnk" (
    del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Dietetíca.lnk"
    echo    ✓ Atalho do menu iniciar removido
)

echo.
echo [4] Limpando registro do Windows...
reg delete "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Uninstall\dietetica" /f 2>nul
reg delete "HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Uninstall\dietetica" /f 2>nul
echo    ✓ Entradas do registro removidas

echo.
echo [5] Removendo dados de usuario (opcional)...
set /p choice="Remover dados salvos? (s/n): "
if /i "%choice%"=="s" (
    if exist "%APPDATA%\dietetica" (
        rmdir /s /q "%APPDATA%\dietetica"
        echo    ✓ Dados de usuario removidos
    )
)

echo.
echo ===============================================
echo            DESINSTALACAO CONCLUIDA!
echo ===============================================
echo.
echo O Dietetica foi removido completamente do sistema.
echo Agora voce pode instalar uma nova versao.
echo.
pause
