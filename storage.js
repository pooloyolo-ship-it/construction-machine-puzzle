(function(root){
 const M=root.ConstructionMissions||(typeof require!=='undefined'?require('./missions.js'):null),KEY='construction-puzzle-missions-v1';
 class Progress{
  constructor(storage){this.storage=storage;this.ids=new Set();this.available=Boolean(storage);try{const raw=JSON.parse(storage?.getItem(KEY)||'null');if(raw?.version===1&&Array.isArray(raw.missions)){for(const m of M.list){if(raw.missions.some(item=>item.id===m.id&&item.cleared===true))this.ids.add(m.id);}}}catch{this.available=false;}}
  get missions(){return M.list.map((m,i)=>({...m,cleared:this.ids.has(m.id),unlocked:i===0||this.ids.has(M.list[i-1].id),earnedStars:this.ids.has(m.id)?m.rewardStars:0}));}
  get stars(){return this.missions.reduce((sum,m)=>sum+m.earnedStars,0);}
  complete(id){const m=this.missions.find(m=>m.id===id);if(!m?.unlocked)return false;const fresh=!this.ids.has(id);this.ids.add(id);this.save();return fresh;}
  save(){try{if(!this.storage)throw Error('保存不可');this.storage.setItem(KEY,JSON.stringify({version:1,missions:this.missions.map(({id,unlocked,cleared,earnedStars})=>({id,unlocked,cleared,earnedStars})),totalStars:this.stars}));this.available=true;}catch{this.available=false;}}
 }
 root.MissionStorage={Progress,KEY};if(typeof module!=='undefined')module.exports=root.MissionStorage;
})(globalThis);

