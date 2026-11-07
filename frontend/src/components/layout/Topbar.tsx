import { useLocation } from "react-router-dom";

import { useCurrentUser } from "../../hooks/useCurrentUser";
import { formatLongDate } from "../../lib/format";
import Avatar from "../ui/Avatar";
import GlobalSearch from "./GlobalSearch";
import { findNavItem } from "./navigation";
import NotificationButton from "./NotificationButton";

function Topbar() {
  const { pathname } = useLocation();
  const { data: user } = useCurrentUser();
  const title = findNavItem(pathname)?.label ?? "";

  return (
    <header className="sticky top-0 z-10 flex h-[62px] items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur-md min-[721px]:h-[58px] min-[721px]:px-6">
      <div>
        <p className="mb-0.5 hidden text-[10px] text-muted min-[721px]:block">{formatLongDate(new Date())}</p>
        <strong className="text-base">{title}</strong>
      </div>
      <div className="flex items-center gap-3">
        <GlobalSearch />
        {/* TODO: ligar ao endpoint de notificações quando existir */}
        <NotificationButton hasUnread />
        {user && <Avatar name={user.name} className="hidden min-[721px]:grid" />}
      </div>
    </header>
  );
}

export default Topbar;
