import type { ReactNode } from "react";

export type PillTone = "neutral" | "green" | "amber" | "red";

interface Props {
  tone?: PillTone;
  children: ReactNode;
}

const tones: Record<PillTone, string> = {
  neutral: "bg-surface text-muted",
  green: "bg-success-soft text-success",
  amber: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-danger",
};

function Pill({ tone = "neutral", children }: Props) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-control px-2 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default Pill;
