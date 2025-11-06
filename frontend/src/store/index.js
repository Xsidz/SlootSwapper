// Export all stores
import useAuthStore from './useAuthStore'
import useEventsStore from './useEventsStore'
import useSwapStore from './useSwapStore'

export { useAuthStore, useEventsStore, useSwapStore }

// Combined store hook for components that need multiple stores
export const useStores = () => ({
    auth: useAuthStore(),
    events: useEventsStore(),
    swap: useSwapStore()
})