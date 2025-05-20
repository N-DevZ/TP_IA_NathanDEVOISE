const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('disable-features', 'WebRtcHideLocalIpsWithMdns'); // <- Ici
app.commandLine.appendSwitch('disable-ipv6');


async function createWindow() {
  const isDev = await import('electron-is-dev').then(module => module.default);

  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  ipcMain.on('minimize-window', () => win.minimize());
  ipcMain.on('maximize-window', () => win.isMaximized() ? win.unmaximize() : win.maximize());
  ipcMain.on('close-window', () => win.close());
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
