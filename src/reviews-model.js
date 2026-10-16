// Existing source resolver owns historical truth; this module only selects presentation.
import {allReviews} from './continuity.js';
import {reviewSourceContext} from './path-review-context.js';
import {gaps} from './domain.js';
export function selectReviews(data,{limit=40,now=Date.now()}={}){
 const completed=allReviews(data),count=Number.isSafeInteger(limit)&&limit>=40?limit:40;
 return {pending:gaps(data,now),total:completed.length,hasMore:completed.length>count,completed:completed.slice(0,count).map(review=>({review,source:reviewSourceContext(data,review)}))};
}
