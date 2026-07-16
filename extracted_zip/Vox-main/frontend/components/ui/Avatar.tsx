import { cn } from "@/utils/cn"
import { getInitials } from "@/utils/format"

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const initials = getInitials(name);
  
  return (
    <div 
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border border-[var(--border)]",
        "bg-[var(--accent-light)] text-[var(--accent)] font-semibold items-center justify-center",
        {
          "h-8 w-8 text-xs": size === "sm",
          "h-10 w-10 text-sm": size === "md",
          "h-16 w-16 text-xl": size === "lg",
        },
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
