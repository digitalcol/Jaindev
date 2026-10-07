import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "tap inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "h-10 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/92",
        outline: "h-10 rounded-full border border-border bg-transparent px-4 text-primary hover:bg-secondary",
        ghost: "h-10 rounded-full px-3 text-primary hover:bg-secondary",
      },
      size: {
        default: "h-10 px-6",
        sm: "h-10 px-4",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
