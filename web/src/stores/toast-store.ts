import { defineStore } from 'pinia'

let id = 0

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as { id: number; message: string; type: 'success' | 'error' | 'info' | undefined }[],
  }),
  actions: {
    show(message: string, type: 'success' | 'error' | 'info' | undefined = undefined) {
      this.toasts.push({ id: ++id, message, type })

      // Vibration logic (Note: navigator.vibrate is NOT supported on iOS Safari)
      if ('vibrate' in navigator) {
        if (type === 'error') {
          // Double pulse for errors
          navigator.vibrate([200, 100, 200])
        } else {
          // Single pulse for success/info
          navigator.vibrate(100)
        }
      }
    },
    remove(id: number) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
  },
})
