// Os 3 casos da folha de cálculo do cliente. Corre com `npm test` (Node ≥ 22.18, sem dependências).
import assert from "node:assert/strict";
import { test } from "node:test";

import { netReturn, taxRate, type CaepTerm, type InvestorKind } from "../src/lib/taxRules.ts";

// Lucro estimado com impostos de 47 037,39 €, num prazo de 6 meses. O capital dá os 20,3% de cash-on-cash da folha.
const base = { grossProfit: 47037.39, investedCapital: 231700, termMonths: 6 };
const round1 = (value: number) => Math.round(value * 10) / 10;

const cases: { kind: InvestorKind; caep: CaepTerm; rate: number; net: number; coc: number; annual: number }[] = [
  { kind: "Empresa", caep: "Mais de 1 ano", rate: 0, net: 47037.39, coc: 20.3, annual: 40.6 },
  { kind: "Empresa", caep: "Menos de 1 ano", rate: 19, net: 38100.28, coc: 16.4, annual: 32.9 },
  { kind: "Particular", caep: "Menos de 1 ano", rate: 28, net: 33866.92, coc: 14.6, annual: 29.2 },
];

for (const item of cases) {
  test(`${item.kind}, CAEP ${item.caep.toLowerCase()}`, () => {
    const result = netReturn({ ...base, kind: item.kind, caep: item.caep });
    assert.equal(result.taxRate, item.rate);
    assert.equal(result.netProfit, item.net);
    assert.equal(Math.round((result.tax + result.netProfit) * 100), Math.round(base.grossProfit * 100));
    assert.equal(round1(result.cashOnCash), item.coc);
    assert.equal(round1(result.annualized), item.annual);
  });
}

test("particular com CAEP superior a 1 ano usa o IRS por defeito", () => {
  assert.equal(taxRate("Particular", "Mais de 1 ano"), 28);
});

test("um prejuízo não paga imposto", () => {
  const result = netReturn({ ...base, grossProfit: -1000, kind: "Empresa", caep: "Menos de 1 ano" });
  assert.equal(result.tax, 0);
  assert.equal(result.netProfit, -1000);
});

test("sem capital nem prazo, os retornos ficam a 0", () => {
  const result = netReturn({ grossProfit: 1000, investedCapital: 0, termMonths: 0, kind: "Empresa", caep: "Mais de 1 ano" });
  assert.equal(result.cashOnCash, 0);
  assert.equal(result.annualized, 0);
});
