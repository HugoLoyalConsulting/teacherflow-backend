import { FC, ReactNode } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  loading?: boolean
  children: ReactNode
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  children,
  disabled,
  className,
  ...props
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-50 border border-gray-300 dark:border-slate-500',
    danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white',
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        'font-medium rounded-xl flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {icon && !loading && <span>{icon}</span>}
      {children}
    </button>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  rightElement?: ReactNode
}

export const Input: FC<InputProps> = ({ label, error, helperText, className, rightElement, ...props }) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">{label}</label>}
      <div className="relative">
        <input
          {...props}
          className={clsx(
            'w-full px-3 sm:px-4 py-2 border border-gray-400 dark:border-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-50 text-sm sm:text-base shadow-sm',
            rightElement && 'pr-10',
            error && 'border-red-500 dark:border-red-500',
            className
          )}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</span>}
      {helperText && <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{helperText}</span>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
  emptyMessage?: string
}

export const Select: FC<SelectProps> = ({ label, error, options, emptyMessage, className, disabled, ...props }) => {
  const hasOptions = options && options.length > 0
  const isDisabled = disabled || !hasOptions
  
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">{label}</label>}
      <select
        {...props}
        disabled={isDisabled}
        className={clsx(
          'px-3 sm:px-4 py-2 border border-gray-400 dark:border-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-50 text-sm sm:text-base disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm',
          error && 'border-red-500 dark:border-red-500',
          className
        )}
      >
        <option value="">{hasOptions ? 'Selecione uma opção' : (emptyMessage || 'Nenhuma opção disponível')}</option>
        {hasOptions && options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</span>}
      {!hasOptions && !error && <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{emptyMessage || 'Nenhuma opção disponível'}</span>}
    </div>
  )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const TextArea: FC<TextAreaProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">{label}</label>}
      <textarea
        {...props}
        className={clsx(
          'px-3 sm:px-4 py-2 border border-gray-400 dark:border-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-50 text-sm sm:text-base shadow-sm',
          error && 'border-red-500 dark:border-red-500',
          className
        )}
      />
      {error && <span className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</span>}
    </div>
  )
}

interface ModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export const Modal: FC<ModalProps> = ({ isOpen, title, onClose, children, footer }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50">{title}</h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
        {footer && <div className="border-t border-gray-200 dark:border-slate-700 p-4 sm:p-6 flex gap-2 justify-end">{footer}</div>}
      </div>
    </div>
  )
}
