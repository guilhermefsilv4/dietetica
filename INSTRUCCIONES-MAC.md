# Instrucciones para Desarrollar en Mac

Como estás desarrollando en Mac pero el target final es Windows, aquí tienes las instrucciones para probar y construir la aplicación.

## Instalación Local (Mac)

```bash
# Instalar dependencias principales
npm install

# Instalar dependencias del backend
cd backend-sqlite
npm install
cd ..

# Instalar Electron
npm install --save-dev electron electron-builder
```

## Probar la Aplicación en Mac

```bash
# Ejecutar la aplicación Electron
npm run start
```

Esto debería abrir la aplicación con la interfaz de selección de base de datos.

## Construir para Windows (desde Mac)

```bash
# Construir para Windows
npm run build-win
```

**Nota**: Electron Builder puede construir para Windows desde Mac, pero necesitarás:

1. Instalar Wine (para testing): `brew install wine`
2. O usar Docker para una construcción más limpia

## Estructura de Archivos Creados

```
/
├── src/
│   ├── main.js              # Proceso principal de Electron
│   ├── setup.html           # Interfaz de selección de BD
│   └── assets/
│       └── icon.png         # (placeholder - reemplaza con ícono real)
├── electron-package.json    # Configuración de Electron
├── install-electron.bat     # Script de instalación para Windows
├── install-electron.ps1     # Script PowerShell para Windows
├── run-app.bat             # Script para ejecutar en Windows
└── README-ELECTRON.md      # Documentación completa
```

## Funcionalidad

1. **Inicio**: La app muestra una interfaz para seleccionar el entorno de BD
2. **Backend**: Se inicia automáticamente con la BD seleccionada
3. **Frontend**: Se inicia automáticamente y se muestra en la ventana
4. **Puertos**: Backend en 3000, Frontend en 4200

## Testing Remoto

Para probar en Windows sin tener una máquina Windows:

1. Usar GitHub Actions para construir automáticamente
2. Usar un servicio como GitHub Codespaces con Windows
3. Pedir a alguien con Windows que pruebe el instalador

## Archivos a Entregar

Para el usuario final en Windows, necesitan:

1. **Código fuente completo** del proyecto
2. **Scripts de instalación**: `install-electron.bat` o `install-electron.ps1`
3. **Script de ejecución**: `run-app.bat`
4. **Documentación**: `README-ELECTRON.md`

## Comandos Útiles

```bash
# Limpiar y reinstalar
rm -rf node_modules
rm -rf backend-sqlite/node_modules
npm run install

# Ver logs de Electron
npm run start --verbose

# Construir para múltiples plataformas
npm run build -- --linux --win --mac
```

## Notas Importantes

- Los scripts `.bat` y `.ps1` son específicos para Windows
- El `main.js` detecta automáticamente el OS para comandos compatibles
- La aplicación necesita Node.js instalado en el sistema Windows target
- El usuario final puede usar el instalador `.exe` generado en `dist/` 
