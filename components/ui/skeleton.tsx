import { cn } from "@/lib/utils/cn"
import { motion } from "framer-motion"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-[var(--yoga-cream)]",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        "before:translate-x-[-200%] before:animate-[shimmer_2s_infinite]",
        className
      )}
      {...props}
    />
  )
}

// Pre-built skeleton components for common use cases
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 p-6", className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  )
}

function SkeletonSchedule({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4", className)}>
      {[...Array(3)].map((_, i) => (
        <motion.div 
          key={i} 
          className="rounded-2xl border border-[var(--yoga-cream)] p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-12 w-full" />
        </motion.div>
      ))}
    </div>
  )
}

function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-11 w-32 rounded-full", className)} />
}

function SkeletonText({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

function SkeletonAvatar({ className }: { className?: string }) {
  return <Skeleton className={cn("h-12 w-12 rounded-full", className)} />
}

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonSchedule, 
  SkeletonButton, 
  SkeletonText,
  SkeletonAvatar 
}