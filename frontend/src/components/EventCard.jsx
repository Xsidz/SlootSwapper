import React, { useState } from 'react'

const EventCard = ({ event, onDelete, onStatusToggle, onEdit }) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'BUSY':
                return 'bg-gray-100 text-gray-800'
            case 'SWAPPABLE':
                return 'bg-green-100 text-green-800'
            case 'SWAP_PENDING':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'BUSY':
                return 'Busy'
            case 'SWAPPABLE':
                return 'Swappable'
            case 'SWAP_PENDING':
                return 'Swap Pending'
            default:
                return status
        }
    }

    const handleStatusToggle = async () => {
        if (event.status === 'SWAP_PENDING') {
            return // Cannot change status when swap is pending
        }

        setIsUpdatingStatus(true)
        try {
            const newStatus = event.status === 'BUSY' ? 'SWAPPABLE' : 'BUSY'
            await onStatusToggle(event._id, newStatus)
        } catch (error) {
            console.error('Error toggling status:', error)
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            setIsDeleting(true)
            try {
                await onDelete(event._id)
            } catch (error) {
                console.error('Error deleting event:', error)
                setIsDeleting(false)
            }
        }
    }

    const startDateTime = formatDateTime(event.startTime)
    const endDateTime = formatDateTime(event.endTime)

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200">
            <div className="flex flex-col space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                            {event.title}
                        </h3>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)} flex-shrink-0`}>
                        {getStatusLabel(event.status)}
                    </span>
                </div>

                {/* Time Details */}
                <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium mr-2">Start:</span>
                        <span className="truncate">
                            {startDateTime.date} at {startDateTime.time}
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium mr-2">End:</span>
                        <span className="truncate">
                            {endDateTime.date} at {endDateTime.time}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 pt-2 border-t border-gray-100">
                    <div className="flex space-x-3">
                        <button
                            onClick={() => onEdit && onEdit(event)}
                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 transition-colors duration-200"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>

                    <div className="flex items-center">
                        {event.status === 'SWAP_PENDING' ? (
                            <div className="flex items-center text-sm text-yellow-600 font-medium bg-yellow-50 px-3 py-2 rounded-lg">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                Swap pending
                            </div>
                        ) : (
                            <button
                                onClick={handleStatusToggle}
                                disabled={isUpdatingStatus}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${event.status === 'BUSY'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                                    } disabled:opacity-50 flex items-center`}
                            >
                                {isUpdatingStatus ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                        {event.status === 'BUSY' ? 'Make Swappable' : 'Make Busy'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EventCard