import React from 'react'
import EventCard from './EventCard'

const EventList = ({ events, onEventUpdate, onEventDelete, onStatusToggle, onEventEdit }) => {
    if (!events || events.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No events yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Create your first event to get started with slot swapping and connect with others
                </p>
                <button
                    onClick={() => onEventEdit && onEventEdit()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 flex items-center space-x-2 mx-auto"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Your First Event</span>
                </button>
            </div>
        )
    }

    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) =>
        new Date(a.startTime) - new Date(b.startTime)
    )

    return (
        <div className="space-y-4 sm:space-y-6">
            {sortedEvents.map((event) => (
                <EventCard
                    key={event._id}
                    event={event}
                    onUpdate={onEventUpdate}
                    onDelete={onEventDelete}
                    onStatusToggle={onStatusToggle}
                    onEdit={onEventEdit}
                />
            ))}
        </div>
    )
}

export default EventList