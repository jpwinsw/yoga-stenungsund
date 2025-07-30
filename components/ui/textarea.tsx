import * as React from "react"

import { cn } from "@/lib/utils/cn"

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-2xl border-2 border-[var(--yoga-cyan)]/20 bg-white px-4 py-3 text-base transition-all duration-200 placeholder:text-[var(--yoga-stone)] hover:border-[var(--yoga-cyan)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--yoga-cyan)] focus:ring-offset-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }