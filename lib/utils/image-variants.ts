/**
 * Image variant utilities for Next.js Image optimization
 * Helps select the best variant based on context and device
 */

export type ImageVariantType = 
  | 'instructor-card'
  | 'instructor-card-2x'
  | 'instructor-card-mobile'
  | 'instructor-detail'
  | 'instructor-detail-2x'
  | 'instructor-avatar'
  | 'instructor-header'
  | 'product-thumbnail'
  | 'product-thumbnail-2x'
  | 'product-listing'
  | 'product-listing-2x'
  | 'product-detail'
  | 'product-zoom'
  | 'hero-banner'
  | 'hero-banner-mobile'
  | 'hero-banner-tablet'
  | 'feature-card'
  | 'feature-card-2x'
  | 'social-share'
  | 'logo-small'
  | 'logo-medium'
  | 'logo-large'
  | 'logo-email'

export interface ImageWithVariants {
  photo_url?: string
  photo_variants?: Record<string, string>
  image_url?: string // Fallback
}

/**
 * Get the optimal image URL for a specific context
 * @param image - Object containing photo_url and photo_variants
 * @param preferredVariant - The preferred variant type
 * @param fallbackVariants - Array of fallback variant types in order of preference
 * @returns The best available image URL
 */
export function getOptimalImageUrl(
  image: ImageWithVariants | undefined,
  preferredVariant: ImageVariantType,
  fallbackVariants: ImageVariantType[] = []
): string | undefined {
  if (!image) return undefined
  
  // Check for preferred variant
  if (image.photo_variants?.[preferredVariant]) {
    return image.photo_variants[preferredVariant]
  }
  
  // Check fallback variants in order
  for (const variant of fallbackVariants) {
    if (image.photo_variants?.[variant]) {
      return image.photo_variants[variant]
    }
  }
  
  // Fallback to original photo_url or image_url
  return image.photo_url || image.image_url
}

/**
 * Get responsive image sources for Next.js Image srcSet
 * @param image - Object containing photo_url and photo_variants
 * @param baseVariant - Base variant name (without size suffix)
 * @returns Object with URLs for different sizes
 */
export function getResponsiveImageSources(
  image: ImageWithVariants | undefined,
  baseVariant: string
): {
  default?: string
  mobile?: string
  tablet?: string
  desktop?: string
  retina?: string
} {
  if (!image) return {}
  
  return {
    default: image.photo_variants?.[baseVariant] || image.photo_url,
    mobile: image.photo_variants?.[`${baseVariant}-mobile`],
    tablet: image.photo_variants?.[`${baseVariant}-tablet`],
    desktop: image.photo_variants?.[baseVariant],
    retina: image.photo_variants?.[`${baseVariant}-2x`]
  }
}

/**
 * Get the appropriate sizes attribute for Next.js Image component
 * @param context - The display context (card, detail, hero, etc.)
 * @returns Sizes string for responsive loading
 */
export function getImageSizes(context: 'card' | 'detail' | 'hero' | 'avatar' | 'logo'): string {
  switch (context) {
    case 'card':
      // For grid layouts: full width on mobile, half on tablet, third on desktop
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    
    case 'detail':
      // For modal/detail views: full width on mobile, constrained on desktop
      return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 672px'
    
    case 'hero':
      // For hero banners: always full viewport width
      return '100vw'
    
    case 'avatar':
      // For small avatars: fixed size
      return '200px'
    
    case 'logo':
      // For logos: responsive but capped
      return '(max-width: 480px) 100px, (max-width: 768px) 200px, 400px'
    
    default:
      return '100vw'
  }
}

/**
 * Check if CloudFront CDN URL (for automatic Next.js optimization)
 * @param url - Image URL to check
 * @returns Boolean indicating if URL is from CloudFront
 */
export function isCloudFrontUrl(url: string | undefined): boolean {
  if (!url) return false
  return url.includes('d3nx09olfb6r4i.cloudfront.net')
}

/**
 * Get blur data URL for placeholder (if needed)
 * This would typically come from the backend during build time
 * @param url - Image URL
 * @returns Placeholder blur data URL or undefined
 */
export function getBlurDataUrl(): string | undefined {
  // This is a placeholder implementation
  // In production, you'd generate actual blur data URLs during build
  return undefined
}