// Synthetic, deterministic fixtures shared by captures and acceptance tests.
import fs from 'node:fs';
import {todayFixture,TEST_NOW} from './today-phase1-fixtures.mjs';
export {TEST_NOW};
export const books=JSON.parse(fs.readFileSync('data/index.json'));
export const flow=JSON.parse(fs.readFileSync('data/faithpath-nachlese-story-flow.json'));
export const sampleStory=flow.stories[0];
export function phase2Fixture(theme='light',chapters=1){
 const {data}=todayFixture('returning',theme);data.events=[];
 let n=0;for(const book of books)for(let chapter=1;chapter<=book.chapters;chapter++)if(n++<chapters)data.events.push({id:`phase2-${book.code}-${chapter}`,kind:'chapter-explored',at:'2026-10-15T12:00:00.000Z',ref:{book:book.code,chapter}});
 return data;
}
