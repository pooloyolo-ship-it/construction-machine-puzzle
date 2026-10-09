(function(root){
 const D=root.ConstructionData||(typeof require!=='undefined'?require('./data.js'):null);
 const copy=s=>JSON.parse(JSON.stringify(s));
 function slide(board,direction){
  const next=board.slice(),merged=[],paths=[];
  for(let line=0;line<D.size;line++){
   const ids=Array.from({length:D.size},(_,p)=> direction==='left'?line*4+p:direction==='right'?line*4+3-p:direction==='up'?p*4+line:(3-p)*4+line);
   const values=ids.map(i=>board[i]).filter(Boolean),out=[];
   for(let p=0;p<values.length;p++){
    if(values[p]===values[p+1]&&values[p]<D.maxLevel){out.push(values[p]+1);merged.push(values[p]+1);paths.push(ids[out.length-1]);p++;}
    else out.push(values[p]);
   }
   ids.forEach((id,p)=>next[id]=out[p]||0);
  }
  return {board:next,changed:next.some((v,i)=>v!==board[i]),merged,mergeCells:paths};
 }
 function spawn(board,rates=D.spawnRates,random=Math.random){
  const empty=board.map((v,i)=>v===0?i:-1).filter(i=>i>=0);if(!empty.length)return null;
  const index=empty[Math.min(empty.length-1,Math.floor(random()*empty.length))];
  let roll=random()*rates.reduce((s,r)=>s+r.weight,0),level=rates[rates.length-1].level;
  for(const rate of rates){roll-=rate.weight;if(roll<0){level=rate.level;break;}}
  board[index]=level;return index;
 }
 function canMove(board){return board.includes(0)||['left','right','up','down'].some(d=>slide(board,d).changed);}
 class Game{
  constructor(random=Math.random){this.random=random;this.best=0;this.reset();}
  reset(mission=null){this.mission=mission;this.state={board:mission?mission.initialBoard.slice():Array(16).fill(0),amount:0,moves:0,highest:mission?Math.max(...mission.initialBoard):1,cleared:false,status:'playing',undoUsed:false};this.previous=null;if(!mission){spawn(this.state.board,[{level:1,weight:1}],this.random);spawn(this.state.board,[{level:1,weight:1}],this.random);}return this.state;}
  move(direction){
   if(this.state.status!=='playing'||!['left','right','up','down'].includes(direction))return {changed:false};
   const result=slide(this.state.board,direction);if(!result.changed)return result;
   this.previous=copy(this.state);const count=result.merged.length;
   result.bonus=D.comboAmounts[Math.min(count,5)]||0;
   result.gain=result.merged.reduce((sum,lv)=>sum+D.mergeAmounts[lv],0)+result.bonus;
   this.state.board=result.board;this.state.amount+=result.gain;this.state.moves++;
   result.spawnCell=spawn(this.state.board,this.mission?.spawnRates||D.spawnRates,this.random);
   this.state.highest=Math.max(this.state.highest,...this.state.board);this.best=Math.max(this.best,this.state.amount);
   result.firstClear=!this.state.cleared&&result.merged.includes(D.maxLevel);
   if(this.mission){const missions=root.ConstructionMissions||(typeof require!=='undefined'?require('./missions.js'):null);if(missions.achieved(this.mission,this.state,result))this.state.status='mission-clear';else if(this.state.moves>=this.mission.moveLimit||!canMove(this.state.board))this.state.status='mission-failed';}
   else if(result.firstClear){this.state.cleared=true;this.state.status='clear';}
   else if(!canMove(this.state.board))this.state.status='over';
   return result;
  }
  undo(){if(!this.previous||this.state.undoUsed)return false;this.state=copy(this.previous);this.state.undoUsed=true;this.previous=null;return true;}
  continue(){if(this.state.status==='clear')this.state.status=canMove(this.state.board)?'playing':'over';}
 }
 const api={Game,slide,spawn,canMove};root.ConstructionGame=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
