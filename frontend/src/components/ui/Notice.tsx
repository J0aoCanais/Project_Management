import type { ReactNode } from "react";

interface Props {
  tone?: "info" | "warning";
  children: ReactNode;
}

const tones = {
  info: "border-brand/30 bg-brand-soft text-brand-dark",
  warning: "border-warning/40 bg-warning-soft text-warning",
};

function Notice({ tone = "info", children }: Props) {
  return <div className={`rounded-control border px-3 py-2.5 text-xs ${tones[tone]}`}>{children}</div>;
}

export default Notice;
