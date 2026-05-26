import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./utils/cn";

export type ToolbarProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  density?: "compact" | "comfortable";
  orientation?: "horizontal" | "vertical";
};

export function Toolbar({
  children,
  density = "compact",
  orientation = "horizontal",
  className,
  ...rest
}: ToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-orientation={orientation}
      className={cn(
        "flex items-center border-border bg-surface/70 backdrop-blur",
        orientation === "horizontal"
          ? "flex-row gap-1 border-b px-2"
          : "flex-col gap-1 border-r py-2",
        density === "compact" ? "h-11" : "h-14",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function ToolbarSeparator({ orientation = "vertical" }: { orientation?: "horizontal" | "vertical" }) {
  return (
    <span
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "vertical" ? "mx-1 h-6 w-px" : "my-1 h-px w-6",
      )}
    />
  );
}

export function ToolbarSpacer() {
  return <span className="flex-1" aria-hidden />;
}

export function ToolbarLabel({ children }: { children: ReactNode }) {
  return (
    <span className="px-2 text-xs font-medium uppercase tracking-wider text-muted">{children}</span>
  );
}
