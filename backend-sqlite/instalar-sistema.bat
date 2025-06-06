@echo off
chcp 65001 >nul
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                     INSTALAÇÃO - SISTEMA LOJA                        ║
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.

:: Criar estrutura de pastas
echo [1/3] Criando estrutura de pastas...
if not exist "database" mkdir database
if not exist "frontend" mkdir frontend
echo ✓ Pastas criadas

:: Copiar arquivos
echo.
echo [2/3] Copiando arquivos...
xcopy /s /y "original\database\*" "database\"
xcopy /s /y "original\frontend\*" "frontend\"
echo ✓ Arquivos copiados

:: Criar atalho na área de trabalho
echo.
echo [3/3] Criando atalho na área de trabalho...
powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Sistema Loja.lnk'); $Shortcut.TargetPath = '%~dp0sistema-loja.exe'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Save()"
echo ✓ Atalho criado

echo.
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                        INSTALAÇÃO CONCLUÍDA                          ║
echo ║                                                                      ║
echo ║  ✓ Sistema instalado com sucesso!                                   ║
echo ║  ✓ Um atalho foi criado na área de trabalho                        ║
echo ║  ✓ Clique duas vezes no atalho para iniciar o sistema              ║
echo ║                                                                      ║
echo ║  Após iniciar, acesse: http://localhost:3000                        ║
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.
pause
