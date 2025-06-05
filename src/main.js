const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');

let mainWindow;
let backendProcess;
let frontendProcess;

// Detect if we're in development or production
const isDev = !app.isPackaged;

// Keep a global reference of the window object
function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    x: 100,
    y: 100,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    show: true,
    alwaysOnTop: true,
    skipTaskbar: false
  });

  // Remove always on top after a moment
  setTimeout(() => {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(false);
    }
  }, 1000);

  // Load the setup page
  const setupPath = path.join(__dirname, 'setup.html');

  mainWindow.loadFile(setupPath).then(() => {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.moveTop();
  }).catch(err => {
    // If setup.html fails, load a simple fallback
    mainWindow.loadURL('data:text/html,<h1>Dietetíca</h1><p>Error cargando interfaz</p>');
    mainWindow.show();
  });

  // Also show on ready-to-show as backup
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Force show after a delay as last resort
  setTimeout(() => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.moveTop();
    }
  }, 2000);

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    stopServers();
  });
}

// Handle database selection from renderer
ipcMain.handle('start-servers', async (event, dbEnvironment) => {
  try {
    // Stop any existing servers
    stopServers();

    // Send status update to renderer
    mainWindow.webContents.send('status-update', 'Verificando archivos del sistema...');

    // Start backend with selected environment
    const backendResult = await startBackend(dbEnvironment);
    if (!backendResult.success) {
      throw new Error(`Error en backend: ${backendResult.error}`);
    }

    // Send status update to renderer
    mainWindow.webContents.send('status-update', 'Backend iniciado. Iniciando interfaz...');

    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start frontend
    const frontendResult = await startFrontend();
    if (!frontendResult.success) {
      throw new Error(`Error en interfaz: ${frontendResult.error}`);
    }

    // Send status update to renderer
    mainWindow.webContents.send('status-update', 'Interfaz iniciada. Abriendo aplicación...');

    // Wait for frontend to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Navigate to the application
    mainWindow.loadURL('http://localhost:4200');

    return { success: true };
  } catch (error) {
    // Send error to renderer
    mainWindow.webContents.send('status-update', `Error: ${error.message}`);
    return { success: false, error: error.message };
  }
});

function startBackend(environment) {
  return new Promise(async (resolve, reject) => {
    // Get the correct path based on whether we're packaged or not
    let backendPath;
    if (isDev) {
      backendPath = path.join(__dirname, '..', 'backend-sqlite');
    } else {
      // In packaged app without asar, look in app directory
      backendPath = path.join(process.resourcesPath, 'app', 'backend-sqlite');
    }

    // Send status to UI
    mainWindow.webContents.send('status-update', `Verificando backend en: ${backendPath}`);

    // Check if backend path exists
    const fs = require('fs');
    if (!fs.existsSync(backendPath)) {
      const error = `Carpeta backend no encontrada: ${backendPath}`;
      return resolve({ success: false, error });
    }

    // Check if backend index.js exists
    const backendIndexPath = path.join(backendPath, 'src', 'index.js');
    if (!fs.existsSync(backendIndexPath)) {
      const error = `Archivo principal del backend no encontrado: ${backendIndexPath}`;
      return resolve({ success: false, error });
    }

    // Check if database file exists for the environment
    const dbFileName = environment === 'development' ? 'dietetica_dev.db' : 'dietetica_prod.db';
    const dbPath = path.join(backendPath, 'src', 'database', dbFileName);
    if (!fs.existsSync(dbPath)) {
      const error = `Base de datos no encontrada: ${dbFileName} en ${path.dirname(dbPath)}`;
      return resolve({ success: false, error });
    }

    mainWindow.webContents.send('status-update', `Archivos backend encontrados. Iniciando servidor con ${dbFileName}...`);

    // Ensure backend dependencies are installed (especially for Windows)
    try {
      await ensureBackendDependencies(backendPath);
    } catch (error) {
      return resolve({ success: false, error: `Error instalando dependências: ${error.message}` });
    }

    // Set environment variable
    const env = { ...process.env };
    env.NODE_ENV = environment;

    // Use different command based on platform
    const isWindows = process.platform === 'win32';

    // For Windows packaged app, try to find node.exe in the app directory first
    let nodeCommand = 'node';
    if (!isDev && isWindows) {
      const appNodePath = path.join(process.resourcesPath, 'app', 'node_modules', '.bin', 'node.exe');
      if (fs.existsSync(appNodePath)) {
        nodeCommand = appNodePath;
      } else {
        // Try to find node in the system PATH
        try {
          execSync('where node', { stdio: 'ignore' });
        } catch (error) {
          return resolve({
            success: false,
            error: 'Node.js no está instalado en el sistema o no está en el PATH. Instale Node.js desde https://nodejs.org'
          });
        }
      }
    }

    mainWindow.webContents.send('status-update', `Ejecutando: ${nodeCommand} src/index.js`);

    backendProcess = spawn(nodeCommand, ['src/index.js'], {
      cwd: backendPath,
      env: env,
      stdio: 'pipe',
      shell: isWindows
    });

    let hasResolved = false;
    let startupTimeout;
    let errorOutput = '';

    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();

      // Send backend output to UI for debugging
      mainWindow.webContents.send('status-update', `Backend: ${output.trim()}`);

      // Check if server started successfully
      if (output.includes('Servidor rodando') || output.includes('listening on port') || output.includes('Server running')) {
        if (!hasResolved) {
          hasResolved = true;
          clearTimeout(startupTimeout);
          mainWindow.webContents.send('status-update', 'Servidor backend iniciado correctamente');
          resolve({ success: true });
        }
      }
    });

    backendProcess.stderr.on('data', (data) => {
      const error = data.toString();
      errorOutput += error;

      // Send error to UI immediately
      mainWindow.webContents.send('status-update', `Error backend: ${error.trim()}`);

      // Some errors might be fatal
      if (error.includes('ENOENT') || error.includes('spawn') || error.includes('MODULE_NOT_FOUND') || error.includes('Cannot find module')) {
        if (!hasResolved) {
          hasResolved = true;
          clearTimeout(startupTimeout);
          resolve({ success: false, error: `Error al ejecutar backend: ${error.trim()}` });
        }
      }
    });

    backendProcess.on('error', (error) => {
      if (!hasResolved) {
        hasResolved = true;
        clearTimeout(startupTimeout);
        resolve({ success: false, error: `Error del proceso backend: ${error.message}` });
      }
    });

    backendProcess.on('exit', (code, signal) => {
      if (!hasResolved) {
        hasResolved = true;
        clearTimeout(startupTimeout);
        let errorMsg = `Backend se cerró inesperadamente (código ${code})`;
        if (errorOutput) {
          errorMsg += `\nError: ${errorOutput.trim()}`;
        }
        if (code === 1) {
          errorMsg += '\nVerifique si Node.js está instalado y las dependencias están disponibles.';
        }
        resolve({ success: false, error: errorMsg });
      }
    });

    // Set timeout to prevent hanging
    startupTimeout = setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        mainWindow.webContents.send('status-update', 'Timeout del backend - continuando...');
        resolve({ success: true });
      }
    }, 15000); // Increased timeout for more time to see errors
  });
}

function startFrontend() {
  return new Promise((resolve, reject) => {
    // Get the correct path based on whether we're packaged or not
    let projectPath;
    if (isDev) {
      projectPath = path.join(__dirname, '..');
    } else {
      // In packaged app without asar, look in app directory
      projectPath = path.join(process.resourcesPath, 'app');
    }

    // Send status to UI
    mainWindow.webContents.send('status-update', `Verificando frontend en: ${projectPath}`);

    // Check if project path exists
    const fs = require('fs');
    if (!fs.existsSync(projectPath)) {
      const error = `Carpeta del proyecto no encontrada: ${projectPath}`;
      return resolve({ success: false, error });
    }

    // Check if angular.json exists
    const angularConfigPath = path.join(projectPath, 'angular.json');
    if (!fs.existsSync(angularConfigPath)) {
      const error = `Configuración Angular no encontrada: ${angularConfigPath}`;
      return resolve({ success: false, error });
    }

    mainWindow.webContents.send('status-update', 'Archivos frontend encontrados. Iniciando interfaz...');

    // Use different command based on platform
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'npx.cmd' : 'npx';

    frontendProcess = spawn(command, ['ng', 'serve', '--host', '0.0.0.0', '--port', '4200'], {
      cwd: projectPath,
      stdio: 'pipe',
      shell: true
    });

    let hasResolved = false;
    let startupTimeout;

    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();

      // Check if server is ready
      if ((output.includes('Local:') || output.includes('webpack compiled') || output.includes('compiled successfully')) && !hasResolved) {
        hasResolved = true;
        clearTimeout(startupTimeout);
        mainWindow.webContents.send('status-update', 'Servidor frontend iniciado correctamente');
        resolve({ success: true });
      }
    });

    frontendProcess.stderr.on('data', (data) => {
      const error = data.toString();

      // Some Angular warnings are normal, only fail on critical errors
      if (error.includes('ENOENT') || error.includes('spawn') || error.includes('command not found')) {
        if (!hasResolved) {
          hasResolved = true;
          clearTimeout(startupTimeout);
          resolve({ success: false, error: `Error al ejecutar Angular: ${error}` });
        }
      }
    });

    frontendProcess.on('error', (error) => {
      if (!hasResolved) {
        hasResolved = true;
        clearTimeout(startupTimeout);
        resolve({ success: false, error: `Error del proceso frontend: ${error.message}` });
      }
    });

    frontendProcess.on('exit', (code, signal) => {
      if (!hasResolved) {
        hasResolved = true;
        clearTimeout(startupTimeout);
        resolve({ success: false, error: `Frontend se cerró inesperadamente (código ${code})` });
      }
    });

    // Set timeout to prevent hanging
    startupTimeout = setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        mainWindow.webContents.send('status-update', 'Timeout del frontend - continuando...');
        resolve({ success: true });
      }
    }, 30000); // 30 seconds timeout for frontend (Angular takes longer)
  });
}

function stopServers() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }

  if (frontendProcess) {
    frontendProcess.kill();
    frontendProcess = null;
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
}).catch(err => {
  // Error loading app - not much we can do
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  stopServers();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle app quit
app.on('before-quit', () => {
  stopServers();
});

// Function to ensure backend dependencies are installed for Windows
async function ensureBackendDependencies(backendPath) {
  const fs = require('fs');
  const nodeModulesPath = path.join(backendPath, 'node_modules');
  const packageJsonPath = path.join(backendPath, 'package.json');

  // Check if package.json exists
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json não encontrado no backend');
  }

  // Check if node_modules exists or if sqlite3 is missing
  const sqlite3Path = path.join(nodeModulesPath, 'sqlite3');
  const needsInstall = !fs.existsSync(nodeModulesPath) || !fs.existsSync(sqlite3Path);

  if (needsInstall) {
    mainWindow.webContents.send('status-update', 'Instalando dependências do backend...');

    return new Promise((resolve, reject) => {
      const isWindows = process.platform === 'win32';
      const npmCommand = isWindows ? 'npm.cmd' : 'npm';

      const installProcess = spawn(npmCommand, ['install'], {
        cwd: backendPath,
        stdio: 'pipe',
        shell: true
      });

      let errorOutput = '';

      installProcess.stdout.on('data', (data) => {
        mainWindow.webContents.send('status-update', `npm: ${data.toString().trim()}`);
      });

      installProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      installProcess.on('exit', (code) => {
        if (code === 0) {
          mainWindow.webContents.send('status-update', 'Dependências instaladas com sucesso');
          resolve();
        } else {
          reject(new Error(`npm install falhou: ${errorOutput}`));
        }
      });

      installProcess.on('error', (error) => {
        reject(new Error(`Erro ao executar npm: ${error.message}`));
      });
    });
  }

  return Promise.resolve();
}
