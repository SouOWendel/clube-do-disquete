import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// No Windows, o instalador (Squirrel) abre o app só para criar/remover atalhos.
if (started) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // Interface em Angular (pasta renderer/).
  // Em desenvolvimento: servidor do Angular (ng serve).
  // Empacotado: arquivos do `ng build`, copiados como recurso extra (ver forge.config.mts).
  if (app.isPackaged) {
    mainWindow.loadFile(
      path.join(process.resourcesPath, 'browser', 'index.html'),
    );
  } else {
    mainWindow.loadURL('http://localhost:4200');
    mainWindow.webContents.openDevTools();
  }
};

app.whenReady().then(() => {
  createWindow();

  // macOS: recria a janela ao clicar no ícone do dock.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// macOS: o app continua ativo sem janelas até o Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
