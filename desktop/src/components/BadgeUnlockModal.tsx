import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { useEffect } from 'react'
import { SoundService } from '../services/soundService'

interface BadgeUnlockModalProps {
    badgeName: string
    onClose: () => void
    theme: any
}

export default function BadgeUnlockModal({ badgeName, onClose, theme }: BadgeUnlockModalProps) {
    useEffect(() => {
        try {
            SoundService.playChime()
        } catch (e) {
            console.warn('Audio play failed', e)
        }
    }, [])

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.8, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.8, y: 20, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={`desktop-shell w-full max-w-[260px] rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden`}
                >
                    {/* Decorative shines */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-white/5 rounded-full blur-3xl -z-10" />
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/20 hover:text-white transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>

                    <div className="relative mb-6">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ 
                                duration: 4, 
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className={`w-20 h-20 rounded-[2rem] ${theme.accentClass} flex items-center justify-center shadow-glow-accent relative z-10`}
                        >
                            <div className={`w-8 h-8 rounded-full ${theme.name === 'Obsidian' ? 'bg-black' : 'bg-white'} shadow-inner`} />
                        </motion.div>
                        <div className={`absolute inset-0 ${theme.accentClass} opacity-20 blur-2xl rounded-full scale-150 -z-10`} />
                    </div>

                    <div className="space-y-2">
                        <span className="section-label">New Achievement</span>
                        <h2 className="text-lg font-black text-white tracking-tight leading-tight">{badgeName}</h2>
                        <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest leading-relaxed">
                            Arena Prestige Increased
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className={`mt-8 w-full py-3 rounded-2xl bg-zinc-100 text-zinc-950 text-[11px] font-black uppercase tracking-widest shadow-xl`}
                    >
                        Claim Reward
                    </motion.button>
                </motion.div>

                {/* Particle effect simulation (Top emitters) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ top: -20, left: `${20 + i * 12}%`, opacity: 1 }}
                            animate={{ top: '110%', opacity: 0 }}
                            transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: "linear", delay: Math.random() }}
                            className={`absolute w-1 h-3 rounded-full ${theme.accentClass} opacity-20 blur-[1px]`}
                        />
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
