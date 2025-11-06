import React, { useState } from 'react'

const IncomingRequestCard = ({ request, onResponse }) => {
    const [isResponding, setIsResponding] = useState(false)
    const [responseError, setResponseError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)

    const formatDateTime = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status) => {
        const statusStyles = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            ACCEPTED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800'
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
                {status.toLowerCase()}
            </span>
        )
    }

    const handleResponse = async (action) => {
        setIsResponding(true)
        setResponseError(null)
        setSuccessMessage(null)

        try {
            const result = await onResponse(request._id, action)

            if (result.success) {
                setSuccessMessage(
                    action === 'accept'
                        ? 'Swap accepted successfully! The events have been exchanged.'
                        : 'Swap request rejected.'
                )
            } else {
                setResponseError(result.error)
            }
        } catch (err) {
            setResponseError('An unexpected error occurred')
        } finally {
            setIsResponding(false)
        }
    }

    const isPending = request.status === 'PENDING'

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            {/* Header with status and timestamp */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {request.requesterUserId.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {request.requesterUserId.email}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    {getStatusBadge(request.status)}
                    <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(request.createdAt)}
                    </p>
                </div>
            </div>

            {/* Swap Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* They're offering */}
                <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">They're offering:</h4>
                    <div className="space-y-1">
                        <p className="font-semibold text-gray-900">{request.requesterSlotId.title}</p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Start:</span> {formatDateTime(request.requesterSlotId.startTime)}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">End:</span> {formatDateTime(request.requesterSlotId.endTime)}
                        </p>
                    </div>
                </div>

                {/* They want */}
                <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-900 mb-2">They want:</h4>
                    <div className="space-y-1">
                        <p className="font-semibold text-gray-900">{request.targetSlotId.title}</p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Start:</span> {formatDateTime(request.targetSlotId.startTime)}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">End:</span> {formatDateTime(request.targetSlotId.endTime)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Message */}
            {request.message && (
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Message:</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                        {request.message}
                    </p>
                </div>
            )}

            {/* Response Message (if responded) */}
            {request.responseMessage && (
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Your Response:</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                        {request.responseMessage}
                    </p>
                    {request.respondedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                            Responded on {formatDateTime(request.respondedAt)}
                        </p>
                    )}
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">{successMessage}</p>
                </div>
            )}

            {/* Error Message */}
            {responseError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{responseError}</p>
                </div>
            )}

            {/* Action Buttons */}
            {isPending && (
                <div className="flex space-x-3">
                    <button
                        onClick={() => handleResponse('accept')}
                        disabled={isResponding}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isResponding ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            'Accept Swap'
                        )}
                    </button>
                    <button
                        onClick={() => handleResponse('reject')}
                        disabled={isResponding}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isResponding ? 'Processing...' : 'Reject'}
                    </button>
                </div>
            )}

            {/* Status Message for non-pending requests */}
            {!isPending && (
                <div className={`text-center py-2 rounded-lg ${request.status === 'ACCEPTED'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                    }`}>
                    <p className="text-sm font-medium">
                        {request.status === 'ACCEPTED'
                            ? '✓ Swap completed successfully'
                            : '✗ Swap request was rejected'
                        }
                    </p>
                </div>
            )}
        </div>
    )
}

export default IncomingRequestCard