import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { eventsAPI } from '../services/api'
import EventList from './EventList'
import EventForm from './EventForm'
import LoadingSkeleton from './LoadingSkeleton'

const CalendarDashboard = () => {
    console.log('CalendarDashboard component rendering...')
    const { user, logout } = useAuth()
    const { showSuccess, showError } = useToast()
    const navigate = useNavigate()
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showEventForm, setShowEventForm] = useState(false)
    const [editingEvent, setEditingEvent] = useState(null)
    const [formLoading, setFormLoading] = useState(false)

    console.log('Current state:', { events, loading, error, user })

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            setLoading(true)
            setError('')
            console.log('Fetching events...')
            const response = await eventsAPI.getEvents()
            console.log('Events API response:', response)
            const events = response.data.data?.events || []
            console.log('Parsed events:', events)
            setEvents(events)
        } catch (error) {
            setError('Failed to load events. Please try again.')
            console.error('Error fetching events:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEventUpdate = async (eventId, updates) => {
        try {
            await eventsAPI.updateEvent(eventId, updates)
            await fetchEvents() // Refresh events list
        } catch (error) {
            setError('Failed to update event. Please try again.')
            console.error('Error updating event:', error)
        }
    }

    const handleCreateEvent = async (eventData) => {
        setFormLoading(true)
        try {
            await eventsAPI.createEvent(eventData)
            await fetchEvents() // Refresh events list
            setShowEventForm(false)
            setError('')
            showSuccess('Event created successfully!')
        } catch (error) {
            const errorMessage = 'Failed to create event. Please try again.'
            setError(errorMessage)
            showError(errorMessage)
            console.error('Error creating event:', error)
            throw error // Re-throw to let form handle it
        } finally {
            setFormLoading(false)
        }
    }

    const handleEditEvent = async (eventData) => {
        if (!editingEvent) return

        setFormLoading(true)
        try {
            await eventsAPI.updateEvent(editingEvent._id, eventData)
            await fetchEvents() // Refresh events list
            setShowEventForm(false)
            setEditingEvent(null)
            setError('')
            showSuccess('Event updated successfully!')
        } catch (error) {
            const errorMessage = 'Failed to update event. Please try again.'
            setError(errorMessage)
            showError(errorMessage)
            console.error('Error updating event:', error)
            throw error // Re-throw to let form handle it
        } finally {
            setFormLoading(false)
        }
    }

    const openCreateForm = () => {
        setEditingEvent(null)
        setShowEventForm(true)
    }

    const openEditForm = (event) => {
        setEditingEvent(event)
        setShowEventForm(true)
    }

    const closeForm = () => {
        setShowEventForm(false)
        setEditingEvent(null)
    }

    const handleEventDelete = async (eventId) => {
        try {
            await eventsAPI.deleteEvent(eventId)
            await fetchEvents() // Refresh events list
            showSuccess('Event deleted successfully!')
        } catch (error) {
            const errorMessage = 'Failed to delete event. Please try again.'
            setError(errorMessage)
            showError(errorMessage)
            console.error('Error deleting event:', error)
        }
    }

    const handleStatusToggle = async (eventId, newStatus) => {
        try {
            await eventsAPI.updateEventStatus(eventId, newStatus)
            await fetchEvents() // Refresh events list
            showSuccess(`Event status updated to ${newStatus.toLowerCase()}!`)
        } catch (error) {
            const errorMessage = 'Failed to update event status. Please try again.'
            setError(errorMessage)
            showError(errorMessage)
            console.error('Error updating event status:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-lg border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    Dashboard
                                </h1>
                                <p className="text-sm sm:text-base text-gray-600">
                                    Welcome back, {user?.name || 'User'}
                                </p>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="sm:hidden">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => navigate('/marketplace')}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <span>Market</span>
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
                                    onClick={logout}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden sm:flex items-center space-x-3">
                            <button
                                onClick={() => navigate('/marketplace')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span>Marketplace</span>
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
                                onClick={logout}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-red-700 font-medium">{error}</div>
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Total Events</p>
                                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Swappable</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {events.filter(e => e.status === 'SWAPPABLE').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {events.filter(e => e.status === 'SWAP_PENDING').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Events Section */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-100">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    My Events
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage your schedule and swap availability
                                </p>
                            </div>
                            <button
                                onClick={openCreateForm}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Create Event</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {loading ? (
                            <LoadingSkeleton type="card" count={3} />
                        ) : (
                            <EventList
                                events={events}
                                onEventUpdate={handleEventUpdate}
                                onEventDelete={handleEventDelete}
                                onStatusToggle={handleStatusToggle}
                                onEventEdit={openEditForm}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* Event Form Modal */}
            <EventForm
                isOpen={showEventForm}
                onClose={closeForm}
                onSubmit={editingEvent ? handleEditEvent : handleCreateEvent}
                event={editingEvent}
                loading={formLoading}
            />
        </div>
    )
}

export default CalendarDashboard