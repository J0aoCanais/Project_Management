import { createPortal } from "react-dom";

import type { ExtraCost, FinanceValues, OpportunityDetail } from "../../api/opportunitiesApi";
import { calcFinance } from "../../lib/finance";
import { formatDate } from "../../lib/format";
import Button from "../ui/Button";
import { useEscape } from "../ui/useEscape";
import ReportCostTable from "./ReportCostTable";
import ReportKpis from "./ReportKpis";

interface Props {
  detail: OpportunityDetail;
  values: FinanceValues;
  extras: ExtraCost[];
  onClose: () => void;
}

const heading = "mb-2 text-[13px] font-bold text-brand-dark";

/** Pré-visualização em ecrã inteiro do relatório para investidores. Ao imprimir, só este documento aparece. */
function OpportunityReport({ detail, values, extras, onClose }: Props) {
  useEscape(onClose);
  const result = calcFinance(values, extras);
  const { property } = detail;
  const area = property.areaM2 ? `${property.areaM2} m²` : "—";
  const facts = [
    { label: "Tipologia", value: detail.typology },
    { label: "Zona", value: detail.zone },
    { label: "Área bruta privativa", value: area },
    { label: "Ano de construção", value: property.constructionYear ?? "—" },
    { label: "Estado de conservação", value: property.condition ?? "—" },
    { label: "Certificado energético", value: property.energyCertificate ?? "—" },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Relatório de oportunidade"
      className="fixed inset-0 z-[200] overflow-auto bg-line px-4 pb-10 print:static print:overflow-visible print:bg-white print:p-0"
    >
      <div className="sticky top-0 z-10 -mx-4 mb-5 flex flex-wrap items-center gap-2 border-b border-line bg-white px-5 py-2.5 print:hidden">
        <div className="max-[720px]:w-full min-[721px]:mr-auto">
          <strong className="block text-sm">Relatório de oportunidade</strong>
          <span className="block text-[11px] text-muted">Pré-visualização do documento para investidores</span>
        </div>
        <Button autoFocus className="max-[720px]:flex-1" onClick={onClose}>
          Fechar
        </Button>
        <Button variant="primary" icon="download" className="max-[720px]:flex-1" onClick={() => window.print()}>
          Imprimir / guardar PDF
        </Button>
      </div>

      <article className="mx-auto max-w-[820px] border border-line bg-white px-4 py-5 text-ink min-[721px]:px-10 min-[721px]:py-9 print:max-w-none print:border-0 print:p-0">
        <header className="flex flex-col items-start justify-between gap-5 border-b-2 border-brand pb-4 min-[721px]:flex-row print:flex-row">
          <div>
            <span className="text-[10px] font-bold tracking-[1px] text-brand uppercase">ImoVentures · Oportunidade de investimento</span>
            <h1 className="mt-1.5 mb-1 text-[26px] font-bold tracking-[-0.5px] wrap-anywhere">{detail.title}</h1>
            <p className="text-[13px] text-muted">
              {detail.typology} · {detail.zone} · {area}
            </p>
          </div>
          <div className="shrink-0 min-[721px]:text-right print:text-right">
            <small className="block text-[10px] text-muted">Data do relatório</small>
            <strong className="text-[13px]">{formatDate(new Date())}</strong>
          </div>
        </header>

        {property.photos && property.photos.length > 0 && (
          <div className="my-[18px] grid grid-cols-2 gap-1.5">
            {property.photos.slice(0, 2).map((photo) => (
              <img key={photo.url} src={photo.url} alt={photo.caption} className="block h-[130px] w-full object-cover min-[721px]:h-[210px] print:h-[210px]" />
            ))}
          </div>
        )}

        <div className="mt-[18px]">
          <ReportKpis values={values} result={result} />
        </div>

        <div className="mt-[22px] grid gap-1 min-[721px]:grid-cols-2 min-[721px]:gap-7 print:grid-cols-2 print:gap-7">
          <section>
            <h2 className={heading}>O imóvel</h2>
            <dl className="m-0 mb-[18px]">
              {facts.map((fact) => (
                <div key={fact.label} className="flex justify-between gap-3 border-b border-line py-1.5 text-xs">
                  <dt className="text-muted">{fact.label}</dt>
                  <dd className="m-0 text-right font-semibold">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <h2 className={heading}>Estratégia</h2>
            <p className="text-xs leading-relaxed text-muted">{property.notes ?? "—"}</p>
          </section>
          <section>
            <h2 className={heading}>Estrutura de custos</h2>
            <ReportCostTable values={values} extras={extras} result={result} />
          </section>
        </div>

        <footer className="mt-[18px] border-t border-line pt-3 text-[10px] text-muted">
          Valores estimados com base nos pressupostos da análise financeira à data do relatório. Documento confidencial, destinado apenas a investidores convidados.
        </footer>
      </article>
    </div>,
    document.body,
  );
}

export default OpportunityReport;
