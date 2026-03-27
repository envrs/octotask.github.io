/**
 * v0 Design System Components
 *
 * This directory contains React components that implement v0's design language.
 * They work seamlessly with the existing Bolt UnoCSS styling system.
 *
 * All components follow these principles:
 * - Clean, minimal aesthetic
 * - Accessible (WCAG 2.1 AA)
 * - Type-safe with TypeScript
 * - Support for dark mode
 * - Customizable through className prop
 */

// Export Button component and variants
export { V0Button, type V0ButtonProps, v0ButtonVariants } from './Button';

// Export Card and subcomponents
export { Card, CardHeader, CardBody, CardFooter, CardTitle, CardDescription } from './Card';

// Export Input components
export { Input, TextArea, type InputProps, type TextAreaProps } from './Input';

// Export design tokens and utilities
export {
  v0Colors,
  v0Spacing,
  v0Typography,
  v0ComponentVariants,
  v0Transitions,
  v0Shadows,
  v0BorderRadius,
  v0Classes,
  v0Responsive,
  v0MergeClasses,
} from '../../lib/v0-design-system';
