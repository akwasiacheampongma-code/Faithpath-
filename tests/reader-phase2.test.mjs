import test from 'node:test';import assert from 'node:assert/strict';
import {chapterOffer,chapterNavigation} from '../src/reader-view.js';
test('optional chapter offer preserves canonical unit, count and escaped return route',()=>{
 assert.equal(chapterOffer(null), '');
 const html=chapterOffer({unit:{id:10070,questions:Array(5)},quizRoute:'quiz/10070?return=a&origin=b',done:true});
 assert.match(html,/Was hast du verstanden\?/);assert.match(html,/5 vorhandene Fragen/);assert.match(html,/data-unit-id="10070"/);assert.match(html,/return=a&amp;origin=b/);assert.match(html,/Später/);assert.match(html,/bereits angesehen/);
});
test('chapter navigation has explicit accessible landmark and optional boundary links',()=>{
 const html=chapterNavigation({previous:'read/JHN/2/otb?origin=merged-story%2FNS-0001',next:null});
 assert.match(html,/aria-label="Kapitel wechseln"/);assert.match(html,/Vorheriges Kapitel/);assert.doesNotMatch(html,/Nächstes Kapitel/);
 assert.match(chapterNavigation({next:'read/JHN/4/l1912'}),/Nächstes Kapitel/);
});

test('a chapter end already visible on opening requires explicit exploration',async()=>{
 const {initiallyVisibleChapterEnd}=await import('../src/reader-view.js');
 assert(initiallyVisibleChapterEnd({top:600,bottom:601,scrollY:0,topbarBottom:70,navTop:774}));
 assert(!initiallyVisibleChapterEnd({top:900,bottom:901,scrollY:0,topbarBottom:70,navTop:774}));
 // Opening from a scrolled previous view must use document coordinates, not stale scroll.
 assert(!initiallyVisibleChapterEnd({top:100,bottom:101,scrollY:800,topbarBottom:70,navTop:774}));
});
