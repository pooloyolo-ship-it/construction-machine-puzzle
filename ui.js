'use strict';
const game=new ConstructionGame.Game(),D=ConstructionData;
const $=id=>document.getElementById(id),board=$('board'),dialog=$('result');
let locked=false,start=null;
const discovered=new Set([1]);let sessionDiscoveries=new Set(),newQueue=[],comboTimer;
const overlayOpen=()=>document.querySelector('dialog[open]')!==null;
const money=n=>`${n.toLocaleString('ja-JP')}万円`;
function render(result={}){
 board.replaceChildren();game.state.board.forEach((level,i)=>{
  const cell=document.createElement('div');cell.className='cell';
  if(level){const rank=D.ranks[level-1];cell.classList.add('tile',`lv${level}`);cell.setAttribute('aria-label',`${rank.name} Lv${level}`);const badge=document.createElement('small');badge.textContent=`Lv${level}`;cell.append(badge,MachineIcons.create(rank));if(result.mergeCells?.includes(i))cell.classList.add('pop');if(result.spawnCell===i)cell.classList.add('spawn');}
  else cell.setAttribute('aria-label','空きマス');board.append(cell);
 });
 $('amount').textContent=money(game.state.amount);$('best').textContent=money(game.best);$('moves').textContent=`${game.state.moves}手`;$('rank').textContent=`最高到達：${D.ranks[game.state.highest-1].name}`;
 $('undo').disabled=locked||game.state.undoUsed||!game.previous;$('undo').textContent=game.state.undoUsed?'一手戻す（使用済み）':'一手戻す（あと1回）';
 if(window.MissionUI)MissionUI.renderStatus();
}
function resultDialog(){
 if(game.mission){MissionUI.result();return;}
 dialog.classList.remove('final-mission');
 const clear=game.state.status==='clear';if(!clear&&game.state.status!=='over')return;
 $('result-body').innerHTML=`<h2>${clear?'CLEAR！<br>竣工！ 現場完成！':'GAME OVER'}</h2><p>工事金額：${money(game.state.amount)}</p><p>最高工事金額：${money(game.best)}</p><p>最高到達ランク：${D.ranks[game.state.highest-1].name}</p>`;
 if(clear)$('result-body').prepend(MachineIcons.create(D.ranks[11]));
 const progress=document.createElement('p');progress.textContent=`図鑑達成数：${discovered.size} / 12`;$('result-body').append(progress);
 if(!clear){const found=document.createElement('p');found.textContent=`今回の新発見：${[...sessionDiscoveries].map(level=>D.ranks[level-1].name).join('・')||'なし'}`;$('result-body').append(found);}
 $('result-actions').replaceChildren();
 function button(text,action){const b=document.createElement('button');b.textContent=text;b.onclick=()=>{dialog.close();action();};$('result-actions').append(b);}
 if(clear){button('終了する',()=>{game.state.status='ended';$('feedback').textContent='現場完成！ もう一度遊ぶと新しい現場を開始します。';});button('もう一度遊ぶ',restart);button('このまま続ける',()=>{game.continue();render();resultDialog();showNextDiscovery();});}
 else{button('もう一度遊ぶ',restart);button('重機図鑑を見る',openCatalog);if(!game.state.undoUsed&&game.previous)button('一手戻す',undo);}
 dialog.showModal();
}
async function move(direction){
 if(locked||overlayOpen())return;
 const before=game.state.board.slice(),result=game.move(direction);
 if(!result.changed){$('feedback').textContent='この方向には動かせません。手数は増えません。';return;}
 locked=true;start=null;$('undo').disabled=true;board.setAttribute('aria-busy','true');
 try{
  await BoardMotion.play(board,before,direction);
  registerDiscoveries(result);render(result);showCombo(result);
  $('feedback').textContent=result.merged.length>=2?`COMBO ×${result.merged.length>=5?'5+':result.merged.length}　＋${money(result.bonus)}（合計＋${money(result.gain)}）`:result.gain?`合体！ ＋${money(result.gain)}`:'同じLvのアイテムを合わせよう。';
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)await new Promise(resolve=>setTimeout(resolve,BoardMotion.settleMs));
 }finally{locked=false;board.removeAttribute('aria-busy');render();}
 resultDialog();showNextDiscovery();
}
function restart(){if(locked)return;game.reset(game.mission);sessionDiscoveries=new Set();newQueue=[];hideCombo();$('feedback').textContent=game.mission?game.mission.description:'スコップ2個から、新しい現場を開始！';render();}
function undo(){if(locked)return;if(game.undo()){$('feedback').textContent='直前の一手を戻しました。';render();}}
$('undo').onclick=undo;$('restart').onclick=()=>{if(!locked&&game.state.moves&&game.state.status==='playing'){if(!confirm('現在の現場を終了して、はじめから遊びますか？'))return;}restart();};
document.querySelectorAll('[data-direction]').forEach(button=>button.onclick=()=>move(button.dataset.direction));
document.addEventListener('keydown',event=>{const directions={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};if(directions[event.key]&&!overlayOpen()){event.preventDefault();move(directions[event.key]);}});
board.addEventListener('pointerdown',e=>{if(locked||overlayOpen()||!e.isPrimary)return;start={x:e.clientX,y:e.clientY,id:e.pointerId};board.setPointerCapture(e.pointerId);});
board.addEventListener('pointerup',e=>{if(!start||start.id!==e.pointerId)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.max(Math.abs(dx),Math.abs(dy))<D.swipeThreshold)return;move(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');});
board.addEventListener('pointercancel',()=>start=null);
dialog.addEventListener('cancel',event=>event.preventDefault());
D.ranks.forEach(rank=>{const li=document.createElement('li');li.textContent=`${rank.name} — ${rank.use}${rank.level>1?` ／ 合体＋${money(D.mergeAmounts[rank.level])}`:''}`;$('rank-list').append(li);});updateCatalogCount();render();



function updateCatalogCount(){ $('catalog-count').textContent=`${discovered.size} / 12`; }
function registerDiscoveries(result){
 for(const level of result.merged){if(discovered.has(level))continue;discovered.add(level);sessionDiscoveries.add(level);if(level!==12)newQueue.push(level);}
 updateCatalogCount();
}
function hideCombo(){clearTimeout(comboTimer);$('combo').hidden=true;$('combo').classList.remove('show');}
function showCombo(result){
 if(result.merged.length<2)return;
 hideCombo();const element=$('combo');element.replaceChildren();
 const title=document.createElement('strong');title.textContent=`${Math.min(result.merged.length,5)}コンボ!!`;
 const bonus=document.createElement('span');bonus.textContent=`＋${money(result.bonus)}`;element.append(title,bonus);element.hidden=false;
 void element.offsetWidth;element.classList.add('show');comboTimer=setTimeout(hideCombo,D.comboDurationMs);
}
function addButton(parent,text,action){const button=document.createElement('button');button.textContent=text;button.onclick=action;parent.append(button);return button;}
function showNextDiscovery(){
 if(overlayOpen()||!newQueue.length)return;
 const level=newQueue.shift(),rank=D.ranks[level-1],body=$('discovery-body');body.replaceChildren();
 const heading=document.createElement('h2');heading.textContent='NEW！';const name=document.createElement('h3');name.textContent=rank.name;
 const use=document.createElement('p');use.textContent=`主な用途：${rank.mainUse}`;const description=document.createElement('p');description.textContent=rank.description;
 body.append(heading,MachineIcons.create(rank),name,use,description);$('discovery-actions').replaceChildren();
 addButton($('discovery-actions'),'詳しく見る',()=>showDetail(rank));
 addButton($('discovery-actions'),'ゲームに戻る',()=>{$('discovery').close();showNextDiscovery();});$('discovery').showModal();
}
function showDetail(rank){
 const body=$('detail-body');body.replaceChildren();const heading=document.createElement('h2');heading.textContent=rank.name;
 body.append(MachineIcons.create(rank),heading);
 for(const [label,value] of [[rank.level===12?'主な意味':'主な用途',rank.mainUse],['ひとこと解説',rank.description],['現場POINT',rank.fieldPoint]]){
 const title=document.createElement('h3');title.textContent=label;const text=document.createElement('p');text.textContent=value;body.append(title,text);
 }
 $('machine-detail').showModal();
}
function openCatalog(){
 if(locked)return;
 $('catalog-total').textContent=`${discovered.size} / 12`;$('catalog-grid').replaceChildren();
 for(const rank of D.ranks){const known=discovered.has(rank.level),card=document.createElement('button');card.className='catalog-card';card.disabled=!known;
 card.append(MachineIcons.create(rank,{hidden:!known}));const name=document.createElement('span');name.textContent=known?rank.name:'？？？';card.append(name);
 if(known)card.onclick=()=>showDetail(rank);$('catalog-grid').append(card);}
 $('catalog').showModal();
}
$('catalog-open').onclick=()=>{if(!overlayOpen())openCatalog();};
$('catalog-close').onclick=()=>{$('catalog').close();showNextDiscovery();};
$('detail-close').onclick=()=>$('machine-detail').close();
$('discovery').addEventListener('cancel',event=>{event.preventDefault();$('discovery').close();showNextDiscovery();});
$('catalog').addEventListener('cancel',()=>setTimeout(showNextDiscovery,0));
dialog.addEventListener('close',()=>setTimeout(showNextDiscovery,0));
