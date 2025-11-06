import { create } from 'zustand'
import { swapService } from '../services/apiService'

const useSwapStore = create((set, get) => ({
    // State
    swappableSlots: [],
    incomingRequests: [],
    outgoingRequests: [],
    loading: {
        swappableSlots: false,
        incomingRequests: false,
        outgoingRequests: false,
        createRequest: false,
        respondRequest: false
    },
    error: null,

    // Actions
    setLoading: (key, loading) => set(state => ({
        loading: { ...state.loading, [key]: loading }
    })),

    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Fetch swappable slots from marketplace
    fetchSwappableSlots: async () => {
        set(state => ({
            loading: { ...state.loading, swappableSlots: true },
            error: null
        }))

        const result = await swapService.fetchSwappableSlots()

        set(state => ({
            swappableSlots: result.success ? result.data : state.swappableSlots,
            loading: { ...state.loading, swappableSlots: false },
            error: result.success ? null : result.error
        }))

        return result
    },

    // Fetch incoming swap requests
    fetchIncomingRequests: async () => {
        set(state => ({
            loading: { ...state.loading, incomingRequests: true },
            error: null
        }))

        const result = await swapService.fetchIncomingRequests()

        set(state => ({
            incomingRequests: result.success ? result.data : state.incomingRequests,
            loading: { ...state.loading, incomingRequests: false },
            error: result.success ? null : result.error
        }))

        return result
    },

    // Fetch outgoing swap requests
    fetchOutgoingRequests: async () => {
        set(state => ({
            loading: { ...state.loading, outgoingRequests: true },
            error: null
        }))

        const result = await swapService.fetchOutgoingRequests()

        set(state => ({
            outgoingRequests: result.success ? result.data : state.outgoingRequests,
            loading: { ...state.loading, outgoingRequests: false },
            error: result.success ? null : result.error
        }))

        return result
    },

    // Create swap request with optimistic update
    createSwapRequest: async (requestData) => {
        set(state => ({
            loading: { ...state.loading, createRequest: true },
            error: null
        }))

        // Optimistic update - add temporary request to outgoing
        const tempRequest = {
            ...requestData,
            _id: `temp-${Date.now()}`,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            isOptimistic: true
        }

        set(state => ({
            outgoingRequests: [...state.outgoingRequests, tempRequest]
        }))

        const result = await swapService.createSwapRequest(requestData)

        if (result.success) {
            // Replace optimistic request with real request
            set(state => ({
                outgoingRequests: state.outgoingRequests.map(request =>
                    request._id === tempRequest._id ? result.data : request
                ),
                loading: { ...state.loading, createRequest: false }
            }))
        } else {
            // Remove optimistic request on failure
            set(state => ({
                outgoingRequests: state.outgoingRequests.filter(request => !request.isOptimistic),
                loading: { ...state.loading, createRequest: false },
                error: result.error
            }))
        }

        return result
    },

    // Respond to swap request (accept/reject)
    respondToSwapRequest: async (requestId, action) => {
        set(state => ({
            loading: { ...state.loading, respondRequest: true },
            error: null
        }))

        // Optimistic update - update request status
        const originalIncomingRequests = get().incomingRequests
        set(state => ({
            incomingRequests: state.incomingRequests.map(request =>
                request._id === requestId
                    ? { ...request, status: action.toUpperCase() }
                    : request
            )
        }))

        const result = await swapService.respondToSwapRequest(requestId, action)

        if (result.success) {
            // Update with server response
            set(state => ({
                incomingRequests: state.incomingRequests.map(request =>
                    request._id === requestId ? result.data : request
                ),
                loading: { ...state.loading, respondRequest: false }
            }))
        } else {
            // Revert optimistic update on failure
            set(state => ({
                incomingRequests: originalIncomingRequests,
                loading: { ...state.loading, respondRequest: false },
                error: result.error
            }))
        }

        return result
    },

    // Get pending requests count
    getPendingRequestsCount: () => {
        return get().incomingRequests.filter(request => request.status === 'PENDING').length
    },

    // Refresh all swap data
    refreshAll: async () => {
        const results = await Promise.allSettled([
            get().fetchSwappableSlots(),
            get().fetchIncomingRequests(),
            get().fetchOutgoingRequests()
        ])

        return results.every(result => result.status === 'fulfilled')
    }
}))

export default useSwapStore