import { create } from 'zustand'
import { shopAPI } from '../services/api'
import { useAppStore } from './appStore'
import type { ShopItem, InventoryItem } from '../types'

interface ShopState {
  items: ShopItem[]
  inventory: InventoryItem[]
  isLoading: boolean
  error: string

  fetchItems: () => Promise<void>
  fetchInventory: () => Promise<void>
  buyItem: (itemId: number) => Promise<void>
  useItem: (itemId: number) => Promise<void>
}

export const useShopStore = create<ShopState>((set, get) => ({
  items: [],
  inventory: [],
  isLoading: false,
  error: '',

  fetchItems: async () => {
    set({ isLoading: true, error: '' })
    try {
      const items = await shopAPI.getItems()
      set({ items })
    } catch {
      set({ error: 'Failed to load shop.' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchInventory: async () => {
    set({ isLoading: true, error: '' })
    try {
      const inventory = await shopAPI.getInventory()
      set({ inventory })
    } catch {
      set({ error: 'Failed to load inventory.' })
    } finally {
      set({ isLoading: false })
    }
  },

  buyItem: async (itemId: number) => {
    set({ isLoading: true, error: '' })
    try {
      await shopAPI.buyItem(itemId)
      // Refresh both shop and profile (gold changed)
      await Promise.all([
        get().fetchItems(),
        get().fetchInventory(),
        useAppStore.getState().hydrateDashboard(),
      ])
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Purchase failed. Not enough gold?' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  useItem: async (itemId: number) => {
    set({ isLoading: true, error: '' })
    try {
      await shopAPI.useItem(itemId)
      await get().fetchInventory()
      await useAppStore.getState().hydrateDashboard()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to use item.' })
    } finally {
      set({ isLoading: false })
    }
  },
}))
