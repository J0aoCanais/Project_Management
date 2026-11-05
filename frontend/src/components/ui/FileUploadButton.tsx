import type { ChangeEvent } from "react";

import Icon, { type IconName } from "./Icon";
import { buttonClasses, type ButtonVariant } from "./buttonClasses";

interface Props {
  label: string;
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  variant?: ButtonVariant;
  icon?: IconName;
}

/** Botão que abre o seletor de ficheiros. O input fica escondido, mas acessível pelo teclado. */
function FileUploadButton({ label, onFiles, accept, multiple = false, variant = "primary", icon = "upload" }: Props) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length) onFiles(files);
  };
  return (
    <label className={`${buttonClasses(variant)} cursor-pointer focus-within:outline-2 focus-within:outline-brand`}>
      <Icon name={icon} size={16} />
      {label}
      <input type="file" accept={accept} multiple={multiple} onChange={handleChange} className="sr-only" />
    </label>
  );
}

export default FileUploadButton;
