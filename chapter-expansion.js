/* Chapter expansion layer for SILENT MALL.
   Seven chapters: extra floor dressing, per-entity behaviours, the final lockdown.
   Cinematics live in story.js; this file only touches the playfield. */
(()=>{
'use strict';

/* Extra interior dressing per chapter (tile x, y, w, h). Short segments only:
   they add structure without ever sealing a room off from the concourse. */
const WALLS = [
  [],
  [[20,13,1,3],[24,12,1,2],[40,14,1,3],[43,10,1,3],[32,18,2,1]],
  [[18,13,1,3],[23,12,1,2],[39,13,1,3],[45,14,1,3],[28,19,4,1],[15,9,3,1]],
  [[12,6,1,4],[32,6,1,4],[51,6,1,4],[12,22,1,4],[32,22,1,4],[51,22,1,4]],
  [[14,6,1,6],[26,6,1,6],[14,21,1,6],[26,21,1,6],[42,8,1,5],[54,8,1,5]],
  [[20,12,1,5],[42,12,1,5],[27,11,7,1],[27,19,7,1],[31,12,1,2],[34,17,1,2]],
  [[10,6,1,5],[34,6,1,5],[50,6,1,5],[10,22,1,5],[34,22,1,5],[50,22,1,5]]
];

/* Soft floor washes so each chapter reads as its own place. */
const PATCHES = [
  [[[7,9,13,3],[16,9,6,3],[42,9,13,3]], 0x7f9b91],
  [[[7,8,13,4],[24,8,15,4],[43,8,12,4],[7,20,13,3],[43,20,12,3]], 0x8b7355],
  [[[7,7,13,5],[23,7,17,5],[43,7,13,5],[7,20,15,3],[25,20,15,3],[43,20,13,3]], 0x6b789d],
  [[[6,6,15,7],[26,6,13,7],[44,6,15,7],[6,19,15,7],[26,19,13,7],[44,19,15,7]], 0x8a7b62],
  [[[8,6,23,7],[40,7,19,6],[8,19,23,7],[40,19,19,7]], 0x8c4f45],
  [[[7,8,12,4],[22,8,19,4],[45,8,12,4],[22,20,19,3],[45,20,12,3]], 0x9b554c],
  [[[4,6,17,7],[24,6,17,7],[44,6,18,7],[4,19,17,7],[24,19,17,7],[44,19,18,7]], 0x8a8fb0]
];

function chapterIndex(scene){
  const M = window.MALL;
  if(M && typeof M.CHAPTER_INDEX === 'number') return M.CHAPTER_INDEX;
  const t = (scene && scene.chapter && scene.chapter.title) || '';
  if(t.includes('FOOD COURT')) return 1;
  if(t.includes('CHILDREN')) return 2;
  if(t.includes('LOST')) return 3;
  if(t.includes('SCREENING')) return 4;
  if(t.includes('HEART')) return 5;
  if(t.includes('ROOF')) return 6;
  return 0;
}

function paint(scene, n){
  if(!scene || !scene.add) return;
  scene.__painted = n;

  const wash = PATCHES[n] || [];
  const tint = wash[1] !== undefined ? wash[1] : 0x7f9b91;
  const rects = wash[0] || [];
  rects.forEach(p=>{
    scene.add.rectangle((p[0]+p[2]/2)*16, (p[1]+p[3]/2)*16, p[2]*16, p[3]*16, tint, .12).setDepth(1);
  });

  const walls = WALLS[n] || [];
  walls.forEach(p=>{
    scene.addSolid(p[0]*16, p[1]*16, p[2]*16, p[3]*16);
    for(let y=p[1]; y<p[1]+p[3]; y++){
      for(let x=p[0]; x<p[0]+p[2]; x++){
        if(scene.blocked && scene.blocked[y]) scene.blocked[y][x] = true;
      }
    }
  });

  if(window.ENTITIES && window.ENTITIES.apply) window.ENTITIES.apply(scene, n);

  scene.__mallPulse = scene.time.now + 9000;
  scene.__ability = scene.time.now + 7000;
  scene.__phase = 0;
  scene.__boss = false;
}

function install(scene){
  if(!scene || scene.__expansionInstalled) return;
  scene.__expansionInstalled = true;

  scene.toast = (m, ms)=>{
    const e = document.getElementById('toast');
    if(!e) return;
    e.textContent = m;
    e.classList.add('on');
    clearTimeout(scene.__toast);
    scene.__toast = setTimeout(()=>e.classList.remove('on'), ms || 1200);
  };

  const create = scene.create.bind(scene);
  scene.create = function(){
    this.__painted = -1;
    create();
    paint(this, chapterIndex(this));
  };

  const updateHunter = scene.updateHunter.bind(scene);
  scene.updateHunter = function(dt){
    const n = chapterIndex(this);
    const now = this.time.now;
    const h = this.hunter;

    /* 02 — THE USHER: moves the signs, pulls the hunter toward a false exit */
    if(n===1 && h && now>this.__ability && h.state!=='hunt'){
      this.__ability = now + 11500;
      h.target = { x:(Math.random()<.5?13:47)*16, y:(Math.random()<.5?9:21)*16 };
      h.state = 'investigate';
      h.nextStep = now + 100;
      this.toast('THE USHER HAS MOVED THE EXIT SIGN.', 1800);
    }

    /* 03 — THE STATIC CHILD: drops out of frame, returns somewhere else */
    if(n===2 && h && now>this.__ability && h.state!=='hunt' && h.state!=='dormant'){
      this.__ability = now + 13500;
      h.state = 'dormant';
      this.__phase = now + 1700;
      if(this.hunterSprite) this.hunterSprite.setAlpha(.08);
      this.chromaBurst = .45;
      this.flash(.13, 260);
      this.toast('CAMERA 04: SUBJECT MISSING.', 1600);
    }
    if(n===2 && h && h.state==='dormant' && this.__phase && now>=this.__phase){
      const x = Math.max(2, Math.min(61, Math.floor((this.player.x - this.faceX*112)/16)));
      const y = Math.max(2, Math.min(27, Math.floor((this.player.y - this.faceY*112)/16)));
      if(this.blocked[y] && !this.blocked[y][x]){ h.x = x*16+8; h.y = y*16+8; }
      h.state = 'idle';
      h.target = { x:this.player.x, y:this.player.y };
      h.nextStep = now + 300;
      this.__phase = 0;
      if(this.hunterSprite) this.hunterSprite.setAlpha(.8);
    }

    /* 04 — THE COLLECTOR: files you, and re-shelves the way out */
    if(n===3 && h && now>this.__ability && h.state!=='hunt'){
      this.__ability = now + 12000;
      h.target = { x:this.keyPos.x*16, y:this.keyPos.y*16 };
      h.state = 'investigate';
      h.nextStep = now + 100;
      this.chromaBurst = Math.max(this.chromaBurst||0, .22);
      this.flash(.07, 240);
      this.toast('SHE HAS FILED YOU UNDER "PENDING".', 1900);
    }

    /* 05 — THE PROJECTIONIST: floods the room with your own footage */
    if(n===4 && h && now>this.__ability && h.state!=='hunt'){
      this.__ability = now + 12500;
      this.flash(.2, 420);
      this.cameras.main.shake(260, .0035);
      this.chromaBurst = .5;
      if(this.wakeNear) this.wakeNear(this.player.x, this.player.y, 190, 40);
      this.toast('THE PROJECTOR IS PLAYING YOUR NIGHT.', 1900);
    }

    /* 06 — THE NIGHT MANAGER: the shutter wakes him and he does not stop */
    if(n===5 && this.__boss && h){
      h.state = 'hunt';
      h.huntUntil = now + 1000;
      h.alert = 1;
      h.target = { x:this.player.x, y:this.player.y };
      h.nextStep = Math.min(h.nextStep, now + 110);
    }

    /* 07 — THE MALL: the building closes in, floor by floor */
    if(n===6 && h && now>this.__ability && h.state!=='hunt'){
      this.__ability = now + 11000;
      if(this.wakeNear) this.wakeNear(this.player.x, this.player.y, 240, 55);
      if(this.hunterHear) this.hunterHear(this.player.x, this.player.y, .8);
      this.toast('THE MALL IS TURNING OFF THE LIGHTS.', 1700);
    }

    /* the building breathes, in every chapter */
    if(this.__mallPulse && now>this.__mallPulse && !this.ended){
      this.__mallPulse = now + 16500;
      this.chromaBurst = Math.max(this.chromaBurst||0, .24);
      this.flash(.055, 320);
      this.cameras.main.shake(180, .0015);
    }
    updateHunter(dt);
  };

  const openShutter = scene.openShutter.bind(scene);
  scene.openShutter = function(){
    openShutter();
    if(chapterIndex(this)===5 && !this.__boss){
      this.__boss = true;
      this.hunter.state = 'hunt';
      this.hunter.alert = 1;
      this.hunter.huntUntil = this.time.now + 30000;
      this.toast('BOSS ENCOUNTER — THE NIGHT MANAGER.', 2800);
      this.cameras.main.shake(420, .008);
      this.flash(.22, 420);
    }
    if(chapterIndex(this)===6){
      this.toast('THE HATCH IS OPEN. RUN.', 2400);
      this.cameras.main.shake(320, .005);
    }
  };

  paint(scene, chapterIndex(scene));
}

function watch(){
  if(window.__mall && !window.__mall.__expansionInstalled) install(window.__mall);
  if(!window.__mall || !window.__mall.__expansionInstalled) setTimeout(watch, 180);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', watch); else watch();
setTimeout(watch, 400);

})();
