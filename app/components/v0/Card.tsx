import * as React from 'react';
import { classNames } from '~/utils/classNames';

/**
 * v0 Card Component
 * 
 * A clean, minimal card container for grouping related content.
 * Follows v0's design principles with subtle borders and shadows.
 */

const CardContext = React.createContext<{
  variant?: 'default' | 'elevated' | 'outline';
} | null>(null);

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline';
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-white border border-gray-200 dark:bg-gray-950 dark:border-gray-800',
      elevated: 'bg-white border border-gray-200 shadow-md dark:bg-gray-950 dark:border-gray-800 dark:shadow-lg',
      outline: 'bg-transparent border-2 border-accent-500',
    };

    const hoverClasses = hoverable
      ? 'cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700'
      : '';

    return (
      <CardContext.Provider value={{ variant }}>
        <div
          ref={ref}
          className={classNames(
            'rounded-lg p-4 transition-theme',
            variantClasses[variant],
            hoverClasses,
            className,
          )}
          {...props}
        />
      </CardContext.Provider>
    );
  },
);
Card.displayName = 'V0Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={classNames('pb-4 border-b border-gray-200 dark:border-gray-800', className)}
      {...props}
    />
  ),
);
CardHeader.displayName = 'V0CardHeader';

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={classNames('py-4', className)}
      {...props}
    />
  ),
);
CardBody.displayName = 'V0CardBody';

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={classNames('pt-4 border-t border-gray-200 dark:border-gray-800 flex gap-2 justify-end', className)}
      {...props}
    />
  ),
);
CardFooter.displayName = 'V0CardFooter';

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={classNames('text-lg font-semibold text-gray-900 dark:text-white', className)}
      {...props}
    />
  ),
);
CardTitle.displayName = 'V0CardTitle';

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={classNames('text-sm text-gray-600 dark:text-gray-400', className)}
      {...props}
    />
  ),
);
CardDescription.displayName = 'V0CardDescription';

export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
};
