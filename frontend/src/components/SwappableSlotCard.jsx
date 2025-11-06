import React, { useState } from 'react'

const SwappableSlotCard = ({ slot, onSwapRequest }) => {
    const [isRequesting, setIsRequesting] = useState(false)

    const formatDateTime = (dateString) => {
        const date = new Date(dateString)
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
        }
    }

    const getDuration = (startTime, endTime) => {
        const start = new Date(startTime)
        const end = new Date(endTime)
        const durationMs = end - start
        const hours = Math.floor(durationMs / (1000 * 60 * 60))
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

        if (hours === 0) {
            return `${minutes}m`
        } else if (minutes === 0) {
            return `${hours}h`
        } else {
            return `${hours}h ${minutes}m`
        }
    }

    const handleSwapRequest = async () => {
        setIsRequesting(true)
        try {
            await onSwapRequest(slot._id)
        } catch (error) {
            console.error('Error requesting swap:', error)
        } finally {
            setIsRequesting(false)
        }
    }

    const startDateTime = formatDateTime(slot.startTime)
    const endDateTime = formatDateTime(slot.endTime)
    const duration = getDuration(slot.startTime, slot.endTime)

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {slot.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                        by {slot.ownerName}
                    </p>
                </div>
                <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                    </span>
                </div>
            </div>

            {/* Time Details */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Start:</span>
                    <span className="ml-1">
                        {startDateTime.date} at {startDateTime.time}
                    </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">End:</span>
                    <span className="ml-1">
                        {endDateTime.date} at {endDateTime.time}
                    </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-medium">Duration:</span>
                    <span className="ml-1">{duration}</span>
                </div>
            </div>

            {/* Owner Info */}
            <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                            {slot.ownerName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                            {slot.ownerName}
                        </p>
                        <p className="text-xs text-gray-500">
                            Slot owner
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSwapRequest}
                    disabled={isRequesting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRequesting ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Requesting...
                        </div>
                    ) : (
                        'Request Swap'
                    )}
                </button>
            </div>
        </div>
    )
}

export default SwappableSlotCard