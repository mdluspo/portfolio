import { cn } from "@/lib/utils";
import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary";
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border-[2px] border-black px-2.5 py-0.5 text-xs font-semibold font-display",
          variant === "default" && "bg-white text-black",
          variant === "primary" && "bg-primary text-black",
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
