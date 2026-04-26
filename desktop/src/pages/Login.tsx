import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/solid'

export default function Login() {
    const { login, isLoading } = useAuthStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [serverWarm, setServerWarm] = useState<'idle' | 'pinging' | 'ready' | 'slow'>('idle')

    // Ping backend on mount to warm up Render free-tier (non-blocking)
    useEffect(() => {
        setServerWarm('pinging')
        const timeout = setTimeout(() => setServerWarm('slow'), 5000)
        fetch('https://focusarenaa.onrender.com/api/health')
            .then(() => { clearTimeout(timeout); setServerWarm('ready') })
            .catch(() => { clearTimeout(timeout); setServerWarm('slow') })
        return () => clearTimeout(timeout)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        try {
            await login({ email, password })
            toast.success('Welcome back, Hunter!', {
                style: {
                    background: 'rgba(10,10,10,0.9)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '12px',
                    fontWeight: '700',
                }
            })
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Invalid credentials'
            setError(msg)
        }
    }

    return (
        <div className="desktop-stage select-none">
            <div className="desktop-viewport">
                <div className="desktop-viewport-inner relative flex h-full flex-col items-center justify-center overflow-hidden">
                    <div className="absolute top-0 left-0 z-40 h-10 w-full app-drag-region" />

                    <div className="ambient-orb-desktop left-[-4rem] top-[-3rem] h-44 w-44 bg-white/18" />
                    <div className="ambient-orb-desktop bottom-[-5rem] right-[-3rem] h-56 w-56 bg-indigo-500/30" />
                    <div className="ambient-orb-desktop left-[20%] bottom-[18%] h-36 w-36 bg-emerald-500/18" />

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, type: 'spring', stiffness: 180, damping: 24 }}
                        className="relative z-10 w-full px-5"
                    >
                        <div className="desktop-shell mx-auto w-full max-w-[290px] rounded-[2rem] px-5 pb-5 pt-6">
                    {/* Logo & Title */}
                            <div className="text-center space-y-2">
                                <motion.div
                                    className="mb-4 flex items-center justify-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 18 }}
                                >
                                    <div className="relative">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-[1.25rem] border border-white/10 bg-white/[0.05] shadow-xl">
                                            <div className="h-3.5 w-3.5 rounded-full bg-zinc-100 shadow-[0_0_14px_rgba(255,255,255,0.45)]" />
                                        </div>
                                        <div className="absolute -inset-2 -z-10 rounded-[1.5rem] bg-white/[0.02] blur-md" />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="section-label">Desktop command center</div>
                                    <h1 className="mt-2 text-[22px] font-black tracking-tight text-gradient-desktop">Focus Arena</h1>
                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/22">Compact focus cockpit</p>
                                </motion.div>
                            </div>

                            {/* Server status */}
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-5 overflow-hidden"
                            >
                                <div className={`command-card flex items-center gap-2 rounded-2xl px-4 py-3 ${serverWarm === 'slow'
                                    ? 'border-amber-500/20 bg-amber-500/[0.08]'
                                    : serverWarm === 'ready'
                                        ? 'border-emerald-500/20 bg-emerald-500/[0.08]'
                                        : ''}`}>
                                    <div className={`status-dot flex-shrink-0 ${serverWarm === 'slow'
                                        ? 'animate-pulse bg-amber-400 text-amber-400'
                                        : serverWarm === 'ready'
                                            ? 'bg-emerald-400 text-emerald-400'
                                            : 'animate-pulse bg-white/35 text-white/35'}`} />
                                    <span className={`text-[10px] font-medium ${serverWarm === 'slow'
                                        ? 'text-amber-300/90'
                                        : serverWarm === 'ready'
                                            ? 'text-emerald-300/90'
                                            : 'text-white/45'}`}>
                                        {serverWarm === 'slow'
                                            ? 'Server warming up. First login may take longer.'
                                            : serverWarm === 'ready'
                                                ? 'Server ready.'
                                                : 'Checking server status.'}
                                    </span>
                                </div>
                            </motion.div>

                            {/* Form card */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="command-card mt-4 rounded-[1.5rem] p-4 backdrop-blur-sm"
                            >
                                <form onSubmit={handleSubmit} className="space-y-2.5">
                        {/* Email */}
                                    <div className="relative group">
                                        <div className="absolute inset-0 rounded-xl border border-white/[0.07] bg-white/[0.04] transition-all duration-200 group-focus-within:border-white/20 group-focus-within:bg-white/[0.07]" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="Email address"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError('') }}
                                            autoComplete="email"
                                            className="relative z-10 w-full bg-transparent px-4 py-3 text-[12px] font-medium text-white outline-none placeholder:text-white/20"
                                        />
                                    </div>

                        {/* Password */}
                                    <div className="relative group">
                                        <div className="absolute inset-0 rounded-xl border border-white/[0.07] bg-white/[0.04] transition-all duration-200 group-focus-within:border-white/20 group-focus-within:bg-white/[0.07]" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setError('') }}
                                            autoComplete="current-password"
                                            className="relative z-10 w-full bg-transparent py-3 pl-4 pr-10 text-[12px] font-medium text-white outline-none placeholder:text-white/20"
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => setShowPassword(v => !v)}
                                            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 p-1 text-white/20 transition-colors hover:text-white/50"
                                        >
                                            {showPassword
                                                ? <EyeSlashIcon className="h-3.5 w-3.5" />
                                                : <EyeIcon className="h-3.5 w-3.5" />
                                            }
                                        </button>
                                    </div>

                        {/* Error message */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -4 }}
                                                className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3 py-2 text-[10px] font-medium text-red-300/85"
                                            >
                                                {error}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>

                        {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isLoading || !email || !password}
                                        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-950 shadow-lg transition-all duration-200 hover:bg-white active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-25"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-zinc-400 border-t-zinc-900" />
                                                <span>Signing in...</span>
                                            </>
                                        ) : 'Enter Arena'}
                                    </button>
                                </form>
                            </motion.div>

                            {/* Footer */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="pt-4 text-center"
                            >
                                <span className="text-[10px] text-white/15">No account? </span>
                                <a
                                    href="https://focusarenaa.vercel.app/register"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-bold text-white/30 transition-colors hover:text-white/60"
                                >
                                    Open web registration
                                </a>
                            </motion.div>
                        </div>
                    </motion.div>

                    <div className="absolute right-3 top-3 z-50 no-drag">
                        <button
                            onClick={() => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const ipc = (window as any).electron?.ipcRenderer
                                if (ipc) ipc.send('quit-app')
                            }}
                            className="rounded-full border border-white/8 bg-black/15 p-2 text-white/30 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
