import * as React from 'react';
import { classNames } from '~/utils/classNames';

/**
 * v0 Input Component
 *
 * A clean text input following v0 design principles.
 * Features subtle focus states and good accessibility.
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, fullWidth = false, ...props }, ref) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            {label}
          </label>
        )}

        <input
          type={type}
          className={classNames(
            // Base styles
            'relative w-full appearance-none rounded-md border bg-white px-3 py-2 text-sm',
            'transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
            'placeholder:text-gray-400 dark:placeholder:text-gray-600',

            // Border and background
            'border-gray-300 dark:bg-gray-950 dark:border-gray-700',
            'text-gray-900 dark:text-white',

            // Focus state - subtle ring with accent color
            'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2',
            'dark:focus:ring-accent-400 dark:focus:ring-offset-gray-950',

            // Hover state
            'hover:border-gray-400 dark:hover:border-gray-600',

            // Disabled state
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900',

            // Error state
            error && 'border-red-500 dark:border-red-400 focus:ring-red-500',

            // Custom className
            className,
          )}
          ref={ref}
          id={inputId}
          {...props}
        />

        {error && (
          <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            {error}
          </p>
        )}

        {helperText && !error && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'V0Input';

/**
 * TextArea Component
 * Multi-line input following v0 design
 */

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, helperText, fullWidth = false, ...props }, ref) => {
    const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            {label}
          </label>
        )}

        <textarea
          className={classNames(
            // Base styles
            'relative w-full appearance-none rounded-md border bg-white px-3 py-2 text-sm',
            'transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
            'placeholder:text-gray-400 dark:placeholder:text-gray-600',

            // Border and background
            'border-gray-300 dark:bg-gray-950 dark:border-gray-700',
            'text-gray-900 dark:text-white',

            // Focus state
            'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2',
            'dark:focus:ring-accent-400 dark:focus:ring-offset-gray-950',

            // Hover state
            'hover:border-gray-400 dark:hover:border-gray-600',

            // Disabled state
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900',

            // Error state
            error && 'border-red-500 dark:border-red-400 focus:ring-red-500',

            // Resize behavior
            'resize-vertical min-h-24',

            // Custom className
            className,
          )}
          ref={ref}
          id={textareaId}
          {...props}
        />

        {error && (
          <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            {error}
          </p>
        )}

        {helperText && !error && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>}
      </div>
    );
  },
);

TextArea.displayName = 'V0TextArea';

export { Input, TextArea };
