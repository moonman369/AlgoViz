"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export function TooltipContent({ children, ...props }: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) {
  return <TooltipPrimitive.Portal><TooltipPrimitive.Content sideOffset={6} className="z-50 rounded bg-zinc-900 px-2 py-1 text-xs text-white shadow" {...props}>{children}</TooltipPrimitive.Content></TooltipPrimitive.Portal>;
}
