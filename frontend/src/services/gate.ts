import { api } from './api'
import { Task } from '../types'

export enum GateRank {
    E = 0,
    D = 1,
    C = 2,
    B = 3,
    A = 4,
    S = 5
}

export enum GateStatus {
    Active = 0,
    Cleared = 1,
    Failed = 2
}

export interface Gate {
    id: number
    userId: number
    title: string
    description?: string
    bossName: string
    type: string
    rank: GateRank
    requiredLevel: number
    recommendedPartySize: number
    status: GateStatus
    createdAt: string
    deadline?: string
    clearedAt?: string
    xpReward: number
    goldReward: number
    tasks: Task[]
}

export interface CreateGateDto {
    title: string
    description?: string
    bossName?: string
    type?: string
    rank: GateRank
    deadline?: string
}

export const gateAPI = {
    getUserGates: async (): Promise<Gate[]> => {
        const response = await api.get<Gate[]>('/gates')
        return response.data
    },

    getGate: async (id: number): Promise<Gate> => {
        const response = await api.get<Gate>(`/gates/${id}`)
        return response.data
    },

    createGate: async (data: CreateGateDto): Promise<Gate> => {
        const response = await api.post<Gate>('/gates', data)
        return response.data
    },

    createProceduralGate: async (rank: GateRank = GateRank.C): Promise<Gate> => {
        const response = await api.post<Gate>(`/gates/procedural?rank=${rank}`)
        return response.data
    },

    addTaskToGate: async (gateId: number, taskId: number): Promise<void> => {
        await api.post(`/gates/${gateId}/add-task/${taskId}`)
    },

    claimRewards: async (gateId: number): Promise<void> => {
        await api.post(`/gates/${gateId}/claim`)
    }
}
