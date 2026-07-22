import type { HTMLAttributes } from 'react'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-bg-app rounded animate-pulse ${className || ''}`}
      {...props}
    />
  )
}