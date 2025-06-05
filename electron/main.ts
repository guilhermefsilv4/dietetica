import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { spawn } from 'child_process';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let backendProcess: any = null;

function createWindow(dbType: 'dev' | 'prod') {
  // Inicia o backend com o banco de dados selecionado
  const backendPath = path.join(__dirname, '../../backend-sqlite/src/index.js');
  console.log('Backend path:', backendPath);

  backendProcess = spawn('node', [backendPath], {
    env: {
      ...process.env,
      NODE_ENV: dbType === 'dev' ? 'development' : 'production'
    }
  });

  backendProcess.stdout.on('data', (data: any) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data: any) => {
    console.error(`Backend Error: ${data}`);
  });

  // Cria a janela principal
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Em desenvolvimento, carrega do servidor Angular
  if (process.env.NODE_ENV === 'development') {
    console.log('Loading from dev server...');
    mainWindow.loadURL('http://localhost:4200');
    mainWindow.webContents.openDevTools();
  } else {
    // Em produção, carrega dos arquivos construídos
    const indexPath = path.join(__dirname, '../dietetica/index.html');
    console.log('Loading from production path:', indexPath);
    mainWindow.loadFile(indexPath);
    // Abre o DevTools para debug
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Cria a janela de seleção de ambiente
function createEnvSelector() {
  const envWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false,
    resizable: false,
    transparent: true
  });

  envWindow.loadFile(path.join(__dirname, 'environment-selector.html'));

  // Quando o ambiente for selecionado
  ipcMain.once('select-environment', (event, dbType: 'dev' | 'prod') => {
    envWindow.close();
    createWindow(dbType);
  });
}

app.on('ready', () => {
  createEnvSelector();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) {
      backendProcess.kill();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null && BrowserWindow.getAllWindows().length === 0) {
    createEnvSelector();
  }
});
