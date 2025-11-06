import React, { useState, useEffect } from 'react'

const EventForm = ({ isOpen, onClose, onSubmit, event = null, loading = false }) => {
    const [formData, setFormData] = useState({
        title: '',
        startTime: '',
        endTime: ''
    })
    const [errors, setErrors] = useState({})

    // Initialize form data when event prop changes
    useEffect(() => {
        if (event) {
            // Format datetime for input fields (YYYY-MM-DDTHH:MM)
            const formatForInput = (dateString) => {
                const date = new Date(dateString)
                return date.toISOString().slice(0, 16)
            }

            setFormData({
                title: event.title || '',
                startTime: formatForInput(event.startTime),
                endTime: formatForInput(event.endTime)
            })
        } else {
            setFormData({
                title: '',
                startTime: '',
                endTime: ''
            })
        }
        setErrors({})
    }, [event, isOpen])

    const validateForm = () => {
        const newErrors = {}

        // Title validation
        if (!formData.title.trim()) {
            newErrors.title = 'Event title is required'
        }

        // Start time validation
        if (!formData.startTime) {
            newErrors.startTime = 'Start time is required'
        }

        // End time validation
        if (!formData.endTime) {
            newErrors.endTime = 'End time is required'
        } else if (formData.startTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
            newErrors.endTime = 'End time must be after start time'
        }

        // Check if start time is in the past (only for new events)
        if (!event && formData.startTime && new Date(formData.startTime) < new Date()) {
            newErrors.startTime = 'Start time cannot be in the past'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            // Convert datetime-local format to ISO string
            const eventData = {
                title: formData.title.trim(),
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString()
            }

            await onSubmit(eventData)
            onClose()
        } catch (error) {
            setErrors({ submit: 'Failed to save event. Please try again.' })
        }
    }

    const handleClose = () => {
        setFormData({
            title: '',
            startTime: '',
            endTime: ''
        })
        setErrors({})
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {event ? 'Edit Event' : 'Create Event'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {event ? 'Update your event details' : 'Add a new event to your calendar'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errors.submit && (
                            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-sm text-red-700 font-medium">{errors.submit}</div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Event Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        } rounded-xl focus:outline-none focus:ring-2 transition-colors duration-200 text-gray-900 placeholder-gray-500`}
                                    placeholder="Enter event title"
                                />
                                {errors.title && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="startTime" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Start Time
                                </label>
                                <input
                                    type="datetime-local"
                                    id="startTime"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${errors.startTime ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        } rounded-xl focus:outline-none focus:ring-2 transition-colors duration-200 text-gray-900`}
                                />
                                {errors.startTime && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {errors.startTime}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="endTime" className="block text-sm font-semibold text-gray-700 mb-2">
                                    End Time
                                </label>
                                <input
                                    type="datetime-local"
                                    id="endTime"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${errors.endTime ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        } rounded-xl focus:outline-none focus:ring-2 transition-colors duration-200 text-gray-900`}
                                />
                                {errors.endTime && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {errors.endTime}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        {event ? 'Updating...' : 'Creating...'}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {event ? 'Update Event' : 'Create Event'}
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EventForm