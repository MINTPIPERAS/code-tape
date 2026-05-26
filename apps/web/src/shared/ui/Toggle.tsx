import * as RadixToggle from "@radix-ui/react-toggle";
import { forwardRef, type ReactNode } from "react";
import { cn } from "./utils/cn";

export type ToggleProps = {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  label: string;
  icon: ReactNode;
  iconPressed?: ReactNode;
  disabled?: boolean;
  tone?: "default" | "record" | "warning";
};

const toneClasses: Record<NonNullable<ToggleProps["tone"]>, { idle: string; pressed: string }> = {
  default: {
    idle: "text-foreground/80 hover:bg-surface",
    pressed: "bg-surface-raised text-foreground",
  },
  record: {
    idle: "text-foreground/80 hover:bg-surface",
    pressed: "bg-record text-primary-foreground animate-record-pulse",
  },
  warning: {
    idle: "text-foreground/80 hover:bg-surface",
    pressed: "bg-pause text-primary-foreground",
  },
};

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { pressed, onPressedChange, label, icon, iconPressed, disabled, tone = "default" },
  ref,
) {
  return (
    <RadixToggle.Root
      ref={ref}
      pressed={pressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent",
        "transition-[background-color,color] duration-150 ease-out-soft",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        pressed ? toneClasses[tone].pressed : toneClasses[tone].idle,
      )}
    >
      {pressed && iconPressed ? iconPressed : icon}
    </RadixToggle.Root>
  );
});
