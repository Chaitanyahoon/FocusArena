import { motion } from 'framer-motion'
import { type Task, TaskStatus } from '../types'
import { memo } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'
import { BriefcaseIcon, BookOpenIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/solid'

interface TaskItemProps {
    item: Task
    theme: any
    onComplete: (id: number) => void
}

const CATEGORY_META: Record<number, { label: string; icon: typeof BriefcaseIcon }> = {
    0: { label: 'Study', icon: BookOpenIcon },
    1: { label: 'Work', icon: BriefcaseIcon },
    2: { label: 'Fitness', icon: HeartIcon },
    3: { label: 'Personal', icon: SparklesIcon },
    4: { label: 'Learning', icon: BookOpenIcon },
}

const DIFFICULTY_LABEL: Record<number, string> = {
    0: 'Easy',
    1: 'Medium',
    2: 'Hard',
}

const TaskItem = memo(({ item, theme, onComplete }: TaskItemProps) => {
    const isDone = item.status === TaskStatus.Done
    const categoryMeta = CATEGORY_META[item.category] ?? { label: 'Task', icon: SparklesIcon }
    const CategoryIcon = categoryMeta.icon

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`command-card group rounded-2xl px-4 py-3 transition-all duration-300 ${isDone ? 'border-white/5 bg-white/[0.02]' : `${theme.accentBorderHover}`}`}
        >
            <div className="flex items-start gap-3">
                <button
                    onClick={() => onComplete(item.id)}
                    aria-label={`Complete ${item.title}`}
                    className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isDone
                        ? `${theme.accentClass} border-transparent`
                        : `border-white/10 ${theme.accentSoft} ${theme.accentBorder} hover:scale-105`}`}
                >
                    {isDone ? (
                        <CheckIcon className={`w-3.5 h-3.5 ${theme.name === 'Obsidian' ? 'text-black' : 'text-white'} stroke-[3]`} />
                    ) : (
                        <div className={`h-1.5 w-1.5 rounded-full ${theme.accentClass} opacity-60`} />
                    )}
                </button>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className={`truncate text-[12px] font-semibold transition-all duration-300 ${isDone ? 'text-white/25 line-through' : 'text-white/85 group-hover:text-white'}`}>
                                {item.title}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-white/28">
                                <span className="inline-flex items-center gap-1">
                                    <CategoryIcon className="w-3 h-3" />
                                    {categoryMeta.label}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-white/10" />
                                <span>{DIFFICULTY_LABEL[item.difficulty] ?? 'Normal'}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 pt-0.5">
                            <div className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.18em] ${isDone ? 'border-white/10 bg-white/[0.04] text-white/35' : `${theme.accentSoft} ${theme.accentBorder} ${theme.accentText}`}`}>
                                {isDone ? 'Done' : 'Active'}
                            </div>
                            <div className="flex items-center gap-1.5">
                                {[...Array(item.difficulty + 1)].map((_, i) => (
                                    <div key={i} className={`h-1.5 w-1.5 rounded-full ${theme.accentClass} ${i === item.difficulty ? 'opacity-100' : 'opacity-35'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
})

export default TaskItem
