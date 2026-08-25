import { create } from 'zustand'

export const useRestauranteStore = create((set) => ({
  restaurante: null,
  loading: false,
  error: null,

  setRestaurante: (data) => set({ restaurante: data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))