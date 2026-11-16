import { useState, type FormEvent } from "react";

import { ApiError } from "../../api/client";
import type { DocumentOwnerKind } from "../../api/documentsApi";
import { useDocumentOwners, useUploadDocuments } from "../../hooks/useDocuments";
import { MAX_FILE_BYTES, MAX_FILES_PER_UPLOAD, OWNER_KINDS, OWNER_KIND_LABELS, documentTypeError, documentTypesFor, expiryDateError, filesError } from "../../lib/documentRules";
import { formatFileSize } from "../../lib/format";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import FileUploadButton from "../ui/FileUploadButton";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import Select from "../ui/Select";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  onClose: () => void;
}

const FORM_ID = "carregar-documento";
const kindOptions = OWNER_KINDS.map((kind) => ({ value: kind, label: OWNER_KIND_LABELS[kind] }));

function UploadDocumentDrawer({ onClose }: Props) {
  const upload = useUploadDocuments();
  const [kind, setKind] = useState<DocumentOwnerKind | "">("");
  const [ownerId, setOwnerId] = useState("");
  const [type, setType] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const owners = useDocumentOwners(kind || undefined);

  const errors = {
    kind: kind ? undefined : "Escolha o tipo de registo.",
    owner: kind && !ownerId ? "Escolha o registo." : undefined,
    type: kind ? documentTypeError(kind, type) : undefined,
    expiryDate: expiryDateError(expiryDate),
    files: filesError(files),
  };

  const changeKind = (value: string) => {
    setKind(value as DocumentOwnerKind | "");
    setOwnerId("");
    setType("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (!kind || Object.values(errors).some(Boolean)) return;
    upload.mutate({ owner: { kind, id: Number(ownerId) }, type, expiryDate: expiryDate || undefined, files }, { onSuccess: onClose });
  };

  const shown = (message: string | undefined) => (showErrors ? message : undefined);

  return (
    <Drawer
      title="Carregar documento"
      subtitle={`Até ${MAX_FILES_PER_UPLOAD} ficheiros de ${MAX_FILE_BYTES / 1024 / 1024} MB`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={upload.isPending}>
            Carregar
          </Button>
        </>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="grid gap-3 rounded-panel border border-line bg-white p-3.5">
        {upload.isError && (
          <Notice tone="warning">{upload.error instanceof ApiError && upload.error.status === 422 ? upload.error.message : "Não foi possível carregar os documentos. Tente novamente."}</Notice>
        )}
        <FormField label="Associar a" error={shown(errors.kind)}>
          <Select value={kind} onChange={changeKind} options={kindOptions} placeholder="Selecionar tipo de registo…" invalid={!!shown(errors.kind)} autoFocus />
        </FormField>
        <FormField label="Registo" error={shown(errors.owner)}>
          <Select
            value={ownerId}
            onChange={setOwnerId}
            disabled={!kind || owners.isPending}
            options={(owners.data ?? []).map((owner) => ({ value: String(owner.id), label: owner.label }))}
            placeholder={kind ? (owners.isPending ? "A carregar…" : "Selecionar registo…") : "Escolha primeiro o tipo de registo"}
            invalid={!!shown(errors.owner)}
          />
        </FormField>
        <FormField label="Tipo de documento" error={shown(errors.type)}>
          <Select value={type} onChange={setType} disabled={!kind} options={kind ? documentTypesFor(kind) : []} placeholder="Selecionar tipo…" invalid={!!shown(errors.type)} />
        </FormField>
        <FormField label="Data de validade (opcional)" error={shown(errors.expiryDate)}>
          <input type="date" className={inputClasses} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </FormField>
        <div>
          <span className="mb-1 block text-[11px] text-muted">Ficheiros</span>
          <FileUploadButton label={files.length ? "Escolher outros ficheiros" : "Escolher ficheiros"} variant="secondary" multiple onFiles={setFiles} />
          {files.length > 0 && (
            <ul className="mt-2 grid gap-1 text-xs">
              {files.map((file) => (
                <li key={`${file.name}-${file.size}`} className="flex justify-between gap-3">
                  <span className="truncate">{file.name}</span>
                  <span className={`shrink-0 tabular-nums ${file.size > MAX_FILE_BYTES ? "font-semibold text-danger" : "text-muted"}`}>{formatFileSize(file.size)}</span>
                </li>
              ))}
            </ul>
          )}
          {showErrors && errors.files && <span className="mt-1 block text-[11px] text-danger">{errors.files}</span>}
        </div>
      </form>
    </Drawer>
  );
}

export default UploadDocumentDrawer;
