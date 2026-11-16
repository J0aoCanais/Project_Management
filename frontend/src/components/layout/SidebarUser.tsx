import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useLogout } from "../../hooks/useSession";
import Avatar from "../ui/Avatar";
import DropdownMenu from "../ui/DropdownMenu";

function SidebarUser() {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="mt-auto flex items-center gap-2.5 border-t border-sidebar-line px-1 pt-[17px]">
      {isLoading || !user ? (
        <div className="h-[34px] flex-1 animate-pulse rounded-control bg-sidebar-hover" />
      ) : (
        <>
          <Avatar name={user.name} />
          <div className="min-w-0 flex-1">
            <strong className="block truncate text-[11px] text-white">{user.name}</strong>
            <small className="mt-0.5 block text-[11px] text-[#8ca9a8]">{user.role}</small>
          </div>
          <DropdownMenu
            label="Opções da conta"
            buttonClassName="text-sidebar-text hover:bg-sidebar-hover hover:text-white"
            items={[{ label: logout.isPending ? "A terminar sessão…" : "Terminar sessão", onSelect: () => logout.mutate(), disabled: logout.isPending }]}
          />
        </>
      )}
    </div>
  );
}

export default SidebarUser;
