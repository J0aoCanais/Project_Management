import { Link } from "react-router-dom";

import Panel from "../components/ui/Panel";
import { privacyPolicy } from "../content/privacyPolicy";
import { formatIsoDate } from "../lib/format";

/** Página pública de Política de Privacidade (sem autenticação e sem barra lateral). */
function PrivacyPolicyPage() {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="border-b border-line bg-sidebar px-4 py-4 text-white">
        <div className="mx-auto flex max-w-[820px] items-center justify-between gap-4">
          <Link to="/login" className="text-lg font-bold tracking-[-0.5px] text-white hover:opacity-90">
            ImoVentures
            <small className="block text-[8px] tracking-[2px] text-sidebar-muted">CRM</small>
          </Link>
          <Link
            to="/login"
            className="text-xs font-semibold text-sidebar-text hover:text-white hover:underline"
          >
            Voltar ao início de sessão
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[820px] px-4 py-8">
        <Panel className="p-6 min-[721px]:p-8">
          <div className="border-b border-line pb-4">
            <h1 className="text-[22px] font-bold tracking-[-0.35px] text-ink">
              {privacyPolicy.title}
            </h1>
            <p className="mt-1 text-[11px] text-muted">
              Versão {privacyPolicy.version} · Atualizada em {formatIsoDate(privacyPolicy.updatedAt)}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-ink">{privacyPolicy.intro}</p>
          </div>

          <div className="mt-6 grid gap-6">
            {privacyPolicy.sections.map((section) => (
              <section key={section.id} aria-labelledby={section.id}>
                <h2 id={section.id} className="text-sm font-bold text-ink">
                  {section.title}
                </h2>
                <div className="mt-2 grid gap-2 text-xs leading-relaxed text-muted">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index} className="m-0">
                      {paragraph}
                    </p>
                  ))}
                  {section.items && (
                    <ul className="m-0 grid list-disc gap-1 pl-5">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}

            <section aria-labelledby="contactos-direitos" className="rounded-control border border-line bg-surface p-4">
              <h2 id="contactos-direitos" className="text-xs font-bold text-ink">
                Como exercer os seus direitos ou apresentar reclamação
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                Para exercer qualquer um dos direitos referidos ou esclarecer dúvidas sobre o tratamento dos seus dados pessoais, contacte-nos através do endereço de correio eletrónico{" "}
                <a href={`mailto:${privacyPolicy.controller.email}`} className="font-semibold text-brand hover:underline">
                  {privacyPolicy.controller.email}
                </a>{" "}
                ou por via postal para {privacyPolicy.controller.address}.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Assiste-lhe ainda o direito de apresentar reclamação junto da autoridade de controlo nacional —{" "}
                <strong className="font-semibold text-ink">
                  Comissão Nacional de Proteção de Dados (CNPD)
                </strong>
                , através do portal{" "}
                <a
                  href="https://www.cnpd.pt"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand hover:underline"
                >
                  www.cnpd.pt
                </a>
                .
              </p>
            </section>
          </div>
        </Panel>
      </main>
    </div>
  );
}

export default PrivacyPolicyPage;
