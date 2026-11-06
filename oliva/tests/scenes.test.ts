import {describe,it,expect} from 'vitest';
import {SCENES,sceneFor} from '../src/features/bible/scenes';
import {validReference,getPassage} from '../src/features/bible/repository';
describe('Szenen mit ausdrücklichem Textbereich',()=>{
 it('verweist auf vier vorhandene Abschnitte und ordnet spätere Verse keinem fremden Abschnitt zu',()=>{
  expect(SCENES).toHaveLength(4);expect(new Set(SCENES.map(s=>s.id)).size).toBe(4);
  for(const scene of SCENES){expect(validReference(scene.ref)).toBe(true);expect(getPassage(scene.ref).length).toBeGreaterThan(0);expect(sceneFor(scene.ref)?.id).toBe(scene.id);expect(scene.interpretation.length).toBeGreaterThan(40);}
  expect(sceneFor({book:'MRK',chapter:16,from:9,to:20})).toBeUndefined();expect(sceneFor({book:'GEN',chapter:15})?.id).toBe('abraham');
 });
});
