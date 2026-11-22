import type { LocalDate } from "@/model/entities/localDate";
import type { DayChangeListener, IDayChangeService } from "@/model/services/iDayChangeService";

/**
 * Implementação Fake de `IDayChangeService` para simular a virada do dia,
 * retorno do segundo plano em outro dia ou mudança de fuso nos testes automatizados (issue #210).
 */
export class FakeDayChangeService implements IDayChangeService {
  private readonly listeners = new Set<DayChangeListener>();

  subscribe(listener: DayChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emitDayChange(newDate: LocalDate): void {
    for (const listener of [...this.listeners]) {
      listener(newDate);
    }
  }

  get listenerCount(): number {
    return this.listeners.size;
  }
}
