import { create } from 'zustand'
import { focusAPI } from '../services/api'
import { SoundService } from '../services/soundService'

export type TimerMode = 'focus' | 'break'

interface TimerStore {
    secondsLeft: number
    isRunning: boolean
    mode: TimerMode
    totalSessions: number
    
    start: () => void
    pause: () => void
    reset: () => void
    tick: () => void
    toggleMode: () => void
    setMode: (mode: TimerMode) => void
    syncNow: () => Promise<void>
}

const FOCUS_TIME = 25 * 60
const BREAK_TIME = 5 * 60

export const useTimerStore = create<TimerStore>((set, get) => ({
    secondsLeft: FOCUS_TIME,
    isRunning: false,
    mode: 'focus',
    totalSessions: 0,

    start: () => set({ isRunning: true }),
    pause: () => {
        set({ isRunning: false });
        get().syncNow();
    },
    
    reset: () => set((state) => ({
        secondsLeft: state.mode === 'focus' ? FOCUS_TIME : BREAK_TIME,
        isRunning: false
    })),

    tick: () => set((state) => {
        if (!state.isRunning) return state
        
        if (state.secondsLeft > 0) {
            // Heartbeat every 60 seconds
            if (state.secondsLeft % 60 === 0) {
                get().syncNow();
            }
            return { secondsLeft: state.secondsLeft - 1 }
        } else {
            // Timer finished
            const nextMode: TimerMode = state.mode === 'focus' ? 'break' : 'focus'
            const newState = {
                mode: nextMode,
                secondsLeft: nextMode === 'focus' ? FOCUS_TIME : BREAK_TIME,
                isRunning: false,
                totalSessions: state.mode === 'focus' ? state.totalSessions + 1 : state.totalSessions
            };
            
            // Audio feedback
            SoundService.playChime();

            // Background sync on finish
            focusAPI.sync({
                secondsLeft: newState.secondsLeft,
                mode: newState.mode,
                isRunning: false
            });

            return newState;
        }
    }),

    toggleMode: () => set((state) => {
        const nextMode: TimerMode = state.mode === 'focus' ? 'break' : 'focus'
        return {
            mode: nextMode,
            secondsLeft: nextMode === 'focus' ? FOCUS_TIME : BREAK_TIME,
            isRunning: false
        }
    }),

    setMode: (mode: TimerMode) => set({
        mode,
        secondsLeft: mode === 'focus' ? FOCUS_TIME : BREAK_TIME,
        isRunning: false
    }),

    syncNow: async () => {
        const state = get();
        try {
            await focusAPI.sync({
                secondsLeft: state.secondsLeft,
                mode: state.mode,
                isRunning: state.isRunning
            });
        } catch (error) {
            console.error('Focus sync failed', error);
        }
    }
}))
