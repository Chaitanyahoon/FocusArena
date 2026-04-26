import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { gateAPI, Gate, GateRank } from '../services/gate';
import { toast } from 'react-hot-toast';
import CreateGateModal from '../components/gates/CreateGateModal';
import SystemEmptyState from '../components/shared/SystemEmptyState';

export default function GatePage() {
    const navigate = useNavigate();
    const [gates, setGates] = useState<Gate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const loadGates = async () => {
        setIsLoading(true);
        try {
            const data = await gateAPI.getUserGates();
            setGates(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load Gates.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadGates();
    }, []);

    const getRankColor = (rank: GateRank) => {
        switch (rank) {
            case GateRank.E: return "text-gray-400 border-gray-400";
            case GateRank.D: return "text-green-400 border-green-400";
            case GateRank.C: return "text-blue-400 border-blue-400";
            case GateRank.B: return "text-purple-400 border-purple-400";
            case GateRank.A: return "text-red-400 border-red-400";
            case GateRank.S: return "text-yellow-400 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]";
            default: return "text-gray-400";
        }
    };

    return (
        <div className="p-6 h-full overflow-y-auto custom-scrollbar relative">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold font-rajdhani text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 filter drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">
                        DUNGEON GATES
                    </h1>
                    <p className="text-gray-400 font-exo text-sm mt-1">
                        Select a Gate to begin your raid, Hunter.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={async () => {
                            setIsLoading(true);
                            try {
                                await gateAPI.createProceduralGate(GateRank.C);
                                toast.success("Procedural Anomaly Generated!");
                                loadGates();
                            } catch (error) {
                                console.error(error);
                                toast.error("Failed to generate anomaly.");
                                setIsLoading(false);
                            }
                        }}
                        className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500 text-purple-400 hover:text-white font-bold rounded flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    >
                        SCAN ANOMALY
                    </button>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                    >
                        <PlusIcon className="w-5 h-5" />
                        CREATE GATE
                    </button>
                </div>
            </div>

            {/* Gate Grid */}
            {isLoading ? (
                <div className="system-card flex justify-center items-center h-64 rounded-2xl text-blue-400 animate-pulse">
                    Scanning dimensional frequencies...
                </div>
            ) : gates.length === 0 ? (
                <SystemEmptyState
                    eyebrow="No active gates"
                    title="The dungeon map is quiet."
                    description="Create a gate when a normal task list feels too small. Gates turn bigger goals into raid rooms."
                    action={
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="system-button system-button-primary px-5 py-3 text-xs"
                        >
                            Create gate
                        </button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gates.map((gate) => (
                        <div key={gate.id} className="bg-[#0a1120] border border-blue-900/30 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] group relative overflow-hidden">
                            {/* Rank Badge */}
                            <div className={`absolute top-4 right-4 w-10 h-10 rounded border-2 flex items-center justify-center font-bold font-rajdhani bg-black/50 ${getRankColor(gate.rank)}`}>
                                {GateRank[gate.rank]}
                            </div>

                            <h3 className="text-xl font-bold text-white font-rajdhani mb-2 pr-12 group-hover:text-blue-400 transition-colors">
                                {gate.title}
                            </h3>
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2 h-10">
                                {gate.description || "No description provided."}
                            </p>

                            {/* RPG Stats Badges */}
                            <div className="flex gap-2 mb-4 font-mono text-[10px] tracking-wider">
                                <span className="bg-blue-900/40 text-blue-300 border border-blue-800/50 px-2 py-1 rounded">
                                    LV.{gate.requiredLevel || 1} REQ
                                </span>
                                <span className="bg-purple-900/40 text-purple-300 border border-purple-800/50 px-2 py-1 rounded">
                                    {gate.recommendedPartySize || 1} PLAYER(S)
                                </span>
                                <span className="bg-gray-800/50 text-gray-400 border border-gray-700/50 px-2 py-1 rounded uppercase">
                                    {gate.type || "DUNGEON"}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-xs text-gray-500 mb-4 font-mono">
                                <span>Tasks: {gate.tasks?.length || 0}</span>
                                <span className="text-yellow-500/80">XP: {gate.xpReward}</span>
                            </div>

                            <button
                                onClick={() => navigate(`/gates/${gate.id}`)}
                                className="w-full py-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold rounded hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest text-sm"
                            >
                                ENTER GATE
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <CreateGateModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onGateCreated={loadGates}
            />
        </div>
    );
}
