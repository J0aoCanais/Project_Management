import Icon from "../ui/Icon";

interface Props {
  hasUnread?: boolean;
}

function NotificationButton({ hasUnread = false }: Props) {
  return (
    <button
      type="button"
      aria-label={hasUnread ? "Notificações (há novas)" : "Notificações"}
      className="relative grid size-[34px] place-items-center rounded-control border border-line bg-white hover:bg-surface"
    >
      <Icon name="bell" />
      {hasUnread && (
        <i className="absolute top-1.5 right-[7px] size-1.5 rounded-full border border-white bg-danger" aria-hidden="true" />
      )}
    </button>
  );
}

export default NotificationButton;
