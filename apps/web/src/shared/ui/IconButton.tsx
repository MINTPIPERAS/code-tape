import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "./utils/cn";

export type IconButtonVariant = "ghost" | "subtle" | "solid" | "danger";
export type IconButtonSize = "sm" | "md" | "lg";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  isActive?: boolean;
  badge?: ReactNode;
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "h-8 w-8 text-[14px]",
  md: "h-9 w-9 text-[16px]",
  lg: "h-11 w-11 text-[18px]",
};

const variantClasses: Record<IconButtonVariant, { base: string; active: string }> = {
  ghost: {
    base: "text-foreground/80 hover:bg-surface hover:text-foreground",
    active: "bg-surface text-foreground",
  },
  subtle: {
    base: "bg-surface text-foreground/90 hover:bg-surface-raised",
    active: "bg-surface-raised text-foreground",
  },
  solid: {
    base: "bg-primary text-primary-foreground hover:opacity-90",
    active: "bg-primary text-primary-foreground",
  },
  danger: {
    base: "bg-record text-primary-foreground hover:opacity-90",
    active: "bg-record text-primary-foreground",
  },
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant = "ghost", size = "md", isActive = false, badge, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      data-active={isActive ? "" : undefined}
      className={cn(
        "relative inline-flex select-none items-center justify-center rounded-md border border-transparent",
        "transition-[background-color,color,box-shadow] duration-150 ease-out-soft",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        sizeClasses[size],
        isActive ? variantClasses[variant].active : variantClasses[variant].base,
        className,
      )}
      {...rest}
    >
      <span aria-hidden className="inline-flex">
        {icon}
      </span>
      {badge ? (
        <span className="absolute -right-1 -top-1 min-w-[1rem] rounded-full bg-record px-1 text-[10px] font-medium leading-4 text-primary-foreground">
          {badge}
        </span>
      ) : null}
    </button>
  );
});
