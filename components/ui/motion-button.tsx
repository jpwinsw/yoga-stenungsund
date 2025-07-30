'use client'

import * as React from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { Button, ButtonProps } from "./button"

export interface MotionButtonProps extends ButtonProps {
  motionProps?: React.ComponentProps<typeof motion.div>
  enableMagneticEffect?: boolean
  enableRipple?: boolean
}

const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ motionProps, enableMagneticEffect = true, enableRipple = true, children, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([])
    
    // Magnetic effect
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const springConfig = { damping: 20, stiffness: 300 }
    const xSpring = useSpring(x, springConfig)
    const ySpring = useSpring(y, springConfig)
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enableMagneticEffect) return
      
      const rect = e.currentTarget.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distanceX = e.clientX - centerX
      const distanceY = e.clientY - centerY
      
      x.set(distanceX * 0.1)
      y.set(distanceY * 0.1)
    }
    
    const handleMouseLeave = () => {
      x.set(0)
      y.set(0)
      setIsHovered(false)
    }
    
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enableRipple) return
      
      const rect = e.currentTarget.getBoundingClientRect()
      const rippleX = e.clientX - rect.left
      const rippleY = e.clientY - rect.top
      
      const newRipple = {
        x: rippleX,
        y: rippleY,
        id: Date.now()
      }
      
      setRipples(prev => [...prev, newRipple])
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 600)
    }
    
    return (
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          x: xSpring,
          y: ySpring,
          position: 'relative',
          display: 'inline-block'
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...motionProps}
      >
        <Button ref={ref} {...props}>
          {children}
          {/* Ripple effects */}
          {ripples.map(ripple => (
            <motion.span
              key={ripple.id}
              className="absolute inset-0 overflow-hidden rounded-full pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
            >
              <motion.span
                className="absolute bg-white/30 rounded-full"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: 10,
                  height: 10,
                  x: '-50%',
                  y: '-50%'
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 20, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </motion.span>
          ))}
          {/* Hover glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(0, 180, 216, 0.2) 0%, transparent 70%)',
              opacity: isHovered ? 1 : 0
            }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </Button>
      </motion.div>
    )
  }
)
MotionButton.displayName = "MotionButton"

export { MotionButton }