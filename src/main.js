const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;
let frontendProcess;

// Keep a global reference of the window object
function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false
  });

  // Load the setup page
  mainWindow.loadFile(path.join(__dirname, 'setup.html'));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

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

    // Start backend with selected environment
    await startBackend(dbEnvironment);

    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start frontend
    await startFrontend();

    // Wait for frontend to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Navigate to the application
    mainWindow.loadURL('http://localhost:4200');

    return { success: true };
  } catch (error) {
    console.error('Error starting servers:', error);
    return { success: false, error: error.message };
  }
});

function startBackend(environment) {
  return new Promise((resolve, reject) => {
    const backendPath = path.join(__dirname, '..', 'backend-sqlite');

    // Set environment variable
    const env = { ...process.env };
    env.NODE_ENV = environment;

    backendProcess = spawn('node', ['src/index.js'], {
      cwd: backendPath,
      env: env,
      stdio: 'pipe'
    });

    backendProcess.stdout.on('data', (data) => {
      console.log('Backend:', data.toString());
    });

    backendProcess.stderr.on('data', (data) => {
      console.error('Backend Error:', data.toString());
    });

    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
      reject(error);
    });

    // Give backend time to start
    setTimeout(() => {
      resolve();
    }, 2000);
  });
}

function startFrontend() {
  return new Promise((resolve, reject) => {
    const projectPath = path.join(__dirname, '..');

    // Use different command based on platform
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'npx.cmd' : 'npx';

    frontendProcess = spawn(command, ['ng', 'serve', '--host', '0.0.0.0', '--port', '4200'], {
      cwd: projectPath,
      stdio: 'pipe',
      shell: true
    });

    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Frontend:', output);

      // Check if server is ready
      if (output.includes('Local:') || output.includes('webpack compiled')) {
        resolve();
      }
    });

    frontendProcess.stderr.on('data', (data) => {
      console.error('Frontend Error:', data.toString());
    });

    frontendProcess.on('error', (error) => {
      console.error('Failed to start frontend:', error);
      reject(error);
    });
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
app.whenReady().then(createWindow);

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
