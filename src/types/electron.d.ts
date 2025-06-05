export interface IElectronAPI {
  selectEnvironment: (dbType: 'dev' | 'prod') => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
