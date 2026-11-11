import { useState } from "react";

import type { SettingsUser } from "../../api/settingsApi";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useRoles, useUsers } from "../../hooks/useSettings";
import { formatIsoDate } from "../../lib/format";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import LoadingState from "../ui/LoadingState";
import Panel from "../ui/Panel";
import PanelHeader from "../ui/PanelHeader";
import Pill from "../ui/Pill";
import Table, { type TableColumn } from "../ui/Table";
import NewUserDrawer from "./NewUserDrawer";
import UserActions from "./UserActions";
import { administratorRole } from "../../temp";

function UsersPanel() {
  const usersQuery = useUsers();
  const rolesQuery = useRoles();
  const currentUser = useCurrentUser();
  const [creating, setCreating] = useState(false);

  if (usersQuery.isPending || rolesQuery.isPending || currentUser.isPending) return <LoadingState />;
  if (usersQuery.isError) return <ErrorState onRetry={() => usersQuery.refetch()} />;
  if (rolesQuery.isError) return <ErrorState onRetry={() => rolesQuery.refetch()} />;
  if (currentUser.isError) return <ErrorState onRetry={() => currentUser.refetch()} />;
  if (!usersQuery.data?.length) return <EmptyState message="Ainda não há utilizadores." />;

  const users = usersQuery.data;
  const roles = rolesQuery.data.map((role) => role.name);
  const activeAdmins = users.filter((user) => user.active && user.accessLevel === administratorRole);
  const columns: TableColumn<SettingsUser>[] = [
    { key: "username", header: "Nome de utilizador", render: (user) => <span className={!user.active ? "text-muted" : ""}>{user.username}</span> },
    { key: "email", header: "Email", render: (user) => user.email },
    { key: "accessLevel", header: "Nível de acesso", render: (user) => <Pill tone={user.active ? "green" : "neutral"}>{user.accessLevel}{user.active ? "" : " · Inativo"}</Pill> },
    { key: "lastLogin", header: "Último acesso", render: (user) => user.lastLogin ? formatIsoDate(user.lastLogin) : "Nunca" },
    {
      key: "actions",
      header: "Ações",
      render: (user) => (
        <UserActions
          user={user}
          roles={roles}
          isCurrentUser={user.id === currentUser.data?.id}
          isLastAdministrator={user.accessLevel === administratorRole && activeAdmins.length <= 1}
        />
      ),
    },
  ];

  return (
    <>
      <Panel className="overflow-hidden">
        <PanelHeader title="Utilizadores" action={<Button variant="primary" icon="plus" onClick={() => setCreating(true)}>Novo utilizador</Button>} />
        <div className="pt-2">
          <Table columns={columns} rows={users} getRowKey={(user) => user.id} />
        </div>
      </Panel>
      {creating && <NewUserDrawer onClose={() => setCreating(false)} />}
    </>
  );
}

export default UsersPanel;
