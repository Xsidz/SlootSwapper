import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { swapAPI } from '../services/api'
import SwappableSlotCard from './SwappableSlotCard'
import SwapRequestModal from './SwapRequestModal'
import LoadingSkeleton from './LoadingSkeleton'

const MarketplaceView = () => {
    const navigate = useNavigate()
    const { showSuccess, showError } = useToast()
    const [slots, setSlots] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredSlots, setFilteredSlots] = useState([])
    const [showSwapModal, setShowSwapModal] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [swapRequestLoading, setSwapRequestLoading] = useState(false)

    // Filter and sort states
    const [sortBy, setSortBy] = useState('startTime') // startTime, duration, title, owner
    const [sortOrder, setSortOrder] = useState('asc') // asc, desc
    const [dateFilter, setDateFilter] = useState('all') // all, today, tomorrow, thisWeek, nextWeek
    const [durationFilter, setDurationFilter] = useState('all') // all, short, medium, long
    const [timeFilter, setTimeFilter] = useState('all') // all, morning, afternoon, evening
    const [showFilters, setShowFilters] = useState(false) // for mobile filter toggle

    useEffect(() => {
        fetchSwappableSlots()
    }, [])

    useEffect(() => {
        let filtered = [...slots]

        // Apply search filter
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(slot =>
                slot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                slot.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Apply date filter
        if (dateFilter !== 'all') {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            const thisWeekEnd = new Date(today)
            thisWeekEnd.setDate(thisWeekEnd.getDate() + (7 - today.getDay()))
            const nextWeekEnd = new Date(thisWeekEnd)
            nextWeekEnd.setDate(nextWeekEnd.getDate() + 7)

            filtered = filtered.filter(slot => {
                const slotDate = new Date(slot.startTime)
                const slotDay = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate())

                switch (dateFilter) {
                    case 'today':
                        return slotDay.getTime() === today.getTime()
                    case 'tomorrow':
                        return slotDay.getTime() === tomorrow.getTime()
                    case 'thisWeek':
                        return slotDate >= today && slotDate <= thisWeekEnd
                    case 'nextWeek':
                        return slotDate > thisWeekEnd && slotDate <= nextWeekEnd
                    default:
                        return true
                }
            })
        }

        // Apply duration filter
        if (durationFilter !== 'all') {
            filtered = filtered.filter(slot => {
                const duration = new Date(slot.endTime) - new Date(slot.startTime)
                const hours = duration / (1000 * 60 * 60)

                switch (durationFilter) {
                    case 'short':
                        return hours <= 1
                    case 'medium':
                        return hours > 1 && hours <= 3
                    case 'long':
                        return hours > 3
                    default:
                        return true
                }
            })
        }

        // Apply time of day filter
        if (timeFilter !== 'all') {
            filtered = filtered.filter(slot => {
                const hour = new Date(slot.startTime).getHours()

                switch (timeFilter) {
                    case 'morning':
                        return hour >= 6 && hour < 12
                    case 'afternoon':
                        return hour >= 12 && hour < 18
                    case 'evening':
                        return hour >= 18 || hour < 6
                    default:
                        return true
                }
            })
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue

            switch (sortBy) {
                case 'startTime':
                    aValue = new Date(a.startTime)
                    bValue = new Date(b.startTime)
                    break
                case 'duration':
                    aValue = new Date(a.endTime) - new Date(a.startTime)
                    bValue = new Date(b.endTime) - new Date(b.startTime)
                    break
                case 'title':
                    aValue = a.title.toLowerCase()
                    bValue = b.title.toLowerCase()
                    break
                case 'owner':
                    aValue = a.ownerName.toLowerCase()
                    bValue = b.ownerName.toLowerCase()
                    break
                default:
                    return 0
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
            return 0
        })

        setFilteredSlots(filtered)
    }, [slots, searchTerm, sortBy, sortOrder, dateFilter, durationFilter, timeFilter])

    const fetchSwappableSlots = async () => {
        try {
            setLoading(true)
            setError('')
            console.log('Fetching swappable slots...')
            const response = await swapAPI.getSwappableSlots()
            console.log('Swappable slots API response:', response)
            // Backend returns slots with populated user data
            const slots = response.data.data?.slots || []
            console.log('Parsed slots:', slots)
            // Transform slots to include owner name from populated user data
            const transformedSlots = slots.map(slot => ({
                ...slot,
                ownerName: slot.userId?.name || 'Unknown User'
            }))
            console.log('Transformed slots:', transformedSlots)
            setSlots(transformedSlots)
        } catch (error) {
            setError('Failed to load available slots. Please try again.')
            console.error('Error fetching swappable slots:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSwapRequest = (targetSlotId) => {
        const targetSlot = slots.find(slot => slot._id === targetSlotId)
        if (targetSlot) {
            setSelectedSlot(targetSlot)
            setShowSwapModal(true)
            setError('')
        }
    }

    const handleSwapRequestSubmit = async (swapRequestData) => {
        setSwapRequestLoading(true)
        try {
            await swapAPI.createSwapRequest(swapRequestData)
            showSuccess('Swap request created successfully!')
            setShowSwapModal(false)
            setSelectedSlot(null)
            setError('')
            // Refresh slots to reflect the updated status
            await fetchSwappableSlots()
        } catch (error) {
            const errorMessage = 'Failed to create swap request. Please try again.'
            setError(errorMessage)
            showError(errorMessage)
            console.error('Error creating swap request:', error)
            throw error // Re-throw to let modal handle it
        } finally {
            setSwapRequestLoading(false)
        }
    }

    const handleCloseModal = () => {
        setShowSwapModal(false)
        setSelectedSlot(null)
    }

    const handleRefresh = () => {
        fetchSwappableSlots()
    }

    const clearAllFilters = () => {
        setSearchTerm('')
        setSortBy('startTime')
        setSortOrder('asc')
        setDateFilter('all')
        setDurationFilter('all')
        setTimeFilter('all')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-lg border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        Marketplace
                                    </h1>
                                    <p className="text-sm sm:text-base text-gray-600">
                                        Browse and request swaps for available time slots
                                    </p>
                                </div>
                            </div>

                            {/* Mobile Menu */}
                            <div className="sm:hidden">
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        <span>Dashboard</span>
                                    </button>
                                    <button
                                        onClick={() => navigate('/notifications')}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7h6m0 10v-3M9 17h3m-3-10h3m2-3h.01M9 14h.01M15 11h.01" />
                                        </svg>
                                        <span>Alerts</span>
                                    </button>
                                    <button
                                        onClick={handleRefresh}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Desktop Menu */}
                            <div className="hidden sm:flex items-center space-x-3">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>Dashboard</span>
                                </button>
                                <button
                                    onClick={() => navigate('/notifications')}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7h6m0 10v-3M9 17h3m-3-10h3m2-3h.01M9 14h.01M15 11h.01" />
                                    </svg>
                                    <span>Notifications</span>
                                </button>
                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-3">
                            Search slots
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="search"
                                placeholder="Search by title or owner name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                            />
                        </div>
                    </div>

                    {/* Filter Toggle for Mobile */}
                    <div className="mb-4 md:hidden">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100"
                        >
                            <span>Filters & Sorting</span>
                            <svg
                                className={`w-5 h-5 transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Filters and Sorting */}
                    <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort by
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="startTime">Start Time</option>
                                    <option value="duration">Duration</option>
                                    <option value="title">Title</option>
                                    <option value="owner">Owner</option>
                                </select>
                            </div>

                            {/* Sort Order */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Order
                                </label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date
                                </label>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All dates</option>
                                    <option value="today">Today</option>
                                    <option value="tomorrow">Tomorrow</option>
                                    <option value="thisWeek">This week</option>
                                    <option value="nextWeek">Next week</option>
                                </select>
                            </div>

                            {/* Duration Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration
                                </label>
                                <select
                                    value={durationFilter}
                                    onChange={(e) => setDurationFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All durations</option>
                                    <option value="short">Short (≤ 1h)</option>
                                    <option value="medium">Medium (1-3h)</option>
                                    <option value="long">Long (&gt; 3h)</option>
                                </select>
                            </div>

                            {/* Time of Day Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Time of day
                                </label>
                                <select
                                    value={timeFilter}
                                    onChange={(e) => setTimeFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All times</option>
                                    <option value="morning">Morning (6AM-12PM)</option>
                                    <option value="afternoon">Afternoon (12PM-6PM)</option>
                                    <option value="evening">Evening (6PM-6AM)</option>
                                </select>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(searchTerm || dateFilter !== 'all' || durationFilter !== 'all' || timeFilter !== 'all' || sortBy !== 'startTime' || sortOrder !== 'asc') && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-blue-900">Active filters:</span>
                                    {searchTerm && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Search: "{searchTerm}"
                                        </span>
                                    )}
                                    {dateFilter !== 'all' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Date: {dateFilter}
                                        </span>
                                    )}
                                    {durationFilter !== 'all' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Duration: {durationFilter}
                                        </span>
                                    )}
                                    {timeFilter !== 'all' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Time: {timeFilter}
                                        </span>
                                    )}
                                    {(sortBy !== 'startTime' || sortOrder !== 'asc') && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Sort: {sortBy} ({sortOrder})
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quick Filter Presets */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quick filters
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => {
                                        setDateFilter('today')
                                        setSortBy('startTime')
                                        setSortOrder('asc')
                                    }}
                                    className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                                >
                                    Today's slots
                                </button>
                                <button
                                    onClick={() => {
                                        setTimeFilter('morning')
                                        setSortBy('startTime')
                                        setSortOrder('asc')
                                    }}
                                    className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                                >
                                    Morning slots
                                </button>
                                <button
                                    onClick={() => {
                                        setDurationFilter('short')
                                        setSortBy('duration')
                                        setSortOrder('asc')
                                    }}
                                    className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                                >
                                    Quick meetings
                                </button>
                                <button
                                    onClick={() => {
                                        setDateFilter('thisWeek')
                                        setSortBy('startTime')
                                        setSortOrder('asc')
                                    }}
                                    className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                                >
                                    This week
                                </button>
                            </div>
                        </div>

                        {/* Filter Actions */}
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Showing {filteredSlots.length} of {slots.length} slots
                            </div>
                            <button
                                onClick={clearAllFilters}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>



                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-700">{error}</div>
                        </div>
                    )}

                    {/* Slots Grid */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Available Slots
                                </h2>
                                <div className="flex items-center space-x-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        {filteredSlots.length} slots
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            {loading ? (
                                <LoadingSkeleton type="card" count={6} />
                            ) : filteredSlots.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {slots.length === 0
                                            ? 'No swappable slots available'
                                            : 'No slots match your filters'
                                        }
                                    </h3>
                                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                        {slots.length === 0
                                            ? 'Check back later for new opportunities, or create your own events to swap.'
                                            : 'Try adjusting your search terms or filters to find more slots.'
                                        }
                                    </p>
                                    {slots.length > 0 && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors duration-200"
                                        >
                                            Clear all filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {filteredSlots.map((slot) => (
                                        <SwappableSlotCard
                                            key={slot._id}
                                            slot={slot}
                                            onSwapRequest={handleSwapRequest}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Swap Request Modal */}
                <SwapRequestModal
                    isOpen={showSwapModal}
                    onClose={handleCloseModal}
                    targetSlot={selectedSlot}
                    onSubmit={handleSwapRequestSubmit}
                    loading={swapRequestLoading}
                />
            </div>
        </div>
    )
}

export default MarketplaceView