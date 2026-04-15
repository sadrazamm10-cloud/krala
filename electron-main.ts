import { app, BrowserWindow } from 'electron';
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
  } catch (err) {
    console.error('Failed to start express server:', err);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    title: "GAME PANEL - Desktop",
  });

  // Load the app
  const url = 'http://localhost:3000';
  win.loadURL(url);

  if (isDev) {
    win.webContents.openDevTools();
  }
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
