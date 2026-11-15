/** Durações pré-definidas do Modo Foco (RF-0019), sem valor livre. */
export type FocusDuration = 5 | 10 | 15 | 20 | 25 | 30;

export const FOCUS_DURATIONS: readonly FocusDuration[] = [5, 10, 15, 20, 25, 30];

/** Duração selecionada por padrão (D12). */
export const DEFAULT_FOCUS_DURATION: FocusDuration = 15;

export function isFocusDuration(value: number): value is FocusDuration {
  return (FOCUS_DURATIONS as readonly number[]).includes(value);
}
