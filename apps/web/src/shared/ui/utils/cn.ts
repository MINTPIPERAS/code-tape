/**
 * Tiny classnames helper.
 *
 * Avoid pulling in clsx/tailwind-merge until we hit a real conflict; for now the
 * declarative Tailwind classes we apply don't overlap.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter((x): x is string => typeof x === "string" && x.length > 0).join(" ");
}
