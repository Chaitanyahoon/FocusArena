import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="desktop-stage">
        <div className="desktop-viewport">
          <div className="desktop-viewport-inner relative flex h-full items-center justify-center overflow-hidden text-white app-drag-region">
            <div className="ambient-orb-desktop left-[-4rem] top-[-2rem] h-40 w-40 bg-white/20" />
            <div className="ambient-orb-desktop bottom-[-3rem] right-[-2rem] h-44 w-44 bg-indigo-500/30" />
            <div className="command-card rounded-[2rem] px-8 py-7 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="section-label">Focus Arena Desktop</span>
                <span className="text-[11px] uppercase tracking-[0.22em] text-white/24">Connecting to Arena</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-transparent text-white overflow-hidden select-none">
      {isAuthenticated ? <Dashboard /> : <Login />}
    </div>
  )
}

export default App
