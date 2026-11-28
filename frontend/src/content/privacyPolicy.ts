export interface PrivacyPolicySection {
  id: string;
  title: string;
  paragraphs: string[];
  items?: string[];
}

export interface PrivacyPolicyDocument {
  title: string;
  version: string;
  updatedAt: string;
  intro: string;
  // TODO(cliente): Confirmar com o cliente a entidade jurídica titular (no site atual surge a Reclick)
  // e o prazo exato de conservação dos dados pessoais.
  controller: {
    name: string;
    address: string;
    nipc: string;
    phone: string;
    email: string;
  };
  sections: PrivacyPolicySection[];
}

export const privacyPolicy: PrivacyPolicyDocument = {
  title: "Política de Privacidade",
  version: "1.0",
  updatedAt: "2026-11-28",
  intro:
    "A presente Política de Privacidade descreve a forma como recolhemos, tratamos e protegemos os dados pessoais tratados na plataforma ImoVentures, em conformidade com o Regulamento Geral sobre a Proteção de Dados (Regulamento (UE) 2016/679 — RGPD) e com a legislação nacional aplicável.",
  controller: {
    name: "Reclick - Comunicação e Imagem, Lda. (entidade a confirmar com o cliente)",
    address: "Avenida das Túlipas, n.º 36, 1.º Andar, 1495-159 Algés",
    nipc: "517269805",
    phone: "+351 914 300 071",
    email: "info@imoinvestors.pt",
  },
  sections: [
    {
      id: "responsavel",
      title: "1. Identificação do responsável pelo tratamento",
      paragraphs: [
        "O responsável pelo tratamento dos dados pessoais recolhidos e tratados no âmbito da atividade da ImoVentures é:",
      ],
      items: [
        "Entidade: Reclick - Comunicação e Imagem, Lda. (entidade a confirmar com o cliente)",
        "Sede: Avenida das Túlipas, n.º 36, 1.º Andar, 1495-159 Algés",
        "NIPC: 517269805",
        "Telefone: +351 914 300 071",
        "Email: info@imoinvestors.pt",
      ],
    },
    {
      id: "informacao-consentimento",
      title: "2. Informação e consentimento (RGPD)",
      paragraphs: [
        "Nos termos do Regulamento (UE) 2016/679 do Parlamento Europeu e do Conselho (RGPD) e da Lei n.º 58/2019 (Lei da Proteção de Dados Pessoais), o tratamento de dados pessoais assenta na transparência, lealdade e minimização dos dados recolhidos.",
        "Ao disponibilizar os seus dados pessoais e prestar consentimento expresso, o titular autoriza o respetivo tratamento para as finalidades descritas nesta política. Nunca solicitamos nem tratamos categorias especiais de dados pessoais (dados sensíveis), tais como origem racial ou étnica, opiniões políticas, convicções religiosas, dados de saúde ou orientação sexual.",
      ],
    },
    {
      id: "categorias-dados",
      title: "3. Categorias de dados pessoais recolhidos",
      paragraphs: [
        "Recolhemos apenas os dados estritamente necessários à gestão de pedidos de contacto, avaliação de imóveis e acompanhamento comercial:",
      ],
      items: [
        "Dados de identificação: nome completo e eventual referência da empresa.",
        "Dados de contacto: número de telefone, endereço de correio eletrónico e morada.",
        "Dados do imóvel: localização/zona, tipologia, área, estado de conservação, valor pretendido e informações complementares fornecidas pelo titular para avaliação ou proposta.",
      ],
    },
    {
      id: "finalidades-fundamento",
      title: "4. Finalidades e fundamento legal do tratamento",
      paragraphs: [
        "Os dados pessoais recolhidos são tratados exclusivamente para as seguintes finalidades:",
      ],
      items: [
        "Elaboração e apresentação de propostas de compra e venda de imóveis e agendamento de visitas.",
        "Comunicações de marketing e envio de informações comerciais relevantes, mediante consentimento prévio.",
        "Manutenção da relação comercial, gestão de contactos e prestação de esclarecimentos solicitados.",
        "Análise estatística interna e melhoria contínua dos serviços prestados.",
      ],
    },
    {
      id: "fundamento-legal",
      title: "5. Fundamento legal",
      paragraphs: [
        "O fundamento legal para a recolha e tratamento dos dados pessoais é o consentimento explícito prestado pelo titular dos dados (alínea a) do n.º 1 do artigo 6.º do RGPD), bem como a realização de diligências pré-contratuais a pedido do titular quando aplicável (alínea b) do n.º 1 do artigo 6.º do RGPD).",
        "O titular pode retirar o seu consentimento a qualquer momento, sem que isso comprometa a licitude do tratamento efetuado com base no consentimento previamente dado.",
      ],
    },
    {
      id: "conservacao",
      title: "6. Prazo de conservação dos dados",
      paragraphs: [
        "Os dados pessoais são conservados apenas durante o período necessário para as finalidades que motivaram a sua recolha ou enquanto subsistir o consentimento do titular.",
        "Como regra indicativa (prazo final a definir com o cliente), os dados de contactos e pedidos de proposta sem operação concluída são conservados pelo prazo máximo de 24 meses após a última interação relevante, findo o qual são eliminados ou anonimizados de forma segura, salvo obrigação legal ou fiscal que imponha prazo superior.",
      ],
    },
    {
      id: "medidas-seguranca",
      title: "7. Medidas de segurança",
      paragraphs: [
        "O responsável pelo tratamento aplica medidas técnicas e organizativas adequadas para proteger os dados pessoais contra destruição, perda, alteração, divulgação ou acesso não autorizado, incluindo controlo de acessos autenticado, proteção de sessão e comunicações cifradas.",
        "Não obstante os controlos implementados, recorda-se que a circulação de dados em redes abertas (Internet) comporta riscos residuais de segurança fora do controlo exclusivo da plataforma.",
      ],
    },
    {
      id: "cookies",
      title: "8. Uso de cookies",
      paragraphs: [
        "A plataforma utiliza cookies estritamente necessários ao funcionamento técnico, autenticação de sessão e proteção contra pedidos fraudulentos (CSRF). Não são utilizados cookies publicitários ou de rastreamento de terceiros nesta área privada.",
        "O utilizador pode configurar o seu navegador para bloquear ou eliminar cookies; contudo, a desativação de cookies estritamente necessários poderá impedir o funcionamento normal da sessão.",
      ],
    },
    {
      id: "direitos-cnpd",
      title: "9. Exercício dos direitos e reclamação à CNPD",
      paragraphs: [
        "Nos termos da legislação aplicável, o titular dos dados pode exercer a qualquer momento os seguintes direitos:",
      ],
      items: [
        "Direito de acesso aos seus dados pessoais e às informações sobre o respetivo tratamento.",
        "Direito de retificação de dados inexatos ou incompletos.",
        "Direito ao apagamento dos dados («direito a ser esquecido»), nos termos legais.",
        "Direito à limitação do tratamento.",
        "Direito à portabilidade dos dados fornecidos, em formato estruturado e de leitura automática.",
        "Direito de oposição ao tratamento, incluindo para efeitos de marketing direto.",
      ],
    },
  ],
};
