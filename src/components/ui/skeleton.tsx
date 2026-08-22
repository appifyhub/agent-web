import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "w-full animate-pulse rounded-2xl bg-foreground/15 sm:w-xs",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
