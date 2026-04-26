import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { taskAPI, analyticsAPI, leaderboardAPI } from '../services/api'
import { type Task, TaskStatus, TaskCategory } from '../types'
import type { DashboardStats } from '../types'
import { useAuthStore } from '../stores/authStore'
import TaskItem from '../components/TaskItem'
import NoteItem from '../components/NoteItem'
import LeaderboardOverlay from '../components/LeaderboardOverlay'
import BadgeUnlockModal from '../components/BadgeUnlockModal'
import {
    ArrowsPointingInIcon,
    ArrowRightOnRectangleIcon,
    ArrowsPointingOutIcon,
    SwatchIcon,
    XMarkIcon,
    PlusIcon,
    PlayIcon,
    PauseIcon,
    ArrowPathIcon,
    TrophyIcon,
    SparklesIcon
} from '@heroicons/react/24/solid'
import { useTimerStore } from '../stores/timerStore'

// IPC helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ipcRenderer = (window as any).electron ? (window as any).electron.ipcRenderer : { send: () => console.warn('IPC not available') }

const THEMES = [
    {
        name: 'Obsidian',
        bg: 'bg-zinc-950/90',
        border: 'border-zinc-800/50',
        text: 'text-zinc-100',
        textMuted: 'text-zinc-500',
        accent: 'zinc-100',
        accentClass: 'bg-zinc-100',
        accentText: 'text-zinc-100',
        accentBorder: 'border-zinc-100/40',
        accentBorderHover: 'hover:border-zinc-100/40',
        accentSoft: 'bg-zinc-100/10',
        hover: 'hover:bg-zinc-900',
        active: 'bg-zinc-900',
        shadow: 'shadow-zinc-950/50'
    },
    {
        name: 'Midnight',
        bg: 'bg-slate-950/90',
        border: 'border-slate-800/50',
        text: 'text-slate-100',
        textMuted: 'text-slate-500',
        accent: 'indigo-500',
        accentClass: 'bg-indigo-500',
        accentText: 'text-indigo-400',
        accentBorder: 'border-indigo-400/40',
        accentBorderHover: 'hover:border-indigo-400/40',
        accentSoft: 'bg-indigo-500/10',
        hover: 'hover:bg-slate-900',
        active: 'bg-slate-900',
        shadow: 'shadow-indigo-950/50'
    },
    {
        name: 'Forest',
        bg: 'bg-stone-950/90',
        border: 'border-stone-800/50',
        text: 'text-stone-100',
        textMuted: 'text-stone-500',
        accent: 'emerald-500',
        accentClass: 'bg-emerald-500',
        accentText: 'text-emerald-400',
        accentBorder: 'border-emerald-400/40',
        accentBorderHover: 'hover:border-emerald-400/40',
        accentSoft: 'bg-emerald-500/10',
        hover: 'hover:bg-stone-900',
        active: 'bg-stone-900',
        shadow: 'shadow-emerald-950/50'
    },
    {
        name: 'Crimson',
        bg: 'bg-neutral-950/90',
        border: 'border-neutral-800/50',
        text: 'text-neutral-100',
        textMuted: 'text-neutral-500',
        accent: 'rose-500',
        accentClass: 'bg-rose-500',
        accentText: 'text-rose-400',
        accentBorder: 'border-rose-400/40',
        accentBorderHover: 'hover:border-rose-400/40',
        accentSoft: 'bg-rose-500/10',
        hover: 'hover:bg-neutral-900',
        active: 'bg-neutral-900',
        shadow: 'shadow-rose-950/50'
    }
]

export default function Dashboard() {
    const { user, logout } = useAuthStore()
    const [tasks, setTasks] = useState<Task[]>([])
    const [newItemTitle, setNewItemTitle] = useState('')
    const [isMiniMode, setIsMiniMode] = useState(false)
    const [activeTab, setActiveTab] = useState<'quests' | 'notes'>('quests')
    const [showSettings, setShowSettings] = useState(false)
    const [theme, setTheme] = useState(THEMES[0])
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [stealthMode, setStealthMode] = useState(() => localStorage.getItem('stealthMode') === 'true')
    const [userRank, setUserRank] = useState<number | string>('?')
    const [showLeaderboard, setShowLeaderboard] = useState(false)
    const [newBadge, setNewBadge] = useState<string | null>(null)

    useEffect(() => {
        localStorage.setItem('stealthMode', stealthMode.toString())
        ipcRenderer.send('update-taskbar-visibility', stealthMode && isMiniMode)
    }, [stealthMode, isMiniMode])

    const fetchTasks = async () => {
        try {
            const [taskData, statsData] = await Promise.all([
                taskAPI.getAll(),
                analyticsAPI.getDashboardStats()
            ])
            setTasks(taskData || [])
            setStats(statsData)
            fetchRank()
        } catch (error) {
            console.error("Failed to load data", error)
        }
    }

    const fetchRank = async () => {
        try {
            const global = await leaderboardAPI.getGlobal()
            const myRank = global.find(u => u.userId === user?.id)
            if (myRank) setUserRank(myRank.rank)
        } catch (error) {}
    }

    const { secondsLeft, isRunning, mode, start, pause, reset, tick, toggleMode, totalSessions } = useTimerStore()

    useEffect(() => {
        let interval: any
        if (isRunning) {
            interval = setInterval(() => {
                tick()
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isRunning, tick])

    useEffect(() => {
        fetchTasks()
        ipcRenderer.send('resize-window', 320, 540)

        // Listen for global toggle shortcut
        const unsubscribe = ipcRenderer.on('toggle-mini-mode', () => {
            toggleMiniMode()
        })

        return () => {
            if (unsubscribe) unsubscribe()
        }
    }, [isMiniMode]) 

    const toggleMiniMode = () => {
        setIsMiniMode(prev => {
            const nextMode = !prev
            if (nextMode) {
                ipcRenderer.send('resize-window', 140, 48)
            } else {
                ipcRenderer.send('resize-window', 320, 540)
            }
            return nextMode
        })
    }

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newItemTitle.trim()) return

        try {
            const isNote = activeTab === 'notes'
            await taskAPI.create({
                title: newItemTitle,
                category: isNote ? TaskCategory.Note : TaskCategory.Personal,
                difficulty: 1,
                recurrence: 0
            })
            setNewItemTitle('')
            fetchTasks()
        } catch (error) {
            console.error('Failed to save', error)
        }
    }

    const handleComplete = useCallback(async (id: number) => {
        try {
            const result = await taskAPI.complete(id)
            setTasks(prev => prev.filter(t => t.id !== id))
            
            // Handle Badge Unlock
            if (result.badgesEarned && result.badgesEarned.length > 0) {
                setNewBadge(result.badgesEarned[0].name)
            }
            
            // Refresh stats to update progress ring and rank
            const statsData = await analyticsAPI.getDashboardStats()
            setStats(statsData)
            fetchRank()
        } catch (error) {
            console.error('Failed complete', error)
        }
    }, [user])

    const handleDelete = useCallback(async (id: number) => {
        try {
            await taskAPI.delete(id)
            setTasks(prev => prev.filter(t => t.id !== id))
        } catch (error) {
            console.error('Failed delete', error)
        }
    }, [])

    const filteredItems = tasks.filter(t =>
        activeTab === 'notes'
            ? t.category === TaskCategory.Note
            : t.category !== TaskCategory.Note
    )

    const activeTasks = tasks.filter(t => t.category !== TaskCategory.Note && t.status !== TaskStatus.Done)
    const todoCount = activeTasks.length
    const nextTask = activeTasks[0]
    const sessionsToday = totalSessions
    const timerDuration = mode === 'focus' ? 25 * 60 : 5 * 60
    const timerProgress = 1 - secondsLeft / timerDuration

    const progress = stats ? (stats.completedTasks / (stats.totalTasks || 1)) : 0
    // SVG Circle properties
    const strokeDasharray = 88 // 2 * PI * r (r=14) approx

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-transparent">
            {!isMiniMode && (
                <>
                    <div className="desktop-stage absolute inset-0">
                        <div className="desktop-viewport" />
                    </div>
                    <div className="ambient-orb-desktop right-[8%] top-[4%] h-32 w-32 bg-white/18" />
                    <div className="ambient-orb-desktop bottom-[6%] left-[14%] h-40 w-40 bg-indigo-500/24" />
                </>
            )}
            <div className={`relative z-10 flex h-full w-full items-start justify-end ${isMiniMode ? 'p-1.5' : 'p-2'}`}>
                <AnimatePresence mode="wait">
                {isMiniMode ? (
                    /* PILL MODE: 140x48 */
                    <motion.div
                        key="pill"
                        layoutId="main-card"
                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -10 }}
                        transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
                        onClick={toggleMiniMode}
                        className={`desktop-shell h-[42px] w-[132px] rounded-full px-3 flex items-center justify-between app-drag-region cursor-pointer group ${isRunning ? 'timer-active' : ''}`}
                    >
                        <div className="flex flex-col items-start justify-center no-drag">
                            <span className="text-[10px] font-bold text-white/40 group-hover:text-white/80 transition-colors uppercase tracking-widest leading-none">
                                {mode === 'focus' ? 'Focus' : 'Break'}
                            </span>
                            <span className={`text-[11px] font-black tabular-nums transition-colors ${isRunning ? theme.accentText : 'text-white/60'}`}>
                                {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
                            </span>
                        </div>

                        <div className="relative flex items-center justify-center no-drag">
                            {/* Circular Progress Ring */}
                            <svg className="absolute w-8 h-8 -rotate-90">
                                <circle
                                    cx="16"
                                    cy="16"
                                    r="14"
                                    className="stroke-white/10 fill-none"
                                    strokeWidth="1.5"
                                />
                                <motion.circle
                                    cx="16"
                                    cy="16"
                                    r="14"
                                    className={`fill-none stroke-current ${theme.accentText}`}
                                    strokeWidth="1.5"
                                    strokeDasharray={strokeDasharray}
                                    initial={{ strokeDashoffset: strokeDasharray }}
                                    animate={{ strokeDashoffset: strokeDasharray - (strokeDasharray * progress) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            
                            <div className={`h-6 min-w-[24px] px-1.5 rounded-full ${theme.accentClass} flex items-center justify-center shadow-lg relative z-10`}>
                                <span className={`text-[11px] font-black ${theme.name === 'Obsidian' ? 'text-black' : 'text-white'}`}>
                                    {todoCount}
                                </span>
                            </div>
                            
                            {/* Suble glow pulse if tasks exist */}
                            {todoCount > 0 && (
                                <div className={`absolute inset-0 rounded-full ${theme.accentClass} opacity-20 blur-md animate-pulse scale-110`} />
                            )}
                        </div>
                        
                        <div className="no-drag opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowsPointingOutIcon className="w-3 h-3 text-white/50" />
                        </div>
                    </motion.div>
                ) : (
                    /* EXPANDED MODE: 320x420 */
                    <motion.div
                        key="expanded"
                        layoutId="main-card"
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
                        className={`desktop-shell w-[300px] h-[520px] rounded-[2rem] flex flex-col overflow-hidden box-border`}
                    >
                        {/* Settings Overlay */}
                        <AnimatePresence>
                            {showSettings && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-xl z-[60] p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="section-label">Palette Vault</h3>
                                        <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors no-drag">
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="command-card flex items-center justify-between rounded-2xl p-4 no-drag mb-2">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-bold text-white">Stealth Mode</span>
                                                <span className="text-[10px] text-white/40">Hide from taskbar in Pill mode</span>
                                            </div>
                                            <button 
                                                onClick={() => setStealthMode(!stealthMode)}
                                                className={`w-10 h-5 rounded-full relative transition-colors ${stealthMode ? theme.accentClass : 'bg-white/10'}`}
                                            >
                                                <motion.div 
                                                    animate={{ x: stealthMode ? 22 : 2 }}
                                                    className={`absolute top-1 w-3 h-3 rounded-full ${stealthMode ? (theme.name === 'Obsidian' ? 'bg-black' : 'bg-white') : 'bg-white/40'}`}
                                                />
                                            </button>
                                        </div>

                                        <h3 className="section-label mt-2 mb-1">Palettes</h3>
                                        {THEMES.map(t => (
                                            <button
                                                key={t.name}
                                                onClick={() => { setTheme(t); setShowSettings(false) }}
                                                className={`command-card flex items-center justify-between rounded-2xl p-3 transition-all no-drag ${theme.name === t.name ? 'border-white/20 bg-white/5' : 'border-transparent'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${t.accentClass}`} />
                                                    <span className="text-xs font-bold">{t.name}</span>
                                                </div>
                                                {theme.name === t.name && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Top Header Bar */}
                        <div className="h-12 flex-shrink-0 flex items-center justify-between px-6 app-drag-region">
                            <div className="flex items-center gap-2 cursor-pointer no-drag group" onClick={toggleMiniMode}>
                                <div className={`w-2.5 h-2.5 rounded-full ${theme.accentClass} ${todoCount > 0 ? 'animate-pulse' : ''} shadow-glow-accent`} />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-colors">Arena</span>
                            </div>
                            <div className="flex items-center gap-1 no-drag">
                                <button onClick={() => setShowLeaderboard(true)} className="p-2 text-white/30 hover:text-amber-400 hover:bg-amber-500/10 rounded-full transition-all">
                                    <TrophyIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => setShowSettings(true)} className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-full transition-all">
                                    <SwatchIcon className="w-4 h-4" />
                                </button>
                                <button onClick={toggleMiniMode} className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-full transition-all">
                                    <ArrowsPointingInIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => ipcRenderer.send('quit-app')} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all">
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                                <button onClick={logout} className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-full transition-all">
                                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* User Prestige Hub */}
                        <div className="px-6 mb-2 no-drag">
                            <div className="command-card flex items-center gap-2 rounded-3xl p-3 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-white/[0.01] -z-10 group-hover:bg-white/[0.04] transition-colors" />
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`w-9 h-9 rounded-2xl ${theme.accentClass} flex items-center justify-center shadow-glow-accent opacity-80`}>
                                    <SparklesIcon className={`w-5 h-5 ${theme.name === 'Obsidian' ? 'text-black' : 'text-white'}`} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-white/80 text-[11px] font-black tracking-tight truncate">{user?.name || 'Hunter'}</span>
                                            <div className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">
                                                <span className="text-[8px] font-black text-white/40 uppercase">Lv.{user?.level || 1}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-white/30 font-bold tabular-nums">#{userRank} Rank</span>
                                            <div className="w-[1px] h-2 bg-white/5" />
                                            <span className="text-[10px] text-white/30 font-bold tabular-nums">{user?.xp || 0} XP</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`rounded-2xl border px-2.5 py-2 text-right ${theme.accentSoft} ${theme.accentBorder}`}>
                                    <div className={`text-[9px] font-black uppercase tracking-[0.18em] ${theme.accentText}`}>Open</div>
                                    <div className="text-sm font-black text-white tabular-nums">{todoCount}</div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-2 no-drag">
                            <div className="command-card rounded-[1.5rem] p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="section-label">Today&apos;s run</div>
                                        <h2 className="mt-2 text-[16px] font-black tracking-tight text-white">
                                            {nextTask ? nextTask.title : activeTab === 'notes' ? 'Log the next idea.' : 'No active quests queued.'}
                                        </h2>
                                        <p className="mt-1 text-[10px] leading-5 text-white/38">
                                            {nextTask
                                                ? `Next best action is already chosen. Clear it before the window closes.`
                                                : activeTasks.length === 0
                                                    ? 'Add one task to keep the desktop client useful as a daily cockpit.'
                                                    : 'Capture a note or reset the session state before leaving.'}
                                        </p>
                                    </div>
                                    <div className={`rounded-2xl px-3 py-2 text-right ${theme.accentSoft} border ${theme.accentBorder}`}>
                                        <div className={`text-[9px] font-black uppercase tracking-[0.18em] ${theme.accentText}`}>Open</div>
                                        <div className="text-lg font-black text-white">{todoCount}</div>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    <div className="rounded-2xl border border-white/6 bg-black/20 px-3 py-2.5">
                                        <div className="section-label">Streak</div>
                                        <div className="mt-1 text-sm font-black text-white tabular-nums">{stats?.currentStreak ?? user?.streakCount ?? 0}</div>
                                    </div>
                                    <div className="rounded-2xl border border-white/6 bg-black/20 px-3 py-2.5">
                                        <div className="section-label">Sessions</div>
                                        <div className="mt-1 text-sm font-black text-white tabular-nums">{sessionsToday}</div>
                                    </div>
                                    <div className="rounded-2xl border border-white/6 bg-black/20 px-3 py-2.5">
                                        <div className="section-label">Focus</div>
                                        <div className="mt-1 text-sm font-black text-white tabular-nums">{Math.round(timerProgress * 100)}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Focus Hub (Timer Section) */}
                        <div className="px-6 py-2 no-drag flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <button 
                                        onClick={toggleMode}
                                        className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors text-left no-drag"
                                    >
                                        {mode === 'focus' ? 'Deep Work' : 'Refuel Break'}
                                    </button>
                                    <h2 className={`text-2xl font-black tabular-nums ${isRunning ? theme.accentText : 'text-white/90'}`}>
                                        {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={reset}
                                        className="p-2.5 rounded-2xl glass-light hover:bg-white/10 text-white/40 hover:text-white transition-all"
                                        title="Reset"
                                    >
                                        <ArrowPathIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={isRunning ? pause : start}
                                        className={`p-3 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 ${isRunning ? 'bg-white/10 text-white' : `${theme.accentClass} ${theme.name === 'Obsidian' ? 'text-black' : 'text-white'}`}`}
                                    >
                                        {isRunning ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    className={`h-full ${theme.accentClass}`}
                                    initial={false}
                                    animate={{ width: `${timerProgress * 100}%` }}
                                    transition={{ duration: 1, ease: "linear" }}
                                />
                            </div>
                        </div>

                        {/* Custom Tabs */}
                        <div className="px-6 pb-2 no-drag">
                            <div className="flex bg-white/5 rounded-2xl p-1 relative">
                                <motion.div
                                    layoutId="tab-bg"
                                    className="absolute inset-1 bg-white/10 rounded-xl shadow-sm"
                                    initial={false}
                                    animate={{ x: activeTab === 'quests' ? 0 : '100%' }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    style={{ width: 'calc(50% - 4px)' }}
                                />
                                <button
                                    onClick={() => setActiveTab('quests')}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-[0.1em] relative z-10 transition-colors ${activeTab === 'quests' ? 'text-white' : 'text-white/30'}`}
                                >
                                    Quests
                                </button>
                                <button
                                    onClick={() => setActiveTab('notes')}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-[0.1em] relative z-10 transition-colors ${activeTab === 'notes' ? 'text-white' : 'text-white/30'}`}
                                >
                                    Logs
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 no-drag">
                            <AnimatePresence mode="popLayout">
                                {filteredItems.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    className="h-full flex flex-col items-center justify-center gap-4 text-white/20 select-none pb-8"
                                    >
                                        <div className="command-card flex h-16 w-16 items-center justify-center rounded-full border-dashed">
                                            <div className="h-2.5 w-2.5 rotate-45 rounded-sm bg-white/25" />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-center">
                                            {activeTab === 'quests' ? 'No contracts queued' : 'No notes captured'}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className={activeTab === 'notes' ? 'columns-1 gap-2' : 'flex flex-col gap-1'}>
                                        {filteredItems.map((item, i) => (
                                            activeTab === 'notes' ? (
                                                <NoteItem
                                                    key={item.id}
                                                    item={item}
                                                    theme={theme}
                                                    onDelete={handleDelete}
                                                    index={i}
                                                />
                                            ) : (
                                                <TaskItem
                                                    key={item.id}
                                                    item={item}
                                                    theme={theme}
                                                    onComplete={handleComplete}
                                                />
                                            )
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Dynamic Footer Input */}
                        <div className="p-6 pt-2 no-drag mt-auto">
                            <form onSubmit={handleAddItem} className="relative group">
                                <div className="absolute inset-0 bg-white/5 rounded-2xl group-focus-within:bg-white/10 transition-colors border border-white/5" />
                                <input
                                    type="text"
                                    value={newItemTitle}
                                    onChange={e => setNewItemTitle(e.target.value)}
                                    placeholder={activeTab === 'quests' ? "Add a new quest..." : "Log a thought..."}
                                    className="w-full bg-transparent text-xs text-white py-3.5 px-5 outline-none placeholder:text-white/20 relative z-10 font-medium"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                    <button type="submit" className={`p-1.5 rounded-lg ${theme.accentClass} text-black shadow-lg`}>
                                        <PlusIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>

            {/* Overlays & Modals */}
            <AnimatePresence>
                {showLeaderboard && (
                    <LeaderboardOverlay 
                        onClose={() => setShowLeaderboard(false)}
                        theme={theme}
                        currentUserId={user?.id}
                    />
                )}
                {newBadge && (
                    <BadgeUnlockModal 
                        badgeName={newBadge}
                        onClose={() => setNewBadge(null)}
                        theme={theme}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

