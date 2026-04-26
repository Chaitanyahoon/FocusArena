const { app, BrowserWindow, screen, shell, ipcMain, globalShortcut, Tray, Menu, nativeImage } = require('electron')
const path = require('node:path')

app.disableHardwareAcceleration()
app.commandLine.appendSwitch('no-sandbox')
app.commandLine.appendSwitch('disable-gpu-sandbox')
app.commandLine.appendSwitch('disable-software-rasterizer')

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win = null
let tray = null

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

function createTray() {
    const iconPath = path.join(process.env.VITE_PUBLIC || '', 'icon.png')
    const icon = nativeImage.createFromPath(iconPath)

    tray = new Tray(icon.resize({ width: 16, height: 16 }))
    tray.setToolTip('Focus Arena')

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Focus Arena', enabled: false },
        { type: 'separator' },
        {
            label: 'Show Dashboard',
            click: () => {
                if (win) {
                    win.show()
                    win.webContents.send('toggle-mini-mode', false)
                }
            }
        },
        {
            label: 'Minimize to Pill',
            click: () => {
                if (win) {
                    win.show()
                    win.webContents.send('toggle-mini-mode', true)
                }
            }
        },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
    ])

    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
        if (!win) return
        if (win.isVisible()) {
            win.focus()
        } else {
            win.show()
        }
    })
}

function createWindow() {
    const { width } = screen.getPrimaryDisplay().workAreaSize

    win = new BrowserWindow({
        width: 320,
        height: 420,
        x: width - 340,
        y: 40,
        icon: path.join(process.env.VITE_PUBLIC || '', 'icon.png'),
        backgroundColor: '#00000000',
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
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
    })

    win.setSkipTaskbar(false)

    win.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    ipcMain.on('resize-window', (_event, width, height) => {
        if (!win) return
        const bounds = win.getBounds()
        const rightEdge = bounds.x + bounds.width
        const newX = rightEdge - width

        win.setBounds({
            x: Math.round(newX),
            y: bounds.y,
            width: Math.round(width),
            height: Math.round(height)
        }, true)
    })

    ipcMain.on('update-taskbar-visibility', (_event, shouldSkip) => {
        if (win) {
            win.setSkipTaskbar(shouldSkip)
        }
    })

    ipcMain.on('quit-app', () => {
        app.quit()
    })

    const registered = globalShortcut.register('Alt+Z', () => {
        if (win) {
            win.webContents.send('toggle-mini-mode')
        }
    })

    if (!registered) {
        console.warn('Registration failed for Alt+Z')
    }

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        win.loadFile(path.join(process.env.DIST || '', 'index.html'))
    }
}

app.on('will-quit', () => {
    globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(() => {
    try {
        createWindow()
    } catch (error) {
        console.error('Failed to create window:', error)
    }
    try {
        createTray()
    } catch (error) {
        console.error('Failed to create tray (non-fatal):', error)
    }
})
