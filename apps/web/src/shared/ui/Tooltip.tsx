import * as RadixTooltip from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";
import { cn } from "./utils/cn";

export type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delayMs?: number;
  shortcut?: string;
};

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <RadixTooltip.Provider delayDuration={300}>{children}</RadixTooltip.Provider>;
}

export function Tooltip({ content, children, side = "top", delayMs, shortcut }: TooltipProps) {
  return (
    <RadixTooltip.Root delayDuration={delayMs}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className={cn(
            "z-50 rounded-md border border-border bg-tooltip px-2 py-1 text-xs text-tooltip-foreground shadow-elevation-2",
            "animate-fade-out data-[state=delayed-open]:animate-none",
          )}
        >
          <span>{content}</span>
          {shortcut ? (
            <kbd className="ml-2 rounded border border-border px-1 text-[10px] font-mono">
              {shortcut}
            </kbd>
          ) : null}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
