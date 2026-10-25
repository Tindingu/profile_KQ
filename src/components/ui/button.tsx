import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
const variants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        default: "bg-emerald-950 text-white hover:bg-emerald-800",
        outline: "border border-stone-300 bg-transparent hover:bg-stone-100",
        destructive: "bg-red-700 text-white hover:bg-red-800",
      },
      size: { default: "h-10 px-4 py-2", sm: "h-8 px-3 text-xs" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof variants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={twMerge(clsx(variants({ variant, size }), className))}
      {...props}
    />
  );
}
