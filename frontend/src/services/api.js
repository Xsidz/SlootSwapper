import axios from 'axios'
import { tokenStorage, formatAuthHeader } from '../utils/auth'

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = tokenStorage.get()
        if (token) {
            config.headers.Authorization = formatAuthHeader(token)
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            tokenStorage.remove()
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Authentication API methods
export const authAPI = {
    login: (email, password) => {
        return api.post('/auth/login', { email, password })
    },

    register: (name, email, password) => {
        return api.post('/auth/register', { name, email, password })
    },

    getProfile: () => {
        return api.get('/auth/profile')
    },

    setAuthToken: (token) => {
        if (token) {
            api.defaults.headers.common['Authorization'] = formatAuthHeader(token)
        } else {
            delete api.defaults.headers.common['Authorization']
        }
    }
}

// Events API methods
export const eventsAPI = {
    getEvents: () => api.get('/events'),
    createEvent: (eventData) => api.post('/events', eventData),
    updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
    deleteEvent: (id) => api.delete(`/events/${id}`),
    updateEventStatus: (id, status) => api.patch(`/events/${id}/status`, { status })
}

// Swap API methods
export const swapAPI = {
    getSwappableSlots: () => api.get('/swappable-slots'),
    createSwapRequest: (requestData) => api.post('/swap-request', requestData),
    respondToSwapRequest: (requestId, action) => api.post(`/swap-response/${requestId}`, { action }),
    getIncomingRequests: () => api.get('/swap-requests/incoming'),
    getOutgoingRequests: () => api.get('/swap-requests/outgoing')
}

export default api