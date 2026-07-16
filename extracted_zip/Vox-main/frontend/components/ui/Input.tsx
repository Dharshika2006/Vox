import * as React from "react"
import { cn } from "@/utils/cn"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative group rounded-2xl p-1 bg-[var(--bg-primary)] ring-1 ring-[var(--border)] shadow-sm transition-all focus-within:ring-[var(--text-secondary)] focus-within:ring-2">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-[calc(1rem-4px)] border-0 bg-[var(--bg-secondary)] px-4 py-2 text-sm text-[var(--text-primary)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
