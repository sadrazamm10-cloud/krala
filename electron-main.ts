import { app, BrowserWindow, Menu, shell, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = !app.isPackaged;

// Import the server
let serverProcess: any;

async function startServer() {
  if (isDev) {
    console.log('Dev mode: Server should be started by concurrently');
    return;
  }
  try {
    // In production, we import the compiled server
    await import('./server.js'); 
    console.log('Express server started');
    // Give the server a moment to start listening
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (err) {
    console.error('Failed to start express server:', err);
  }
}

function createMenu(win: BrowserWindow) {
  const template: any = [
    {
      label: 'Dosya',
      submenu: [
        { label: 'Yeniden Başlat', role: 'reload' },
        { label: 'Zorla Yeniden Başlat', role: 'forceReload' },
        { type: 'separator' },
        { label: 'Çıkış', role: 'quit' }
      ]
    },
    {
      label: 'Görünüm',
      submenu: [
        { label: 'Tam Ekran', role: 'togglefullscreen' },
        { label: 'Yakınlaştır', role: 'zoomIn' },
        { label: 'Uzaklaştır', role: 'zoomOut' },
        { label: 'Varsayılan Boyut', role: 'resetZoom' }
      ]
    },
    {
      label: 'Hızlı Erişim',
      submenu: [
        { label: 'Ana Panel', click: () => win.loadURL('http://127.0.0.1:3000/#/') },
        { label: 'Oyuncu Yönetimi', click: () => win.loadURL('http://127.0.0.1:3000/#/players') },
        { label: 'Hesap Yönetimi', click: () => win.loadURL('http://127.0.0.1:3000/#/accounts') },
        { type: 'separator' },
        { label: 'Veritabanı Yönetimi', click: () => win.loadURL('http://127.0.0.1:3000/#/database') },
        { label: 'Dosya Gezgini', click: () => win.loadURL('http://127.0.0.1:3000/#/files') },
        { label: 'Sunucu Konsolu', click: () => win.loadURL('http://127.0.0.1:3000/#/console') }
      ]
    },
    {
      label: 'Yardım',
      submenu: [
        {
          label: 'ITJA Web Sitesi',
          click: async () => {
            await shell.openExternal('https://www.ugurkaya.work');
          }
        },
        {
          label: 'Hakkında',
          click: () => {
            dialog.showMessageBox(win, {
              type: 'info',
              title: 'Hakkında',
              message: 'ITJA GAME PANEL',
              detail: 'Geliştirici: Uğur Kaya\nWeb: www.ugurkaya.work\nVersiyon: 1.0.0'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.cjs');
  console.log('Preload path:', preloadPath);

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
    title: "ITJA GAME PANEL",
    backgroundColor: '#ffffff', // Set a background color
  });

  createMenu(win);

  const url = 'http://127.0.0.1:3000';
  
  const loadWithRetry = (attempts = 0) => {
    win.loadURL(url).catch(err => {
      if (attempts < 10) { // Increased retries
        console.log(`Failed to load URL, retrying... (${attempts + 1})`);
        setTimeout(() => loadWithRetry(attempts + 1), 1000);
      } else {
        console.error('Failed to load URL after 10 attempts:', err);
      }
    });
  };

  loadWithRetry();

  // DevTools removed as requested
  // win.webContents.openDevTools();
  
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
  });
}

app.whenReady().then(async () => {
  await startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
