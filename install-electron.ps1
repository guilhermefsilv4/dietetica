Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  Instalando Dietetica - Aplicacion de Escritorio" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "Instalando dependencias del proyecto principal..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Error al instalar dependencias principales"
    }

    Write-Host ""
    Write-Host "Instalando dependencias del backend..." -ForegroundColor Yellow
    Set-Location backend-sqlite
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Error al instalar dependencias del backend"
    }
    Set-Location ..

    Write-Host ""
    Write-Host "Instalando Electron..." -ForegroundColor Yellow
    npm install --save-dev electron electron-builder
    if ($LASTEXITCODE -ne 0) {
        throw "Error al instalar Electron"
    }

    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host "  Instalacion completada exitosamente!" -ForegroundColor Green
    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para ejecutar la aplicacion:" -ForegroundColor White
    Write-Host "  npm run start" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para construir para Windows:" -ForegroundColor White
    Write-Host "  npm run build-win" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Presiona cualquier tecla para continuar..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
