import {stageNames} from './content.js';
import {escapeHtml as e} from './view-html.js';

/** Original FaithPath vector artwork. No third-party image or font dependency.
 * Presentation consumes the domain level; it never counts or writes development.
 * Context scopes paint IDs when several illustrations share a document.
 */
export function renderOliveTree(level=0,{context='main',label='Olivenbaum',decorative=false}={}) {
 const stage=Number.isInteger(level)&&level>=0&&level<7?level:0;
 const key='olive-'+context.replace(/[^a-z0-9-]/gi,'')+'-'+stage;
 const leaf=(x,y,angle,scale=1,tone=0)=>`<use href="#${key}-leaf-shape-${tone}" transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})"/>`;
 const leafShapes=[0,1].map(tone=>`<g id="${key}-leaf-shape-${tone}"><path d="M0 0C7-17 23-23 37-17C28-3 15 3 0 0Z" fill="url(#${key}-${tone?'silver':'leaf'})"/><path d="M2-1L32-16" stroke="#e2d8a6" stroke-width=".7" opacity=".55"/></g>`).join('');
 const clusters=[[-80,172,-35],[-46,123,-55],[0,100,-75],[49,121,-105],[89,164,-135],[-105,213,-20],[100,214,-160],[-48,203,-55],[43,198,-120],[-13,159,-75],[22,240,-105],[-64,260,-40],[70,270,-140]];
 const foliage=stage<2?'':clusters.slice(0,[0,0,4,8,11,12,13][stage]).map(([dx,y,angle],i)=>{
  const factor=stage===2?.55:stage===3?.78:1;
  const x=200+dx*factor,cy=stage===2?y*.64+94:stage===3?y*.85+22:y;
  const leaves=Array.from({length:stage===2?5:8},(_,j)=>{const a=(j*51+i*19)%360;return leaf(Math.cos(a*Math.PI/180)*16,Math.sin(a*Math.PI/180)*13,a,.67+(j%3)*.15,j%3===0)}).join('');
  return `<g class="tree-bough"><path d="M200 290Q${200+dx*.35} ${cy+42} ${x} ${cy}" fill="none" stroke="url(#${key}-bark)" stroke-width="${stage===2?2:3.5}" stroke-linecap="round"/><g transform="translate(${x} ${cy}) rotate(${angle+75})">${leaves}</g>${stage>=5&&i%2===0?`<g class="tree-fruit"><path d="M${x+5} ${cy+3}l2 10" stroke="#5d6440"/><ellipse cx="${x+7}" cy="${cy+18}" rx="5" ry="7" fill="url(#${key}-fruit)"/>${stage===6?`<ellipse cx="${x-5}" cy="${cy+14}" rx="4" ry="6" fill="#77744e"/>`:''}</g>`:''}</g>`;
 }).join('');
 const seed=`<g class="tree-seed"><path d="M181 350C185 333 208 329 222 340C222 357 198 366 181 350Z" fill="url(#${key}-seed)"/><path d="M187 351Q205 342 217 340" fill="none" stroke="#edcf9b" stroke-width="1.5" opacity=".7"/></g>`;
 const sprout=`<g class="tree-sprout"><path d="M201 349Q193 307 202 275" fill="none" stroke="#647647" stroke-width="5" stroke-linecap="round"/>${leaf(199,310,174,1.03)}${leaf(199,293,-3,.9,1)}<path d="M201 349q-12 13-22 14m22-14q4 17 20 18" fill="none" stroke="#9c8155" stroke-width="1.4"/></g>`;
 const trunk=stage<2?'':`<g class="tree-trunk"><path d="M179 354Q199 326 192 286Q182 247 201 214Q209 189 202 ${stage===2?199:151}Q225 189 214 223Q203 255 215 282Q223 327 236 355Q217 343 209 353Q200 345 179 354Z" fill="url(#${key}-bark)"/><path d="M201 345Q214 311 202 276Q194 252 209 223M210 329Q201 302 206 285M211 244L223 205" fill="none" stroke="#d4b78c" stroke-width="1.8" opacity=".7"/><path d="M182 354Q161 361 144 361M225 351Q245 359 260 357" fill="none" stroke="#92744c" stroke-width="3" stroke-linecap="round"/></g>`;
 return `<svg class="olive-art" data-living-tree data-tree-context="${e(context)}" data-tree-stage="${stage}" viewBox="${stage===0?'75 240 250 160':stage===1?'75 185 250 215':'0 0 400 420'}" xmlns="http://www.w3.org/2000/svg"${decorative?' aria-hidden="true"':` role="img" aria-labelledby="${key}-title"`}>
 <title id="${key}-title">${e(label)} – ${e(stageNames[stage])}</title>
 <defs>${leafShapes}<radialGradient id="${key}-halo"><stop stop-color="#dbc991" stop-opacity=".45"/><stop offset="1" stop-color="#dbc991" stop-opacity="0"/></radialGradient>
 <linearGradient id="${key}-leaf" x2=".8" y2="1"><stop stop-color="#a2aa75"/><stop offset=".45" stop-color="#6e8559"/><stop offset="1" stop-color="#355a43"/></linearGradient>
 <linearGradient id="${key}-silver" x2=".6" y2="1"><stop stop-color="#d4d7b5"/><stop offset="1" stop-color="#879a76"/></linearGradient>
 <linearGradient id="${key}-bark"><stop stop-color="#746348"/><stop offset=".48" stop-color="#ac9170"/><stop offset=".7" stop-color="#6d6048"/><stop offset="1" stop-color="#b59a75"/></linearGradient>
 <linearGradient id="${key}-seed" x2=".8" y2="1"><stop stop-color="#d7b27a"/><stop offset=".5" stop-color="#997247"/><stop offset="1" stop-color="#604d38"/></linearGradient>
 <radialGradient id="${key}-fruit" cx=".3" cy=".2"><stop stop-color="#aeb184"/><stop offset="1" stop-color="#485944"/></radialGradient></defs>
 <ellipse class="tree-light" cx="200" cy="205" rx="185" ry="185" fill="url(#${key}-halo)"/>
 <path class="tree-horizon" d="M34 358Q190 333 366 358" fill="none" stroke="currentColor" opacity=".12"/>
 <ellipse cx="205" cy="363" rx="${stage<2?50:105}" ry="12" fill="#7f7852" opacity=".13"/>
 ${stage===0?seed:stage===1?sprout:trunk+foliage}
 <g class="tree-ground" fill="#93876b" opacity=".55"><ellipse cx="160" cy="366" rx="3" ry="1"/><ellipse cx="238" cy="369" rx="4" ry="1"/><ellipse cx="185" cy="374" rx="2" ry="1"/></g>
 </svg>`;
}
