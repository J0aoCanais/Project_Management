import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { daysBetween, formatIsoDate, formatMonth, isValidIsoDate, todayIso } from "../../lib/format";
import EmptyState from "../ui/EmptyState";
import Panel from "../ui/Panel";
import type { PillTone } from "../ui/Pill";
import SegmentedChoice from "../ui/SegmentedChoice";

export interface GanttRow {
  id: string | number;
  label: string;
  sublabel?: string;
  planned?: [string, string];
  real?: [string, string];
  realInProgress?: boolean;
  tone: PillTone;
  href?: string;
}

interface Props {
  rows: GanttRow[];
  today?: string;
  emptyMessage?: string;
}

type ZoomLevel = "month" | "quarter";

const toneStyles: Record<PillTone, { planned: string; real: string; dot: string }> = {
  neutral: {
    planned: "border border-line bg-surface",
    real: "bg-muted",
    dot: "bg-muted",
  },
  amber: {
    planned: "border border-warning/35 bg-warning-soft",
    real: "bg-warning",
    dot: "bg-warning",
  },
  green: {
    planned: "border border-success/35 bg-success-soft",
    real: "bg-success",
    dot: "bg-success",
  },
  red: {
    planned: "border border-danger/35 bg-danger-soft",
    real: "bg-danger",
    dot: "bg-danger",
  },
};

function isValidRange(range?: [string, string]): range is [string, string] {
  return Boolean(
    range &&
      isValidIsoDate(range[0]) &&
      isValidIsoDate(range[1]) &&
      range[1] >= range[0],
  );
}

function shortDate(iso: string): string {
  const parts = formatIsoDate(iso).split("/");
  return `${parts[0]}/${parts[1]}`;
}

function buildAccessibleText(row: GanttRow): string {
  const parts: string[] = [];
  if (isValidRange(row.planned)) {
    parts.push(`Planeado ${shortDate(row.planned[0])}–${shortDate(row.planned[1])}`);
  }
  if (isValidRange(row.real)) {
    const endLabel = row.realInProgress ? "em curso" : shortDate(row.real[1]);
    parts.push(`real ${shortDate(row.real[0])}–${endLabel}`);
  }
  return parts.length ? `${row.label}: ${parts.join(", ")}` : `${row.label}: sem datas definidas`;
}

function parseYearMonth(iso: string): { year: number; month: number } {
  const [y, m] = iso.split("-").map(Number);
  return { year: y, month: m };
}

function formatYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function lastDayOfMonth(year: number, month: number): string {
  const days = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(days).padStart(2, "0")}`;
}

interface MonthSlot {
  key: string;
  label: string;
  quarterKey: string;
  quarterLabel: string;
}

function buildMonths(minIso: string, maxIso: string, alignToQuarter: boolean): {
  axisStart: string;
  axisEnd: string;
  months: MonthSlot[];
} {
  const start = parseYearMonth(minIso);
  const end = parseYearMonth(maxIso);

  let sYear = start.year;
  let sMonth = start.month;
  let eYear = end.year;
  let eMonth = end.month;

  if (alignToQuarter) {
    sMonth = Math.floor((sMonth - 1) / 3) * 3 + 1;
    eMonth = Math.floor((eMonth - 1) / 3) * 3 + 3;
  }

  const months: MonthSlot[] = [];
  let y = sYear;
  let m = sMonth;
  while (y < eYear || (y === eYear && m <= eMonth)) {
    const ym = formatYearMonth(y, m);
    const q = Math.floor((m - 1) / 3) + 1;
    months.push({
      key: ym,
      label: formatMonth(ym),
      quarterKey: `${y}-Q${q}`,
      quarterLabel: `T${q} ${y}`,
    });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }

  return {
    axisStart: `${formatYearMonth(sYear, sMonth)}-01`,
    axisEnd: lastDayOfMonth(eYear, eMonth),
    months,
  };
}

/**
 * Diagrama de Gantt genérico em CSS Grid, sem bibliotecas externas.
 * Em ecrãs estreitos, o scroll horizontal acontece apenas dentro do gráfico.
 */
function GanttChart({
  rows,
  today = todayIso(),
  emptyMessage = "Sem datas definidas para apresentar no gráfico.",
}: Props) {
  const [zoom, setZoom] = useState<ZoomLevel>("month");

  const { datedRows, undatedRows } = useMemo(() => {
    const dated: GanttRow[] = [];
    const undated: GanttRow[] = [];
    for (const row of rows) {
      if (isValidRange(row.planned) || isValidRange(row.real)) {
        dated.push(row);
      } else {
        undated.push(row);
      }
    }
    return { datedRows: dated, undatedRows: undated };
  }, [rows]);

  const timeline = useMemo(() => {
    if (!datedRows.length) return null;

    const allDates: string[] = [today];
    for (const row of datedRows) {
      if (isValidRange(row.planned)) allDates.push(row.planned[0], row.planned[1]);
      if (isValidRange(row.real)) allDates.push(row.real[0], row.real[1]);
    }
    allDates.sort();

    const { axisStart, axisEnd, months } = buildMonths(
      allDates[0],
      allDates[allDates.length - 1],
      zoom === "quarter",
    );
    const totalDays = Math.max(1, daysBetween(axisStart, axisEnd) + 1);
    const monthWidth = zoom === "month" ? 112 : 48;
    const timelineWidth = months.length * monthWidth;

    const quarters: { key: string; label: string; count: number }[] = [];
    for (const month of months) {
      const last = quarters[quarters.length - 1];
      if (last && last.key === month.quarterKey) last.count += 1;
      else quarters.push({ key: month.quarterKey, label: month.quarterLabel, count: 1 });
    }

    const todayOffset = daysBetween(axisStart, today);
    const todayPercent =
      today >= axisStart && today <= axisEnd
        ? ((todayOffset + 0.5) / totalDays) * 100
        : null;

    const barPosition = (range: [string, string]) => {
      const leftDays = Math.max(0, daysBetween(axisStart, range[0]));
      const spanDays = Math.max(1, daysBetween(range[0], range[1]) + 1);
      return {
        left: `${(leftDays / totalDays) * 100}%`,
        width: `${Math.max(0.8, (spanDays / totalDays) * 100)}%`,
      };
    };

    return { months, quarters, monthWidth, timelineWidth, todayPercent, barPosition };
  }, [datedRows, today, zoom]);

  return (
    <div className="grid min-w-0 gap-3">
      <Panel className="min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3.5 py-2.5">
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-2.5 w-4 rounded-control border border-line bg-surface" />
              Planeado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-2.5 w-4 rounded-control bg-brand" />
              Real
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-3 w-0.5 bg-brand" />
              Hoje ({formatIsoDate(today)})
            </span>
          </div>

          <SegmentedChoice
            label="Escala temporal"
            value={zoom}
            onChange={setZoom}
            options={[
              { value: "month", label: "Mês" },
              { value: "quarter", label: "Trimestre" },
            ]}
          />
        </div>

        {datedRows.length > 0 && timeline ? (
          <div className="w-full overflow-x-auto">
            <div style={{ minWidth: `${220 + timeline.timelineWidth}px` }}>
              {/* Cabeçalho do eixo */}
              <div className="flex border-b border-line bg-surface">
                <div className="sticky left-0 z-10 flex w-[160px] shrink-0 items-center border-r border-line bg-surface px-3 py-2 text-[11px] font-semibold tracking-[.5px] text-muted uppercase min-[721px]:w-[220px]">
                  Item
                </div>
                <div className="relative flex-1" style={{ width: `${timeline.timelineWidth}px` }}>
                  {zoom === "month" ? (
                    <div
                      className="grid"
                      style={{ gridTemplateColumns: `repeat(${timeline.months.length}, minmax(0, 1fr))` }}
                    >
                      {timeline.months.map((month) => (
                        <div
                          key={month.key}
                          className="border-r border-line/70 px-2 py-2 text-center text-[11px] font-semibold text-muted last:border-r-0"
                        >
                          {month.label}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex">
                      {timeline.quarters.map((quarter) => (
                        <div
                          key={quarter.key}
                          style={{ width: `${quarter.count * timeline.monthWidth}px` }}
                          className="border-r border-line/70 px-2 py-2 text-center text-[11px] font-semibold text-muted last:border-r-0"
                        >
                          {quarter.label}
                        </div>
                      ))}
                    </div>
                  )}

                  {timeline.todayPercent !== null && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 bg-brand"
                      style={{ left: `${timeline.todayPercent}%` }}
                    />
                  )}
                </div>
              </div>

              {/* Linhas do gráfico */}
              <div className="divide-y divide-line">
                {datedRows.map((row) => {
                  const accessibleText = buildAccessibleText(row);
                  const style = toneStyles[row.tone];
                  const plannedStyle = isValidRange(row.planned) ? timeline.barPosition(row.planned) : null;
                  const realStyle = isValidRange(row.real) ? timeline.barPosition(row.real) : null;

                  const content = (
                    <>
                      <div className="sticky left-0 z-10 flex w-[160px] shrink-0 flex-col justify-center border-r border-line bg-white px-3 py-2.5 group-hover:bg-surface min-[721px]:w-[220px]">
                        <span className="flex items-center gap-1.5 truncate text-xs font-semibold text-ink">
                          <i className={`size-2 shrink-0 rounded-full ${style.dot}`} />
                          <span className="truncate">{row.label}</span>
                        </span>
                        {row.sublabel && (
                          <span className="mt-0.5 truncate pl-3.5 text-[11px] text-muted">{row.sublabel}</span>
                        )}
                      </div>

                      <div
                        className="relative flex-1 py-2.5"
                        style={{ width: `${timeline.timelineWidth}px` }}
                      >
                        {/* Grelha mensal vertical */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 grid"
                          style={{ gridTemplateColumns: `repeat(${timeline.months.length}, minmax(0, 1fr))` }}
                        >
                          {timeline.months.map((month) => (
                            <div key={month.key} className="border-r border-line/40 last:border-r-0" />
                          ))}
                        </div>

                        {/* Linha vertical de hoje */}
                        {timeline.todayPercent !== null && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-brand"
                            style={{ left: `${timeline.todayPercent}%` }}
                          />
                        )}

                        <div className="relative z-0 grid gap-1 px-0">
                          <div className="relative h-2.5">
                            {plannedStyle && (
                              <div
                                className={`absolute inset-y-0 rounded-control ${style.planned}`}
                                style={plannedStyle}
                              />
                            )}
                          </div>
                          <div className="relative h-2.5">
                            {realStyle && (
                              <div
                                className={`absolute inset-y-0 rounded-control ${style.real}`}
                                style={realStyle}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  );

                  if (row.href) {
                    return (
                      <Link
                        key={row.id}
                        to={row.href}
                        aria-label={accessibleText}
                        title={accessibleText}
                        className="group flex items-stretch hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
                      >
                        <span className="sr-only">{accessibleText}</span>
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={row.id}
                      role="group"
                      aria-label={accessibleText}
                      title={accessibleText}
                      className="group flex items-stretch"
                    >
                      <span className="sr-only">{accessibleText}</span>
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState message={emptyMessage} />
        )}
      </Panel>

      {undatedRows.length > 0 && (
        <Panel className="p-3.5">
          <h3 className="mb-2 text-xs font-bold text-ink">Sem datas definidas</h3>
          <ul className="m-0 grid list-none gap-1.5 p-0">
            {undatedRows.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-2 rounded-control border border-line bg-surface px-3 py-2 text-xs"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <i className={`size-2 shrink-0 rounded-full ${toneStyles[row.tone].dot}`} />
                  {row.href ? (
                    <Link to={row.href} className="truncate font-semibold text-brand hover:underline">
                      {row.label}
                    </Link>
                  ) : (
                    <span className="truncate font-semibold text-ink">{row.label}</span>
                  )}
                  {row.sublabel && <span className="truncate text-[11px] text-muted">· {row.sublabel}</span>}
                </div>
                <span className="shrink-0 text-[11px] text-muted">Sem datas definidas</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

export default GanttChart;
