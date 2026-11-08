import type { AnatomicalStage, WindPose } from "../types";
export const STAGES: AnatomicalStage[];
export function windPose(ms: number, index?: number): WindPose;
export function restPose(): WindPose;
export function mixPose(a: WindPose, b: WindPose, t: number): WindPose;
export function weightsAt(x: number, y: number, stage: AnatomicalStage): number[];
export function sampleDisplacement(x: number, y: number, ms: number, stage: AnatomicalStage, width?: number): number[];
export function project(point: number[], weights: number[], pose: WindPose, stage: AnatomicalStage, width: number): number[];
export function createMesh(stage: AnatomicalStage, cells?: number): { points: number[][]; weights: number[][]; indices: number[]; cells: number };
