# Verifica se esta executando como administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator"))
{
    Write-Host "Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host "Clique com botao direito no arquivo e selecione 'Executar como administrador'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ou execute este comando no PowerShell como Admin:"
    Write-Host "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Cyan
    Write-Host ".\desinstalar.ps1" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "===============================================" -ForegroundColor Green
Write-Host "    DESINSTALACAO DIETETICA - POWERSHELL" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# 1. Parar processos
Write-Host "[1] Parando processos relacionados..." -ForegroundColor Yellow
$processes = @("Dietetíca", "dietetica", "node", "ng")
foreach ($proc in $processes) {
    Get-Process -Name $proc -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}
Write-Host "    ✓ Processos parados" -ForegroundColor Green

Start-Sleep -Seconds 2

# 2. Remover arquivos do programa
Write-Host ""
Write-Host "[2] Removendo arquivos do programa..." -ForegroundColor Yellow
$appPath = "$env:USERPROFILE\AppData\Local\Programs\dietetica"
if (Test-Path $appPath) {
    Write-Host "    Removendo: $appPath" -ForegroundColor Cyan
    Remove-Item -Path $appPath -Recurse -Force -ErrorAction SilentlyContinue
    if (-not (Test-Path $appPath)) {
        Write-Host "    ✓ Arquivos removidos" -ForegroundColor Green
    } else {
        Write-Host "    ! Erro ao remover alguns arquivos" -ForegroundColor Red
    }
} else {
    Write-Host "    - Pasta do programa nao encontrada" -ForegroundColor Gray
}

# 3. Remover atalhos
Write-Host ""
Write-Host "[3] Removendo atalhos..." -ForegroundColor Yellow

$shortcuts = @(
    "$env:PUBLIC\Desktop\Dietetíca.lnk",
    "$env:USERPROFILE\Desktop\Dietetíca.lnk",
    "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Dietetíca.lnk",
    "$env:ALLUSERSPROFILE\Microsoft\Windows\Start Menu\Programs\Dietetíca.lnk"
)

foreach ($shortcut in $shortcuts) {
    if (Test-Path $shortcut) {
        Remove-Item -Path $shortcut -Force -ErrorAction SilentlyContinue
        Write-Host "    ✓ Atalho removido: $(Split-Path $shortcut -Leaf)" -ForegroundColor Green
    }
}

# 4. Limpar registro
Write-Host ""
Write-Host "[4] Limpando registro do Windows..." -ForegroundColor Yellow

$regPaths = @(
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\dietetica",
    "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\dietetica",
    "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\dietetica"
)

foreach ($regPath in $regPaths) {
    if (Test-Path $regPath) {
        Remove-Item -Path $regPath -Recurse -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "    ✓ Entradas do registro limpas" -ForegroundColor Green

# 5. Limpar dados temporários
Write-Host ""
Write-Host "[5] Removendo dados temporarios e cache..." -ForegroundColor Yellow

$tempPaths = @(
    "$env:TEMP\dietetica*",
    "$env:APPDATA\dietetica"
)

foreach ($tempPath in $tempPaths) {
    Get-Item -Path $tempPath -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "    ✓ Cache e temporarios removidos" -ForegroundColor Green

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "          DESINSTALACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "O Dietetica foi removido completamente do sistema." -ForegroundColor White
Write-Host "Agora voce pode instalar uma nova versao." -ForegroundColor White
Write-Host ""
Read-Host "Pressione Enter para fechar"
