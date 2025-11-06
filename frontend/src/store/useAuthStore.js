import { create } from 'zustand'
import { authService } from '../services/apiService'
import { tokenStorage } from '../utils/auth'

const useAuthStore = create((set, get) => ({
    // State
    user: null,
    token: tokenStorage.get(),
    loading: true,
    error: null,

    // Computed
    isAuthenticated: () => !!get().token,

    // Actions
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Initialize auth state
    initialize: async () => {
        const { token } = get()

        if (token) {
            set({ loading: true, error: null })
            const result = await authService.getProfile()

            if (result.success) {
                set({
                    user: result.data.data.user,
                    loading: false
                })
            } else {
                console.error('Token validation failed:', result.error)
                get().logout()
            }
        } else {
            set({ loading: false })
        }
    },

    // Login action
    login: async (email, password) => {
        set({ loading: true, error: null })
        const result = await authService.login(email, password)

        if (result.success) {
            const { token: newToken, user: userData } = result.data

            set({
                token: newToken,
                user: userData,
                loading: false
            })

            tokenStorage.set(newToken)
            return { success: true }
        } else {
            set({
                loading: false,
                error: result.error
            })
            return result
        }
    },

    // Register action
    register: async (name, email, password) => {
        set({ loading: true, error: null })
        const result = await authService.register(name, email, password)

        if (result.success) {
            const { token: newToken, user: userData } = result.data

            set({
                token: newToken,
                user: userData,
                loading: false
            })

            tokenStorage.set(newToken)
            return { success: true }
        } else {
            set({
                loading: false,
                error: result.error
            })
            return result
        }
    },

    // Logout action
    logout: () => {
        set({
            token: null,
            user: null,
            loading: false,
            error: null
        })

        tokenStorage.remove()
    }
}))

export default useAuthStore