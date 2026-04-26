// Central API configuration
const PRODUCTION_API = 'https://focusarenaa.onrender.com'

// Detect if running in Electron dev mode
const isElectronDev = import.meta.env.DEV

export const API_BASE = isElectronDev
    ? 'http://localhost:5134/api' // Point to local backend directly (or via proxy)
    : `${PRODUCTION_API}/api` // Point to production backend in build

export const HUB_BASE = isElectronDev
    ? 'http://localhost:5134'
    : PRODUCTION_API
