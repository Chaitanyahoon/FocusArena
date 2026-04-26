const { spawn } = require('node:child_process')
const waitOn = require('wait-on')
const electronBinary = require('electron')

const env = { ...process.env, VITE_DEV_SERVER_URL: 'http://localhost:5173' }
delete env.ELECTRON_RUN_AS_NODE

waitOn({ resources: ['tcp:5173'] }, (error) => {
    if (error) {
        console.error('Electron launch aborted:', error)
        process.exit(1)
        return
    }

    const child = spawn(electronBinary, ['.'], {
        cwd: process.cwd(),
        env,
        stdio: 'inherit',
    })

    child.on('exit', (code) => {
        process.exit(code ?? 0)
    })

    child.on('error', (spawnError) => {
        console.error('Electron failed to start:', spawnError)
        process.exit(1)
    })
})
