/**
 * v0 Design System Integration
 * 
 * This module provides design tokens and utilities that map v0's design system
 * to the existing Bolt UnoCSS-based styling system.
 * 
 * v0 uses a clean, minimal design language with:
 * - 4-5 core colors (primary, secondary, success, danger, warning)
 * - Clear typography hierarchy
 * - Consistent spacing scale
 * - Smooth transitions and interactions
 */

// Color Tokens - Maps to UnoCSS variables
export const v0Colors = {
  // Primary brand color - Purple accent
  primary: {
    50: 'var(--accent-50)',
    100: 'var(--accent-100)',
    200: 'var(--accent-200)',
    300: 'var(--accent-300)',
    400: 'var(--accent-400)',
    500: 'var(--accent-500)',
    600: 'var(--accent-600)',
    700: 'var(--accent-700)',
    800: 'var(--accent-800)',
    900: 'var(--accent-900)',
    950: 'var(--accent-950)',
  },
  
  // Neutral/Gray - Background and text
  neutral: {
    50: 'var(--gray-50)',
    100: 'var(--gray-100)',
    200: 'var(--gray-200)',
    300: 'var(--gray-300)',
    400: 'var(--gray-400)',
    500: 'var(--gray-500)',
    600: 'var(--gray-600)',
    700: 'var(--gray-700)',
    800: 'var(--gray-800)',
    900: 'var(--gray-900)',
    950: 'var(--gray-950)',
  },

  // Semantic colors
  success: 'var(--green-500)',
  successLight: 'var(--green-100)',
  danger: 'var(--red-500)',
  dangerLight: 'var(--red-100)',
  warning: 'var(--orange-500)',
  warningLight: 'var(--orange-100)',
};

// Spacing Scale
export const v0Spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
};

// Typography Scales
export const v0Typography = {
  // Font sizes
  sizes: {
    'xs': '12px',
    'sm': '14px',
    'base': '16px',
    'lg': '18px',
    'xl': '20px',
    '2xl': '24px',
    '3xl': '30px',
  },
  // Font weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  // Line heights for readability
  lineHeights: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

// Component variant configs
export const v0ComponentVariants = {
  // Button variants that align with v0 design
  button: {
    primary: {
      bg: v0Colors.primary[600],
      text: 'white',
      hover: v0Colors.primary[700],
      focus: 'ring-2 ring-offset-2 ring-accent-500',
      disabled: 'opacity-50 cursor-not-allowed',
    },
    secondary: {
      bg: v0Colors.neutral[200],
      text: v0Colors.neutral[900],
      hover: v0Colors.neutral[300],
      focus: 'ring-2 ring-offset-2 ring-accent-500',
      disabled: 'opacity-50 cursor-not-allowed',
    },
    ghost: {
      bg: 'transparent',
      text: v0Colors.neutral[900],
      hover: v0Colors.neutral[100],
      focus: 'ring-2 ring-offset-2 ring-accent-500',
      disabled: 'opacity-50 cursor-not-allowed',
    },
    danger: {
      bg: v0Colors.danger,
      text: 'white',
      hover: 'rgb(220, 38, 38)',
      focus: 'ring-2 ring-offset-2 ring-red-500',
      disabled: 'opacity-50 cursor-not-allowed',
    },
  },

  // Card variants
  card: {
    default: {
      bg: 'bg-bolt-elements-background-depth-1',
      border: 'border border-bolt-elements-borderColor',
      padding: 'p-4',
      rounded: 'rounded-lg',
    },
    elevated: {
      bg: 'bg-bolt-elements-background-depth-2',
      border: 'border border-bolt-elements-borderColorActive',
      padding: 'p-6',
      rounded: 'rounded-lg',
      shadow: 'shadow-lg',
    },
  },

  // Input variants
  input: {
    default: {
      border: 'border border-bolt-elements-borderColor',
      focus: 'focus:ring-2 focus:ring-accent-500 focus:border-transparent',
      padding: 'px-3 py-2',
      rounded: 'rounded-md',
      bg: 'bg-bolt-elements-background',
      text: 'text-bolt-elements-textPrimary',
    },
  },
};

// Transition utilities aligned with v0 design
export const v0Transitions = {
  fast: 'transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
  normal: 'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
  slow: 'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
};

// Elevation/Shadow system
export const v0Shadows = {
  xs: 'shadow-sm',
  sm: 'shadow-md',
  md: 'shadow-lg',
  lg: 'shadow-xl',
  xl: 'shadow-2xl',
};

// Border radius scale
export const v0BorderRadius = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

/**
 * v0 Design System Helper Functions
 */

/**
 * Generate a class string combining v0 design tokens
 * @param variant The component variant name
 * @param tokens The tokens to apply
 * @returns CSS class string
 */
export function v0Classes(variant: string, tokens: Record<string, string>): string {
  return Object.values(tokens).join(' ');
}

/**
 * Create responsive class variations
 * @param mobile Mobile classes
 * @param tablet Tablet classes (md breakpoint)
 * @param desktop Desktop classes (lg breakpoint)
 * @returns Combined responsive classes
 */
export function v0Responsive(mobile: string, tablet?: string, desktop?: string): string {
  const classes = [mobile];
  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  return classes.join(' ');
}

/**
 * Merge v0 design tokens with custom classes
 * @param tokens v0 token values
 * @param customClass Additional custom classes
 * @returns Merged class string
 */
export function v0MergeClasses(tokens: string, customClass?: string): string {
  return [tokens, customClass].filter(Boolean).join(' ');
}
