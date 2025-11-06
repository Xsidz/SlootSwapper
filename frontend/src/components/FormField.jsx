import React from 'react'

const FormField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    success,
    placeholder,
    required = false,
    disabled = false,
    className = '',
    inputClassName = '',
    labelClassName = '',
    helpText = '',
    children,
    ...props
}) => {
    const baseInputClasses = `
        block w-full px-3 py-2 border rounded-md shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm 
        transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed
    `

    const getInputClasses = () => {
        let classes = baseInputClasses

        if (error) {
            classes += ' border-red-300 focus:ring-red-500 focus:border-red-500'
        } else if (success) {
            classes += ' border-green-300 focus:ring-green-500 focus:border-green-500'
        } else {
            classes += ' border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        }

        return `${classes} ${inputClassName}`
    }

    const renderInput = () => {
        if (children) {
            return children
        }

        if (type === 'textarea') {
            return (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={getInputClasses()}
                    rows={4}
                    {...props}
                />
            )
        }

        if (type === 'select') {
            return (
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    required={required}
                    disabled={disabled}
                    className={getInputClasses()}
                    {...props}
                >
                    {props.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )
        }

        return (
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={getInputClasses()}
                {...props}
            />
        )
    }

    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className={`block text-sm font-medium text-gray-700 ${labelClassName}`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {renderInput()}

                {/* Success icon */}
                {success && !error && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}

                {/* Error icon */}
                {error && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Help text */}
            {helpText && !error && !success && (
                <p className="text-sm text-gray-500">{helpText}</p>
            )}

            {/* Success message */}
            {success && (
                <p className="text-sm text-green-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {success}
                </p>
            )}

            {/* Error message */}
            {error && (
                <p className="text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    )
}

export default FormField