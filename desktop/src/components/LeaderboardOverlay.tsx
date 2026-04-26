import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, TrophyIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import { useState, useEffect } from 'react'
import { leaderboardAPI } from '../services/api'
import type { LeaderboardEntry } from '../types'

interface LeaderboardOverlayProps {
    onClose: () => void
    theme: any
    currentUserId?: number
}

export default function LeaderboardOverlay({ onClose, theme, currentUserId }: LeaderboardOverlayProps) {
    const [view, setView] = useState<'global' | 'weekly'>('global')
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const data = view === 'global' 
                ? await leaderboardAPI.getGlobal() 
                : await leaderboardAPI.getWeekly()
            setEntries(data)
        } catch (e) {
            console.error('Leaderboard error', e)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [view])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[80] bg-black/80 backdrop-blur-2xl flex flex-col pt-12 pb-6"
        >
            {/* Header */}
            <div className="px-6 flex items-center justify-between mb-6">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">Arena Rankings</span>
                    <h2 className="text-xl font-black text-white tracking-tight">The Prestige</h2>
                </div>
                <button 
                    onClick={onClose}
                    className="command-card p-2.5 rounded-2xl hover:bg-white/10 text-white/40 hover:text-white transition-all shadow-xl"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Toggle Tabs */}
            <div className="px-6 mb-6">
                <div className="command-card flex rounded-2xl p-1 relative">
                    <motion.div
                        layoutId="rank-tab-bg"
                        className="absolute inset-1 bg-white/10 rounded-xl shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                        initial={false}
                        animate={{ x: view === 'global' ? 0 : '100%' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                        style={{ width: 'calc(50% - 4px)' }}
                    />
                    <button
                        onClick={() => setView('global')}
                        className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] relative z-10 transition-colors ${view === 'global' ? 'text-white' : 'text-white/20'}`}
                    >
                        Global
                    </button>
                    <button
                        onClick={() => setView('weekly')}
                        className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] relative z-10 transition-colors ${view === 'weekly' ? 'text-white' : 'text-white/20'}`}
                    >
                        Weekly
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar no-drag">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 py-12">
                            <ArrowPathIcon className="w-5 h-5 text-white/10 animate-spin" />
                            <span className="text-[9px] font-bold text-white/20 tracking-widest uppercase">Fetching Rankings</span>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 py-12 opacity-20">
                            <TrophyIcon className="w-8 h-8" />
                            <span className="text-[9px] font-bold tracking-widest uppercase">Arena is Empty</span>
                        </div>
                    ) : entries.map((entry, index) => {
                        const isMe = entry.userId === currentUserId
                        const isTop3 = index < 3
                        
                        return (
                            <motion.div
                                layout
                                key={entry.userId}
                                initial={{ opacity: 0, x: -8, scale: 0.98 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ delay: index * 0.04, duration: 0.35 }}
                                className={`command-card flex items-center gap-4 rounded-2xl p-3.5 transition-all duration-300 ${isMe ? `bg-white/10 ${theme.border}` : 'border-white/[0.03]'}`}
                            >
                                <div className="flex items-center justify-center w-8 select-none">
                                    <span className={`text-xs font-black ${isTop3 ? (index === 0 ? 'text-amber-400' : index === 1 ? 'text-zinc-300' : 'text-orange-500') : 'text-white/20'}`}>
                                        #{entry.rank}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-xs font-black tracking-tight truncate ${isMe ? 'text-white' : 'text-white/70'}`}>
                                        {entry.name} {isMe && <span className="text-[9px] text-white/20 ml-1">(YOU)</span>}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-white/30 font-bold tracking-tight">{entry.xp}</span>
                                            <span className="text-[8px] text-white/10 font-black uppercase">XP</span>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-white/5" />
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-white/30 font-bold tracking-tight">{entry.level}</span>
                                            <span className="text-[8px] text-white/10 font-black uppercase">LVL</span>
                                        </div>
                                    </div>
                                </div>
                                {isTop3 && (
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${index === 0 ? 'bg-amber-400/10 text-amber-400' : index === 1 ? 'bg-zinc-100/10 text-zinc-100' : 'bg-orange-500/10 text-orange-500 shadow-xl'}`}>
                                        <TrophyIcon className="w-4 h-4" />
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
