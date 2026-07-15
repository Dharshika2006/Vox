"use client";

import * as React from "react";
import { cn } from "@/utils/cn";
import { motion, HTMLMotionProps } from "framer-motion";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  trailingIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", trailingIcon, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={cn(
          "group relative inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-on-surface text-surface hover:bg-on-surface-variant shadow-sm": variant === "default",
            "border border-outline-variant bg-transparent hover:border-on-surface-variant text-on-surface shadow-sm": variant === "outline",
            "hover:bg-surface-variant hover:text-on-surface text-on-surface-variant": variant === "ghost",
            "text-primary underline-offset-4 hover:underline": variant === "link",
            "h-12 px-6 py-3": size === "default",
            "h-10 px-4": size === "sm",
            "h-14 px-8 text-base": size === "lg",
            "h-12 w-12": size === "icon",
          },
          className
        )}
        {...props}
      >
        {children}
        {trailingIcon && (
          <div className={cn(
            "ml-3 -mr-1 flex h-8 w-8 items-center justify-center rounded-full transition-transform",
            variant === "default" ? "bg-surface/10 text-surface" : "bg-on-surface/5 text-on-surface",
            "group-hover:translate-x-0.5 group-hover:-translate-y-[0.5px] group-hover:scale-105"
          )}>
            {trailingIcon}
          </div>
        )}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button };
