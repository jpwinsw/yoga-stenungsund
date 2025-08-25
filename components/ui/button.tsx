import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-200 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yoga-cyan)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform-gpu hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[var(--yoga-cyan)] text-white hover:bg-[var(--yoga-blue)] hover:shadow-lg active:bg-[var(--yoga-blue)]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg active:bg-red-800",
        outline:
          "border-2 border-[var(--yoga-cyan)] bg-transparent text-[var(--yoga-cyan)] hover:bg-[var(--yoga-cyan)] hover:text-white hover:shadow-md active:bg-[var(--yoga-blue)]",
        secondary:
          "bg-[var(--yoga-cream)] text-[var(--yoga-purple)] hover:bg-[var(--yoga-sand)] hover:shadow-md active:bg-[var(--yoga-sand)]",
        ghost: "hover:bg-[var(--yoga-cream)] hover:text-[var(--yoga-purple)] active:bg-[var(--yoga-sand)]",
        link: "text-[var(--yoga-cyan)] underline-offset-4 hover:underline active:text-[var(--yoga-blue)]",
        gradient: "gradient-yoga text-white hover:shadow-lg active:opacity-90",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }