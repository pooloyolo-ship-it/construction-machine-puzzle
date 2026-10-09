'use strict';
// 全画面で同じデータとフォールバックを利用する。未発見画像は読み込まない。
window.MachineIcons={create(rank,{hidden=false}={}){
 const holder=document.createElement('span');holder.className='machine-icon';
 if(hidden){holder.classList.add('unknown');holder.textContent='？';holder.setAttribute('role','img');holder.setAttribute('aria-label','未発見のアイテム');return holder;}
 const fallback=document.createElement('span');fallback.className='icon-fallback';
 const symbol=document.createElement('span');symbol.textContent=rank.icon;symbol.setAttribute('aria-hidden','true');
 const label=document.createElement('span');label.textContent=rank.name;fallback.append(symbol,label);holder.append(fallback);
 const image=document.createElement('img');image.alt=rank.name;image.draggable=false;image.hidden=true;
 image.addEventListener('load',()=>{fallback.remove();image.hidden=false;});
 image.addEventListener('error',()=>{image.remove();holder.classList.add('missing');});
 image.src=rank.image;holder.append(image);return holder;
}};
