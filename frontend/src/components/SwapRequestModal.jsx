import React, { useState, useEffect } from 'react'
import { eventsAPI } from '../services/api'

const SwapRequestModal = ({ isOpen, onClose, targetSlot, onSubmit, loading = false }) => {
    const [userSlots, setUserSlots] = useState([])
    const [selectedSlotId, setSelectedSlotId] = useState('')
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (isOpen) {
            fetchUserSwappableSlots()
        }
    }, [isOpen])

    useEffect(() => {
        // Reset form when modal opens/closes
        if (isOpen) {
            setSelectedSlotId('')
            setErrors({})
        }
    }, [isOpen])

    const fetchUserSwappableSlots = async () => {
        try {
            setLoadingSlots(true)
            setErrors({})
            const response = await eventsAPI.getEvents()
            const events = response.data.data?.events || []

            // Filter to only show SWAPPABLE events
            const swappableSlots = events.filter(event => event.status === 'SWAPPABLE')
            setUserSlots(swappableSlots)

            if (swappableSlots.length === 0) {
                setErrors({ slots: 'You have no swappable slots available. Mark some of your events as swappable first.' })
            }
        } catch (error) {
            setErrors({ slots: 'Failed to load your available slots. Please try again.' })
            console.error('Error fetching user slots:', error)
        } finally {
            setLoadingSlots(false)
        }
    }

    const formatDateTime = (dateString) => {
        const date = new Date(dateString)
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!selectedSlotId) {
            newErrors.selectedSlot = 'Please select one of your slots to offer'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            const swapRequestData = {
                requesterSlotId: selectedSlotId,
                targetSlotId: targetSlot._id
            }

            await onSubmit(swapRequestData)
            handleClose()
        } catch (error) {
            setErrors({ submit: 'Failed to create swap request. Please try again.' })
        }
    }

    const handleClose = () => {
        setSelectedSlotId('')
        setErrors({})
        onClose()
    }

    if (!isOpen || !targetSlot) return null

    const targetStartTime = formatDateTime(targetSlot.startTime)
    const targetEndTime = formatDateTime(targetSlot.endTime)

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900">
                            Request Slot Swap
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Target Slot Info */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                            Slot you want to request:
                        </h4>
                        <div className="bg-white p-3 rounded border">
                            <h5 className="font-semibold text-gray-900">{targetSlot.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">
                                by {targetSlot.ownerName}
                            </p>
                            <div className="mt-2 text-sm text-gray-600">
                                <div>Start: {targetStartTime.date} at {targetStartTime.time}</div>
                                <div>End: {targetEndTime.date} at {targetEndTime.time}</div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errors.submit && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="text-sm text-red-700">{errors.submit}</div>
                            </div>
                        )}

                        {errors.slots && (
                            <div className="rounded-md bg-yellow-50 p-4">
                                <div className="text-sm text-yellow-700">{errors.slots}</div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Select your slot to offer in exchange:
                            </label>

                            {loadingSlots ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-gray-600">Loading your slots...</span>
                                </div>
                            ) : userSlots.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No swappable slots available
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {userSlots.map((slot) => {
                                        const startTime = formatDateTime(slot.startTime)
                                        const endTime = formatDateTime(slot.endTime)

                                        return (
                                            <label
                                                key={slot._id}
                                                className={`block p-3 border rounded-lg cursor-pointer transition-colors ${selectedSlotId === slot._id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-start">
                                                    <input
                                                        type="radio"
                                                        name="selectedSlot"
                                                        value={slot._id}
                                                        checked={selectedSlotId === slot._id}
                                                        onChange={(e) => {
                                                            setSelectedSlotId(e.target.value)
                                                            if (errors.selectedSlot) {
                                                                setErrors(prev => ({ ...prev, selectedSlot: '' }))
                                                            }
                                                        }}
                                                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                    />
                                                    <div className="ml-3 flex-1">
                                                        <div className="font-medium text-gray-900">
                                                            {slot.title}
                                                        </div>
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            <div>Start: {startTime.date} at {startTime.time}</div>
                                                            <div>End: {endTime.date} at {endTime.time}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        )
                                    })}
                                </div>
                            )}

                            {errors.selectedSlot && (
                                <p className="mt-2 text-sm text-red-600">{errors.selectedSlot}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || userSlots.length === 0}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating Request...
                                    </div>
                                ) : (
                                    'Create Swap Request'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default SwapRequestModal