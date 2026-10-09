(function(root){
 const rates=weights=>weights.map((weight,i)=>({level:i+1,weight}));
 const rows=[
 ['beginner1','初級',1,'はじめての合体','一輪車を1台作る','level',2,5,1,[0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0],[100]],
 ['beginner2','初級',2,'小型機械を作ろう','プレートコンパクタを1台作る','level',3,15,1,[0,0,0,0,1,0,1,0,0,2,0,0,0,0,0,0],[90,10]],
 ['beginner3','初級',3,'ミニバックホウ登場','ミニバックホウを1台作る','level',4,30,1,[0,0,0,0,1,0,2,0,0,3,0,1,0,0,0,0],[75,20,5]],
 ['intermediate1','中級',1,'ダブル合体','1回の有効操作で2組以上を同時に合体する','merges',2,25,2,[1,0,1,0,0,2,0,2,0,0,1,0,0,0,0,0],[75,25]],
 ['intermediate2','中級',2,'バックホウを作ろう','バックホウを1台作る','level',5,50,2,[0,2,0,0,3,0,1,0,0,4,0,1,0,0,0,0],[65,25,10]],
 ['intermediate3','中級',3,'2,000万円の現場をつくれ！','工事金額2,000万円以上','amount',2000,75,2,[1,0,2,0,0,3,0,1,2,0,0,0,0,0,0,0],[65,25,10]],
 ['advanced1','上級',1,'トリプルコンボ','1回の有効操作で3組以上を同時に合体する','merges',3,80,3,[1,0,1,0,0,2,0,2,3,0,0,3,0,1,0,0],[60,30,10]],
 ['advanced2','上級',2,'ロードローラまで到達','ロードローラを1台作る','level',8,130,3,[3,0,4,0,0,5,0,2,4,0,3,0,0,0,0,0],[45,30,20,5]],
 ['advanced3','上級',3,'重機マスター','クローラクレーンを1台作る','level',11,220,3,[4,0,5,0,0,3,0,4,5,0,2,0,0,0,0,0],[30,30,25,10,5]]
 ];
 const list=rows.map(([id,difficulty,number,title,description,targetType,targetValue,moveLimit,rewardStars,initialBoard,weights],i)=>({id,difficulty,number,title,description,targetType,targetValue,moveLimit,rewardStars,initialBoard,spawnRates:rates(weights),unlocked:i===0,cleared:false,final:i===8}));
 function achieved(mission,state,result){if(!result.changed)return false;switch(mission.targetType){case 'level':return result.merged.includes(mission.targetValue);case 'merges':return result.merged.length>=mission.targetValue;case 'amount':return state.amount>=mission.targetValue;default:return false;}}
 root.ConstructionMissions={list,achieved};if(typeof module!=='undefined')module.exports=root.ConstructionMissions;
})(globalThis);
