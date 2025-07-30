import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--yoga-cyan)] text-white hover:bg-[var(--yoga-blue)]",
        secondary:
          "bg-[var(--yoga-cream)] text-[var(--yoga-purple)] hover:bg-[var(--yoga-sand)]",
        destructive:
          "bg-red-100 text-red-900 hover:bg-red-200",
        outline: 
          "border-2 border-[var(--yoga-cyan)] text-[var(--yoga-cyan)]",
        success:
          "bg-green-100 text-green-900 hover:bg-green-200",
        warning:
          "bg-amber-100 text-amber-900 hover:bg-amber-200",
        purple:
          "bg-[var(--yoga-purple)] text-white hover:bg-[var(--yoga-light-purple)]",
        gradient:
          "gradient-yoga text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }