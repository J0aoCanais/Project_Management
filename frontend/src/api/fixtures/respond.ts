// TODO: remover com o resto do servidor simulado quando os endpoints existirem.

const LATENCY_MS = 150;

/** Simula a latência e devolve uma cópia, como se viesse da rede (alterar a resposta não altera o "servidor"). */
export async function respond<T>(value: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  return structuredClone(value);
}
