interface Props {
  title: string;
}

/** Página temporária para as rotas do menu que ainda não foram implementadas. */
function PlaceholderPage({ title }: Props) {
  return (
    <>
      <h1 className="mb-3.5 text-[22px] font-bold tracking-[-0.35px]">{title}</h1>
      <div className="rounded-panel border border-dashed border-[#a8b4b2] bg-white px-5 py-12 text-center text-muted">
        Página em construção.
      </div>
    </>
  );
}

export default PlaceholderPage;
