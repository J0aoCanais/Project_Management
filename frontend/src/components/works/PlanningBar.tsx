import type { WorkState } from "../../lib/workRules";
import { planningProgress } from "../../lib/workRules";

interface Props {
  work: {
    plannedStartDate?: string;
    plannedEndDate?: string;
    executedPercent: number;
    state?: WorkState;
  };
  today?: string;
  compact?: boolean;
}

/**
 * Barra horizontal de planeamento: compara o prazo decorrido (com marcador de "hoje")
 * com a percentagem executada da obra.
 */
function PlanningBar({ work, today, compact = false }: Props) {
  const progress = planningProgress(work, today);

  if (!progress.hasPlan) {
    return (
      <div className={compact ? "min-w-[120px] max-w-[160px] text-left min-[721px]:min-w-[180px] min-[721px]:max-w-[260px]" : "min-w-0"}>
        <div className="h-2 w-full overflow-hidden rounded-control bg-surface border border-line" aria-hidden="true" />
        <p className="mt-1 text-[11px] text-muted">{progress.summary}</p>
      </div>
    );
  }

  const isCompleted = work.state === "Concluída";
  const trackClass = progress.isOverdue ? "bg-danger-soft border border-danger/30" : "bg-line";
  const timeFillClass = progress.isOverdue ? "bg-danger/30" : "bg-muted/35";
  const execFillClass = progress.isOverdue
    ? "bg-danger"
    : isCompleted
      ? "bg-success"
      : progress.behindSchedule
        ? "bg-warning"
        : "bg-brand";

  return (
    <div
      className={compact ? "min-w-[130px] max-w-[170px] text-left min-[721px]:min-w-[200px] min-[721px]:max-w-[260px]" : "min-w-0 max-w-[440px]"}
      role="group"
      aria-label={`Planeamento: ${progress.summary}`}
    >
      <div
        className={`relative ${compact ? "h-2" : "h-2.5"} w-full overflow-hidden rounded-control ${trackClass}`}
        role="progressbar"
        aria-label="Execução face ao prazo"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.executedPercent}
      >
        {/* Prazo decorrido até hoje */}
        <div
          className={`absolute inset-y-0 left-0 ${timeFillClass}`}
          style={{ width: `${progress.timePercent}%` }}
          title={`${progress.timePercent}% do prazo decorrido`}
        />
        {/* Percentagem executada sobreposta */}
        <div
          className={`absolute inset-y-0 left-0 rounded-l-control ${execFillClass}`}
          style={{ width: `${progress.executedPercent}%` }}
          title={`${progress.executedPercent}% executado`}
        />
        {/* Marcador vertical da posição de "hoje" */}
        {progress.timePercent > 0 && progress.timePercent < 100 && (
          <span
            aria-hidden="true"
            className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-ink"
            style={{ left: `${progress.timePercent}%` }}
          />
        )}
      </div>

      <p
        className={`mt-1 text-[11px] tabular-nums ${
          progress.isOverdue ? "font-semibold text-danger" : "text-muted"
        }`}
      >
        {progress.summary}
      </p>
    </div>
  );
}

export default PlanningBar;
