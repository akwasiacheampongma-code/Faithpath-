/* Authored rig coordinates, in the common 1254 × 1254 source canvas.
 * A component's source attachment is mapped rigidly onto its wood attachment.
 * Growth is LOCAL twig growth, never an independently fitted whole-tree image.
 */
window.OLIVE_GEOMETRY = {
 canvas:1254,groundBoundary:1100,
 anchors:{rootContact:[650,1100],futureHollow:[670,855],leftFork:[532,658],lowerLeft:[353,528],rightElbow:[815,795],highAttach:[432,363],rightAttach:[1042,542]},
 components:{
  C1:{source:'crown-broad-left.png',sourceAnchor:[750,1100],target:[432,363],scale:.31,rotation:0},
  C2:{source:'crown-outer-lower.png',sourceAnchor:[1230,84],target:[353,528],scale:.25,rotation:15},
  C3:{source:'crown-broad-right.png',sourceAnchor:[1210,1200],target:[1042,542],scale:.36,rotation:0},
 },
 fruit:{source:'olive-cluster.png',sourceAnchor:[625,51],
  back:[{point:[631,930],scale:.26,rotation:10},{point:[899,722],scale:.24,rotation:-12}],
  front:[{point:[1040,950],scale:.26,rotation:-8},{point:[610,590],scale:.24,rotation:12},{point:[800,820],scale:.25,rotation:2}],
 },
 stages:[
  {index:0,name:'Samen',flat:'01-samen.png'},
  {index:1,name:'Keimling',flat:'02-keimling.png'},
  {index:2,name:'Junger Olivenbaum',wood:'young',growth:{C1:.74,C2:.58,C3:.73},fruitBack:0,fruitFront:0},
  {index:3,name:'Wachsender Olivenbaum',wood:'young',growth:{C1:.84,C2:.66,C3:.81},fruitBack:0,fruitFront:0},
  {index:4,name:'Starker Olivenbaum',wood:'mature',growth:{C1:.90,C2:.70,C3:.88},fruitBack:0,fruitFront:0},
  {index:5,name:'Erste Früchte',wood:'mature',growth:{C1:.97,C2:.86,C3:.95},fruitBack:0,fruitFront:1},
  {index:6,name:'Fruchttragender Olivenbaum',wood:'mature',growth:{C1:1,C2:1,C3:1},fruitBack:2,fruitFront:3},
 ],
 layerOrder:['G','W','F1','C1','C2','C3','F2'],
 layerParents:{G:null,W:null,F1:'C1',C1:'C1',C2:'C2',C3:'C3',F2:'C3'},
};
