import { create } from 'zustand'
import { todayStr } from '../utils/dateUtils.js'

export const useAppStore = create((set) => ({
  currentDate: todayStr(),
  setCurrentDate: (date) => set({ currentDate: date }),

  activeModal: null, // { type: 'itemDetail'|'categoryManager'|'search', props }
  openModal: (type, props = {}) => set({ activeModal: { type, props } }),
  closeModal: () => set({ activeModal: null }),

  journalOpen: false,
  toggleJournal: () => set((s) => ({ journalOpen: !s.journalOpen })),

  backlogFilters: {
    status: 'unscheduled', // 'unscheduled' | 'scheduled' | 'all'
    categoryId: null,
    isRecurring: undefined,
    hasNotes: false,
    searchText: '',
  },
  setBacklogFilters: (partial) =>
    set((s) => ({ backlogFilters: { ...s.backlogFilters, ...partial } })),

  toasts: [],
  addToast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    set((s) => ({ toasts: [...s.toasts, { id, ...toast }] }))
    return id
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
