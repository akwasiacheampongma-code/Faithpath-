import {escapeHtml as e} from './view-html.js';
// Transient answers remain transient. This projection never writes quiz or personal state.
export function storyQuestionState(model,id,ui={}) {
 const fp=model.fp.get(id),nq=model.n.get(id);if(!fp&&!nq)return null;
 const q=fp?.question||nq,mapping=model.flow.mapping_links.find(l=>l.FP_ID===id);
 const storyId=mapping?.Story_ID||nq?.source_story_id,story=storyId?model.stories.get(storyId):null;
 const index=story?.flow_items.findIndex(item=>item.source_question_ids.includes(id))??-1;
 return {id,fp,q,storyId,story,index,hasMC:Array.isArray(q.a),
  result:Array.isArray(q.a)&&Number.isInteger(ui.sourceAnswer)&&ui.sourceAnswerId===id?ui.sourceAnswer:null,
  previous:index>0?story.flow_items[index-1].primary_question_id:null,
  next:story&&index>=0&&index<story.flow_items.length-1?story.flow_items[index+1].primary_question_id:null};
}
export function reflectionInvitation(story) {
 return `<section class="story-reflection" aria-labelledby="story-reflection-title"><span class="overline">Deine persönliche Geschichte</span><h2 id="story-reflection-title">Was bedeutet diese Geschichte für dich?</h2><p>Vielleicht gibt es einen Gedanken, den du für dich festhalten möchtest.</p><blockquote>${e(story.reflection)}</blockquote><button type="button" class="button primary" data-action="reflect-story" data-id="${e(story.story_id)}">Gedanken festhalten</button><p class="meta">Freiwillig. Deine Reflexion wird nicht bewertet.</p><a class="text-link" href="#merged-story/${e(story.story_id)}">Zur Geschichte zurückkehren</a></section>`;
}
function answerOptions(q,id,result) {
 return `<div class="answers">${q.a.map((answer,index)=>{
  const answered=result!==null,correct=answered&&index===q.c,wrong=result===index&&!correct;
  return `<button type="button" data-action="source-answer" data-id="${e(id)}" data-answer="${index}" ${answered?'disabled':''}
   class="answer${correct?' correct':wrong?' selected-wrong':''}"><span>${String.fromCharCode(65+index)}</span><span>${e(answer)}${correct?'<small>Richtige Antwort</small>':wrong?'<small>Deine Antwort</small>':''}</span></button>`;
 }).join('')}</div>`;
}
export function renderStoryQuestion(state,{back,heading,link}) {
 const {id,fp,q,storyId,story,index,hasMC,result,previous,next}=state;
 const answer=hasMC?answerOptions(q,id,result):`<details class="source-answer"><summary>Antwort ansehen</summary><p data-n-answer>${e(q.answer)}</p></details>`;
 const feedback=hasMC&&result!==null?`<section class="explanation" role="status"><strong>${result===q.c?'Ja, das steht im Text.':'Schau noch einmal auf den Zusammenhang.'}</strong><p>${e(q.x||q.answer)}</p></section>`:'';
 const navigation=story?`<nav class="question-flow-nav" aria-label="Fragen zur Geschichte">
  ${previous?link('Vorherige Frage','question/'+previous,'button quiet'):''}
  ${next?link('Nächste Frage','question/'+next,'button quiet'):link('Zur persönlichen Reflexion','merged-story/'+storyId+'?reflection=1','button quiet')}
 </nav>`:'';
 return `${back('Zur Geschichte',story?'merged-story/'+storyId:'story/'+fp.unit.id)}
  ${story&&index>=0?`<div class="quiz-head"><span class="overline">Fragen zur Geschichte</span><span>Frage ${index+1} von ${story.flow_items.length}</span></div>`:''}
  ${heading(q.ref,q.q)}<span class="sr-only" data-question-id="${e(id)}">${e(id)}</span>
  ${answer}${feedback}${navigation}${story&&index===story.flow_items.length-1?reflectionInvitation(story):''}`;
}
