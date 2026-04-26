import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gateAPI, Gate, GateStatus } from '../services/gate';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, ExclamationTriangleIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { TaskDifficulty, TaskCategory } from '../types';
import { taskAPI } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { useAuthStore } from '../stores/authStore';
import BossHpBar from '../components/raid/BossHpBar';

interface CreateTaskDto {
    title: string;
    description?: string;
    difficulty: TaskDifficulty;
    category: TaskCategory;
}

// Different DiceBear styles for each rank to give variety
const BOSS_AVATAR_STYLES = [
    'bottts-neutral',  // E - Simple robot
    'bottts',          // D - More detailed robot
    'shapes',          // C - Abstract shapes
    'identicon',       // B - Geometric patterns
    'rings',           // A - Ring patterns
    'glass',           // S - Glass avatars
];

const RANK_ATMOSPHERE: Record<number, { bg: string; particle: string; aura: string; label: string }> = {
    0: { bg: 'from-gray-900/50 to-gray-950', particle: 'bg-gray-500', aura: 'shadow-[0_0_60px_rgba(156,163,175,0.15)]', label: 'E-RANK DUNGEON' },
    1: { bg: 'from-green-950/40 to-gray-950', particle: 'bg-green-500', aura: 'shadow-[0_0_60px_rgba(74,222,128,0.15)]', label: 'D-RANK DUNGEON' },
    2: { bg: 'from-blue-950/40 to-gray-950', particle: 'bg-blue-500', aura: 'shadow-[0_0_80px_rgba(96,165,250,0.2)]', label: 'C-RANK DUNGEON' },
    3: { bg: 'from-purple-950/40 to-gray-950', particle: 'bg-purple-500', aura: 'shadow-[0_0_80px_rgba(192,132,252,0.25)]', label: 'B-RANK DUNGEON' },
    4: { bg: 'from-red-950/40 to-gray-950', particle: 'bg-red-500', aura: 'shadow-[0_0_100px_rgba(248,113,113,0.3)]', label: 'A-RANK DUNGEON' },
    5: { bg: 'from-yellow-950/40 to-amber-950/30', particle: 'bg-yellow-500', aura: 'shadow-[0_0_120px_rgba(250,204,21,0.35)]', label: 'S-RANK DUNGEON' },
};

const RANK_TEXT_COLORS = ['text-gray-400', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-red-400', 'text-yellow-400'];

export default function RaidPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { fetchProfile } = useAuthStore();
    const [gate, setGate] = useState<Gate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, taskId: number | null }>({ isOpen: false, taskId: null });

    const loadGate = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await gateAPI.getGate(Number(id));
            setGate(data);
        } catch {
            toast.error("Failed to load Dungeon data.");
            navigate('/gates');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadGate();
    }, [id]);

    const handleTaskComplete = async (taskId: number) => {
        try {
            await taskAPI.complete(taskId);
            toast.success("Monster defeated.");
            loadGate();

            if (gate && gate.tasks.every(t => t.id === taskId || t.status === 2)) {
                toast.success("DUNGEON CLEARED!", { duration: 5000 });
            }
        } catch {
            toast.error("Attack failed.");
        }
    };

    const handleClaimRewards = async () => {
        if (!gate) return;
        try {
            await gateAPI.claimRewards(gate.id);
            toast.success(`Rewards Claimed: ${gate.xpReward} XP, ${gate.goldReward} Gold!`);
            await fetchProfile();
            loadGate();
        } catch {
            toast.error("Failed to claim rewards.");
        }
    };

    const handleDeleteTask = (taskId: number) => {
        setConfirmModal({ isOpen: true, taskId });
    };

    const confirmAbandon = async () => {
        if (!confirmModal.taskId) return;
        try {
            await taskAPI.delete(confirmModal.taskId);
            toast.success("Quest abandoned.");
            loadGate();
        } catch {
            toast.error("Failed to abandon quest.");
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-blue-400 font-mono text-sm animate-pulse">Scanning dungeon structure...</p>
            </div>
        </div>
    );

    if (!gate) return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <p className="text-red-500 font-rajdhani text-xl mb-2">DUNGEON COLLAPSED</p>
                <button onClick={() => navigate('/gates')} className="text-blue-400 hover:text-blue-300 font-mono text-sm">
                    Return to Gate Selection
                </button>
            </div>
        </div>
    );

    const isCleared = gate.status === GateStatus.Cleared;
    const isAllDone = gate.tasks.length > 0 && gate.tasks.every(t => t.status === 2);
    const totalXp = gate.tasks.reduce((sum, t) => sum + t.xpReward, 0);
    const completedXp = gate.tasks.filter(t => t.status === 2).reduce((sum, t) => sum + t.xpReward, 0);
    const bossCurrentHp = Math.max(0, totalXp - completedXp);
    const bossMaxHp = totalXp > 0 ? totalXp : 1000;
    const completedTasks = gate.tasks.filter(t => t.status === 2).length;
    const totalTasks = gate.tasks.length;

    const atmosphere = RANK_ATMOSPHERE[gate.rank] || RANK_ATMOSPHERE[0];
    const avatarStyle = BOSS_AVATAR_STYLES[gate.rank] || BOSS_AVATAR_STYLES[0];
    const bossAvatarUrl = `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${gate.bossName || gate.title}&scale=80`;
    const rankTextColor = RANK_TEXT_COLORS[gate.rank] || RANK_TEXT_COLORS[0];

    return (
        <div className="p-6 h-full overflow-y-auto custom-scrollbar relative">
            {/* Retreat Button */}
            <button
                onClick={() => navigate('/gates')}
                className="flex items-center text-gray-500 hover:text-white mb-4 transition-colors text-sm font-mono group"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
                RETREAT
            </button>

            {/* Gate Title Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className={`text-[10px] font-mono ${rankTextColor} tracking-[0.3em] mb-1`}>
                        {atmosphere.label}
                    </div>
                    <h1 className="text-3xl font-black font-rajdhani text-white tracking-wide">{gate.title}</h1>
                    {gate.description && <p className="text-gray-500 text-sm mt-1 max-w-md">{gate.description}</p>}
                </div>
                <div className="text-right bg-black/30 rounded-lg border border-gray-800/50 p-3">
                    <div className="flex justify-end gap-2 mb-2">
                        <span className="bg-blue-900/40 text-blue-300 text-[9px] px-1.5 py-0.5 rounded font-mono border border-blue-800/50">
                            LV.{gate.requiredLevel || 1} REQ
                        </span>
                        <span className="bg-purple-900/40 text-purple-300 text-[9px] px-1.5 py-0.5 rounded font-mono border border-purple-800/50">
                            {gate.recommendedPartySize || 1} PLAYER(S)
                        </span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono mb-1">BOUNTY</div>
                    <div className="text-cyan-400 font-black font-rajdhani text-lg">{gate.xpReward.toLocaleString()} XP</div>
                    <div className="text-yellow-400 font-bold font-rajdhani">{gate.goldReward.toLocaleString()} G</div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column: Boss Arena */}
                <div className="lg:w-2/5 flex flex-col gap-4">
                    {/* Boss Card */}
                    <div className={`bg-gradient-to-b ${atmosphere.bg} rounded-xl border border-blue-900/20 p-6 relative overflow-hidden ${atmosphere.aura}`}>
                        {/* Atmospheric particles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`absolute w-1 h-1 rounded-full ${atmosphere.particle} opacity-20`}
                                    style={{
                                        left: `${15 + i * 15}%`,
                                        top: `${20 + (i % 3) * 25}%`,
                                        animation: `float ${3 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Boss Sprite */}
                        <div className={`flex justify-center mb-6 relative ${isCleared ? 'opacity-20 grayscale blur-sm' : ''} transition-all duration-1000`}>
                            <div className="relative">
                                {/* Aura glow behind boss */}
                                <div className={`absolute inset-0 rounded-full blur-3xl ${atmosphere.particle} opacity-10 scale-150`} />
                                <img
                                    src={bossAvatarUrl}
                                    alt={gate.bossName || "Boss"}
                                    className="w-44 h-44 object-contain relative z-10 drop-shadow-2xl"
                                    style={{ filter: isCleared ? '' : `drop-shadow(0 0 30px ${RANK_ATMOSPHERE[gate.rank]?.particle === 'bg-yellow-500' ? 'rgba(250,204,21,0.3)' : 'rgba(248,113,113,0.2)'})` }}
                                />
                            </div>
                        </div>

                        {/* Boss HP Bar */}
                        <BossHpBar
                            currentHp={bossCurrentHp}
                            maxHp={bossMaxHp}
                            bossName={gate.bossName || "Unknown Entity"}
                            rank={gate.rank}
                        />

                        {/* Cleared Overlay */}
                        {isCleared && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20 rounded-xl">
                                <div className="text-center">
                                    <SparklesIcon className="w-10 h-10 text-yellow-500 mx-auto mb-3 animate-bounce" />
                                    <h2 className="text-3xl font-black text-yellow-500 font-rajdhani tracking-wider mb-1">CLEARED</h2>
                                    <p className="text-gray-400 text-xs font-mono">All threats neutralized</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-black/30 rounded-lg border border-gray-800/30 p-3 text-center">
                            <div className="text-[10px] text-gray-500 font-mono mb-1">TASKS</div>
                            <div className="text-white font-black font-rajdhani text-lg">{completedTasks}/{totalTasks}</div>
                        </div>
                        <div className="bg-black/30 rounded-lg border border-gray-800/30 p-3 text-center">
                            <div className="text-[10px] text-gray-500 font-mono mb-1">DMG DEALT</div>
                            <div className="text-red-400 font-black font-rajdhani text-lg">{completedXp.toLocaleString()}</div>
                        </div>
                        <div className="bg-black/30 rounded-lg border border-gray-800/30 p-3 text-center">
                            <div className="text-[10px] text-gray-500 font-mono mb-1">PROGRESS</div>
                            <div className={`font-black font-rajdhani text-lg ${totalTasks > 0 ? (completedTasks === totalTasks ? 'text-green-400' : 'text-blue-400') : 'text-gray-500'}`}>
                                {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '—'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Task Battle Log */}
                <div className="lg:w-3/5 flex flex-col">
                    {/* Battle Log Header */}
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-bold text-white font-rajdhani text-lg tracking-wider">BATTLE LOG</h3>
                            <p className="text-[10px] text-gray-500 font-mono">Complete tasks to damage the boss</p>
                        </div>
                        {!isCleared && (
                            <button
                                onClick={() => setIsAddTaskOpen(true)}
                                className="px-4 py-2.5 bg-gradient-to-r from-red-600/20 to-red-800/20 hover:from-red-600/30 hover:to-red-800/30 text-red-400 border border-red-500/30 rounded-lg text-xs flex items-center gap-2 transition-all font-bold tracking-wider"
                            >
                                <PlusIcon className="w-4 h-4" />
                                ADD TASK
                            </button>
                        )}
                    </div>

                    {/* Task List */}
                    <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 custom-scrollbar">
                        {gate.tasks.length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-gray-800/50 rounded-xl text-gray-600 bg-black/20">
                                <div className="mx-auto mb-4 h-8 w-8 rounded-full border border-gray-700 bg-gray-800/20" />
                                <p className="font-rajdhani text-lg">No Encounters</p>
                                <p className="text-xs font-mono mt-1">Add tasks to begin the battle</p>
                            </div>
                        ) : (
                            gate.tasks.map((task, _index) => {
                                const isDone = task.status === 2;
                                return (
                                    <div
                                        key={task.id}
                                        className={`p-4 rounded-xl border transition-all relative overflow-hidden group ${isDone
                                            ? 'bg-gray-900/20 border-gray-800/30 opacity-60'
                                            : 'bg-[#0a1120] border-gray-800/40 hover:border-blue-500/30 hover:bg-blue-950/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Action Button */}
                                            <button
                                                onClick={() => !isDone && handleTaskComplete(task.id)}
                                                disabled={isDone || isCleared}
                                                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${isDone
                                                    ? 'bg-green-500/10 border-green-500/40 text-green-500'
                                                    : 'border-red-500/30 hover:bg-red-500 hover:border-red-500 text-red-500/60 hover:text-white'
                                                    }`}
                                            >
                                                {isDone ? (
                                                    <span className="text-[10px] font-black font-mono">DONE</span>
                                                ) : (
                                                    <span className="text-[10px] font-black font-mono">ATK</span>
                                                )}
                                            </button>

                                            {/* Task Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center gap-3">
                                                    <h4 className={`font-bold font-rajdhani truncate ${isDone ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                        {task.title}
                                                    </h4>
                                                    <span className={`text-[10px] font-mono flex-shrink-0 px-2 py-0.5 rounded ${isDone ? 'text-gray-600 bg-gray-800/30' : 'text-red-400 bg-red-500/10'}`}>
                                                        {task.xpReward} DMG
                                                    </span>
                                                </div>
                                                {task.description && (
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>
                                                )}
                                            </div>

                                            {/* Delete */}
                                            {!isCleared && !isDone && (
                                                <button
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-600 hover:text-red-400 transition-all flex-shrink-0"
                                                >
                                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Claim Button */}
                    {isAllDone && !isCleared && (
                        <div className="mt-4 pt-4 border-t border-gray-800/30">
                            <button
                                onClick={handleClaimRewards}
                                className="w-full py-4 bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-yellow-400 hover:to-amber-400 text-black font-black text-lg rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.5)] uppercase tracking-[0.2em] font-rajdhani transition-all relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <SparklesIcon className="w-6 h-6" />
                                    CLAIM REWARDS
                                </span>
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating particles CSS */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
                    50% { transform: translateY(-20px) scale(1.5); opacity: 0.4; }
                }
            `}</style>

            {/* Modals */}
            <AddTaskModal
                isOpen={isAddTaskOpen}
                onClose={() => setIsAddTaskOpen(false)}
                gateId={gate.id}
                onTaskAdded={loadGate}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, taskId: null })}
                onConfirm={confirmAbandon}
                title="Abandon Quest"
                message="Are you sure? Abandoning will heal the boss."
                confirmText="Abandon"
                isDestructive={true}
            />
        </div>
    );
}

// --- Add Task Modal ---
function AddTaskModal({ isOpen, onClose, gateId, onTaskAdded }: { isOpen: boolean, onClose: () => void, gateId: number, onTaskAdded: () => void }) {
    const { register, handleSubmit, reset } = useForm<CreateTaskDto>();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: CreateTaskDto) => {
        setIsLoading(true);
        try {
            const newTask = await taskAPI.create({
                ...data,
                dueDate: undefined
            });
            await gateAPI.addTaskToGate(gateId, newTask.id);
            toast.success("Encounter added.");
            reset();
            onTaskAdded();
            onClose();
        } catch {
            toast.error("Failed to summon task.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-b from-[#0c1527] to-[#060d1a] border border-blue-500/20 p-6 shadow-2xl transition-all">
                                <h3 className="text-xl font-black font-rajdhani text-white mb-1 tracking-wider">ADD ENCOUNTER</h3>
                                <p className="text-xs text-gray-500 font-mono mb-5">Each task deals damage to the boss</p>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <input
                                        {...register('title', { required: true })}
                                        placeholder="Task Name"
                                        className="w-full bg-black/40 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <select {...register('difficulty', { valueAsNumber: true })} className="bg-black/40 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all">
                                            <option value={TaskDifficulty.Easy}>Easy</option>
                                            <option value={TaskDifficulty.Medium}>Medium</option>
                                            <option value={TaskDifficulty.Hard}>Hard</option>
                                        </select>
                                        <select {...register('category', { valueAsNumber: true })} className="bg-black/40 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all">
                                            <option value={TaskCategory.Work}>Work</option>
                                            <option value={TaskCategory.Personal}>Personal</option>
                                            <option value={TaskCategory.Fitness}>Fitness</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg font-bold tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-red-900/30"
                                    >
                                        {isLoading ? 'Summoning...' : 'SUMMON ENCOUNTER'}
                                    </button>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
