import { useEffect, useState } from "react";

import type { SettingsUser } from "../../api/settingsApi";
import { useUpdateUser } from "../../hooks/useSettings";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import Notice from "../ui/Notice";
import Select from "../ui/Select";

interface Props {
  user: SettingsUser;
  roles: string[];
  isCurrentUser: boolean;
  isLastAdministrator: boolean;
}

function UserActions({ user, roles, isCurrentUser, isLastAdministrator }: Props) {
  const update = useUpdateUser();
  const [accessLevel, setAccessLevel] = useState(user.accessLevel);
  const [confirming, setConfirming] = useState(false);
  useEffect(() => setAccessLevel(user.accessLevel), [user.accessLevel]);

  const changeRole = (value: string) => {
    setAccessLevel(value);
    update.mutate({ id: user.id, input: { accessLevel: value } }, { onError: () => setAccessLevel(user.accessLevel) });
  };
  const changeStatus = (active: boolean) => {
    update.mutate({ id: user.id, input: { active } }, { onSuccess: () => setConfirming(false) });
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Select label={`Nível de acesso de ${user.username}`} className="min-w-[130px]" value={accessLevel} onChange={changeRole} options={roles} />
      {user.active ? (
        <Button
          variant="danger"
          disabled={update.isPending || isCurrentUser || isLastAdministrator}
          title={isCurrentUser ? "Não pode desativar a sua própria conta" : isLastAdministrator ? "Não pode desativar o último administrador" : undefined}
          onClick={() => setConfirming(true)}
        >
          Desativar
        </Button>
      ) : (
        <Button disabled={update.isPending} onClick={() => changeStatus(true)}>Ativar</Button>
      )}
      {update.isError && <span role="alert" className="text-[11px] text-danger">Não foi possível guardar.</span>}
      {confirming && (
        <Dialog
          title="Desativar utilizador"
          description={`A conta ${user.username} deixará de poder aceder ao sistema.`}
          onClose={() => setConfirming(false)}
          footer={
            <>
              <Button onClick={() => setConfirming(false)}>Cancelar</Button>
              <Button variant="danger" disabled={update.isPending} onClick={() => changeStatus(false)}>Confirmar</Button>
            </>
          }
        />
      )}
      {roles.length === 0 && <Notice tone="warning">Não foi possível carregar os níveis de acesso.</Notice>}
    </div>
  );
}

export default UserActions;
