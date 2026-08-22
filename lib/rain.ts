/**
 * Estado compartilhado da chuva de balas.
 *
 * Cada seção de produto escreve sua própria intensidade (0–1) enquanto o
 * usuário rola. O canvas lê o vencedor a cada frame, então nada disso passa
 * pelo ciclo de render do React — o scroll continua a 60fps mesmo com
 * centenas de partículas na tela.
 */

export type RainEntry = {
  /** sprite da bala — PNG com transparência */
  src: string;
  /** 0 = sem chuva, 1 = pico */
  intensity: number;
  /** lado maior do sprite em px */
  size: number;
  /** partículas por segundo no pico */
  rate: number;
  /** giro máximo em graus por segundo */
  spin: number;
};

const entries = new Map<string, RainEntry>();

export function setRain(id: string, entry: RainEntry): void {
  entries.set(id, entry);
}

export function clearRain(id: string): void {
  entries.delete(id);
}

/** A seção com maior intensidade manda na chuva. */
export function activeRain(): RainEntry | null {
  let best: RainEntry | null = null;
  for (const entry of entries.values()) {
    if (entry.intensity > 0.01 && (!best || entry.intensity > best.intensity)) {
      best = entry;
    }
  }
  return best;
}
