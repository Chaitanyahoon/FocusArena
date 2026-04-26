import { motion } from 'framer-motion'
import type { Task } from '../types'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { memo } from 'react'

interface NoteItemProps {
    item: Task
    theme: any
    onDelete: (id: number) => void
    index: number
}

const NoteItem = memo(({ item, theme, onDelete, index }: NoteItemProps) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.03 }}
            className="command-card group relative mb-2 overflow-hidden rounded-2xl p-4 transition-all duration-300"
        >
            <div className={`absolute top-0 left-0 w-1 h-full ${theme.accentClass} opacity-20`} />
            
            <p className={`text-[11px] text-white/70 whitespace-pre-wrap font-medium leading-relaxed tracking-wide`}>
                {item.title}
            </p>
            
            <button
                onClick={() => onDelete(item.id)}
                className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-red-500/20 text-red-400 transition-all duration-200 no-drag`}
            >
                <XMarkIcon className="w-3.5 h-3.5" />
            </button>
        </motion.div>
    )
})

export default NoteItem
