import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn("min-h-24 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";
