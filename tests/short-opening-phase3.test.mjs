import test from 'node:test';import assert from 'node:assert/strict';
import {chapterOpeningBottom,initiallyVisibleChapterEnd} from '../src/reader-view.js';
test('only a bottom dock reduces the initial reading viewport, never a side navigation',()=>{
 assert.equal(chapterOpeningBottom({nav:{top:110,bottom:342,width:170},topbarBottom:80,viewportWidth:1440,viewportHeight:1000}),1000);
 assert.equal(chapterOpeningBottom({nav:{top:774,bottom:844,width:390},topbarBottom:70,viewportWidth:390,viewportHeight:844}),774);
 assert.equal(chapterOpeningBottom({nav:null,topbarBottom:70,viewportWidth:390,viewportHeight:844}),844);
 assert.equal(chapterOpeningBottom({nav:{top:400,bottom:450,width:300},topbarBottom:70,viewportWidth:390,viewportHeight:844}),844);
});
test('scrolled initial layout still requires consent for a short chapter on desktop',()=>{
 const bottom=chapterOpeningBottom({nav:{top:110,bottom:342,width:170},topbarBottom:-1120,viewportWidth:1440,viewportHeight:1000});
 assert(initiallyVisibleChapterEnd({top:-564,bottom:-563,scrollY:1200,topbarBottom:-1120,navTop:bottom}));
 assert(!initiallyVisibleChapterEnd({top:1600,bottom:1601,scrollY:1200,topbarBottom:-1120,navTop:bottom}));
});
