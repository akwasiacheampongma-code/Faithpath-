// Presentation-only projections. Reading authority remains bible-journey.js.
export function swordReadingState(summary) {
 const total=summary.books.reduce((n,b)=>n+b.chapters,0);
 return {chapters:summary.chapters,total,completedBooks:summary.completedBooks,
  reveal:total ? Math.sqrt(Math.min(1,Math.max(0,summary.chapters/total))) : 0};
}
export const countLabel=(n,one,many)=>`${n} ${n===1?one:many}`;
export function groupOriginPairs(pairs) {
 const groups=new Map();
 for(const pair of pairs){const key=pair.before.route;if(!groups.has(key))groups.set(key,{before:pair.before,pairs:[]});groups.get(key).pairs.push(pair);}
 return [...groups.values()];
}
// Book/sword seal is a symbol. Exact reading counts remain visible in words;
// no visual element claims faith strength or awards a spiritual level.
export function progressiveSword(summary,id='journey-sword') {
 const x=swordReadingState(summary);
 return `<svg class="journey-sword" viewBox="0 0 260 292" role="img" aria-label="Buch und Schwert des Geistes: ${x.chapters} von ${x.total} Kapiteln erkundet" data-reveal="${x.reveal}"><g transform="translate(10 20)">  <!-- Compact book-and-sword seal: reading is the anchor of the composition. -->
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="120" cy="120" r="93" stroke="var(--gold)" stroke-width="1"/>
    <path d="M35 99A89 89 0 0 1 55 60M185 60A89 89 0 0 1 205 99" stroke="var(--muted)" stroke-width="2.2"/>
    <path d="M60 120C82 115 98 119 120 130C141 119 159 115 180 120V173C158 170 140 176 120 185C100 176 82 170 60 173Z" stroke="var(--primary)" stroke-width="2.5"/>
    <path d="M65 126V168C84 165 103 171 120 179C139 171 157 165 175 168V126M120 133V179" stroke="var(--muted)" stroke-width="1.2"/>
    <path d="M73 137C85 136 96 139 105 143M73 146C85 145 96 148 105 152M135 143C145 139 155 136 167 137M135 152C145 148 155 145 167 146" stroke="var(--muted)" stroke-width="1"/>
    <path d="M113 92H127L126 142L120 163L114 142Z" fill="var(--muted)" stroke="var(--primary)" stroke-width="1.4"/>
    <path d="M120 97V153" stroke="var(--gold)" stroke-width="1"/>
    <path d="M115 60H125L124 83H116Z" fill="var(--primary)"/>
    <path d="m116 65 8 3m-8 3 8 3m-8 3 8 3" stroke="var(--gold)" stroke-width="1"/>
    <ellipse cx="120" cy="52" rx="6" ry="8" fill="var(--gold)"/>
    <path d="M93 82C105 87 113 85 120 85C128 85 135 87 147 82L149 88C137 93 128 92 120 91C112 92 103 93 91 88Z" fill="var(--gold)"/>
    <path d="M59 188C50 183 45 177 41 169M181 188C190 183 195 177 199 169" stroke="var(--muted)" stroke-width="1.4"/>
    <path d="M47 179C37 180 30 175 29 170C38 169 44 173 47 179ZM44 174C42 164 46 159 50 157C53 164 49 170 44 174ZM193 179C203 180 210 175 211 170C202 169 196 173 193 179ZM196 174C198 164 194 159 190 157C187 164 191 170 196 174Z" fill="var(--muted)"/>
  </g>
</g></svg>`;
}
