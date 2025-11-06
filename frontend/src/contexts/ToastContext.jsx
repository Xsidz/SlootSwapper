import React, { createContext, useContext, useState, useCallback } from 'react'
import Toast from '../components/Toast'

const ToastContext = createContext()

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const addToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random()
        const newToast = {
            id,
            message,
            type,
            duration,
            isVisible: true
        }

        setToasts(prev => [...prev, newToast])

        // Auto-remove toast after duration
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id))
            }, duration)
        }

        return id
    }, [])

    const showSuccess = useCallback((message, duration) => {
        return addToast(message, 'success', duration)
    }, [addToast])

    const showError = useCallback((message, duration) => {
        return addToast(message, 'error', duration)
    }, [addToast])

    const showWarning = useCallback((message, duration) => {
        return addToast(message, 'warning', duration)
    }, [addToast])

    const showInfo = useCallback((message, duration) => {
        return addToast(message, 'info', duration)
    }, [addToast])

    const clearAll = useCallback(() => {
        setToasts([])
    }, [])

    const value = {
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        clearAll
    }

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        isVisible={toast.isVisible}
                        onClose={() => removeToast(toast.id)}
                        duration={0} // Duration is handled by the context
                    />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export default ToastProvider