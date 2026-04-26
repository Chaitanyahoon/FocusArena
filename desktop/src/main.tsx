import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
      <Toaster position="bottom-center" toastOptions={{
        style: {
          background: 'rgba(6, 10, 18, 0.94)',
          color: '#f8fafc',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          fontSize: '11px',
          fontWeight: '700',
          boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
        }
      }} />
    </HashRouter>
  </React.StrictMode>,
)
