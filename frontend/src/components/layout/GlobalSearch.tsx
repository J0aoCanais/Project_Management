import Icon from "../ui/Icon";

function GlobalSearch() {
  return (
    <label className="hidden h-[38px] w-[270px] items-center gap-2 rounded-[9px] border border-line px-[11px] text-[#879493] min-[1051px]:flex">
      <Icon name="search" />
      <input
        type="search"
        placeholder="Pesquisar em todo o CRM..."
        aria-label="Pesquisar em todo o CRM"
        className="w-full border-0 bg-transparent text-xs text-ink outline-none placeholder:text-[#879493]"
      />
    </label>
  );
}

export default GlobalSearch;
