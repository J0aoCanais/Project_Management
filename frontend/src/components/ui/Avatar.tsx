interface Props {
  name: string;
  size?: "sm" | "md";
  className?: string;
}

/** Iniciais do primeiro e do último nome: "Rodrigo Mendes" → "RM". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function Avatar({ name, size = "md", className = "" }: Props) {
  const dims = size === "sm" ? "size-5 text-[7px]" : "size-[34px] text-[11px]";
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-avatar font-bold text-brand-dark ${dims} ${className}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export default Avatar;
