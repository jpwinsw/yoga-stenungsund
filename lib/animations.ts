import { Variants } from 'framer-motion'

// Animation durations
export const duration = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8
}

// Easing functions
export const easing = {
  easeOut: [0.4, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 25
  }
}

// Fade animations
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.easeOut
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: duration.fast
    }
  }
}

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.easeOut
    }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: {
      duration: duration.fast
    }
  }
}

// Scale animations
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: duration.normal,
      ease: easing.easeOut
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: {
      duration: duration.fast
    }
  }
}

// Scale with spring animation
export const scaleSpring: Variants = {
  initial: { scale: 0 },
  animate: { 
    scale: 1,
    transition: easing.spring
  },
  exit: { 
    scale: 0,
    transition: {
      duration: duration.fast
    }
  }
}

// Slide animations
export const slideInFromLeft: Variants = {
  initial: { x: -100, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: duration.normal,
      ease: easing.easeOut
    }
  },
  exit: { 
    x: -100, 
    opacity: 0,
    transition: {
      duration: duration.fast
    }
  }
}

export const slideInFromRight: Variants = {
  initial: { x: 100, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: duration.normal,
      ease: easing.easeOut
    }
  },
  exit: { 
    x: 100, 
    opacity: 0,
    transition: {
      duration: duration.fast
    }
  }
}

// Stagger children animations
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.easeOut
    }
  }
}

// Button hover animations
export const buttonHover = {
  scale: 1.02
}

export const buttonTap = {
  scale: 0.98
}

// Card hover animations
export const cardHover = {
  y: -8,
  transition: {
    duration: duration.normal,
    ease: easing.easeOut
  }
}

// Shimmer effect for loading states
export const shimmer = {
  initial: { backgroundPosition: '200% 0' },
  animate: {
    backgroundPosition: '-200% 0',
    transition: {
      duration: 1.5,
      ease: 'linear',
      repeat: Infinity
    }
  }
}

// Page transition variants
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slow,
      ease: easing.easeOut
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: duration.normal,
      ease: easing.easeIn
    }
  }
}

// Modal animations
export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: duration.normal
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: duration.normal
    }
  }
}

export const modalContent: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.easeOut
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
    transition: {
      duration: duration.fast,
      ease: easing.easeIn
    }
  }
}

// Floating animation for decorative elements
export const float = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
}

// Pulse animation for CTAs
export const pulse = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
}