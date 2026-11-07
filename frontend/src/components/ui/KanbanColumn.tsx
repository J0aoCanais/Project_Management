import { useState, type DragEvent, type ReactNode } from "react";

interface Props {
  title: string;
  count: number;
  /** Cor do ponto (classe Tailwind), como "bg-brand". */
  dotClassName?: string;
  onDropItem: (itemId: string) => void;
  children: ReactNode;
}

function KanbanColumn({ title, count, dotClassName = "bg-muted", onDropItem, children }: Props) {
  const [over, setOver] = useState(false);
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id) onDropItem(id);
  };
  return (
    <section
      aria-label={title}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      className={`w-[calc(100vw-20px)] shrink-0 snap-start rounded-control p-1.5 min-[721px]:w-[230px] ${over ? "bg-brand-soft" : "bg-line/60"}`}
    >
      <header className="sticky top-0 flex items-center justify-between px-[3px] pt-[3px] pb-2.5 text-[11px] font-semibold tracking-[.3px] uppercase">
        <span className="flex items-center gap-[5px]">
          <i className={`size-1.5 rounded-full ${dotClassName}`} />
          {title}
        </span>
        <b className="grid size-5 place-items-center rounded-full bg-white text-[11px] tabular-nums">{count}</b>
      </header>
      <div className="grid min-h-[420px] content-start gap-1.5">{children}</div>
    </section>
  );
}

export default KanbanColumn;
