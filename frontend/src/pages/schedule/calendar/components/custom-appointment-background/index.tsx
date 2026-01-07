import React from 'react'

interface CustomAppointmentBackgroundProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  variant?: 'default' | 'compact'
}

export function CustomAppointmentBackground({
  children,
  className = '',
  style,
  onClick,
  variant = 'default',
}: CustomAppointmentBackgroundProps) {
  return (
    <div
      className={`
        relative
        w-full h-full
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg
        shadow-sm
        cursor-pointer
        hover:shadow-md
        hover:border-gray-300 dark:hover:border-gray-600
        transition-all duration-200
        overflow-hidden
        ${variant === 'compact' ? 'text-xs' : 'text-sm'}
        ${className}
      `}
      style={{
        boxSizing: 'border-box',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
