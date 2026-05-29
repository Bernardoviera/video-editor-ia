import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#00c4f0]/15 text-[#00c4f0] border border-[#00c4f0]/25",
        secondary: "bg-white/8 text-white/60 border border-white/8",
        success: "bg-emerald-400/15 text-emerald-400 border border-emerald-400/25",
        destructive: "bg-red-400/15 text-red-400 border border-red-400/25",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
