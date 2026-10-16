/** One read-only map for the drawer's task groups and deep-route active states.
 * Removed direct links remain in the existing Discover hub; old URLs stay valid. */
const GROUPS = [
 {label:'Schnellzugriff',items:[['today','Heute'],['bible','Bibel'],['paths','Mein Weg'],['journal','Journal']]},
 {label:'Lesen & Entdecken',items:[['discover','Entdecken'],['marks','Markierungen']]},
 {label:'Persönliche Geschichte',items:[['history','Meine Geschichte'],['reviews','Rückblicke']]},
 {label:'Einstellungen & Daten',items:[['more','Mehr']]},
];
const FAMILIES = {
 today:['today'],bible:['bible','chapters','read','bible-journey'],paths:['paths','path','tree'],journal:['journal','entry','reflection','compose'],
 discover:['discover','guidance','topic','plans','plan','guide','story','merged-story','question','quizzes','quiz','chapter-quizzes'],
 marks:['marks','mark'],history:['history'],reviews:['reviews','review'],more:['more','licenses','content-status'],
};
export function navigationTarget(route='today') {
 const name=route.split('?')[0].split('/')[0];
 return Object.entries(FAMILIES).find(([,routes])=>routes.includes(name))?.[0]||null;
}
export function navigationGroups(route) {
 const active=navigationTarget(route);
 return GROUPS.map(group=>({label:group.label,items:group.items.map(([route,label])=>({route,label,current:route===active}))}));
}
