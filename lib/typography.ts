import { cn } from '@/lib/utils/cn'

export const typography = {
  // Display - for hero sections and major impact
  display: {
    xl: cn('text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9]'),
    lg: cn('text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.95]'),
    md: cn('text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight'),
    sm: cn('text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight'),
  },
  
  // Headings - for section titles
  heading: {
    h1: cn('text-3xl md:text-4xl font-bold tracking-tight leading-tight'),
    h2: cn('text-2xl md:text-3xl font-semibold leading-tight'),
    h3: cn('text-xl md:text-2xl font-semibold leading-snug'),
    h4: cn('text-lg md:text-xl font-medium leading-snug'),
    h5: cn('text-base md:text-lg font-medium'),
    h6: cn('text-sm md:text-base font-medium'),
  },
  
  // Body text
  body: {
    xl: cn('text-xl leading-relaxed'),
    lg: cn('text-lg leading-relaxed'),
    base: cn('text-base leading-relaxed'),
    sm: cn('text-sm leading-relaxed'),
    xs: cn('text-xs leading-relaxed'),
  },
  
  // Special text styles
  lead: cn('text-lg md:text-xl text-gray-600 leading-relaxed'),
  quote: cn('text-xl md:text-2xl font-light italic text-[var(--yoga-purple)] leading-relaxed'),
  caption: cn('text-sm text-gray-500'),
  overline: cn('text-xs uppercase tracking-wider font-medium text-gray-500'),
  
  // Link styles
  link: {
    default: cn('text-[var(--yoga-cyan)] hover:text-[var(--yoga-blue)] underline-offset-4 hover:underline transition-colors'),
    subtle: cn('text-gray-600 hover:text-gray-900 transition-colors'),
    nav: cn('text-gray-700 hover:text-[var(--yoga-cyan)] transition-colors'),
  },
  
  // Weights
  weight: {
    thin: cn('font-thin'),
    light: cn('font-light'),
    normal: cn('font-normal'),
    medium: cn('font-medium'),
    semibold: cn('font-semibold'),
    bold: cn('font-bold'),
    black: cn('font-black'),
  },
  
  // Text colors aligned with brand
  color: {
    primary: cn('text-gray-900'),
    secondary: cn('text-gray-700'),
    muted: cn('text-gray-600'),
    subtle: cn('text-gray-500'),
    accent: cn('text-[var(--yoga-cyan)]'),
    gradient: cn('gradient-yoga-text'),
  },
}

// Utility function to combine typography styles
export function text(...classes: (string | undefined)[]) {
  return cn(...classes.filter(Boolean))
}