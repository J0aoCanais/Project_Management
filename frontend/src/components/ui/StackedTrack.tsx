type Tone = "dark" | "main" | "light";

interface Segment {
  label: string;
  value: number;
  tone: Tone;
}

interface Props {
  segments: Segment[];
  /** Como mostrar o valor na legenda (ex.: formatMoney). */
  formatValue?: (value: number) => string;
}

const tones: Record<Tone, string> = {
  dark: "bg-sidebar",
  main: "bg-brand",
  light: "bg-sidebar-accent",
};

/** Barra dividida em segmentos proporcionais, com legenda. */
function StackedTrack({ segments, formatValue = String }: Props) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div className="grid min-w-0 flex-1 gap-2.5 min-[1051px]:grid-cols-[1fr_auto] min-[1051px]:items-center min-[1051px]:gap-6">
      <div className="flex h-[7px] overflow-hidden rounded-control bg-line">
        {segments.map((segment) => (
          <i key={segment.label} className={tones[segment.tone]} style={{ width: total ? `${(segment.value / total) * 100}%` : 0 }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((segment) => (
          <span key={segment.label} className="whitespace-nowrap text-[11px] text-muted">
            <b className={`mr-1.5 inline-block size-[7px] rounded-full ${tones[segment.tone]}`} />
            {segment.label}
            <strong className="ml-[13px] block tabular-nums text-ink">{formatValue(segment.value)}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

export default StackedTrack;
