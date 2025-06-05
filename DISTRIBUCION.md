# Guía de Distribución - Dietetíca

## 📦 Archivos de Instalación Generados

### 🖥️ Windows
- **Archivo**: `Dietetíca Setup 1.0.0.exe` (97MB)
- **Arquitectura**: x64 (64-bit)
- **Requisitos**: Windows 10 o superior + Node.js

### 🍎 macOS
- **Intel Mac**: `Dietetíca-1.0.0.dmg` (126MB)
- **Apple Silicon**: `Dietetíca-1.0.0-arm64.dmg` (121MB)
- **Requisitos**: macOS 10.14 o superior + Node.js

## 🛠️ Comandos para Generar Instaladores

```bash
# Solo Windows
npm run electron-build-win

# Solo macOS
npm run electron-build-mac

# Ambos (Windows + macOS)
npm run electron-build-all
```

## 📋 Instrucciones para el Cliente

### **Requisitos Previos (IMPORTANTE)**
1. **Node.js** debe estar instalado en el sistema
   - Descargar desde: https://nodejs.org/
   - Versión recomendada: 18 LTS o superior

### **Instalación en Windows**
1. Descargar `Dietetíca Setup 1.0.0.exe`
2. Ejecutar como **Administrador**
3. Seguir el asistente de instalación
4. La aplicación se instalará en `C:\Users\[Usuario]\AppData\Local\Programs\dietetica`
5. Se creará un acceso directo en el escritorio

### **Instalación en macOS**
1. Descargar el `.dmg` correspondiente a su Mac:
   - Intel: `Dietetíca-1.0.0.dmg`
   - Apple Silicon: `Dietetíca-1.0.0-arm64.dmg`
2. Abrir el archivo `.dmg`
3. Arrastrar `Dietetíca.app` a la carpeta `Applications`
4. Ejecutar desde Launchpad

## 🚀 Funcionamiento de la Aplicación

### **Al Iniciar**
1. Se abre una ventana de configuración
2. **Seleccionar entorno de base de datos**:
   - 🔧 **Desarrollo**: Para pruebas (dietetica_dev.db)
   - 🚀 **Producción**: Con datos reales (dietetica_prod.db)

### **Proceso Automático**
1. La aplicación inicia el backend (puerto 3000)
2. Inicia el frontend Angular (puerto 4200)
3. Abre la interfaz web en la ventana de la aplicación

### **Puertos Utilizados**
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:4200

## 🔧 Solución de Problemas

### **Error: "Node.js no encontrado"**
- Instalar Node.js desde https://nodejs.org/
- Reiniciar el sistema después de la instalación

### **Error: "Puerto ocupado"**
- Cerrar otros programas que usen los puertos 3000 o 4200
- Reiniciar la aplicación

### **En macOS: "App dañada o de desarrollador no identificado"**
- Ir a Preferencias del Sistema > Seguridad y Privacidad
- Permitir la aplicación o ejecutar: `xattr -cr /Applications/Dietetíca.app`

### **La aplicación no se conecta a la base de datos**
- Verificar que los archivos `.db` estén en la carpeta correcta
- Reiniciar la aplicación

## 📁 Estructura de Archivos (Post-instalación)

```
Aplicación/
├── src/
│   ├── main.js              # Proceso principal
│   └── setup.html           # Interfaz de configuración
├── backend-sqlite/
│   └── src/database/
│       ├── dietetica_dev.db  # Base de datos desarrollo
│       └── dietetica_prod.db # Base de datos producción
└── resources/               # Recursos de la aplicación
```

## 🔄 Actualizaciones

Para futuras actualizaciones:
1. Desinstalar la versión anterior
2. Instalar la nueva versión
3. Los datos de la base de datos se conservarán

## 📞 Soporte

Para problemas técnicos:
1. Verificar que Node.js esté instalado
2. Revisar que los puertos 3000 y 4200 estén libres
3. Reiniciar la aplicación
4. Contactar soporte técnico con capturas de pantalla del error 
