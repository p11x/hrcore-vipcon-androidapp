import { Skeleton } from './Skeleton'

export function CardSkeleton() {
  return (
    <div className="bg-surface border border-border-soft rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-3 h-3 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}