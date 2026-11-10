import { describe, expect, it } from "vitest";
import { a51Stage, A51_STAGES, stageVariant, treeLayout } from "../src/features/garden/a51/stages";
import { STAGES, sampleDisplacement, createMesh, project, windPose } from "../src/features/garden/a51/engine/motion-model";
import { initialData, decodeData } from "../src/state/model";
describe("A51 als Darstellung bestehender OLIVA-Daten", () => {
  it("bewahrt sieben unterscheidbare Originalstadien und die Darstellung kleiner Anfänge", () => {
    expect(A51_STAGES).toHaveLength(7);
    expect(new Set(A51_STAGES.map(s=>s.sourceSHA256)).size).toBe(7);
    expect(a51Stage(-1).index).toBe(0);expect(a51Stage(9).index).toBe(0);
    for(const stage of A51_STAGES) {
      expect(stage.variants.map(v=>v.width)).toEqual([384,640,1024]);
      const frame=treeLayout(stage,280);
      expect(frame.height).toBeGreaterThan(80);
      expect(frame.left).toBeGreaterThanOrEqual(0);
      expect(frame.bottom).toBeGreaterThanOrEqual(0);
      expect(stageVariant(stage,380,3).width).toBeGreaterThanOrEqual(384);
    }
  });
  it("verändert weder V4/V5-Fortschritt noch Notizen beim Wechsel des Bildes", () => {
    for(let index=0;index<7;index++) {
      const data=initialData();data.name="Ada";data.growthStage=index;
      const before=JSON.stringify(data);
      for(const s of A51_STAGES) { treeLayout(s,320);stageVariant(s,320,3); }
      expect(JSON.stringify(data)).toBe(before);
      const {readingPosition,retainedReviewGrowth, invitations,ntStudy,...legacy}=data;
      const upgraded=decodeData({...legacy,version:4});
      expect(upgraded.growthStage).toBe(index);expect(upgraded.name).toBe("Ada");
    }
  });
  it("hält alle anatomischen Holzachsen und den Samen in Ruhe", () => {
    for(const stage of STAGES) for(const point of stage.probes) for(const ms of [0,10000,30000,120000]) {
      expect(sampleDisplacement(point[0]!,point[1]!,ms,stage,280)).toEqual([0,0]);
    }
    for(const ms of [1000,30000,120000]) expect(windPose(ms,0).x.every(v => v === 0)).toBe(true);
    expect(windPose(10000,6)).not.toEqual(windPose(30000,6));
  });
  it("hält die bewegten Netze bei allen Qualitätsstufen durchgängig und unverfaltet", () => {
    for(const stage of STAGES) for(const cells of [48,64,80]) {
      const mesh=createMesh(stage,cells);
      for(const ms of [0,13500,30000,79700,120000]) {
        const pose=windPose(ms,stage.index),points=mesh.points.map((p,i)=>project(p,mesh.weights[i]!,pose,stage,200));
        for(let i=0;i<mesh.indices.length;i+=3) {
          const a=points[mesh.indices[i]!]!,b=points[mesh.indices[i+1]!]!,c=points[mesh.indices[i+2]!]!;
          const area=(b[0]!-a[0]!)*(c[1]!-a[1]!)-(b[1]!-a[1]!)*(c[0]!-a[0]!);
          if(!(area>0)) throw new Error(`${stage.name}: gefaltetes Netz bei ${ms}/${cells}`);
        }
      }
    }
  });
});
