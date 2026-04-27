import { useState, useEffect } from 'react'
import { useTaskStore } from '../stores/taskStore'
import { useAuthStore } from '../stores/authStore'
import { PlusIcon, CheckIcon, TrashIcon, ClockIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { TaskStatus, TaskDifficulty, TaskCategory, CreateTaskDto, RecurrenceType } from '../types'
import toast from 'react-hot-toast'
import RewardReveal from '../components/effects/RewardReveal'
import SystemEmptyState from '../components/shared/SystemEmptyState'

export default function Quests() {
    const { tasks, fetchTasks, createTask, completeTask, deleteTask, isLoading } = useTaskStore()
    const { user } = useAuthStore()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCompleting, setIsCompleting] = useState<number | null>(null)
    const [rewardReveal, setRewardReveal] = useState<{ title: string; xp: number; gold: number } | null>(null)

    // New Task Form State
    const [newTask, setNewTask] = useState<CreateTaskDto>({
        title: '',
        description: '',
        category: TaskCategory.Work,
        difficulty: TaskDifficulty.Easy,
        dueDate: '',
        recurrence: RecurrenceType.None,
        recurrenceInterval: 1
    })

    useEffect(() => {
        fetchTasks()
    }, [])

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const taskPayload = {
                ...newTask,
                dueDate: newTask.dueDate === '' ? undefined : newTask.dueDate
            }
            await createTask(taskPayload)
            toast.success('System: New Quest Acquired')
            setIsModalOpen(false)
            setNewTask({
                title: '',
                description: '',
                category: TaskCategory.Work,
                difficulty: TaskDifficulty.Easy,
                dueDate: '',
                recurrence: RecurrenceType.None,
                recurrenceInterval: 1
            })
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.message || 'System Error: Quest Creation Failed')
        }
    }

    const handleComplete = async (id: number) => {
        if (isCompleting) return
        setIsCompleting(id)
        try {
            const result = await completeTask(id)
            const xpGained = result.xpGained || 0
            toast.success(`QUEST COMPLETE! +${xpGained} XP`)
            setRewardReveal({
                title: 'Quest complete',
                xp: xpGained,
                gold: Math.max(10, Math.floor(xpGained / 2))
            })

            // Trigger a level up check or refresh profile if needed
            // (The store handles basic task list updates)
        } catch (error) {
            toast.error('System Error: Completion Failed')
        } finally {
            setIsCompleting(null)
        }
    }

    // Group tasks by status
    const pendingTasks = tasks.filter(t => t.status !== TaskStatus.Done)
    
    // Filter completed tasks to only show today's completions
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const completedTasks = tasks.filter(t => {
        if (t.status !== TaskStatus.Done) return false
        if (!t.completedAt) return true // Show if date is missing
        const completedDate = new Date(t.completedAt)
        completedDate.setHours(0, 0, 0, 0)
        return completedDate.getTime() === today.getTime()
    })

    // render difficulty badge
    const renderDifficulty = (diff: TaskDifficulty) => {
        switch (diff) {
            case TaskDifficulty.Easy: return <span className="text-gray-400 text-xs border border-gray-600 px-1">E-RANK</span>
            case TaskDifficulty.Medium: return <span className="text-blue-400 text-xs border border-blue-500 px-1">C-RANK</span>
            case TaskDifficulty.Hard: return <span className="text-red-500 text-xs border border-red-500 px-1">S-RANK</span>
        }
    }

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-blue-500/30 pb-4 gap-4 md:gap-0">
                <div>
                    <h1 className="text-4xl text-white font-display font-bold tracking-wider mb-2">QUEST LOG</h1>
                    <p className="text-blue-400/60 font-mono text-sm tracking-widest">
                        ACTIVE HUNTER: {user?.name.toUpperCase()}
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="system-button flex items-center justify-center gap-2 hover:bg-blue-500/10 w-full md:w-auto"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>NEW QUEST</span>
                </button>
            </div>

            {/* Main Quest List (Pending) */}
            <div className="mb-12">
                <h2 className="text-xl text-red-500 font-display font-bold tracking-widest mb-6 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                    CURRENT OBJECTIVES
                </h2>

                {isLoading ? (
                    <div className="system-card rounded-2xl p-8 text-center text-blue-500/50 font-mono animate-pulse">
                        Scanning quest contracts...
                    </div>
                ) : pendingTasks.length === 0 ? (
                    <SystemEmptyState
                        eyebrow="Quest log empty"
                        title="No active contracts."
                        description="The System cannot reward idle intent. Create one concrete objective and give today a win condition."
                        action={
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="system-button system-button-primary px-5 py-3 text-xs"
                            >
                                Generate quest
                            </button>
                        }
                    />
                ) : (
                    <div className="grid gap-4">
                        {pendingTasks.map(task => (
                            <div
                                key={task.id}
                                className="group relative bg-[#0a0f1e]/80 border-l-4 border-l-red-500 border-y border-r border-[#1e293b] p-5 hover:border-l-red-400 hover:bg-[#0f172a] transition-all"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {renderDifficulty(task.difficulty)}
                                            <span className="text-xs text-gray-500 uppercase tracking-wider">{TaskCategory[task.category]}</span>
                                            {task.dueDate && (
                                                <span className="text-xs text-yellow-500 flex items-center gap-1">
                                                    <ClockIcon className="w-3 h-3" />
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                            {task.recurrence !== undefined && task.recurrence !== RecurrenceType.None && (
                                                <span className="text-xs text-purple-400 flex items-center gap-1 border border-purple-500/30 px-1 rounded">
                                                    <ArrowPathIcon className="w-3 h-3" />
                                                    {RecurrenceType[task.recurrence]}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl text-white font-bold mb-1 group-hover:text-blue-200 transition-colors">
                                            {task.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm max-w-2xl">
                                            {task.description || "No specific instructions provided."}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-3">
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500 block">REWARD</span>
                                            <span className="text-green-400 font-bold font-mono text-lg">{task.xpReward} XP</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                                                title="Abandon Quest"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleComplete(task.id)}
                                                disabled={isCompleting === task.id}
                                                className={`flex items-center gap-2 bg-blue-600/10 border border-blue-500/50 text-blue-400 px-4 py-2 hover:bg-blue-600 hover:text-white transition-all skew-x-[-10deg] ${isCompleting === task.id ? 'opacity-50 cursor-wait' : ''}`}
                                            >
                                                {isCompleting === task.id ? (
                                                    <ArrowPathIcon className="w-5 h-5 animate-spin skew-x-[10deg]" />
                                                ) : (
                                                    <CheckIcon className="w-5 h-5 skew-x-[10deg]" />
                                                )}
                                                <span className="font-bold text-sm skew-x-[10deg] tracking-widest">
                                                    {isCompleting === task.id ? 'PROCESSING' : 'COMPLETE'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Logs */}
            <div className="opacity-60">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg text-gray-500 font-display font-bold tracking-widest">
                        TODAY'S COMPLETIONS
                    </h2>
                    {completedTasks.length > 0 && (
                        <span className="text-xs font-mono text-green-500/50">
                            {completedTasks.reduce((acc, curr) => acc + curr.xpReward, 0)} XP TOTAL
                        </span>
                    )}
                </div>
                <div className="grid gap-2">
                    {completedTasks.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-800 bg-black/20 p-4 text-center text-xs font-mono uppercase tracking-[0.18em] text-gray-600">
                            No cleared contracts yet today.
                        </div>
                    ) : (
                        completedTasks.map(task => (
                            <div key={task.id} className="group flex justify-between items-center bg-[#050914] border border-gray-800 p-3 px-6 hover:border-gray-600 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-green-500 rounded-full group-hover:shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-shadow"></div>
                                    <span className="text-gray-400 line-through decoration-gray-600 group-hover:text-gray-300 transition-colors">{task.title}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-green-500/50 font-mono text-sm group-hover:text-green-400/80 transition-colors">+{task.xpReward} XP</span>
                                    <button 
                                        onClick={() => deleteTask(task.id)}
                                        className="text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete Log Entry"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {/* NEW QUEST MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="system-panel w-full max-w-lg p-8 animate-in zoom-in duration-200 border border-blue-500/40 shadow-[0_0_50px_rgba(0,100,255,0.1)]">
                        <h3 className="text-2xl font-display font-bold text-white mb-6 border-b border-gray-800 pb-2">
                            NEW QUEST GENERATION
                        </h3>

                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="text-xs text-blue-400 tracking-widest mb-1 block">OBJECTIVE TITLE</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    className="system-input"
                                    placeholder="Enter quest goal..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs text-blue-400 tracking-widest mb-1 block">DETAILS</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                    className="system-input h-24 resize-none"
                                    placeholder="Additional instructions..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-blue-400 tracking-widest mb-1 block">DIFFICULTY</label>
                                    <select
                                        value={newTask.difficulty}
                                        onChange={e => setNewTask({ ...newTask, difficulty: Number(e.target.value) })}
                                        className="system-input"
                                    >
                                        <option value={TaskDifficulty.Easy}>E-RANK (Easy)</option>
                                        <option value={TaskDifficulty.Medium}>C-RANK (Normal)</option>
                                        <option value={TaskDifficulty.Hard}>S-RANK (Hard)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-blue-400 tracking-widest mb-1 block">CATEGORY</label>
                                    <select
                                        value={newTask.category}
                                        onChange={e => setNewTask({ ...newTask, category: Number(e.target.value) })}
                                        className="system-input"
                                    >
                                        <option value={TaskCategory.Work}>WORK</option>
                                        <option value={TaskCategory.Study}>STUDY</option>
                                        <option value={TaskCategory.Fitness}>FITNESS</option>
                                        <option value={TaskCategory.Personal}>PERSONAL</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-blue-400 tracking-widest mb-1 block">DEADLINE (OPTIONAL)</label>
                                <input
                                    type="date"
                                    value={newTask.dueDate}
                                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    className="system-input"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-blue-400 tracking-widest mb-1 block">RECURRENCE</label>
                                    <select
                                        value={newTask.recurrence}
                                        onChange={e => setNewTask({ ...newTask, recurrence: Number(e.target.value) })}
                                        className="system-input"
                                    >
                                        <option value={RecurrenceType.None}>NO REPEAT</option>
                                        <option value={RecurrenceType.Daily}>DAILY</option>
                                        <option value={RecurrenceType.Weekly}>WEEKLY</option>
                                        <option value={RecurrenceType.Monthly}>MONTHLY</option>
                                    </select>
                                </div>
                                {newTask.recurrence !== RecurrenceType.None && (
                                    <div>
                                        <label className="text-xs text-blue-400 tracking-widest mb-1 block">INTERVAL</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={newTask.recurrenceInterval}
                                            onChange={e => setNewTask({ ...newTask, recurrenceInterval: Number(e.target.value) })}
                                            className="system-input"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 text-gray-500 hover:text-white text-sm tracking-wider"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    className="system-button bg-blue-600/20 hover:bg-blue-600 border-blue-500 text-blue-200 hover:text-white"
                                >
                                    CONFIRM ASSIGNMENT
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            <RewardReveal
                isOpen={rewardReveal !== null}
                title={rewardReveal?.title ?? ''}
                subtitle="The quest log recorded your win. Keep the chain hot while the reward is fresh."
                xp={rewardReveal?.xp}
                gold={rewardReveal?.gold}
                tone="green"
                onClose={() => setRewardReveal(null)}
            />

        </div>
    )
}
