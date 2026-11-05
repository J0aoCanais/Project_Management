interface Props {
  events: { id: string | number; date: string; text: string }[];
}

function Timeline({ events }: Props) {
  return (
    <ol className="m-0 grid list-none gap-4 p-3.5">
      {events.map((event, index) => (
        <li key={event.id} className="relative flex gap-2.5">
          {index < events.length - 1 && <span className="absolute top-2.5 bottom-[-16px] left-[3px] w-px bg-line" />}
          <i className="relative mt-1 size-[7px] shrink-0 rounded-full bg-brand" />
          <span>
            <small className="block text-[11px] text-muted">{event.date}</small>
            <strong className="mt-0.5 block text-xs">{event.text}</strong>
          </span>
        </li>
      ))}
    </ol>
  );
}

export default Timeline;
