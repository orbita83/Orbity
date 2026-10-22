import type { FocusSheetStage } from "./use-home-view-model";
import { cosmicTokens as t } from "../view/theme/tokens";

export type ActivitySheetSnapPoints = {
  collapsed: number;
  stage1_1: number;
  stage1_2: number;
};

const STAGES: readonly FocusSheetStage[] = ["collapsed", "stage1_1", "stage1_2"];

export const createSheetSnapPoints = (sceneHeight: number, expandedTop: number): ActivitySheetSnapPoints => {
  const collapsed = Math.max(expandedTop + 2, sceneHeight);
  return {
    collapsed,
    stage1_1: Math.max(expandedTop + 1, Math.min(collapsed - 1, sceneHeight * t.layout.intermediateTop)),
    stage1_2: expandedTop,
  };
};

export const clampSheetTop = (top: number, snaps: ActivitySheetSnapPoints): number =>
  Math.max(snaps.stage1_2, Math.min(snaps.collapsed, top));

export const resolveSheetRelease = (
  stage: FocusSheetStage,
  startTop: number,
  distance: number,
  velocity: number,
  snaps: ActivitySheetSnapPoints,
): FocusSheetStage => {
  const deliberateDrag = Math.abs(distance) >= t.sheetGesture.commitDistance;
  const flick = Math.abs(distance) >= t.sheetGesture.activationDistance &&
    Math.abs(velocity) >= t.sheetGesture.velocityThreshold &&
    Math.sign(velocity) === Math.sign(distance);
  if (!deliberateDrag && !flick) return stage;

  const projectedTop = clampSheetTop(
    startTop + distance + velocity * t.sheetGesture.projectionDuration,
    snaps,
  );
  const nearest = STAGES.reduce((best, candidate) =>
    Math.abs(snaps[candidate] - projectedTop) < Math.abs(snaps[best] - projectedTop)
      ? candidate : best, stage);
  const index = STAGES.indexOf(stage);
  const nearestIndex = STAGES.indexOf(nearest);
  const direction = distance > 0 ? -1 : 1;

  // Um swipe curto intencional avança um estágio; um arraste longo pode
  // atravessar ambos. Pequenos movimentos voltam ao estágio de origem.
  const nextIndex = direction < 0
    ? Math.min(nearestIndex, index - 1)
    : Math.max(nearestIndex, index + 1);
  return STAGES[Math.max(0, Math.min(STAGES.length - 1, nextIndex))];
};
