import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { swapAPI } from '../services/api'
import IncomingRequestCard from './IncomingRequestCard'
import OutgoingRequestCard from './OutgoingRequestCard'
import LoadingSkeleton from './LoadingSkeleton'

const NotificationsView = () => {
    const navigate = useNavigate()
    const { showSuccess, showError } = useToast()
    const [incomingRequests, setIncomingRequests] = useState([])
    const [outgoingRequests, setOutgoingRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('incoming')

    useEffect(() => {
        fetchRequests()

        // Set up polling for real-time updates
        const interval = setInterval(fetchRequests, 30000) // Refresh every 30 seconds

        return () => clearInterval(interval)
    }, [])

    const fetchRequests = async () => {
        try {
            setLoading(true)
            setError(null)

            const [incomingResponse, outgoingResponse] = await Promise.all([
                swapAPI.getIncomingRequests(),
                swapAPI.getOutgoingRequests()
            ])

            setIncomingRequests(incomingResponse.data.data.requests)
            setOutgoingRequests(outgoingResponse.data.data.requests)
        } catch (err) {
            console.error('Error fetching swap requests:', err)
            setError('Failed to load swap requests. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleRequestResponse = async (requestId, action) => {
        try {
            await swapAPI.respondToSwapRequest(requestId, action)

            // Show success message
            const successMessage = action === 'accept'
                ? 'Swap accepted successfully! Events have been exchanged.'
                : 'Swap request rejected successfully.'

            showSuccess(successMessage)

            // Refresh requests after response
            await fetchRequests()

            return { success: true }
        } catch (err) {
            console.error('Error responding to swap request:', err)
            const errorMessage = err.response?.data?.error?.message || 'Failed to respond to request'
            showError(errorMessage)
            return {
                success: false,
                error: errorMessage
            }
        }
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <LoadingSkeleton type="table" count={3} />
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-center">
                        <div className="text-red-600 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Requests</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={fetchRequests}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const pendingIncoming = incomingRequests.filter(req => req.status === 'PENDING')
    const pendingOutgoing = outgoingRequests.filter(req => req.status === 'PENDING')

    return (
        <div className="max-w-4xl mx-auto p-6">


            <div className="bg-white rounded-lg shadow-md">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Swap Requests</h1>
                            <p className="text-gray-600 mt-1">
                                Manage your incoming and outgoing slot exchange requests
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/marketplace')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Marketplace
                            </button>
                            <button
                                onClick={fetchRequests}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                            >
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('incoming')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'incoming'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Incoming Requests
                            {pendingIncoming.length > 0 && (
                                <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {pendingIncoming.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('outgoing')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'outgoing'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Outgoing Requests
                            {pendingOutgoing.length > 0 && (
                                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {pendingOutgoing.length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'incoming' ? (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Incoming Requests ({incomingRequests.length})
                            </h2>
                            {incomingRequests.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Incoming Requests</h3>
                                    <p className="text-gray-600">
                                        You don't have any swap requests from other users yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {incomingRequests.map((request) => (
                                        <IncomingRequestCard
                                            key={request._id}
                                            request={request}
                                            onResponse={handleRequestResponse}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Outgoing Requests ({outgoingRequests.length})
                            </h2>
                            {outgoingRequests.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Outgoing Requests</h3>
                                    <p className="text-gray-600">
                                        You haven't made any swap requests yet. Visit the marketplace to find slots to exchange.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {outgoingRequests.map((request) => (
                                        <OutgoingRequestCard
                                            key={request._id}
                                            request={request}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default NotificationsView