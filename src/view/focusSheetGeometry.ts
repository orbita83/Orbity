/**
 * Geometria pura do painel deslizante da Home (apoio da animação em `useFocusSheetMotion`).
 * As proporções e os limiares do gesto são constantes de comportamento, não tokens visuais
 * (tabela de tokens da Etapa 0.2a em docs/designs/tela-inicial-base.md).
 */

import type { FocusSheetStage } from "../viewmodel/useHomeViewModel";

export type SheetGeometryConfig = {
  /** Altura da área da cena, sem a barra de abas. */
  sceneHeight: number;
  /** Topo do painel quando totalmente aberto (logo abaixo do cabeçalho). */
  expandedTop: number;
  /** Quanto do painel continua visível quando recolhido (0 = some por inteiro). */
  collapsedHeight: number;
};

export type ActivitySheetSnapPoints = Record<FocusSheetStage, number>;

/**
 * Topo do estágio intermediário, como fração da altura da cena.
 * Protótipo do Claude Design: painel em 268 dp numa cena de 756 dp (844 menos a barra de abas).
 */
export const INTERMEDIATE_TOP_RATIO = 0.354;

export type ArtworkPose = {
  /** Deslocamento vertical do centro do planeta, como fração da altura da cena. */
  offset: number;
  /** Escala em relação ao planeta do estágio recolhido. */
  scale: number;
  opacity: number;
};

/**
 * Pose do planeta em cada estágio, tirada do protótipo: 320 dp centrado em 356 dp quando recolhido,
 * 190 dp centrado em 159 dp no intermediário e escondido sob o painel quando expandido.
 */
export const ARTWORK_POSE: Record<FocusSheetStage, ArtworkPose> = {
  collapsed: { offset: 0, scale: 1, opacity: 1 },
  stage1_1: { offset: -0.261, scale: 0.594, opacity: 1 },
  stage1_2: { offset: -0.33, scale: 0.45, opacity: 0 },
};

export const SHEET_GESTURE = {
  /** Distância mínima (dp) para o gesto começar. */
  activationDistance: 10,
  /** Arraste deliberado (dp) que troca de estágio. */
  commitDistance: 48,
  /** Velocidade (dp/ms) que conta como "flick". */
  velocityThreshold: 0.55,
  /** Projeção (ms) da velocidade para achar o estágio mais próximo. */
  projectionDuration: 160,
} as const;

const STAGES: readonly FocusSheetStage[] = ["collapsed", "stage1_1", "stage1_2"];

export const createSheetSnapPoints = ({
  sceneHeight,
  expandedTop,
  collapsedHeight,
}: SheetGeometryConfig): ActivitySheetSnapPoints => {
  const collapsed = Math.max(expandedTop + 2, sceneHeight - collapsedHeight);
  return {
    collapsed,
    stage1_1: Math.max(expandedTop + 1, Math.min(collapsed - 1, sceneHeight * INTERMEDIATE_TOP_RATIO)),
    stage1_2: expandedTop,
  };
};

export const clampSheetTop = (top: number, snaps: ActivitySheetSnapPoints): number =>
  Math.max(snaps.stage1_2, Math.min(snaps.collapsed, top));

/**
 * Decide o estágio ao soltar o painel. Um swipe curto intencional avança um estágio;
 * um arraste longo pode atravessar os dois. Movimentos pequenos voltam ao estágio de origem.
 */
export const resolveSheetRelease = (
  stage: FocusSheetStage,
  startTop: number,
  distance: number,
  velocity: number,
  snaps: ActivitySheetSnapPoints,
): FocusSheetStage => {
  const deliberateDrag = Math.abs(distance) >= SHEET_GESTURE.commitDistance;
  const flick =
    Math.abs(distance) >= SHEET_GESTURE.activationDistance &&
    Math.abs(velocity) >= SHEET_GESTURE.velocityThreshold &&
    Math.sign(velocity) === Math.sign(distance);
  if (!deliberateDrag && !flick) return stage;

  const projectedTop = clampSheetTop(
    startTop + distance + velocity * SHEET_GESTURE.projectionDuration,
    snaps,
  );
  const nearest = STAGES.reduce(
    (best, candidate) =>
      Math.abs(snaps[candidate] - projectedTop) < Math.abs(snaps[best] - projectedTop) ? candidate : best,
    stage,
  );
  const index = STAGES.indexOf(stage);
  const nearestIndex = STAGES.indexOf(nearest);
  const nextIndex = distance > 0 ? Math.min(nearestIndex, index - 1) : Math.max(nearestIndex, index + 1);
  return STAGES[Math.max(0, Math.min(STAGES.length - 1, nextIndex))];
};
