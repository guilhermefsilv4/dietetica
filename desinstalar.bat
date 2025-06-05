@echo off
echo ===============================================
echo           DESINSTALAR DIETETICA
echo ===============================================
echo.

echo Tentando desinstalar via linha de comando...
wmic product where "name like 'Dietetica%%'" call uninstall /nointeractive

echo.
echo Se nao funcionou, tente manualmente:
echo 1. Windows Settings ^> Apps ^> Dietetica ^> Uninstall
echo 2. Ou execute: "%USERPROFILE%\AppData\Local\Programs\dietetica\Uninstall Dietetíca.exe"
echo.

pause
