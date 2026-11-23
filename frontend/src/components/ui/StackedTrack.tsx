type Tone = "dark" | "main" | "light" | "green" | "amber";

interface Segment {
  label: string;
  value: number;
  tone: Tone;
}

interface Props {
  segments: Segment[];
  /** Como mostrar o valor na legenda (ex.: formatMoney). */
  formatValue?: (value: number) => string;
  /** Modo compacto para usar dentro de tabelas ou espaços reduzidos */
  compact?: boolean;
}

const tones: Record<Tone, string> = {
  dark: "bg-sidebar",
  main: "bg-brand",
  light: "bg-sidebar-accent",
  green: "bg-success",
  amber: "bg-warning",
};

/** Barra dividida em segmentos proporcionais, com legenda ou versão compacta. */
function StackedTrack({ segments, formatValue = String, compact = false }: Props) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (compact) {
    const primary = segments[0];
    const percent = total > 0 && primary ? Math.min(100, Math.round((primary.value / total) * 100)) : 0;
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-[6px] w-16 overflow-hidden rounded-control bg-line">
          {segments.map((segment) => (
            <i
              key={segment.label}
              className={tones[segment.tone]}
              style={{ width: total ? `${(segment.value / total) * 100}%` : 0 }}
            />
          ))}
        </div>
        <span className="text-[11px] font-semibold tabular-nums text-muted">{percent}%</span>
      </div>
    );
  }

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
