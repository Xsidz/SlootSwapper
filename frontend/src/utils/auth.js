// JWT token storage and management utilities

export const tokenStorage = {
    get: () => {
        try {
            return localStorage.getItem('token')
        } catch (error) {
            console.error('Error getting token from localStorage:', error)
            return null
        }
    },

    set: (token) => {
        try {
            if (token) {
                localStorage.setItem('token', token)
            } else {
                localStorage.removeItem('token')
            }
        } catch (error) {
            console.error('Error setting token in localStorage:', error)
        }
    },

    remove: () => {
        try {
            localStorage.removeItem('token')
        } catch (error) {
            console.error('Error removing token from localStorage:', error)
        }
    }
}

export const isTokenExpired = (token) => {
    if (!token) return true

    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentTime = Date.now() / 1000
        return payload.exp < currentTime
    } catch (error) {
        console.error('Error parsing token:', error)
        return true
    }
}

export const getTokenPayload = (token) => {
    if (!token) return null

    try {
        return JSON.parse(atob(token.split('.')[1]))
    } catch (error) {
        console.error('Error parsing token payload:', error)
        return null
    }
}

export const formatAuthHeader = (token) => {
    return token ? `Bearer ${token}` : null
}