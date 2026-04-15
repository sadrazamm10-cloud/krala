import { app, BrowserWindow } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the server
// We'll use dynamic import to start the express server
let serverProcess: any;

async function startServer() {
  if (isDev) {
    console.log('Dev mode: Server should be started by concurrently');
    return;
  }
  try {
    // In production, we import the compiled server
    // We assume server.ts is compiled to server.js in the same directory or dist
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
  // In dev, we load from the vite dev server
  // In prod, we load from the express server (which serves the dist folder)
  const url = isDev ? 'http://localhost:3000' : 'http://localhost:3000';
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
