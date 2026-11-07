export type ButtonVariant = "primary" | "secondary" | "danger" | "text" | "icon";

const base = "inline-flex shrink-0 items-center justify-center whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-45";
const boxed = "h-[38px] gap-2 rounded-control px-3.5 text-xs font-semibold";

const variants: Record<ButtonVariant, string> = {
  primary: `${boxed} bg-brand text-white not-disabled:hover:bg-brand-dark`,
  secondary: `${boxed} border border-line bg-white text-ink not-disabled:hover:bg-surface`,
  danger: `${boxed} border border-danger/40 bg-white text-danger not-disabled:hover:bg-danger-soft`,
  text: "gap-1 text-xs font-semibold text-brand hover:text-brand-dark",
  icon: "size-[34px] rounded-control text-muted hover:bg-surface hover:text-ink",
};

/** Classes partilhadas por `Button` e `ButtonLink`, para terem o mesmo aspeto. */
export function buttonClasses(variant: ButtonVariant): string {
  return `${base} ${variants[variant]}`;
}
