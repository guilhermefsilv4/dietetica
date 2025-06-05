import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  selectEnvironment: (dbType: 'dev' | 'prod') => {
    ipcRenderer.send('select-environment', dbType);
  }
});
