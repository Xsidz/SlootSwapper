import React from 'react'

const LoadingSkeleton = ({
    type = 'card',
    count = 1,
    className = '',
    height = 'h-20',
    width = 'w-full'
}) => {
    const renderCardSkeleton = () => (
        <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
            <div className="animate-pulse">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
        </div>
    )

    const renderListSkeleton = () => (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="animate-pulse">
                    <div className={`bg-gray-200 rounded ${height} ${width}`}></div>
                </div>
            ))}
        </div>
    )

    const renderTableSkeleton = () => (
        <div className={`bg-white rounded-lg shadow ${className}`}>
            <div className="animate-pulse">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
                {/* Rows */}
                <div className="p-6 space-y-4">
                    {Array.from({ length: count }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-4">
                            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderFormSkeleton = () => (
        <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
            <div className="animate-pulse space-y-6">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-4">
                    {Array.from({ length: count }).map((_, index) => (
                        <div key={index}>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded w-full"></div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end space-x-3">
                    <div className="h-10 bg-gray-200 rounded w-20"></div>
                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
        </div>
    )

    const renderTextSkeleton = () => (
        <div className={`animate-pulse ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={`bg-gray-200 rounded mb-2 ${height} ${width}`}></div>
            ))}
        </div>
    )

    const renderButtonSkeleton = () => (
        <div className={`animate-pulse ${className}`}>
            <div className={`bg-gray-200 rounded ${height} ${width}`}></div>
        </div>
    )

    const renderAvatarSkeleton = () => (
        <div className={`animate-pulse ${className}`}>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
    )

    const renderImageSkeleton = () => (
        <div className={`animate-pulse ${className}`}>
            <div className={`bg-gray-200 rounded ${height} ${width}`}></div>
        </div>
    )

    switch (type) {
        case 'card':
            return Array.from({ length: count }).map((_, index) => (
                <div key={index}>{renderCardSkeleton()}</div>
            ))
        case 'list':
            return renderListSkeleton()
        case 'table':
            return renderTableSkeleton()
        case 'form':
            return renderFormSkeleton()
        case 'text':
            return renderTextSkeleton()
        case 'button':
            return renderButtonSkeleton()
        case 'avatar':
            return renderAvatarSkeleton()
        case 'image':
            return renderImageSkeleton()
        default:
            return renderCardSkeleton()
    }
}

export default LoadingSkeleton