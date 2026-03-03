import { ReactNode, FC } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
}

export const Card: FC<CardProps> = ({ children, className, title }) => {
  return (
    <div className={clsx('bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-lg dark:shadow-2xl dark:shadow-black/40 p-4 sm:p-6', className)}>
      {title && <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-50">{title}</h3>}
      {children}
    </div>
  )
}

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  children: ReactNode
  className?: string
}

export const Badge: FC<BadgeProps> = ({ variant = 'default', children, className }) => {
  const variants = {
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    default: 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-300',
  }

  return (
    <span className={clsx('inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

interface AlertProps {
  variant?: 'success' | 'warning' | 'danger' | 'info'
  title?: string
  children: ReactNode
  className?: string
}

export const Alert: FC<AlertProps> = ({ variant = 'info', title, children, className }) => {
  const variants = {
    success: 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
    danger: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    info: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
  }

  return (
    <div className={clsx('rounded-lg p-3 sm:p-4', variants[variant], className)}>
      {title && <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{title}</h4>}
      <div className="text-xs sm:text-sm">{children}</div>
    </div>
  )
}