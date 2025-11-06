import { create } from 'zustand'
import { eventsService } from '../services/apiService'

const useEventsStore = create((set, get) => ({
    // State
    events: [],
    loading: false,
    error: null,

    // Actions
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Fetch all events
    fetchEvents: async () => {
        set({ loading: true, error: null })
        const result = await eventsService.fetchEvents()

        if (result.success) {
            set({
                events: result.data,
                loading: false
            })
        } else {
            set({
                loading: false,
                error: result.error
            })
        }

        return result
    },

    // Create event with optimistic update
    createEvent: async (eventData) => {
        set({ error: null })

        // Optimistic update - add temporary event
        const tempEvent = {
            ...eventData,
            _id: `temp-${Date.now()}`,
            status: 'BUSY',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isOptimistic: true
        }

        set(state => ({
            events: [...state.events, tempEvent]
        }))

        const result = await eventsService.createEvent(eventData)

        if (result.success) {
            // Replace optimistic event with real event
            set(state => ({
                events: state.events.map(event =>
                    event._id === tempEvent._id ? result.data : event
                )
            }))
        } else {
            // Remove optimistic event on failure
            set(state => ({
                events: state.events.filter(event => !event.isOptimistic),
                error: result.error
            }))
        }

        return result
    },

    // Update event with optimistic update
    updateEvent: async (eventId, updates) => {
        set({ error: null })

        // Optimistic update
        const originalEvents = get().events
        set(state => ({
            events: state.events.map(event =>
                event._id === eventId
                    ? { ...event, ...updates, updatedAt: new Date().toISOString() }
                    : event
            )
        }))

        const result = await eventsService.updateEvent(eventId, updates)

        if (result.success) {
            // Update with server response
            set(state => ({
                events: state.events.map(event =>
                    event._id === eventId ? result.data : event
                )
            }))
        } else {
            // Revert optimistic update on failure
            set({
                events: originalEvents,
                error: result.error
            })
        }

        return result
    },

    // Delete event with optimistic update
    deleteEvent: async (eventId) => {
        set({ error: null })

        // Optimistic update - remove event
        const originalEvents = get().events
        set(state => ({
            events: state.events.filter(event => event._id !== eventId)
        }))

        const result = await eventsService.deleteEvent(eventId)

        if (!result.success) {
            // Revert optimistic update on failure
            set({
                events: originalEvents,
                error: result.error
            })
        }

        return result
    },

    // Update event status with optimistic update
    updateEventStatus: async (eventId, status) => {
        set({ error: null })

        // Optimistic update
        const originalEvents = get().events
        set(state => ({
            events: state.events.map(event =>
                event._id === eventId
                    ? { ...event, status, updatedAt: new Date().toISOString() }
                    : event
            )
        }))

        const result = await eventsService.updateEventStatus(eventId, status)

        if (result.success) {
            // Update with server response
            set(state => ({
                events: state.events.map(event =>
                    event._id === eventId ? result.data : event
                )
            }))
        } else {
            // Revert optimistic update on failure
            set({
                events: originalEvents,
                error: result.error
            })
        }

        return result
    },

    // Get events by status
    getEventsByStatus: (status) => {
        return get().events.filter(event => event.status === status)
    },

    // Get swappable events
    getSwappableEvents: () => {
        return get().events.filter(event => event.status === 'SWAPPABLE')
    }
}))

export default useEventsStore