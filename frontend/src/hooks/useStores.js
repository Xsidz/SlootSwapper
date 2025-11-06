// Simple hook to use multiple stores together
import { useAuthStore, useEventsStore, useSwapStore } from '../store'

export const useStores = () => {
    const auth = useAuthStore()
    const events = useEventsStore()
    const swap = useSwapStore()

    return {
        auth,
        events,
        swap
    }
}

export default useStores