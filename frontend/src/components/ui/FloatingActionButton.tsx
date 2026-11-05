import Icon, { type IconName } from "./Icon";

interface Props {
  label: string;
  icon?: IconName;
  onClick: () => void;
}

/** Botão redondo fixo acima da barra inferior; só aparece em telemóvel. */
function FloatingActionButton({ label, icon = "plus", onClick }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="fixed right-4 bottom-[82px] z-30 grid size-[46px] place-items-center rounded-full border-2 border-white bg-brand text-white min-[721px]:hidden"
    >
      <Icon name={icon} />
    </button>
  );
}

export default FloatingActionButton;
