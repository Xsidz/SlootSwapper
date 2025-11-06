import React from 'react'

const LoadingSpinner = ({
    size = 'md',
    color = 'blue',
    text = '',
    className = '',
    fullScreen = false
}) => {
    const getSizeClasses = () => {
        switch (size) {
            case 'xs':
                return 'h-3 w-3'
            case 'sm':
                return 'h-4 w-4'
            case 'md':
                return 'h-6 w-6'
            case 'lg':
                return 'h-8 w-8'
            case 'xl':
                return 'h-12 w-12'
            default:
                return 'h-6 w-6'
        }
    }

    const getColorClasses = () => {
        switch (color) {
            case 'blue':
                return 'border-blue-600'
            case 'green':
                return 'border-green-600'
            case 'red':
                return 'border-red-600'
            case 'yellow':
                return 'border-yellow-600'
            case 'gray':
                return 'border-gray-600'
            case 'white':
                return 'border-white'
            default:
                return 'border-blue-600'
        }
    }

    const getTextSizeClasses = () => {
        switch (size) {
            case 'xs':
                return 'text-xs'
            case 'sm':
                return 'text-sm'
            case 'md':
                return 'text-base'
            case 'lg':
                return 'text-lg'
            case 'xl':
                return 'text-xl'
            default:
                return 'text-base'
        }
    }

    const spinner = (
        <div className={`animate-spin rounded-full border-2 border-transparent border-t-current ${getSizeClasses()} ${getColorClasses()}`}></div>
    )

    const content = (
        <div className={`flex items-center justify-center ${text ? 'space-x-2' : ''} ${className}`}>
            {spinner}
            {text && (
                <span className={`text-gray-600 ${getTextSizeClasses()}`}>
                    {text}
                </span>
            )}
        </div>
    )

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                <div className="text-center">
                    {content}
                </div>
            </div>
        )
    }

    return content
}

export default LoadingSpinner