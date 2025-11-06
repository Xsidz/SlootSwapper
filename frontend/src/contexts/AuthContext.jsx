import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import { tokenStorage } from '../utils/auth'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [token, setToken] = useState(tokenStorage.get())

    useEffect(() => {
        const validateToken = async () => {
            if (token) {
                try {
                    // Set token in API headers
                    authAPI.setAuthToken(token)

                    // Validate token with backend
                    const response = await authAPI.getProfile()
                    setUser(response.data.data.user)
                    setLoading(false)
                } catch (error) {
                    // Token is invalid, clear it
                    console.error('Token validation failed:', error)
                    setToken(null)
                    setUser(null)
                    tokenStorage.remove()
                    authAPI.setAuthToken(null)
                    setLoading(false)
                }
            } else {
                setLoading(false)
            }
        }

        validateToken()
    }, [token])

    const login = async (email, password) => {
        try {
            const response = await authAPI.login(email, password)
            const { token: newToken, user: userData } = response.data
            setToken(newToken)
            setUser(userData)
            tokenStorage.set(newToken)
            authAPI.setAuthToken(newToken)

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Login failed'
            }
        }
    }

    const register = async (name, email, password) => {
        try {
            const response = await authAPI.register(name, email, password)
            const { token: newToken, user: userData } = response.data

            setToken(newToken)
            setUser(userData)
            tokenStorage.set(newToken)
            authAPI.setAuthToken(newToken)

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Registration failed'
            }
        }
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        tokenStorage.remove()
        authAPI.setAuthToken(null)
    }

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}