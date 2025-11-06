import React from 'react'

const OutgoingRequestCard = ({ request }) => {
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

        const statusIcons = {
            PENDING: (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            ACCEPTED: (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ),
            REJECTED: (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
                {statusIcons[status]}
                {status.toLowerCase()}
            </span>
        )
    }

    const getStatusMessage = (status) => {
        switch (status) {
            case 'PENDING':
                return 'Waiting for response from the other user'
            case 'ACCEPTED':
                return 'Swap completed successfully! Check your calendar for the new event.'
            case 'REJECTED':
                return 'Your swap request was declined'
            default:
                return ''
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            {/* Header with recipient and status */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Request to {request.targetUserId.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {request.targetUserId.email}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    {getStatusBadge(request.status)}
                    <p className="text-xs text-gray-500 mt-1">
                        Sent {formatDateTime(request.createdAt)}
                    </p>
                </div>
            </div>

            {/* Swap Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Your offer */}
                <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">You offered:</h4>
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

                {/* You want */}
                <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-900 mb-2">You requested:</h4>
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

            {/* Your Message */}
            {request.message && (
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Your Message:</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                        {request.message}
                    </p>
                </div>
            )}

            {/* Response Message (if responded) */}
            {request.responseMessage && (
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Their Response:</h4>
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

            {/* Status Message */}
            <div className={`text-center py-3 rounded-lg ${request.status === 'PENDING'
                    ? 'bg-yellow-50 text-yellow-700'
                    : request.status === 'ACCEPTED'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                }`}>
                <p className="text-sm font-medium">
                    {getStatusMessage(request.status)}
                </p>
                {request.status === 'PENDING' && (
                    <p className="text-xs mt-1 opacity-75">
                        You'll be notified when they respond
                    </p>
                )}
            </div>

            {/* Timeline for responded requests */}
            {request.status !== 'PENDING' && request.respondedAt && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Request sent: {formatDateTime(request.createdAt)}</span>
                        <span>Response received: {formatDateTime(request.respondedAt)}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OutgoingRequestCard