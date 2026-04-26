const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        send: (channel, ...args) => ipcRenderer.send(channel, ...args),
        on: (channel, func) => {
            const subscription = (_event, ...args) => func(...args)
            ipcRenderer.on(channel, subscription)
            return () => ipcRenderer.removeListener(channel, subscription)
        }
    }
})
