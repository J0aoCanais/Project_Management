import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

type IconName =
  | "grid" | "users" | "target" | "briefcase" | "hammer" | "home" | "contact"
  | "wallet" | "chart" | "file" | "settings" | "search" | "plus" | "bell"
  | "chevron" | "trend" | "clock" | "euro" | "more" | "list" | "board"
  | "upload" | "x" | "arrow" | "folder" | "camera" | "download";

const icons: Record<IconName, string> = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  target: "M22 12a10 10 0 1 1-3-7.1M22 4l-10 10M16 4h6v6",
  briefcase: "M9 6V4h6v2M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2M2 11h20M10 11v2h4v-2",
  hammer: "m15 5 4 4M14 6l4 4M3 21l8.5-8.5M12 3l9 9-3 3-9-9z",
  home: "m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z",
  contact: "M4 4h16v16H4zM8 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4M5 14c.5-2 5.5-2 6 0M14 8h3M14 12h3M14 16h3",
  wallet: "M3 6h16a2 2 0 0 1 2 2v10H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14M16 12h5",
  chart: "M4 19V9M10 19V5M16 19v-7M22 19V3",
  file: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h6M9 17h6",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6l-.04.08H10l-.04-.08a1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1l-.08-.04V10L4 9.96a1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6l.04-.08h3.92L14 4a1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.13.4.34.74.6 1l.08.04v3.92L20 14c-.26.26-.47.6-.6 1",
  search: "m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  plus: "M12 5v14M5 12h14", bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  chevron: "m9 18 6-6-6-6", trend: "m3 17 6-6 4 4 8-9M15 6h6v6", clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 6v6l4 2",
  euro: "M18 7.5A7 7 0 1 0 18 17M4 10h10M4 14h9", more: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2M19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2M5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01", board: "M4 4h6v16H4zM14 4h6v10h-6z",
  upload: "M12 16V3m0 0L7 8m5-5 5 5M4 15v5h16v-5", x: "M18 6 6 18M6 6l12 12", arrow: "m9 18 6-6-6-6",
  folder: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  camera: "M3 9a2 2 0 0 1 2-2h2l2-3h6l2 3h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7",
  download: "M12 3v12m0 0-5-5m5 5 5-5M4 20h16"
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[name]} /></svg>;
}

const menu = [
  ["Painel", "grid"], ["Leads", "users"], ["Oportunidades", "target"], ["Operações", "briefcase"],
  ["Obras", "hammer"], ["Imóveis", "home"], ["Contactos", "contact"], ["Investidores", "wallet"],
  ["Finanças", "chart"], ["Documentos", "file"], ["Definições", "settings"]
] as [string, IconName][];

const money = (n: number) => new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const stages = ["Novo", "Contactado", "Análise financeira", "Informação pendente", "Due diligence", "Negociação", "CPCV", "Aprovado"];
const zones = ["Baixa","Alta","Celas","Solum","Santa Clara","Olivais"];
const leadSources = ["Consultor imobiliário","Procura própria","Facebook/Instagram","Anúncio","Idealista","Site","Indicação"];
const opportunities = [
  { id: 1, title: "Apartamento na Alta", city: "Alta", type: "T2", ask: 285000, vvr: 410000, profit: 61500, days: 3, stage: 0 },
  { id: 2, title: "Rua do Brasil", city: "Celas", type: "T3", ask: 220000, vvr: 345000, profit: 52700, days: 8, stage: 1 },
  { id: 3, title: "Baixa de Coimbra", city: "Coimbra", type: "T2", ask: 128000, vvr: 215000, profit: 39200, days: 2, stage: 2 },
  { id: 4, title: "Quinta da Portela", city: "Olivais", type: "T1", ask: 145000, vvr: 225000, profit: 33800, days: 12, stage: 4 },
  { id: 5, title: "Moradia na Solum", city: "Solum", type: "T4", ask: 395000, vvr: 585000, profit: 86400, days: 5, stage: 7 },
];
// Fotografias de obra: pertencem exclusivamente às obras e organizam-se em pastas por dia (campo "date").
type WorkPhoto = { id:number; date:string; caption:string; visible:boolean; url:string };
const workPhotos: WorkPhoto[] = [
  { id:1, date:"02/11/2026", caption:"Cozinha – estado inicial", visible:true, url:"https://images.unsplash.com/photo-1653339403812-00659169dd73?auto=format&fit=crop&w=1200&q=85" },
  { id:2, date:"02/11/2026", caption:"Sala – estado inicial", visible:false, url:"https://images.unsplash.com/photo-1543926618-a1616b2b8575?auto=format&fit=crop&w=1200&q=85" },
  { id:3, date:"08/11/2026", caption:"Cozinha – demolição", visible:true, url:"https://images.unsplash.com/photo-1672326863703-11d1dff639cf?auto=format&fit=crop&w=1200&q=85" },
  { id:4, date:"14/11/2026", caption:"Sala – preparação elétrica", visible:true, url:"https://images.unsplash.com/photo-1722957864268-71a75fe82fde?auto=format&fit=crop&w=1200&q=85" },
  { id:5, date:"28/11/2026", caption:"Sala – pintura concluída", visible:false, url:"https://images.unsplash.com/photo-1722314888277-f71cfa013f1f?auto=format&fit=crop&w=1200&q=85" },
];
const workCover=workPhotos[0].url;

const pad2=(n:number)=>String(n).padStart(2,"0");
const toDay=(d:Date)=>`${pad2(d.getDate())}/${pad2(d.getMonth()+1)}/${d.getFullYear()}`;
const parseDay=(s:string)=>{const [d,m,y]=s.split("/").map(Number);return new Date(y,m-1,d);};
const todayDay=()=>toDay(new Date());
const longDay=(s:string)=>{const t=new Intl.DateTimeFormat("pt-PT",{weekday:"long",day:"numeric",month:"long"}).format(parseDay(s));return t.charAt(0).toUpperCase()+t.slice(1);};

const leads = [
  ["Marta Ribeiro", "Casa Certa", "Coimbra", "912 345 678", "Anúncio", "Nova", "14/11/2026"],
  ["João Noronha", "Porta 21", "Alta", "933 821 204", "Indicação", "Qualificada", "13/11/2026"],
  ["Carla Mendes", "Habita", "Celas", "968 452 190", "Idealista", "Contactada", "12/11/2026"],
  ["Rui Valente", "Particular", "Solum", "916 774 305", "Site", "Convertida", "10/11/2026"],
  ["Sofia Matos", "Domus", "Coimbra", "927 610 482", "Facebook/Instagram", "Descartada", "08/11/2026"],
];

const genericData: Record<string, { headers: string[]; rows: string[][] }> = {
  "Operações": { headers: ["Código", "Imóvel", "Fase", "Investimento", "Margem prevista", "Atualização"], rows: [["OP-2026-001", "T2 · Baixa, Coimbra", "Em renovação", "172 400 €", "22,8%", "14/11/2026"], ["OP-2026-002", "T1 · Solum, Solum", "Em aquisição", "158 500 €", "19,4%", "13/11/2026"], ["OP-2026-003", "T3 · Santa Clara, Alta", "À venda", "342 800 €", "25,1%", "11/11/2026"], ["OP-2025-014", "T2 · Olivais, Celas", "CPCV venda", "248 000 €", "21,6%", "09/11/2026"]] },
  "Obras": { headers: ["Operação", "Imóvel", "Estado", "Início previsto", "Fim previsto", "Orçamento", "Desvio"], rows: [["OP-2026-001", "Baixa, Coimbra", "Em curso", "03/11/2026", "30/11/2026", "45 800 €", "+6,2%"], ["OP-2026-003", "Santa Clara, Alta", "Concluída", "05/11/2026", "28/11/2026", "68 200 €", "+11,8%"], ["OP-2026-004", "Olivais, Celas", "Planeada", "02/11/2026", "15/11/2026", "92 500 €", "0,0%"]] },
  "Imóveis": { headers: ["Imóvel", "Morada", "Tipologia", "Área", "Estado", "Preço pedido"], rows: [["IM-1042", "Rua da Sofia, Coimbra", "T2", "86 m²", "A renovar", "128 000 €"], ["IM-1038", "Rua do Celas, Celas", "T3", "124 m²", "Habitável", "220 000 €"], ["IM-1029", "Rua da Alta, Alta", "T2", "91 m²", "A renovar", "285 000 €"], ["IM-1018", "Av. Dr. Lourenço Peixinho, Solum", "T1", "64 m²", "Renovado", "225 000 €"]] },
  "Contactos": { headers: ["Nome", "Papel", "Email", "Telemóvel", "NIF", "RGPD"], rows: [["Marta Ribeiro", "Consultora imobiliária", "marta.ribeiro@exemplo.pt", "912 345 678", "247 891 320", "Sim · 12/11/2026"], ["Miguel Seabra", "Empreiteiro", "miguel.seabra@exemplo.pt", "935 221 094", "218 645 902", "Sim · 18/11/2026"], ["Luís Paiva", "Proprietário", "luis.paiva@exemplo.pt", "966 018 443", "196 287 345", "Não"], ["Inês Tavares", "Arquiteta", "ines.tavares@exemplo.pt", "918 476 220", "257 903 614", "Sim · 04/11/2026"]] },
  "Investidores": { headers: ["Nome", "Zona", "Telemóvel", "Capital disponível", "Condições", "Estado"], rows: [["Ana Lourenço", "Alta", "912 830 445", "180 000 €", "Fixo · 8,0%", "Ativo"], ["Manuel Gouveia", "Celas", "934 112 887", "250 000 €", "Participação · 25%", "Ativo"], ["Teresa Faria", "Coimbra", "961 309 210", "95 000 €", "Fixo · 7,5%", "Prospeto"], ["Pedro Alvim", "Solum", "922 874 601", "120 000 €", "Participação · 20%", "Inativo"]] },
  "Finanças": { headers: ["Descrição", "Categoria", "Operação", "Data prevista", "Estado", "Valor"], rows: [["Adiantamento empreiteiro", "Obras", "OP-2026-001", "16/11/2026", "Previsto", "-12 500 €"], ["Tranche investidor", "Investimento", "OP-2026-002", "14/11/2026", "Realizado", "+45 000 €"], ["Software de gestão", "Custo de estrutura", "—", "10/11/2026", "Realizado", "-390 €"], ["Sinal CPCV venda", "Venda", "OP-2025-014", "18/11/2026", "Previsto", "+24 800 €"]] },
  "Documentos": { headers: ["Documento", "Tipo", "Imóvel", "Entidade associada", "Tamanho", "Validade", "Estado"], rows: [
    ["CPCV_compra_OP001.pdf", "CPCV", "IM-1042", "OP-2026-001", "1,8 MB", "—", "Válido"],
    ["Certidão_permanente.pdf", "Certidão permanente", "IM-1042", "IM-1042", "840 KB", "22/11/2026", "A expirar"],
    ["Caderneta_predial_IM1042.pdf", "Caderneta predial", "IM-1042", "IM-1042", "410 KB", "—", "Válido"],
    ["Orçamento_electricidade.xlsx", "Orçamento de obra", "IM-1042", "Obra OP-2026-001", "224 KB", "—", "Válido"],
    ["Caderneta_predial_IM1038.pdf", "Caderneta predial", "IM-1038", "Oportunidade · Rua do Brasil", "380 KB", "—", "Válido"],
    ["Certificado_energetico_IM1029.pdf", "Certificado energético", "IM-1029", "IM-1029", "1,1 MB", "15/03/2035", "Válido"],
    ["Licença_utilização_IM1018.pdf", "Licença de utilização", "IM-1018", "IM-1018", "650 KB", "—", "Válido"],
    ["CC_Ana_Lourenço.pdf", "Identificação", "—", "Investidora · Ana Lourenço", "1,2 MB", "30/11/2026", "A expirar"]] },
};

// Importação por template: o cliente descarrega o template, preenche no Excel e carrega o ficheiro.
type ImportConfig = { title: string; template: string; columns: string[]; sample: string[][] };
const importConfigs: Record<string, ImportConfig> = {
  Leads: { title: "Importar leads", template: "template_leads.csv", columns: ["Nome","Referenciado por","Zona","Telemóvel","Origem","Estado","Data"], sample: [
    ["Marta Ribeiro","Casa Certa","Coimbra","912 345 678","Anúncio","Nova","03/11/2026"],
    ["Nuno Almeida","Particular","Celas","934 102 889","Indicação","Nova","03/11/2026"],
    ["Beatriz Cruz","Habita","Solum","966 334 120","Site","Nova","03/11/2026"],
    ["Paulo Simões","Porta 21","Alta","918 422 301","Idealista","Nova","03/11/2026"],
    ["Carolina Neves","Particular","Olivais","927 108 443","Procura própria","Nova","03/11/2026"]] },
  Contactos: { title: "Importar ficha de contactos", template: "template_contactos.csv", columns: ["Nome","Papel","Email","Telemóvel","NIF","RGPD"], sample: [
    ["Miguel Seabra","Empreiteiro","miguel.seabra@exemplo.pt","935 221 094","218 645 902","Sim · 18/11/2026"],
    ["Pedro Carvalho","Empreiteiro","pedro.carvalho@exemplo.pt","913 552 018","231 774 902","Sim · 03/11/2026"],
    ["Rita Moura","Arquiteta","rita.moura@exemplo.pt","962 118 470","229 340 115","Sim · 03/11/2026"],
    ["Hugo Sá","Fornecedor","hugo.sa@exemplo.pt","924 690 331","205 883 641","Não"]] },
  Investidores: { title: "Importar ficha de investidores", template: "template_investidores.csv", columns: ["Nome","Zona","Telemóvel","Capital disponível","Condições","Estado"], sample: [
    ["Joana Pires","Celas","915 220 734","150 000 €","Fixo · 8,0%","Prospeto"],
    ["Ricardo Leal","Alta","936 401 118","200 000 €","Participação · 25%","Ativo"],
    ["Helena Couto","Solum","968 775 002","90 000 €","Fixo · 7,0%","Prospeto"]] },
  Orçamento: { title: "Importar orçamento de obra", template: "template_orcamento_obra.csv", columns: ["Rubrica","Orçamentado","Contratado","Executado","Faturado","Pago","Empreiteiro","Desvio %"], sample: [
    ["Caixilharia","6 800 €","6 500 €","—","—","—","Alumínios Mondego","—"],
    ["Pavimentos","5 400 €","5 400 €","—","—","—","Soalhos Centro","—"],
    ["Casas de banho","9 200 €","—","—","—","—","HidroCentro","—"]] },
};

function downloadTemplate(config: ImportConfig) {
  const csv = "﻿" + config.columns.join(";") + "\r\n";
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = config.template; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function parseCsv(text: string, columns: string[]): string[][] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];
  const sep = (lines[0].split(";").length >= lines[0].split(",").length) ? ";" : ",";
  const split = (line: string) => { const out: string[] = []; let cur = "", q = false; for (const ch of line) { if (ch === '"') q = !q; else if (ch === sep && !q) { out.push(cur.trim()); cur = ""; } else cur += ch; } out.push(cur.trim()); return out; };
  let rows = lines.map(split);
  if (rows[0][0].toLowerCase() === columns[0].toLowerCase()) rows = rows.slice(1);
  return rows.filter(r => r.some(Boolean)).map(r => columns.map((_, i) => r[i] || "—"));
}

const euro = (s: string) => { const n = Number(s.replace(/[^\d,]/g, "").replace(",", ".")); return isNaN(n) ? 0 : n; };
const pct = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1).replace(".", ",")}%`;
const workCosts: string[][] = [["Demolição","5 200 €","5 000 €","5 450 €","5 450 €","5 000 €","Rui & Filhos","+4,8%"],["Canalização","8 400 €","8 600 €","9 520 €","8 600 €","6 000 €","HidroCentro","+13,3%"],["Eletricidade","7 800 €","7 400 €","6 900 €","6 900 €","4 500 €","Volt Lda.","−11,5%"],["Cozinha","12 500 €","12 500 €","8 200 €","6 250 €","3 750 €","Linha Clara","−34,4%"],["Pintura","4 200 €","4 000 €","1 900 €","—","—","Cor & Obra","−54,8%"]];

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

function App() {
  const [page, setPage] = useState("Painel");
  const [detail, setDetail] = useState<string | null>(null);
  const [view, setView] = useState<"board" | "list">("board");
  const [cards, setCards] = useState(opportunities);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [newLead, setNewLead] = useState(false);
  const [portal, setPortal] = useState(false);

  const navigate = (label: string) => { setPage(label); setDetail(null); setMobileMenu(false); };

  if (portal) return <InvestorPortal onExit={() => setPortal(false)} />;
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span>ImoVentures<small>CRM</small></span></div>
      <nav>{menu.map(([label, icon]) => <button key={label} className={page === label ? "active" : ""} onClick={() => navigate(label)}><Icon name={icon} /><span>{label}</span>{label === "Leads" && <b>5</b>}</button>)}</nav>
      <div className="user"><div className="avatar">RM</div><div><strong>Rodrigo Mendes</strong><small>Administrador</small></div><Icon name="more" /></div>
    </aside>

    <main>
      <header className="topbar">
        <div><p>Quarta-feira, 15 de abril</p><strong>{page}</strong></div>
        <div className="top-actions"><label className="global-search"><Icon name="search" /><input placeholder="Pesquisar em todo o CRM..." /></label><button className="icon-btn"><Icon name="bell" /><i /></button><div className="avatar">RM</div></div>
      </header>
      <section className="content">
        {detail ? <Detail title={detail} page={page} onBack={() => setDetail(null)} onConvert={() => { setPage("Operações"); setDetail("OP-2026-005"); }} /> :
          page === "Painel" ? <Dashboard onNavigate={navigate} onDetail={(code) => { setPage("Operações"); setDetail(code); }} /> :
          page === "Oportunidades" ? <Opportunities cards={cards} setCards={setCards} view={view} setView={setView} onDetail={setDetail} /> :
          page === "Leads" ? <Leads onDetail={setDetail} onNew={() => setNewLead(true)} /> :
          page === "Operações" ? <Operations onDetail={setDetail} /> :
          page === "Definições" ? <Settings onPortal={() => setPortal(true)} /> :
          <GenericPage key={page} page={page} onDetail={setDetail} />}
      </section>
    </main>

    <nav className="mobile-nav">
      {menu.slice(0, 5).map(([label, icon]) => <button key={label} className={page === label ? "active" : ""} onClick={() => navigate(label)}><Icon name={icon} /><span>{label === "Oportunidades" ? "Oportun." : label}</span></button>)}
      <button onClick={() => setMobileMenu(true)}><Icon name="more" /><span>Mais</span></button>
    </nav>
    {page==="Leads"&&<button className="mobile-fab" onClick={()=>setNewLead(true)} aria-label="Nova lead"><Icon name="plus"/></button>}
    {mobileMenu && <div className="mobile-menu"><div className="sheet-head"><strong>Mais áreas</strong><button className="icon-btn" onClick={() => setMobileMenu(false)}><Icon name="x" /></button></div>{menu.slice(5).map(([label, icon]) => <button key={label} onClick={() => navigate(label)}><Icon name={icon} />{label}</button>)}</div>}
    {newLead && <LeadDrawer onClose={() => setNewLead(false)} />}
  </div>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1></div>{action}</div>;
}

function Dashboard({ onNavigate, onDetail }: { onNavigate: (p: string) => void; onDetail: (d: string) => void }) {
  const stats = [
    ["Oportunidades abertas", "24", "+5 este mês", "target"],
    ["Operações ativas", "8", "3 em renovação", "briefcase"],
    ["Vendas do ano", "1 285 000 €", "+18,2% vs. 2025", "trend"],
    ["Margem realizada", "286 450 €", "22,3% média", "euro"],
  ] as [string, string, string, IconName][];
  return <>
    <PageHeading title="Painel" description="" action={<button className="primary" onClick={() => onNavigate("Oportunidades")}><Icon name="plus" /> Nova oportunidade</button>} />
    <div className="stat-grid">{stats.map(([label, value, meta]) => <article className="stat-card" key={label}><strong>{value}</strong><span>{label}</span><small className={label.includes("Operações") ? "" : "positive"}>{meta}</small></article>)}</div>
    <section className="investor-capital"><div><span>Capital dos investidores</span><strong>1 240 000 €</strong></div><div className="capital-track"><i /><i /><i /></div><div className="capital-legend"><span><b className="dark" />Comprometido <strong>680 000 €</strong></span><span><b className="main" />Investido <strong>390 000 €</strong></span><span><b className="light" />Disponível <strong>170 000 €</strong></span></div></section>
    <div className="dashboard-grid">
      <article className="panel chart-panel"><div className="panel-head"><div><h2>Funil de oportunidades</h2></div><button className="text-btn" onClick={() => onNavigate("Oportunidades")}>Ver todas <Icon name="arrow" /></button></div><div className="bar-chart funnel">{stages.map((n,i) => <div key={n}><div className="bar-wrap"><span>{Math.max(1,14-i*2)}</span><i style={{ height: `${Math.max(1,14-i*2) * 8}px` }} /></div><small>{n}</small></div>)}</div></article>
      <article className="panel leads-chart"><div className="panel-head"><div><h2>Leads por origem · últimos 7 dias</h2></div><strong>38</strong></div><div className="horizontal-bars">{[["Idealista",12],["Anúncio",9],["Indicação",8],["Site",6],["Facebook/Instagram",3]].map(([n,v])=><div key={n}><span>{n}</span><i><b style={{width:`${Number(v)/12*100}%`}}/></i><strong>{v}</strong></div>)}</div></article>
    </div>
    <div className="lower-grid"><article className="panel operations"><div className="panel-head"><div><h2>Operações ativas por fase</h2></div><button className="text-btn" onClick={() => onNavigate("Operações")}>Ver operações <Icon name="arrow" /></button></div><GroupedOperations onDetail={onDetail}/></article>
      <article className="panel alerts"><div className="panel-head"><div><h2>Alertas</h2></div><button className="text-btn" onClick={()=>onNavigate("Definições")}>Limites</button></div>{[["15/11/2026","Marta Ribeiro","Follow-up em atraso","Leads"],["15/11/2026","Obra Baixa","Desvio de obra: 11,8%","Obras"],["14/11/2026","Apartamento na Alta","12 dias sem alteração","Oportunidades"],["13/11/2026","Certidão permanente","Expira em 15 dias","Documentos"]].map(([d,r,t,p])=><button className="alert-row" onClick={()=>onNavigate(p)} key={r}><time>{d}</time><b>{r}</b><span>{t}</span><Icon name="arrow"/></button>)}</article></div>
  </>;
}

function Leads({ onDetail, onNew }: { onDetail: (d: string) => void; onNew:()=>void }) {
  const [importing,setImporting]=useState(false);
  const [rows,setRows]=useState(()=>[...leads]);
  return <><PageHeading title="Leads" description="" action={<div className="actions"><button className="secondary" onClick={()=>setImporting(true)}><Icon name="upload"/>Importar de Excel</button><button className="primary" onClick={onNew}><Icon name="plus"/>Nova lead</button></div>}/>
    <Filters search="Pesquisar por nome, referência ou telemóvel..." options={[["Todos os estados","Nova","Contactada","Qualificada","Convertida","Descartada"],["Todas as origens",...leadSources],["Todas as zonas",...zones]]}/>
    <div className="panel table-panel"><Table headers={importConfigs.Leads.columns} rows={rows} onRow={r=>onDetail(r[0])}/></div>
    {importing&&<ImportExcel config={importConfigs.Leads} existing={rows} onClose={()=>setImporting(false)} onImport={added=>{leads.push(...added);setRows([...leads]);}}/>}
  </>;
}

function Opportunities({ cards, setCards, view, setView, onDetail }: { cards: typeof opportunities; setCards: (c: typeof opportunities)=>void; view:"board"|"list"; setView:(v:"board"|"list")=>void; onDetail:(d:string)=>void }) {
  const moveCard = (id:number, stage:number) => setCards(cards.map(c=>c.id===id?{...c,stage}:c));
  return <><PageHeading eyebrow="Aquisição" title="Oportunidades" description="24 oportunidades abertas · Valor potencial de 3 840 000 €" action={<button className="primary"><Icon name="plus"/>Nova oportunidade</button>}/>
    <div className="toolbar"><div className="view-switch"><button className={view==="board"?"active":""} onClick={()=>setView("board")}><Icon name="board"/>Quadro</button><button className={view==="list"?"active":""} onClick={()=>setView("list")}><Icon name="list"/>Lista</button></div><Filters compact search="Pesquisar oportunidades..." options={[["Todas as zonas",...zones],["Todos os gestores","Rodrigo Mendes","Sofia Lima"]]}/></div>
    {view==="board"?<div className="kanban">{stages.map((stage,idx)=><div className="kanban-col" key={stage} onDragOver={e=>e.preventDefault()} onDrop={e=>moveCard(Number(e.dataTransfer.getData("id")),idx)}><div className="kanban-head"><span><i className={`dot d${idx}`}/>{idx+1}. {stage}</span><b>{cards.filter(c=>c.stage===idx).length}</b></div><div className="kanban-drop">{cards.filter(c=>c.stage===idx).map(c=><article draggable onDragStart={e=>e.dataTransfer.setData("id",String(c.id))} onClick={()=>onDetail(c.title)} className="deal-card" key={c.id}><div><Pill>{c.type}</Pill><button className="icon-btn"><Icon name="more"/></button></div><h3>{c.title}</h3><p><Icon name="home" size={14}/>{c.city}</p><dl><div><dt>Preço pedido</dt><dd>{money(c.ask)}</dd></div><div><dt>VVR</dt><dd>{money(c.vvr)}</dd></div></dl><div className="profit"><span>Lucro estimado</span><strong>{money(c.profit)}</strong></div><footer><Icon name="clock" size={14}/><span className={c.days>10?"late":""}>{c.days} dias nesta fase</span><div className="mini-avatar">RM</div></footer></article>)}</div></div>)}</div>:<div className="panel table-panel"><Table headers={["Imóvel / Zona","Tipologia","Preço pedido","VVR","Lucro estimado","Fase","Dias"]} rows={cards.map(c=>[`${c.title} · ${c.city}`,c.type,money(c.ask),money(c.vvr),money(c.profit),stages[c.stage],String(c.days)])} onRow={r=>onDetail(r[0].split(" · ")[0])}/></div>}
  </>;
}

const operationStages=["Em aquisição","Adquirido","Em obra","Em preparação para venda","À venda","Vendido","Fechado"];
function Operations({onDetail}:{onDetail:(d:string)=>void}){
  const [items,setItems]=useState([["OP-2026-002","T1 · Solum",0,"158 500 €"],["OP-2026-005","T4 · Olivais",1,"412 000 €"],["OP-2026-001","T2 · Baixa",2,"172 400 €"],["OP-2026-004","T2 · Celas",3,"276 200 €"],["OP-2026-003","T3 · Santa Clara",4,"342 800 €"],["OP-2025-014","T2 · Alta",5,"248 000 €"]] as [string,string,number,string][]);
  const move=(code:string,stage:number)=>setItems(items.map(x=>x[0]===code?[x[0],x[1],stage,x[3]]:x));
  return <><PageHeading title="Operações" description="" action={<button className="primary"><Icon name="plus"/>Nova operação</button>}/><Filters search="Pesquisar por código ou imóvel..." options={[["Todas as fases",...operationStages],["Todas as zonas",...zones]]}/><div className="operation-board">{operationStages.map((s,i)=><section key={s} onDragOver={e=>e.preventDefault()} onDrop={e=>move(e.dataTransfer.getData("code"),i)}><header><span>{stages.length+1+i}. {s}</span><b>{items.filter(x=>x[2]===i).length}</b></header>{items.filter(x=>x[2]===i).map(x=><button draggable onDragStart={e=>e.dataTransfer.setData("code",x[0])} key={x[0]} onClick={()=>onDetail(x[0])}><strong>{x[0]}</strong><span>{x[1]}</span><em>{x[3]}</em></button>)}{!items.some(x=>x[2]===i)&&<p>Sem operações nesta fase</p>}</section>)}</div></>
}

function GenericPage({ page, onDetail }: { page:string; onDetail:(d:string)=>void }) {
  if(page==="Portal do investidor") return null;
  const data=genericData[page] || genericData["Contactos"];
  const [rows,setRows]=useState(()=>[...data.rows]);
  const [importing,setImporting]=useState(false);
  const [filter,setFilter]=useState<Record<number,string>>({});
  const [property,setProperty]=useState<string|null>(null);
  const importConfig=importConfigs[page];
  const desc:Record<string,string>={Operações:"Acompanhe o ciclo de investimento, da aquisição ao fecho.",Obras:"Planeamento, orçamento e execução das renovações.",Imóveis:"Portefólio completo de ativos imobiliários.",Contactos:"Base central de contactos e consentimentos.",Investidores:"Capital, preferências e participações.",Finanças:"Fluxos financeiros previstos e realizados.",Documentos:"Arquivo central e controlo de validade."};
  const financeOps=[...new Set(genericData["Finanças"].rows.map(r=>r[2]).filter(x=>x!=="—"))];
  const options=page==="Contactos"?[["Todos os papéis","Comprador","Empreiteiro","Fornecedor","Arquiteto","Consultor imobiliário","Proprietário"],["RGPD","Com consentimento","Sem consentimento"]]
    :page==="Finanças"?[["Todos os estados","Previsto","Realizado"],["Todas as operações",...financeOps,"Sem operação"]]
    :[["Todos os estados","Ativo","Planeada","Em curso","Concluída"],["Todas as zonas",...zones]];
  // Filtros ativos em Finanças (estado e operação) e no resumo de documentos (imóvel)
  let shown=rows;
  if(page==="Finanças"){
    const st=filter[0], op=filter[1];
    if(st&&st!==options[0][0]) shown=shown.filter(r=>r[4]===st);
    if(op&&op!==options[1][0]) shown=shown.filter(r=>op==="Sem operação"?r[2]==="—":r[2]===op);
  }
  if(page==="Documentos"&&property) shown=shown.filter(r=>r[2]===property);
  return <><PageHeading eyebrow={page==="Finanças"?"Contabilidade":"Gestão"} title={page} description={desc[page]||"Gestão centralizada da atividade."} action={<div className="actions">{page==="Documentos"&&<button className="secondary"><Icon name="upload"/>Carregar documentos</button>}{importConfig&&<button className="secondary" onClick={()=>setImporting(true)}><Icon name="upload"/>Importar de Excel</button>}<button className="primary"><Icon name="plus"/>Novo registo</button></div>}/>
    <Filters search={`Pesquisar em ${page.toLowerCase()}...`} options={options} onSelect={page==="Finanças"?(g,v)=>setFilter(f=>({...f,[g]:v})):undefined}/>
    {page==="Documentos"&&<DocumentSummary rows={rows} selected={property} onSelect={setProperty}/>}
    {page==="Documentos"&&<div className="dropzone"><Icon name="upload" size={24}/><div><strong>Arraste os ficheiros para aqui</strong><small>PDF, imagens ou Office · Máximo 25 MB</small></div><button className="secondary">Selecionar ficheiros</button></div>}
    <div className="panel table-panel">{page==="Documentos"&&property&&<div className="table-action"><strong>Documentos de {property}</strong><button className="secondary" onClick={()=>setProperty(null)}><Icon name="x"/>Mostrar todos</button></div>}{shown.length?<Table headers={data.headers} rows={shown} onRow={r=>onDetail(r[0])}/>:<p className="table-empty">Sem registos para os filtros escolhidos.</p>}</div>
    {importing&&importConfig&&<ImportExcel config={importConfig} existing={rows} onClose={()=>setImporting(false)} onImport={added=>{data.rows.push(...added);setRows([...data.rows]);}}/>}
  </>;
}

// Menu Documentos: resumo de todos os documentos associados a cada imóvel
function DocumentSummary({rows,selected,onSelect}:{rows:string[][];selected:string|null;onSelect:(p:string|null)=>void}){
  const groups=genericData["Imóveis"].rows.map(p=>{const list=rows.filter(r=>r[2]===p[0]);return {code:p[0],address:p[1],list,expiring:list.filter(r=>r[6]==="A expirar").length,types:[...new Set(list.map(r=>r[1]))]};}).filter(g=>g.list.length);
  const total=groups.reduce((s,g)=>s+g.list.length,0);
  return <article className="panel doc-summary"><div className="table-action"><strong>Resumo por imóvel</strong><span>{total} documentos em {groups.length} imóveis · selecione um imóvel para filtrar</span></div><div className="doc-summary-grid">{groups.map(g=><button key={g.code} className={selected===g.code?"active":""} onClick={()=>onSelect(selected===g.code?null:g.code)}><b>{g.code}</b><strong>{g.address}</strong><span>{g.list.length} {g.list.length===1?"documento":"documentos"}{g.expiring?<em> · {g.expiring} a expirar</em>:null}</span><small>{g.types.join(" · ")}</small></button>)}</div></article>;
}

function Table({headers,rows,onRow}:{headers:string[];rows:string[][];onRow?:(r:string[])=>void}) {
  return <div className="table-scroll"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i} onClick={()=>onRow?.(r)}>{r.map((v,j)=><td key={j}>{j===headers.length-1&&["Nova","Qualificada","Contactada","Convertida","Descartada","Ativo","Inativo","Prospeto","Previsto","Realizado","A expirar","Válido"].some(x=>v.includes(x))?<Pill tone={v.includes("Descartada")||v.includes("Inativo")?"red":v.includes("A expirar")||v.includes("Previsto")?"amber":"green"}>{v}</Pill>:v}</td>)}</tr>)}</tbody></table></div>;
}

function Filters({search,options,compact=false,onSelect}:{search:string;options:string[][];compact?:boolean;onSelect?:(group:number,value:string)=>void}) {
  return <div className={`filters ${compact?"compact":""}`}><label><Icon name="search"/><input placeholder={search}/></label>{options.map((group,gi)=><select key={group[0]} defaultValue={group[0]} onChange={e=>onSelect?.(gi,e.target.value)}>{group.map(o=><option key={o}>{o}</option>)}</select>)}</div>;
}

function Detail({title,page,onBack,onConvert}:{title:string;page:string;onBack:()=>void;onConvert:()=>void}) {
  if(page==="Leads") return <LeadDetail title={title} onBack={onBack}/>;
  if(page==="Obras") return <WorkDetail title={title} onBack={onBack}/>;
  if(page==="Operações") return <OperationDetail title={title} onBack={onBack}/>;
  if(page==="Contactos") return <ContactDetail title={title} onBack={onBack}/>;
  if(page==="Investidores") return <InvestorDetail title={title} onBack={onBack}/>;
  if(page==="Imóveis") return <PropertyDetail title={title} onBack={onBack}/>;
  if(page==="Documentos") return <DocumentDetail title={title} onBack={onBack}/>;
  if(page==="Finanças") return <FinanceDetail title={title} onBack={onBack}/>;
  return <OpportunityDetail title={title} page={page} onBack={onBack} onConvert={onConvert}/>;
}

// Imóvel associado à oportunidade de demonstração (Rua da Sofia, Baixa · IM-1042)
const oppProperty="IM-1042";
const docTypes=["Caderneta predial","Certidão permanente","Orçamento de obra","Planta","Licença de utilização","Certificado energético","Outro"];
type ExtraCost={id:number;label:string;value:number};
type FinanceValues={buy:number;tax:number;stamp:number;deed:number;works:number;sale:number;commission:number;vat:number;months:number};

function calcFinance(v:FinanceValues,extras:ExtraCost[]){
  const other=extras.reduce((s,x)=>s+(x.value||0),0);
  const commission=v.sale*v.commission/100*(1+v.vat/100);
  const cost=v.buy+v.tax+v.stamp+v.deed+v.works+other+commission;
  const margin=v.sale-cost;
  const roi=cost?margin/cost*100:0;
  const annual=v.months>0?(Math.pow(1+roi/100,12/v.months)-1)*100:0;
  return {other,commission,cost,margin,roi,annual};
}
const fmtPct=(n:number)=>`${n.toFixed(1).replace(".",",")}%`;

function OpportunityDetail({title,page,onBack,onConvert}:{title:string;page:string;onBack:()=>void;onConvert:()=>void}) {
  const [tab,setTab]=useState("Resumo");
  const [values,setValues]=useState<FinanceValues>({buy:220000,tax:8400,stamp:1760,deed:1250,works:58000,sale:355000,commission:5,vat:23,months:10});
  const [extras,setExtras]=useState<ExtraCost[]>([{id:1,label:"Licenças e projeto",value:3500},{id:2,label:"IMI e condomínio durante a operação",value:1800},{id:3,label:"Seguro",value:1200}]);
  const [docs,setDocs]=useState(()=>genericData["Documentos"].rows.filter(r=>r[2]===oppProperty));
  const [docType,setDocType]=useState(docTypes[0]);
  const [report,setReport]=useState(false);
  const fin=calcFinance(values,extras);
  const tabs=["Resumo","Análise financeira","Histórico de fases","Documentos"];
  const currentStage=title.includes("Solum")?stages.length-1:stages.indexOf("Análise financeira");
  const set=(k:keyof FinanceValues)=>(e:React.ChangeEvent<HTMLInputElement>)=>setValues({...values,[k]:Number(e.target.value)});
  const field=(label:string,k:keyof FinanceValues,suffix="€")=><label key={k}><span>{label}</span><div className="input-suffix"><input type="number" value={values[k]} onChange={set(k)}/><i>{suffix}</i></div></label>;
  const upload=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const files=Array.from(e.target.files||[]); if(!files.length) return;
    const added=files.map(f=>[f.name,docType,oppProperty,`Oportunidade · ${title}`,f.size>1048576?`${(f.size/1048576).toFixed(1).replace(".",",")} MB`:`${Math.max(1,Math.round(f.size/1024))} KB`,"—","Válido"]);
    genericData["Documentos"].rows.push(...added); setDocs(d=>[...d,...added]); e.target.value="";
  };
  return <><button className="back" onClick={onBack}><Icon name="chevron"/>Voltar a {page.toLowerCase()}</button><div className="record-head"><div><span className="record-icon"><Icon name="target"/></span><div><p>{page} · Registo atualizado hoje</p><h1>{title}</h1><div><Pill tone="green">{stages[currentStage]}</Pill><span className="muted">Responsável: Rodrigo Mendes</span></div></div></div><div className="actions"><button className="secondary" onClick={()=>setReport(true)}><Icon name="file"/>Gerar relatório</button><button className="danger-btn">Marcar como rejeitada/perdida</button>{currentStage<stages.length-1?<button className="primary">Avançar fase</button>:<button className="primary" onClick={onConvert}>Converter em operação</button>}</div></div>
    <button className="secondary report-mobile" onClick={()=>setReport(true)}><Icon name="file"/>Gerar relatório para investidores</button>
    <div className="phase-stepper">{stages.map((s,i)=><div className={i<=currentStage?"done":""} key={s}><i>{i+1}</i><span>{s}</span></div>)}</div>
    <div className="tabs">{tabs.map(t=><button className={tab===t?"active":""} onClick={()=>setTab(t)} key={t}>{t}</button>)}</div>
    {tab==="Histórico de fases"?<div className="panel table-panel"><Table headers={["Fase anterior","Nova fase","Data","Nota"]} rows={[["Contactado","Análise financeira","10/11/2026","Pressupostos iniciais lançados"],["Novo","Contactado","06/11/2026","Primeiro contacto com a proprietária"]]}/></div>
    :tab==="Análise financeira"?<div className="finance-layout"><article className="panel form-card"><div className="panel-head"><div><h2>Pressupostos financeiros</h2></div></div>
      <div className="form-grid">{field("Preço de compra","buy")}{field("IMT","tax")}{field("Imposto do selo","stamp")}{field("Escritura e registos","deed")}{field("Custo da obra","works")}{field("Preço de venda previsto","sale")}{field("Prazo previsto (meses)","months","meses")}</div>
      <div className="form-section"><h3>Comissão imobiliária</h3><p>Percentagem sobre o preço de venda previsto, acrescida de IVA. Entra no custo total.</p><div className="form-grid compact-grid">{field("Comissão","commission","%")}{field("IVA sobre a comissão","vat","%")}<div className="computed"><span>Valor da comissão</span><strong>{money(fin.commission)}</strong><small>{String(values.commission).replace(".",",")}% × {money(values.sale)} + IVA {values.vat}%</small></div></div></div>
      <div className="form-section"><h3>Outros custos</h3><p>Acrescente todos os custos que não estão acima.</p>
        <div className="extra-costs">{extras.map(x=><div key={x.id}><input value={x.label} placeholder="Descrição do custo" onChange={e=>setExtras(xs=>xs.map(y=>y.id===x.id?{...y,label:e.target.value}:y))}/><div className="input-suffix"><input type="number" value={x.value} onChange={e=>setExtras(xs=>xs.map(y=>y.id===x.id?{...y,value:Number(e.target.value)}:y))}/><i>€</i></div><button className="icon-btn" aria-label="Remover custo" onClick={()=>setExtras(xs=>xs.filter(y=>y.id!==x.id))}><Icon name="x" size={16}/></button></div>)}</div>
        <div className="extra-footer"><button className="secondary" onClick={()=>setExtras(xs=>[...xs,{id:Date.now(),label:"",value:0}])}><Icon name="plus"/>Adicionar custo</button><span>Total de outros custos <strong>{money(fin.other)}</strong></span></div></div>
    </article><aside className="results-card"><span>Análise de rentabilidade</span><small>Atualizada em tempo real</small><div><label>Investimento total</label><strong>{money(fin.cost)}</strong></div>
      <ul className="cost-breakdown"><li><span>Compra</span><b>{money(values.buy)}</b></li><li><span>IMT, selo e escritura</span><b>{money(values.tax+values.stamp+values.deed)}</b></li><li><span>Obra</span><b>{money(values.works)}</b></li><li><span>Comissão imobiliária (c/ IVA)</span><b>{money(fin.commission)}</b></li><li><span>Outros custos</span><b>{money(fin.other)}</b></li></ul>
      <div className="hero-result"><label>Margem estimada</label><strong>{money(fin.margin)}</strong><small>{values.sale?fmtPct(fin.margin/values.sale*100):"—"} sobre a venda</small></div><div className="result-split"><div><label>ROI</label><strong>{fmtPct(fin.roi)}</strong></div><div><label>ROI anualizado</label><strong>{fmtPct(fin.annual)}</strong></div></div><Pill tone={fin.roi>15?"green":"amber"}>{fin.roi>15?"Rentabilidade acima do objetivo":"Rever pressupostos"}</Pill></aside></div>
    :tab==="Documentos"?<div className="panel table-panel"><div className="notice info">Pode carregar documentos em qualquer fase, incluindo o due diligence (certidões, cadernetas, orçamentos de obra…). Ficam associados ao imóvel {oppProperty} e aparecem no menu Documentos.</div><div className="table-action"><strong>Documentos do imóvel</strong><select className="status-select" value={docType} onChange={e=>setDocType(e.target.value)}>{docTypes.map(t=><option key={t}>{t}</option>)}</select><label className="primary file-button"><Icon name="upload"/>Carregar documentos<input type="file" multiple onChange={upload}/></label></div>{docs.length?<Table headers={["Documento","Tipo","Imóvel","Entidade associada","Tamanho","Validade","Estado"]} rows={docs}/>:<p className="table-empty">Ainda não há documentos.</p>}</div>
    :<div className="detail-grid"><article className="panel info-card"><div className="panel-head"><div><h2>Informação principal</h2><p>Dados gerais deste registo.</p></div></div><div className="info-grid">{[["Tipologia","T2"],["Zona","Baixa · Coimbra"],["Área","86 m²"],["Preço pedido","128 000 €"],["VVR","215 000 €"],["Contacto","Marta Ribeiro"],["Data de visita","18/11/2026"]].map(([l,v])=><div key={l}><span>{l}</span><strong>{v}</strong></div>)}</div><div className="notes"><span>Observações</span><p>Imóvel com boa luz natural e excelente localização. Necessita renovação integral de cozinha, instalações sanitárias e rede elétrica.</p></div></article><aside className="panel activity"><div className="panel-head"><div><h2>Atividade recente</h2><p>Histórico do registo</p></div></div>{[["Hoje, 09:42","Análise financeira atualizada"],["14/11/2026","Contacto confirmou a visita"],["12/11/2026","Oportunidade criada"]].map(([d,t])=><div className="timeline" key={t}><i/><span><small>{d}</small><strong>{t}</strong></span></div>)}</aside></div>}
    {report&&<OpportunityReport title={title} values={values} extras={extras} onClose={()=>setReport(false)}/>}
  </>;
}

// Relatório de oportunidade para apresentar a investidores (imprimível / guardar em PDF)
function OpportunityReport({title,values,extras,onClose}:{title:string;values:FinanceValues;extras:ExtraCost[];onClose:()=>void}){
  const fin=calcFinance(values,extras);
  const photos=workPhotos.slice(0,2);
  return createPortal(<div className="report-backdrop">
    <div className="report-toolbar"><div><strong>Relatório de oportunidade</strong><span>Pré-visualização do documento para investidores</span></div><button className="secondary" onClick={onClose}>Fechar</button><button className="primary" onClick={()=>window.print()}><Icon name="download"/>Imprimir / guardar PDF</button></div>
    <article className="report">
      <header><div><span>ImoVentures · Oportunidade de investimento</span><h1>{title}</h1><p>Apartamento T2 · Baixa, Coimbra · 86 m²</p></div><div><small>Data do relatório</small><strong>{todayDay()}</strong></div></header>
      <div className="report-photos">{photos.map(p=><img key={p.id} src={p.url} alt={p.caption}/>)}</div>
      <section className="report-kpis">{[["Investimento total",money(fin.cost)],["Venda prevista",money(values.sale)],["Margem estimada",money(fin.margin)],["ROI",fmtPct(fin.roi)],["ROI anualizado",fmtPct(fin.annual)],["Prazo",`${values.months} meses`]].map(([l,v])=><div key={l}><span>{l}</span><strong>{v}</strong></div>)}</section>
      <div className="report-cols">
        <section><h2>O imóvel</h2><dl>{[["Tipologia","T2"],["Zona","Baixa · Coimbra"],["Área bruta privativa","86 m²"],["Ano de construção","1978"],["Estado de conservação","A renovar"],["Certificado energético","C"]].map(([l,v])=><div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}</dl>
          <h2>Estratégia</h2><p>Imóvel com boa luz natural e excelente localização. Renovação integral de cozinha, instalações sanitárias e rede elétrica, com posterior venda no mercado residencial.</p></section>
        <section><h2>Estrutura de custos</h2><dl>{[["Preço de compra",money(values.buy)],["IMT, selo e escritura",money(values.tax+values.stamp+values.deed)],["Obra",money(values.works)],[`Comissão imobiliária (${String(values.commission).replace(".",",")}% + IVA)`,money(fin.commission)],...extras.filter(x=>x.value).map(x=>[x.label||"Outro custo",money(x.value)])].map(([l,v],i)=><div key={i}><dt>{l}</dt><dd>{v}</dd></div>)}<div className="total"><dt>Investimento total</dt><dd>{money(fin.cost)}</dd></div></dl></section>
      </div>
      <footer>Valores estimados com base nos pressupostos da análise financeira à data do relatório. Documento confidencial, destinado apenas a investidores convidados.</footer>
    </article>
  </div>,document.body);
}

function GroupedOperations({onDetail}:{onDetail:(d:string)=>void}){
  const groups=[["Em aquisição",[["OP-2026-002","Solum","158 500 €","19,4%"]]],["Em obra",[["OP-2026-001","Baixa","172 400 €","22,8%"]]],["À venda",[["OP-2026-003","Santa Clara","342 800 €","25,1%"]]],["Vendido",[["OP-2025-014","Olivais","248 000 €","21,6%"]]]];
  return <div className="grouped-table">{groups.map(([g,rows])=><div key={g as string}><header><strong>{g as string}</strong><span>Subtotal capital: {(rows as string[][])[0][2]}</span></header>{(rows as string[][]).map(r=><button onClick={()=>onDetail(r[0])} key={r[0]}><b>{r[0]}</b><span>{r[1]}</span><em>{r[2]} · margem {r[3]}</em><Icon name="arrow"/></button>)}</div>)}</div>
}

function LeadDrawer({onClose}:{onClose:()=>void}){
  const [existing,setExisting]=useState("existing");
  return <div className="drawer-backdrop" onMouseDown={onClose}><aside className="drawer" onMouseDown={e=>e.stopPropagation()}><header><div><h2>Nova lead</h2><span>Novo registo comercial</span></div><button className="icon-btn" onClick={onClose}><Icon name="x"/></button></header><form><fieldset><legend>Contacto</legend><div className="choice"><button type="button" className={existing==="existing"?"active":""} onClick={()=>setExisting("existing")}>Escolher existente</button><button type="button" className={existing==="new"?"active":""} onClick={()=>setExisting("new")}>Criar novo</button></div>{existing==="existing"?<label><span>Contacto</span><select><option>Selecionar contacto…</option><option>Marta Ribeiro</option><option>João Noronha</option></select></label>:<><label><span>Nome</span><input placeholder="Nome completo"/></label><label><span>Telemóvel</span><input placeholder="9xx xxx xxx"/></label></>}</fieldset><fieldset><legend>Origem</legend><label><span>Origem</span><select><option>Idealista</option><option>Anúncio</option><option>Indicação</option><option>Site</option><option>Facebook/Instagram</option></select></label><label><span>Referenciado por</span><input placeholder="Nome do contacto"/></label><label><span>Mensagem recebida</span><textarea rows={5} placeholder="Mensagem original da lead"/></label></fieldset></form><footer><button className="secondary" onClick={onClose}>Cancelar</button><button className="primary" onClick={onClose}>Criar lead</button></footer></aside></div>
}

function EntityHeader({title,type,onBack,actions,image}:{title:string;type:string;onBack:()=>void;actions?:React.ReactNode;image?:string}){
  return <><button className="back" onClick={onBack}><Icon name="chevron"/>Voltar</button><div className="record-head"><div>{image&&<img className="record-photo" src={image} alt="Fotografia principal do imóvel"/>}<div><p>{type}</p><h1>{title}</h1></div></div><div className="actions">{actions||<button className="secondary">Editar</button>}</div></div></>
}

function WorkDetail({title,onBack}:{title:string;onBack:()=>void}){
  const [tab,setTab]=useState("Planeamento"); const tabs=["Resumo","Planeamento","Orçamento","Fotografias"];
  const [costs,setCosts]=useState(()=>[...workCosts]);
  const [importing,setImporting]=useState(false);
  const sum=(i:number)=>costs.reduce((t,r)=>t+euro(r[i]),0);
  const total=["Total",...[1,2,3,4,5].map(i=>money(sum(i))),"",(()=>{const done=costs.filter(r=>euro(r[3])>0);const b=done.reduce((t,r)=>t+euro(r[1]),0);return b?pct((done.reduce((t,r)=>t+euro(r[3]),0)/b-1)*100):"—";})()];
  return <><EntityHeader title={title} type="Obra · OP-2026-001" onBack={onBack} image={workCover}/><div className="tabs">{tabs.map(x=><button className={tab===x?"active":""} onClick={()=>setTab(x)} key={x}>{x}</button>)}</div>{tab==="Planeamento"?<Gantt/>:tab==="Orçamento"?<div className="panel table-panel"><div className="table-action"><Icon name="file"/>Contratos anexos disponíveis por rubrica<button className="secondary" onClick={()=>setImporting(true)}><Icon name="upload"/>Importar orçamento</button></div><Table headers={importConfigs.Orçamento.columns} rows={[...costs,total]}/>{importing&&<ImportExcel config={importConfigs.Orçamento} existing={costs} onClose={()=>setImporting(false)} onImport={added=>{workCosts.push(...added);setCosts([...workCosts]);}}/>}</div>:tab==="Fotografias"?<WorkPhotoFolders/>:<RecordFields fields={[["Estado","Em curso"],["Início previsto","03/11/2026"],["Fim previsto","30/11/2026"],["Empreiteiro principal","Miguel Seabra"],["Orçamento","45 800 €"],["Executado","31 970 €"]]}/>}</>
}

function Gantt(){
 const tasks=[["Demolição",2,14,2,16],["Canalização",15,20,17,22],["Eletricidade",28,19,31,17],["Carpintaria",48,25,50,0],["Pintura",72,17,0,0]];
 return <div className="panel gantt"><header><strong>Planeamento · fevereiro a maio de 2026</strong><span><i/>Previsto <i/>Real</span></header><div className="gantt-months"><span>Fev.</span><span>Mar.</span><span>Abr.</span><span>Mai.</span></div><div className="today-line"><b>Hoje</b></div>{tasks.map(([n,p,w,r,rw])=><div className="gantt-row" key={n as string}><strong>{n}</strong><div><i className="planned" style={{left:`${p}%`,width:`${w}%`}}/><i className="actual" style={{left:`${r}%`,width:`${rw}%`}}/></div></div>)}</div>
}

function OperationDetail({title,onBack}:{title:string;onBack:()=>void}){
 const [tab,setTab]=useState("Resumo");const tabs=["Resumo","Datas-chave","Investidores","Obras","Resultado","Documentos"];
 return <><EntityHeader title={title} type="Operação · Em obra" onBack={onBack}/><div className="tabs">{tabs.map(x=><button className={tab===x?"active":""} onClick={()=>setTab(x)} key={x}>{x}</button>)}</div>{tab==="Datas-chave"?<><div className="notice danger">A escritura de compra (10/11/2026) está registada antes do CPCV de compra (14/11/2026). Corrija as datas.</div><RecordFields fields={[["CPCV de compra","14/11/2026"],["Escritura de compra","10/11/2026"],["Colocação à venda","18/11/2026"],["CPCV de venda","—"],["Escritura de venda","—"],["Fecho","—"]]}/></>:tab==="Investidores"?<div className="panel table-panel"><div className="table-action"><button className="primary"><Icon name="plus"/>Adicionar investidor</button><span>Investidores já associados não voltam a aparecer.</span></div><Table headers={["Investidor","Comprometido","Participação","Tipo","Taxa","Data do acordo"]} rows={[["Ana Lourenço","80 000 €","46,4%","Retorno fixo","8,0%","08/11/2026"],["Manuel Gouveia","52 000 €","30,2%","Participação","25,0%","09/11/2026"]]}/></div>:tab==="Obras"?<div className="panel table-panel"><Table headers={["Obra","Estado","Início","Fim previsto","Orçamento","Executado","Desvio"]} rows={[["OB-2026-003","Em curso","03/11/2026","30/11/2026","45 800 €","31 970 €","+6,2%"]]}/></div>:tab==="Documentos"?<div className="panel table-panel"><Table headers={["Documento","Tipo","Data","Tamanho","Partilhado"]} rows={[["CPCV_compra_OP001.pdf","CPCV","14/11/2026","1,8 MB","Sim"],["Escritura_compra.pdf","Escritura","18/11/2026","2,4 MB","Não"],["Contrato_investimento.pdf","Contrato","09/11/2026","980 KB","Sim"]]}/></div>:tab==="Resultado"?<div className="panel table-panel"><Table headers={["Indicador","Previsto","Real","Diferença"]} rows={[["Custo total","172 400 €","178 250 €","−5 850 €"],["Receita","235 000 €","242 000 €","+7 000 €"],["Margem","62 600 €","63 750 €","+1 150 €"],["ROI","36,3%","35,8%","−0,5 p.p."]]}/></div>:<RecordFields fields={[["Imóvel","T2 · Baixa, Coimbra"],["Oportunidade de origem","OPO-1042"],["Preço real de compra","128 000 €"],["Preço anunciado","239 000 €"],["Preço final de venda","—"],["Comprador","—"]]}/>}</>
}

function ContactDetail({title,onBack}:{title:string;onBack:()=>void}){
 const [confirm,setConfirm]=useState(false);
 return <><EntityHeader title={title} type="Contacto" onBack={onBack} actions={<><button className="secondary">Exportar dados</button><button className="danger-btn" onClick={()=>setConfirm(true)}>Anonimizar</button></>}/><div className="detail-grid"><RecordFields fields={[["Email","marta.ribeiro@exemplo.pt"],["Telemóvel","912 345 678"],["NIF","247 891 320"],["Papel","Consultora imobiliária"],["Empresa","Casa Certa"],["Zona","Coimbra"]]}/><RecordFields title="Consentimento RGPD" fields={[["Consentimento","Sim"],["Data","12/11/2026"],["Via","Formulário do website"]]}/></div>{confirm&&<Dialog title="Anonimizar contacto" text="Esta ação remove os dados pessoais e não pode ser anulada." onClose={()=>setConfirm(false)}/>}</>
}
function InvestorDetail({title,onBack}:{title:string;onBack:()=>void}){
 return <><EntityHeader title={title} type="Investidor · Ativo" onBack={onBack}/><div className="detail-grid"><RecordFields fields={[["Capital disponível","180 000 €"],["Perfil de risco","Moderado"],["Zonas preferidas","Alta · Coimbra"],["Montantes","50 000 € – 120 000 €"],["Prazo preferido","8 – 18 meses"],["Retorno mínimo","8,0%"]]}/><RecordFields title="Condições" fields={[["Modelo","Retorno fixo"],["Disponibilidade","Imediata"],["Última revisão","03/11/2026"]]}/></div><div className="panel table-panel entity-table"><Table headers={["Operação","Imóvel","Valor investido","Participação","Retorno previsto","Fase"]} rows={[["OP-2026-001","Baixa, Coimbra","80 000 €","46,4%","6 400 €","Em obra"],["OP-2025-014","Olivais, Celas","65 000 €","26,2%","5 200 €","CPCV de venda"]]}/></div></>
}
function PropertyDetail({title,onBack}:{title:string;onBack:()=>void}){
 const [tab,setTab]=useState("Ficha técnica");
 return <><EntityHeader title={title} type="Ficha técnica do imóvel" onBack={onBack}/><div className="tabs">{["Ficha técnica","Ligações"].map(x=><button className={tab===x?"active":""} onClick={()=>setTab(x)} key={x}>{x}</button>)}</div>{tab==="Ligações"?<div className="panel table-panel"><Table headers={["Ligação","Código","Estado","Valor"]} rows={[["Oportunidade","OPO-1042","Em análise","128 000 €"],["Operação","OP-2026-001","Em obra","172 400 €"],["Obra","OB-2026-003","Em curso","45 800 €"]]}/></div>:<RecordFields fields={[["Morada","Rua da Sofia, 82, 2.º Dto."],["Distrito / Concelho","Coimbra / Coimbra"],["Freguesia","Coimbra (Sé Nova)"],["Tipo","Apartamento"],["Tipologia","T2"],["Estado de conservação","A renovar"],["Área bruta privativa","86,00 m²"],["Área dependente","12,50 m²"],["Ano de construção","1978"],["Artigo matricial","U-4821"],["Descrição predial","CRP Coimbra · 6382"],["Licença de utilização","LU-214/1978"],["Certificado energético","SCE 28401933 · C"],["Preço pedido","128 000 €"]]}/>}</>
}
// Fotografias exclusivas da obra, arrumadas numa pasta por dia. Tirar ou carregar sem pasta aberta → pasta de hoje.
function WorkPhotoFolders(){
 const today=todayDay();
 const [photos,setPhotos]=useState<WorkPhoto[]>(()=>workPhotos.map(p=>({...p})));
 const [emptyFolders,setEmptyFolders]=useState<string[]>([]);
 const [folder,setFolder]=useState<string|null>(null);
 const [open,setOpen]=useState<number|null>(null);
 const [creating,setCreating]=useState(false);
 const [newDate,setNewDate]=useState(()=>{const d=new Date();return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;});
 const folders=useMemo(()=>[...new Set([...photos.map(p=>p.date),...emptyFolders])].sort((a,b)=>parseDay(b).getTime()-parseDay(a).getTime()),[photos,emptyFolders]);
 const inFolder=folder?photos.filter(p=>p.date===folder):[];
 const target=folder??today;
 const addFiles=(files:FileList|null,day:string)=>{
  const images=files?Array.from(files):[].filter(f=>f.type.startsWith("image/"));
  if(!images.length) return;
  const added=images.map((f,i)=>({id:Date.now()+i,date:day,caption:f.name.replace(/\.[^.]+$/,""),visible:false,url:URL.createObjectURL(f)}));
  workPhotos.push(...added.map(p=>({...p})));
  setPhotos(ps=>[...ps,...added]); setFolder(day); setOpen(null);
 };
 const toggle=(id:number)=>{const source=workPhotos.find(p=>p.id===id);if(source)source.visible=!source.visible;setPhotos(ps=>ps.map(p=>p.id===id?{...p,visible:!p.visible}:p));};
 const createFolder=()=>{if(!newDate)return;const [y,m,d]=newDate.split("-");const day=`${d}/${m}/${y}`;if(!folders.includes(day))setEmptyFolders(f=>[...f,day]);setFolder(day);setCreating(false);};
 const pick=(day:string)=>(e:React.ChangeEvent<HTMLInputElement>)=>{addFiles(e.target.files,day);e.target.value="";};
 const count=(n:number)=>`${n} ${n===1?"fotografia":"fotografias"}`;
 return <div className="photo-library">
  <div className="photo-toolbar">
   {folder?<div className="photo-crumb"><button onClick={()=>{setFolder(null);setOpen(null);}}><Icon name="chevron" size={14}/>Todas as pastas</button><strong>{longDay(folder)}</strong><span>{folder}{folder===today?" · Hoje":""} · {count(inFolder.length)}</span></div>
    :<div><strong>Fotografias da obra</strong><span>{folders.length} {folders.length===1?"pasta":"pastas"} por dia · {count(photos.length)}</span></div>}
   {!folder&&<button className="secondary" onClick={()=>setCreating(true)}><Icon name="folder"/>Nova pasta</button>}
   <label className="secondary"><Icon name="upload"/>{folder?"Carregar para esta pasta":"Carregar fotografias"}<input type="file" accept="image/*" multiple onChange={pick(target)}/></label>
   <label className="primary camera-button"><Icon name="camera"/>Tirar fotografia<input type="file" accept="image/*" capture="environment" onChange={pick(today)}/></label>
  </div>
  <div className="photo-drop" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();addFiles(e.dataTransfer.files,target);}}><Icon name="upload"/><span>Arraste fotografias para aqui · {folder?`ficam na pasta de ${folder}`:`ficam na pasta de hoje (${today})`}</span></div>
  {!folder?(!folders.length?<div className="photo-empty">Ainda não há fotografias desta obra. Tire ou carregue as primeiras: ficam numa pasta com a data de hoje.</div>
   :<div className="folder-grid">{folders.map(day=>{const list=photos.filter(p=>p.date===day);const shown=list.filter(p=>p.visible).length;return <button className="folder-card" key={day} onClick={()=>setFolder(day)}>
     <div className={`folder-cover n${Math.min(list.length,3)}`}>{list.length?list.slice(0,3).map(p=><img key={p.id} src={p.url} alt=""/>):<Icon name="folder" size={30}/>}</div>
     <div className="folder-info"><strong>{longDay(day)}</strong><span>{day}{day===today?" · Hoje":""}</span><small>{count(list.length)}{list.length?` · ${shown} visíveis para investidores`:""}</small></div>
    </button>;})}</div>)
  :!inFolder.length?<div className="photo-empty">Esta pasta está vazia. Carregue ou tire fotografias para {folder}.</div>
   :<section className="photo-section"><div>{inFolder.map((p,i)=><article key={p.id}><button className="photo-open" onClick={()=>setOpen(i)}><img src={p.url} alt={p.caption}/></button><div><strong>{p.caption}</strong><label><input type="checkbox" checked={p.visible} onChange={()=>toggle(p.id)}/>Visível para investidores</label></div></article>)}</div></section>}
  {open!==null&&inFolder[open]&&<PhotoLightbox photos={inFolder} index={open} onIndex={setOpen} onClose={()=>setOpen(null)}/>}
  {creating&&<div className="dialog-backdrop" onMouseDown={()=>setCreating(false)}><div className="dialog" onMouseDown={e=>e.stopPropagation()}><h2>Nova pasta</h2><p>Cada pasta corresponde a um dia de obra.</p><label className="dialog-field"><span>Dia</span><input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)}/></label><footer><button className="secondary" onClick={()=>setCreating(false)}>Cancelar</button><button className="primary" onClick={createFolder}>Criar pasta</button></footer></div></div>}
 </div>;
}
function PhotoLightbox({photos,index,onIndex,onClose}:{photos:WorkPhoto[];index:number;onIndex:(i:number)=>void;onClose:()=>void}){
 const p=photos[index]; const go=(n:number)=>onIndex((n+photos.length)%photos.length);
 return <div className="lightbox"><button className="lightbox-close" onClick={onClose}><Icon name="x" size={26}/></button><button className="lightbox-prev" onClick={()=>go(index-1)}><Icon name="chevron" size={28}/></button><img src={p.url} alt={p.caption}/><button className="lightbox-next" onClick={()=>go(index+1)}><Icon name="chevron" size={28}/></button><footer><strong>{p.caption}</strong><time>{p.date}</time></footer></div>
}
function LeadDetail({title,onBack}:{title:string;onBack:()=>void}){
 const [discard,setDiscard]=useState(false);
 const [status,setStatus]=useState("Nova");
 return <><EntityHeader title={title} type="Lead" onBack={onBack} actions={<><select className="status-select" value={status} onChange={e=>setStatus(e.target.value)}><option>Nova</option><option>Contactada</option><option>Qualificada</option></select><button className="danger-btn" onClick={()=>setDiscard(true)}>Descartar</button><button className="primary">Converter em oportunidade</button></>}/><RecordFields fields={[["Referenciado por","Casa Certa"],["Zona","Baixa"],["Telemóvel","912 345 678"],["Origem","Anúncio"],["Data","14/11/2026"],["Estado",status],["Mensagem","Proprietária pretende vender apartamento T2 na Baixa de Coimbra."]]}/><div className="panel table-panel entity-table"><div className="table-action"><strong>Histórico de contactos</strong><button className="secondary"><Icon name="plus"/>Registar contacto</button></div><Table headers={["Data","Canal","Responsável","Resultado","Nota"]} rows={[["15/11/2026","Telefone","Rodrigo Mendes","Atendeu","Visita marcada para 18/11/2026"],["14/11/2026","Email","Rodrigo Mendes","Enviado","Pedido de documentação"]]}/></div>{discard&&<Dialog title="Descartar lead" text="Indique obrigatoriamente o motivo." requireReason onClose={()=>setDiscard(false)}/>}</>
}
function RecordFields({fields,title="Dados do registo"}:{fields:([string,React.ReactNode]|string[])[];title?:string}){
 return <article className="panel record-fields"><h2>{title}</h2><div>{fields.map(([l,v])=><dl key={l}><dt>{l}</dt><dd>{v}</dd></dl>)}</div></article>
}

const docMeta:Record<string,{by:string;at:string;shared:string;note:string;versions:[string,string,string][]}>={
 "CPCV_compra_OP001.pdf":{by:"Rodrigo Mendes",at:"14/11/2026",shared:"Sim · Ana Lourenço, Manuel Gouveia",note:"Contrato-promessa de compra assinado pelas duas partes.",versions:[["v2 · versão assinada","14/11/2026","Rodrigo Mendes"],["v1 · minuta","10/11/2026","Rodrigo Mendes"]]},
 "Certidão_permanente.pdf":{by:"Rodrigo Mendes",at:"22/05/2026",shared:"Não",note:"Certidão do registo predial. Renovar antes da escritura.",versions:[["v1","22/05/2026","Rodrigo Mendes"]]},
 "Orçamento_electricidade.xlsx":{by:"Miguel Seabra",at:"06/11/2026",shared:"Não",note:"Orçamento da rede elétrica para a obra.",versions:[["v2 · revisto","06/11/2026","Miguel Seabra"],["v1","02/11/2026","Miguel Seabra"]]},
 "Caderneta_predial_IM1042.pdf":{by:"Rodrigo Mendes",at:"12/11/2026",shared:"Não",note:"Caderneta predial urbana obtida no Portal das Finanças.",versions:[["v1","12/11/2026","Rodrigo Mendes"]]},
 "Caderneta_predial_IM1038.pdf":{by:"Rodrigo Mendes",at:"09/11/2026",shared:"Não",note:"Recebida durante a fase de informação pendente.",versions:[["v1","09/11/2026","Rodrigo Mendes"]]},
 "Certificado_energetico_IM1029.pdf":{by:"Rodrigo Mendes",at:"05/11/2026",shared:"Sim · Ana Lourenço",note:"Classe energética B-.",versions:[["v1","05/11/2026","Rodrigo Mendes"]]},
 "Licença_utilização_IM1018.pdf":{by:"Rodrigo Mendes",at:"04/11/2026",shared:"Não",note:"Licença de utilização emitida pela câmara municipal.",versions:[["v1","04/11/2026","Rodrigo Mendes"]]},
 "CC_Ana_Lourenço.pdf":{by:"Rodrigo Mendes",at:"03/11/2026",shared:"Não",note:"Cópia do documento de identificação, recolhida com consentimento RGPD.",versions:[["v1","03/11/2026","Rodrigo Mendes"]]},
};

function DocumentDetail({title,onBack}:{title:string;onBack:()=>void}){
 const row=genericData["Documentos"].rows.find(r=>r[0]===title)??[title,"—","—","—","—","—","—"];
 const [name,type,property,entity,size,validity,status]=row;
 const meta=docMeta[name]??{by:"—",at:"—",shared:"Não",note:"",versions:[]};
 const ext=(name.split(".").pop()||"").toUpperCase();
 const expiring=status==="A expirar";
 return <><EntityHeader title={name} type={`Documento · ${type}`} onBack={onBack} actions={<><button className="secondary"><Icon name="download"/>Descarregar</button><button className="primary"><Icon name="upload"/>Carregar nova versão</button></>}/>
  {expiring&&<div className="notice warning">Este documento expira a {validity}. Carregue uma versão atualizada antes dessa data.</div>}
  <RecordFields title="Dados do documento" fields={[["Tipo",type],["Imóvel",property],["Entidade associada",entity],["Estado",<Pill tone={expiring?"amber":"green"}>{status}</Pill>],["Validade",validity],["Formato",ext],["Tamanho",size],["Carregado por",meta.by],["Data de carregamento",meta.at],["Partilhado com investidores",meta.shared]]}/>
  <div className="doc-layout">
   <article className="panel"><div className="table-action"><strong>Pré-visualização</strong><button className="secondary">Abrir em ecrã inteiro</button></div><div className="doc-preview"><div className="doc-page" aria-hidden="true"><b>{ext}</b><strong>{name}</strong>{[100,94,98,72,0,96,88,100,64].map((w,i)=><i key={i} style={{width:`${w}%`}}/>)}</div></div></article>
   <aside className="panel activity"><div className="panel-head"><div><h2>Versões</h2><p>{meta.versions.length} {meta.versions.length===1?"versão":"versões"} carregadas</p></div></div>{meta.versions.map(([v,d,u])=><div className="timeline" key={v}><i/><span><small>{d} · {u}</small><strong>{v}</strong></span></div>)}{meta.note&&<div className="notes"><span>Observações</span><p>{meta.note}</p></div>}</aside>
  </div></>
}

const financeMeta:Record<string,{party:string;method:string;doc:string;note:string}>={
 "Adiantamento empreiteiro":{party:"Miguel Seabra · Empreiteiro",method:"Transferência bancária",doc:"Orçamento_electricidade.xlsx",note:"Adiantamento previsto no contrato de empreitada da obra."},
 "Tranche investidor":{party:"Manuel Gouveia · Investidor",method:"Transferência bancária",doc:"Contrato_investimento.pdf",note:"Tranche do capital comprometido na operação."},
 "Software de gestão":{party:"Fornecedor de software",method:"Débito direto",doc:"—",note:"Custo de estrutura, sem operação associada."},
 "Sinal CPCV venda":{party:"Comprador · OP-2025-014",method:"Transferência bancária",doc:"—",note:"Sinal a receber na assinatura do CPCV de venda."},
};

function FinanceDetail({title,onBack}:{title:string;onBack:()=>void}){
 const row=genericData["Finanças"].rows.find(r=>r[0]===title)??[title,"—","—","—","Previsto","0 €"];
 const [desc,cat,op,due,initialStatus,value]=row;
 const [status,setStatus]=useState(initialStatus);
 const [paidOn,setPaidOn]=useState(initialStatus==="Realizado"?due:"—");
 const meta=financeMeta[desc]??{party:"—",method:"—",doc:"—",note:""};
 const inflow=value.trim().startsWith("+");
 const done=status==="Realizado";
 return <><EntityHeader title={desc} type={`Movimento financeiro · ${cat}`} onBack={onBack} actions={<><button className="secondary">Editar</button>{!done&&<button className="primary" onClick={()=>{setStatus("Realizado");setPaidOn(todayDay());}}>Marcar como realizado</button>}</>}/>
  <div className="money-hero"><div><span>{inflow?"Entrada":"Saída"}</span><strong className={inflow?"in":"out"}>{value}</strong></div><div><span>Estado</span><Pill tone={done?"green":"amber"}>{status}</Pill></div><div><span>{done?"Data de realização":"Data prevista"}</span><strong>{done?paidOn:due}</strong></div><div><span>Operação</span><strong>{op}</strong></div></div>
  <div className="detail-grid"><RecordFields title="Dados do movimento" fields={[["Descrição",desc],["Tipo",inflow?"Entrada":"Saída"],["Categoria",cat],["Operação associada",op],["Data prevista",due],["Data de realização",paidOn],["Contraparte",meta.party],["Método de pagamento",meta.method],["Documento de suporte",meta.doc]]}/>
   <aside className="panel activity"><div className="panel-head"><div><h2>Notas</h2></div></div>{meta.note&&<p className="aside-note">{meta.note}</p>}{!done&&<div className="aside-action"><button className="primary" onClick={()=>{setStatus("Realizado");setPaidOn(todayDay());}}>Marcar como realizado</button></div>}</aside>
  </div></>
}
function Dialog({title,text,onClose,requireReason}:{title:string;text:string;onClose:()=>void;requireReason?:boolean}){
 return <div className="dialog-backdrop"><div className="dialog"><h2>{title}</h2><p>{text}</p>{requireReason&&<label><span>Motivo</span><select><option value="">Selecionar motivo…</option><option>Sem interesse do proprietário</option><option>Fora dos critérios de investimento</option><option>Preço não negociável</option></select></label>}<footer><button className="secondary" onClick={onClose}>Cancelar</button><button className="danger-btn" onClick={onClose}>Confirmar</button></footer></div></div>
}
function ImportExcel({config,existing,onClose,onImport}:{config:ImportConfig;existing:string[][];onClose:()=>void;onImport:(rows:string[][])=>void}){
 const [file,setFile]=useState<string|null>(null);
 const [rows,setRows]=useState<string[][]>([]);
 const known=new Set(existing.map(r=>r[0].toLowerCase()));
 const fresh=rows.filter(r=>!known.has(r[0].toLowerCase()));
 const dupes=rows.length-fresh.length;
 const pick=(e:React.ChangeEvent<HTMLInputElement>)=>{
  const f=e.target.files?.[0]; e.target.value=""; if(!f) return;
  setFile(f.name);
  // CSV é lido de verdade; para .xlsx o mockup mostra linhas de exemplo
  if(/\.(csv|txt)$/i.test(f.name)) f.text().then(t=>setRows(parseCsv(t,config.columns))); else setRows(config.sample);
 };
 return <div className="dialog-backdrop" onMouseDown={onClose}><div className="import-modal" onMouseDown={e=>e.stopPropagation()}><header><div><h2>{config.title}</h2><p>Preencha o template no Excel e carregue o ficheiro. Os registos aparecem logo na plataforma.</p></div><button className="icon-btn" onClick={onClose}><Icon name="x"/></button></header>
  <ol className="import-steps">
   <li><b>1</b><div><strong>Descarregar o template</strong><span>Colunas: {config.columns.join(" · ")}</span></div><button className="secondary" onClick={()=>downloadTemplate(config)}><Icon name="download"/>Descarregar template</button></li>
   <li><b>2</b><div><strong>Carregar o ficheiro preenchido</strong><span>{file??"Excel (.xlsx) ou CSV"}</span></div><label className="primary file-button"><Icon name="upload"/>{file?"Escolher outro":"Escolher ficheiro"}<input type="file" accept=".csv,.txt,.xlsx,.xls" onChange={pick}/></label></li>
  </ol>
  {file&&!rows.length&&<div className="notice warning">Não foram encontradas linhas no ficheiro. Confirme que usou o template.</div>}
  {dupes>0&&<div className="notice warning">{dupes} {dupes===1?"linha já existe":"linhas já existem"} na plataforma e {dupes===1?"não será importada":"não serão importadas"}.</div>}
  {rows.length>0&&<div className="panel table-panel"><Table headers={config.columns} rows={rows}/></div>}
  <footer><button className="secondary" onClick={onClose}>Cancelar</button><button className="primary" disabled={!fresh.length} onClick={()=>{onImport(fresh);onClose();}}>{fresh.length?`Importar ${fresh.length} ${fresh.length===1?"linha":"linhas"}`:"Importar"}</button></footer></div></div>
}
function InvestorPortal({onExit}:{onExit:()=>void}){
 const photos=workPhotos.filter(p=>p.visible);
 return <div className="portal"><header><strong>ImoVentures <i>Portal do investidor</i></strong><div><span>Ana Lourenço</span><button className="secondary" onClick={onExit}>Sair do portal</button></div></header><main><PageHeading title="As minhas operações" description=""/><div className="portal-summary"><div><span>Capital investido</span><strong>145 000 €</strong></div><div><span>Retorno previsto</span><strong>11 600 €</strong></div><div><span>Operações ativas</span><strong>2</strong></div></div>{[["OP-2026-001","T2 · Baixa, Coimbra","Em obra","80 000 €","6 400 €"],["OP-2025-014","T2 · Olivais, Celas","CPCV de venda","65 000 €","5 200 €"]].map((r)=><article className="portal-operation" key={r[0]}><header><div><b>{r[0]}</b><h2>{r[1]}</h2></div><Pill tone="green">{r[2]}</Pill></header><dl><div><dt>Valor investido</dt><dd>{r[3]}</dd></div><div><dt>Retorno previsto</dt><dd>{r[4]}</dd></div><div><dt>Prazo previsto</dt><dd>6 meses</dd></div></dl><div className="portal-photos">{photos.map(p=><img key={p.id} src={p.url} alt={p.caption}/>)}</div><footer><button className="secondary"><Icon name="file"/>Documentos partilhados</button></footer></article>)}</main></div>
}

function Settings({onPortal}:{onPortal:()=>void}){
  return <><PageHeading title="Definições" description=""/><div className="settings-grid">{[["Utilizadores e permissões","Equipa, funções e níveis de acesso.","users"],["Limites de alerta","Follow-ups: 3 dias · Fases: 10 dias · Desvio de obra: 10%.","bell"],["Categorias financeiras","Rubricas, impostos e centros de custo.","chart"],["Portal do investidor","Abrir vista de Ana Lourenço.","wallet"]].map(([t,d,i])=><button onClick={t==="Portal do investidor"?onPortal:undefined} className="panel setting-card" key={t}><i><Icon name={i as IconName}/></i><div><h2>{t}</h2><p>{d}</p></div><Icon name="arrow"/></button>)}</div><div className="settings-detail"><article className="panel table-panel"><div className="table-action"><strong>Utilizadores e permissões</strong><button className="primary"><Icon name="plus"/>Adicionar utilizador</button></div><Table headers={["Nome","Tipo","Acesso","Operações visíveis"]} rows={[["Rodrigo Mendes","Administrador","Ativo","Todas"],["Ana Lourenço","Investidora","Ativo","OP-2026-001 · OP-2025-014"],["Manuel Gouveia","Investidor","Inativo","OP-2026-001"]]}/></article><article className="panel source-editor"><div className="table-action"><strong>Origens das leads</strong><button className="secondary"><Icon name="plus"/>Adicionar origem</button></div>{leadSources.map(x=><div key={x}><span>{x}</span><button>Editar</button></div>)}</article></div></>;
}

export default App;
