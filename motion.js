'use strict';
window.BoardMotion={slideMs:200,settleMs:100,
 async play(board,before,direction){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  // 移動ロジックの確定結果から描画用の対応だけを求める。金額や状態は変更しない。
  const target=ConstructionGame.slide(before,direction).board,size=ConstructionData.size;
  const cells=[...board.children],rects=cells.map(cell=>cell.getBoundingClientRect()),base=board.parentElement.getBoundingClientRect();
  const layer=document.createElement('div');layer.className='slide-layer';layer.setAttribute('aria-hidden','true');
  const motions=[];
  for(let line=0;line<size;line++){
   const ids=Array.from({length:size},(_,p)=>direction==='left'?line*size+p:direction==='right'?line*size+size-1-p:direction==='up'?p*size+line:(size-1-p)*size+line);
   const sources=ids.filter(id=>before[id]);let cursor=0;
   for(const destination of ids.filter(id=>target[id])){
    const first=sources[cursor],count=target[destination]===before[first]?1:2;
    for(let n=0;n<count;n++){
     const source=sources[cursor++],node=cells[source].cloneNode(true),from=rects[source],to=rects[destination];
     node.classList.remove('pop','spawn');node.classList.add('sliding-tile');
     Object.assign(node.style,{left:`${from.left-base.left}px`,top:`${from.top-base.top}px`,width:`${from.width}px`,height:`${from.height}px`});
     layer.append(node);motions.push({node,dx:to.left-from.left,dy:to.top-from.top});
    }
   }
  }
  board.parentElement.append(layer);board.classList.add('in-motion');
  try{await Promise.all(motions.map(({node,dx,dy})=>node.animate([{transform:'translate(0,0)'},{transform:`translate(${dx}px,${dy}px)`}],{duration:this.slideMs,easing:'cubic-bezier(.2,.75,.3,1)',fill:'forwards'}).finished));}
  finally{layer.remove();board.classList.remove('in-motion');}
 }
};
