import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { classNames } from '~/utils/classNames';

/**
 * v0-styled Button Component
 * Uses v0's clean, minimal design language
 */
const v0ButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary button - Bold action, primary brand color
        primary:
          'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 dark:bg-accent-500 dark:hover:bg-accent-600',

        // Secondary button - Supporting actions, neutral colors
        secondary:
          'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',

        // Ghost/Tertiary - Minimal style, text only feel
        ghost:
          'bg-transparent text-accent-600 hover:bg-gray-100 active:bg-gray-200 dark:text-accent-400 dark:hover:bg-gray-800',

        // Danger/Destructive - Destructive actions in red
        danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',

        // Outline - Bordered style with transparent background
        outline:
          'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-950 dark:text-white dark:hover:bg-gray-900',
      },

      size: {
        // Small button - 32px height
        sm: 'h-8 rounded-md px-3 text-xs',

        // Default button - 36px height (preferred)
        default: 'h-9 px-4 py-2',

        // Large button - 40px height
        lg: 'h-10 rounded-md px-6 text-base',

        // Icon-only button - Square
        icon: 'h-9 w-9 p-0',
      },
    },

    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface V0ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof v0ButtonVariants> {}

/**
 * Button component following v0 design patterns
 *
 * @example
 * <V0Button variant="primary">Click me</V0Button>
 * <V0Button variant="secondary" size="sm">Small</V0Button>
 * <V0Button variant="danger">Delete</V0Button>
 */
const V0Button = React.forwardRef<HTMLButtonElement, V0ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button className={classNames(v0ButtonVariants({ variant, size }), className)} ref={ref} {...props} />;
});

V0Button.displayName = 'V0Button';

export { V0Button, v0ButtonVariants };
