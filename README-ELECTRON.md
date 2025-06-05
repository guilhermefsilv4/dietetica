# Dietetíca - Aplicación de Escritorio

Esta es la aplicación de escritorio para Windows del sistema Dietetíca.

## Instalación y Configuración

### Requisitos Previos

1. **Node.js** (versión 16 o superior)
2. **npm** (viene con Node.js)

### Instalación de Dependencias

```bash
# Instalar dependencias del proyecto principal (Angular)
npm install

# Instalar dependencias del backend
cd backend-sqlite
npm install
cd ..

# Instalar dependencias de Electron
npm install -g electron electron-builder
npm install --save-dev electron electron-builder
```

### Ejecutar en Desarrollo

```bash
# Para probar la aplicación localmente
npm run start
```

### Construir para Windows

```bash
# Construir el instalador para Windows
npm run build-win
```

El instalador se creará en la carpeta `dist/`.

## Estructura del Proyecto

```
/
├── src/
│   ├── main.js          # Proceso principal de Electron
│   ├── setup.html       # Página de configuración inicial
│   └── assets/
│       └── icon.png     # Ícono de la aplicación
├── backend-sqlite/      # Backend con SQLite
├── public/              # Archivos públicos del frontend
├── electron-package.json # Configuración específica de Electron
└── README-ELECTRON.md   # Este archivo
```

## Funcionalidades

- **Selección de Entorno**: Permite elegir entre base de datos de desarrollo o producción
- **Inicio Automático**: Inicia automáticamente el backend y frontend
- **Interfaz Unificada**: Todo en una sola ventana de aplicación

## Bases de Datos

- **Desarrollo**: `dietetica_dev.db` - Para pruebas y desarrollo
- **Producción**: `dietetica_prod.db` - Con datos reales

## Notas Importantes

1. La aplicación necesita que tanto Node.js como npm estén instalados en el sistema Windows
2. El backend se ejecuta en el puerto 3000
3. El frontend se ejecuta en el puerto 4200
4. Ambos servidores se inician automáticamente al seleccionar el entorno

## Personalización

Para personalizar la aplicación:

1. **Ícono**: Reemplaza `src/assets/icon.png` con tu ícono personalizado
2. **Nombre**: Modifica el `productName` en `electron-package.json`
3. **Estilos**: Edita los estilos CSS en `src/setup.html`

## Resolución de Problemas

Si encuentras problemas:

1. Verifica que Node.js esté instalado correctamente
2. Asegúrate de que los puertos 3000 y 4200 estén disponibles
3. Revisa los logs en la consola de desarrollador (F12)
4. Verifica que las dependencias estén instaladas correctamente

## Construcción para Distribución

Para crear un instalador para Windows:

```bash
npm run dist
```

Esto creará un archivo `.exe` en la carpeta `dist/` que se puede distribuir a los usuarios finales. 
