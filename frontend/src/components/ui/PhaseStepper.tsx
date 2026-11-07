interface Props {
  steps: string[];
  /** Índice do passo atual, a contar de 0. Os anteriores e o atual ficam marcados. */
  current: number;
  /** Número do primeiro passo: 1 nas oportunidades, 9 nas operações. */
  startAt?: number;
}

function PhaseStepper({ steps, current, startAt = 1 }: Props) {
  return (
    <ol className="m-0 mb-3 flex list-none snap-x snap-mandatory overflow-auto border border-line bg-white p-0 min-[721px]:snap-none">
      {steps.map((step, index) => {
        const done = index <= current;
        return (
          <li
            key={step}
            aria-current={index === current ? "step" : undefined}
            className={`flex min-w-[120px] flex-1 snap-start items-center gap-1.5 border-r border-line px-1.5 py-2 last:border-r-0 min-[721px]:min-w-[92px] ${
              done ? "font-semibold text-brand" : "text-muted"
            }`}
          >
            <i className={`grid size-5 shrink-0 place-items-center rounded-full border text-[11px] not-italic ${done ? "border-brand bg-brand text-white" : "border-line"}`}>
              {startAt + index}
            </i>
            <span className="text-[11px] leading-tight">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default PhaseStepper;
