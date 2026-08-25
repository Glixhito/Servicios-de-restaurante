import { create } from 'zustand'
import Cookies from 'js-cookie'

export const useAuthStore = create((set) => ({
  token: Cookies.get('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!Cookies.get('token'),

  login: (token, user) => {
    Cookies.set('token', token, { expires: 7 })
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    Cookies.remove('token')
    localStorage.removeItem('user')
    set({ token: null, user: null, isAuthenticated: false })
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
}))