import { useState } from "react";

import { useCurrentUser } from "../../hooks/useCurrentUser";
import { formatIsoDate } from "../../lib/format";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import LoadingState from "../ui/LoadingState";
import RecordFields from "../ui/RecordFields";
import ChangePasswordDialog from "./ChangePasswordDialog";

function AccountPanel() {
  const { data: user, isPending, isError, refetch } = useCurrentUser();
  const [changingPassword, setChangingPassword] = useState(false);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!user) return <EmptyState message="Não foi possível carregar a conta." />;

  return (
    <>
      <RecordFields
        title="A minha conta"
        fields={[
          { label: "Nome", value: user.name },
          { label: "Email", value: user.email },
          { label: "Papel", value: user.role },
          { label: "Último acesso", value: user.lastLogin ? formatIsoDate(user.lastLogin) : "—" },
        ]}
      >
        <div className="border-t border-line p-3">
          <Button onClick={() => setChangingPassword(true)}>Alterar palavra-passe</Button>
        </div>
      </RecordFields>
      {changingPassword && <ChangePasswordDialog onClose={() => setChangingPassword(false)} />}
    </>
  );
}

export default AccountPanel;
