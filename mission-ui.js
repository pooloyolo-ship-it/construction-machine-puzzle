'use strict';
let missionProgress;
try{missionProgress=new MissionStorage.Progress(localStorage);}catch{missionProgress=new MissionStorage.Progress(null);}
let normalSnapshot=null;
window.MissionUI={
 renderStatus(){
  $('stars-total').textContent=`★ ${missionProgress.stars} / 18`;
  const panel=$('mission-status'),m=game.mission;panel.hidden=!m;if(!m)return;
  panel.replaceChildren();const title=document.createElement('strong');title.textContent=`${m.difficulty}${m.number}　${m.title}`;
  const goal=document.createElement('p');goal.textContent=m.description;
  const progress=document.createElement('p');progress.textContent=`${game.state.moves} / ${m.moveLimit}手　残り${Math.max(0,m.moveLimit-game.state.moves)}手${m.targetType==='amount'?`　${game.state.amount.toLocaleString('ja-JP')} / ${m.targetValue.toLocaleString('ja-JP')}万円`:''}`;
  panel.append(title,goal,progress);
 },
 list(){
  if(locked)return;
  $('list-stars').textContent=`★ ${missionProgress.stars} / 18`;$('missions-groups').replaceChildren();
  for(const difficulty of ['初級','中級','上級']){
   const section=document.createElement('section'),heading=document.createElement('h3');heading.textContent=difficulty;section.append(heading);
   for(const m of missionProgress.missions.filter(m=>m.difficulty===difficulty)){
    const button=document.createElement('button');button.className='mission-card';button.dataset.missionId=m.id;button.disabled=!m.unlocked;
    const title=document.createElement('strong');title.textContent=`${m.cleared?'✓ ':m.unlocked?'':'🔒 '}${m.difficulty}${m.number}　${m.title}`;
    const goal=document.createElement('span');goal.textContent=`${m.description} ／ ${m.moveLimit}手`;
    const reward=document.createElement('span');reward.textContent=`${m.final?'FINAL MISSION · ':''}${m.cleared?'獲得済み ': '報酬 '}${'★'.repeat(m.rewardStars)}`;
    button.append(title,goal,reward);button.onclick=()=>this.brief(m.id);section.append(button);
   }
   $('missions-groups').append(section);
  }
  $('save-status').textContent=missionProgress.available?'進捗はこのブラウザに保存されます。':'保存を利用できません。進捗はこのページ内で保持されます。';
  if(!$('missions-list').open)$('missions-list').showModal();
 },
 brief(id){
  const m=missionProgress.missions.find(m=>m.id===id);if(!m?.unlocked)return;
  const body=$('brief-body');body.replaceChildren();
  const title=document.createElement('h2');title.textContent=`${m.difficulty}${m.number}　${m.title}`;
  const goal=document.createElement('p');goal.textContent=`達成条件：${m.description}`;
  const limit=document.createElement('p');limit.textContent=`制限：${m.moveLimit}手 ／ 報酬：${'★'.repeat(m.rewardStars)}`;
  body.append(title,goal,limit);$('brief-actions').replaceChildren();
  addButton($('brief-actions'),'ミッション開始',()=>{if(locked)return;$('mission-brief').close();$('missions-list').close();this.start(id);}).classList.add('primary');
  addButton($('brief-actions'),'一覧へ戻る',()=>$('mission-brief').close());$('mission-brief').showModal();
 },
 start(id){
  if(locked)return false;
  const m=missionProgress.missions.find(m=>m.id===id);if(!m?.unlocked)return false;
  if(!game.mission&&!normalSnapshot)normalSnapshot={best:game.best,state:structuredClone(game.state),previous:structuredClone(game.previous),session:[...sessionDiscoveries]};
  newQueue=[];sessionDiscoveries=new Set();hideCombo();game.reset(m);$('feedback').textContent=m.description;render();return true;
 },
 normal(){
  if(locked||overlayOpen())return;
  if(!game.mission)return;
  game.mission=null;
  if(normalSnapshot){game.best=normalSnapshot.best;game.state=normalSnapshot.state;game.previous=normalSnapshot.previous;sessionDiscoveries=new Set(normalSnapshot.session);normalSnapshot=null;}else game.reset();
  newQueue=[];hideCombo();$('feedback').textContent='通常モードに戻りました。';render();resultDialog();
 },
 result(){
  const status=game.state.status,m=game.mission;if(!['mission-clear','mission-failed'].includes(status))return;
  const success=status==='mission-clear',fresh=success?missionProgress.complete(m.id):false;
  this.renderStatus();newQueue=[];$('result-body').replaceChildren();$('result-actions').replaceChildren();
  const heading=document.createElement('h2');heading.textContent=success?(m.final?'FINAL MISSION COMPLETE！':'MISSION CLEAR！'):'MISSION FAILED';
  const title=document.createElement('p');title.textContent=success&&m.final?'重機マスター！':m.title;
  const info=document.createElement('p');info.textContent=success?`${'★'.repeat(m.rewardStars)} ${fresh?'GET！':'取得済み'} ／ ★ ${missionProgress.stars} / 18`:`${game.state.moves} / ${m.moveLimit}手 ／ ${game.state.moves>=m.moveLimit?'制限手数に到達しました。':'これ以上動かせません。'}`;
  $('result-body').append(heading,title,info);dialog.classList.toggle('final-mission',success&&m.final);
  const action=(label,fn,primary=false)=>{const b=addButton($('result-actions'),label,()=>{dialog.close();fn();});if(primary)b.classList.add('primary');};
  const index=ConstructionMissions.list.findIndex(item=>item.id===m.id),next=ConstructionMissions.list[index+1];
  if(success&&next)action('次のミッション',()=>this.brief(next.id),true);
  action(success?'もう一度遊ぶ':'もう一度挑戦',()=>this.start(m.id),!success||!next);
  action(success?'ミッション一覧':'ミッション一覧へ戻る',()=>this.list());
  if(!success&&!game.state.undoUsed&&game.previous)action('一手戻す',undo);
  dialog.showModal();
 }
};
$('missions-open').onclick=()=>{if(!overlayOpen())MissionUI.list();};
$('missions-close').onclick=()=>{$('missions-list').close();showNextDiscovery();};
$('normal-mode').onclick=()=>MissionUI.normal();
MissionUI.renderStatus();

