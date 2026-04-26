import * as electron from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { app, BrowserWindow, screen, shell, ipcMain, globalShortcut, Tray, Menu, nativeImage } = electron;
// Fix for transparent window on Windows (prevents black background)
app.disableHardwareAcceleration();
// Fix GPU disk cache crash on Windows
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('disable-software-rasterizer');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// @ts-ignore
process.env.DIST = path.join(__dirname, '../dist');
// @ts-ignore
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');
let win;
let tray = null;
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
function createTray() {
    const iconPath = path.join(process.env.VITE_PUBLIC || '', 'icon.png');
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon.resize({ width: 16, height: 16 }));
    tray.setToolTip('Focus Arena');
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Focus Arena', enabled: false },
        { type: 'separator' },
        {
            label: 'Show Dashboard',
            click: () => {
                if (win) {
                    win.show();
                    win.webContents.send('toggle-mini-mode', false); // Expand
                }
            }
        },
        {
            label: 'Minimize to Pill',
            click: () => {
                if (win) {
                    win.show();
                    win.webContents.send('toggle-mini-mode', true); // Minimize
                }
            }
        },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        if (win) {
            if (win.isVisible()) {
                win.focus();
            }
            else {
                win.show();
            }
        }
    });
}
function createWindow() {
    const { width } = screen.getPrimaryDisplay().workAreaSize;
    win = new BrowserWindow({
        width: 320,
        height: 420,
        x: width - 340,
        y: 40,
        icon: path.join(process.env.VITE_PUBLIC || '', 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
        },
        title: 'Focus Arena',
        alwaysOnTop: true,
        frame: false,
        transparent: true,
        resizable: true,
        skipTaskbar: false,
        minWidth: 100,
        minHeight: 40,
    });
    win.setSkipTaskbar(false);
    // Open urls in the user's browser
    win.webContents.setWindowOpenHandler((edata) => {
        shell.openExternal(edata.url);
        return { action: 'deny' };
    });
    // IPC for resizing with anchoring to top-right
    ipcMain.on('resize-window', (_event, width, height) => {
        if (!win)
            return;
        const bounds = win.getBounds();
        // Anchor to Top-Right: Adjust X to maintain Right edge
        const rightEdge = bounds.x + bounds.width;
        const newX = rightEdge - width;
        win.setBounds({
            x: Math.round(newX),
            y: bounds.y, // Maintain current Y
            width: Math.round(width),
            height: Math.round(height)
        }, true); // animate true
    });
    // IPC for taskbar visibility toggling (Stealth Mode)
    ipcMain.on('update-taskbar-visibility', (_event, shouldSkip) => {
        if (win) {
            win.setSkipTaskbar(shouldSkip);
        }
    });
    // IPC for application quitting
    ipcMain.on('quit-app', () => {
        app.quit();
    });
    // Register Global Shortcut: Alt+Z (Common for productivity apps)
    const ret = globalShortcut.register('Alt+Z', () => {
        if (win) {
            win.webContents.send('toggle-mini-mode');
        }
    });
    if (!ret) {
        console.warn('Registration failed for Alt+Z');
    }
    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    }
    else {
        win.loadFile(path.join(process.env.DIST || '', 'index.html'));
    }
}
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
app.whenReady().then(() => {
    try {
        createWindow();
    }
    catch (e) {
        console.error('Failed to create window:', e);
    }
    try {
        createTray();
    }
    catch (e) {
        console.error('Failed to create tray (non-fatal):', e);
    }
});
