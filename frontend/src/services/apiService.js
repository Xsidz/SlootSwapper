// Simple API service layer for Zustand stores
import { authAPI, eventsAPI, swapAPI } from './api'

// Authentication service
export const authService = {
    async login(email, password) {
        try {
            const response = await authAPI.login(email, password)
            return { success: true, data: response.data }
        } catch (error) {
            return { success: false, error: error.response?.data?.error?.message || 'Login failed' }
        }
    },

    async register(name, email, password) {
        try {
            const response = await authAPI.register(name, email, password)
            return { success: true, data: response.data }
        } catch (error) {
            return { success: false, error: error.response?.data?.error?.message || 'Registration failed' }
        }
    },

    async getProfile() {
        try {
            const response = await authAPI.getProfile()
            return { success: true, data: response.data }
        } catch (error) {
            return { success: false, error: error.response?.data?.error?.message || 'Failed to get profile' }
        }
    }
}

// Events service
export const eventsService = {
    async fetchEvents() {
        try {
            const response = await eventsAPI.getEvents()
            return { success: true, data: response.data.data?.events || [] }
        } catch (error) {
            return { success: false, error: 'Failed to load events' }
        }
    },

    async createEvent(eventData) {
        try {
            const response = await eventsAPI.createEvent(eventData)
            return { success: true, data: response.data.data.event }
        } catch (error) {
            return { success: false, error: 'Failed to create event' }
        }
    },

    async updateEvent(id, eventData) {
        try {
            const response = await eventsAPI.updateEvent(id, eventData)
            return { success: true, data: response.data.data.event }
        } catch (error) {
            return { success: false, error: 'Failed to update event' }
        }
    },

    async deleteEvent(id) {
        try {
            await eventsAPI.deleteEvent(id)
            return { success: true }
        } catch (error) {
            return { success: false, error: 'Failed to delete event' }
        }
    },

    async updateEventStatus(id, status) {
        try {
            const response = await eventsAPI.updateEventStatus(id, status)
            return { success: true, data: response.data.data.event }
        } catch (error) {
            return { success: false, error: 'Failed to update event status' }
        }
    }
}

// Swap service
export const swapService = {
    async fetchSwappableSlots() {
        try {
            const response = await swapAPI.getSwappableSlots()
            return { success: true, data: response.data.data?.slots || [] }
        } catch (error) {
            return { success: false, error: 'Failed to load available slots' }
        }
    },

    async createSwapRequest(requestData) {
        try {
            const response = await swapAPI.createSwapRequest(requestData)
            return { success: true, data: response.data.data.request }
        } catch (error) {
            return { success: false, error: 'Failed to create swap request' }
        }
    },

    async respondToSwapRequest(requestId, action) {
        try {
            const response = await swapAPI.respondToSwapRequest(requestId, action)
            return { success: true, data: response.data.data.request }
        } catch (error) {
            return { success: false, error: 'Failed to respond to swap request' }
        }
    },

    async fetchIncomingRequests() {
        try {
            const response = await swapAPI.getIncomingRequests()
            return { success: true, data: response.data.data?.requests || [] }
        } catch (error) {
            return { success: false, error: 'Failed to load incoming requests' }
        }
    },

    async fetchOutgoingRequests() {
        try {
            const response = await swapAPI.getOutgoingRequests()
            return { success: true, data: response.data.data?.requests || [] }
        } catch (error) {
            return { success: false, error: 'Failed to load outgoing requests' }
        }
    }
}