/* SILENT MALL — entity appearances.
   Each chapter's entity gets its own silhouette, built from the same pixel-art
   vocabulary as the rest of the game: flat ink shapes, one rim light, one accent. */
(function(){
'use strict';
const E = window.ENTITIES = window.ENTITIES || {};

const CFG = [
  { // 01 THE LISTENER — night guard, tall and thin, peaked cap, torch arm
    height:.96, headW:.34, shoulders:.44, hips:.30, hipY:.52, lean:0,
    hat:'peaked', accent:'#7fe0b8', torch:true, coat:.06
  },
  { // 02 THE USHER — hunched, wide, peaked usher cap, lantern in hand
    height:.80, headW:.32, shoulders:.56, hips:.42, hipY:.48, lean:.03,
    hat:'peaked', accent:'#f2b13c', lantern:true, coat:.14
  },
  { // 03 THE STATIC CHILD — small, round head, paper wristband
    height:.52, headW:.44, shoulders:.36, hips:.26, hipY:.44, lean:0,
    hat:'none', accent:'#d8ffe9', band:true, glitch:true
  },
  { // 04 THE COLLECTOR — cardigan, hair in a bun, arms full of boxes
    height:.86, headW:.32, shoulders:.54, hips:.44, hipY:.50, lean:-.01,
    hat:'bun', accent:'#b9a26b', boxes:true
  },
  { // 05 THE PROJECTIONIST — thin, head replaced by a projector lens
    height:.94, headW:.30, shoulders:.46, hips:.32, hipY:.54, lean:.02,
    hat:'none', accent:'#ff5a4d', lens:true
  },
  { // 06 THE NIGHT MANAGER — broad suit, collar and tie, immaculate
    height:1.00, headW:.30, shoulders:.62, hips:.40, hipY:.55, lean:0,
    hat:'slick', accent:'#ff5a4d', tie:true, coat:.10
  },
  { // 07 THE MALL — too many limbs, no clear head, red seam
    height:1.04, headW:.26, shoulders:.66, hips:.34, hipY:.50, lean:0,
    hat:'veil', accent:'#ff5a4d', extra:true
  }
];

const POSES = {
  still:{ armF:0, armUp:0, stride:0, lean:0 },
  drift1:{ armF:.10, armUp:.02, stride:.10, lean:.01 },
  drift2:{ armF:-.08, armUp:.04, stride:-.10, lean:-.01 },
  reach:{ armF:.55, armUp:.30, stride:.16, lean:.05 },
  lunge:{ armF:.75, armUp:.12, stride:.34, lean:.12 },
  rear:{ armF:.30, armUp:.85, stride:.02, lean:-.06 }
};

function drawEntity(ctx, w, h, c, poseName){
  const p = POSES[poseName] || POSES.still;
  const ink = '#04070b';
  const rim = 'rgba(210,232,226,0.55)';
  const accent = c.accent;
  ctx.clearRect(0,0,w,h);

  const topY = h * (1 - c.height);
  const headR = Math.max(2, Math.round(w * c.headW * 0.5));
  const headCX = Math.round(w/2 + (c.lean + p.lean) * w * 0.9);
  const headCY = Math.round(topY + headR + 1);
  const neckY = headCY + headR - 1;
  const shY = Math.round(neckY + h*0.035);
  const shW = Math.round(w * c.shoulders);
  const hipY = Math.round(h * c.hipY);
  const hipW = Math.round(w * c.hips);
  const cx = Math.round(w/2 + (c.lean + p.lean) * w * 0.6);

  const poly = (pts, col)=>{ ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]); ctx.closePath(); ctx.fillStyle=col; ctx.fill(); };
  const rect = (x,y,ww,hh,col)=>{ ctx.fillStyle=col; ctx.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh)); };

  // legs
  const legW = Math.max(2, Math.round(hipW*0.42));
  const stride = Math.round(p.stride * w * 0.5);
  rect(cx - hipW/2 + 1, hipY, legW, h - hipY - 1, ink);
  rect(cx + hipW/2 - legW - 1 + stride, hipY, legW, h - hipY - 1, ink);

  // coat / torso
  const flare = Math.round(shW * (0.5 + (c.coat||0)));
  poly([
    [cx - shW/2, shY],
    [cx + shW/2, shY],
    [cx + flare/2, hipY + h*0.06],
    [cx - flare/2, hipY + h*0.06]
  ], ink);

  // arms
  const armLen = h * 0.36;
  const armW = Math.max(2, Math.round(w*0.10));
  const armY = shY + 2;
  const fwd = p.armF * armLen;
  const up = p.armUp * armLen;
  rect(cx - shW/2 - armW*0.3, armY, armW, armLen - up, ink);
  rect(cx + shW/2 - armW*0.7 + fwd*0.5, armY, armW, armLen - up*0.6, ink);

  // head
  if(c.lens){
    // projector head: a housing with a glowing lens
    const bw = headR*2.4, bh = headR*2.0;
    rect(headCX - bw/2, headCY - bh/2, bw, bh, ink);
    ctx.fillStyle = accent;
    ctx.globalAlpha = .85;
    ctx.beginPath(); ctx.arc(headCX + bw*0.18, headCY, Math.max(1.6, headR*0.45), 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    rect(headCX - bw*0.42, headCY - bh/2 - 1, bw*0.5, 1, ink);
  } else {
    ctx.beginPath(); ctx.ellipse(headCX, headCY, headR, headR*1.12, 0, 0, Math.PI*2);
    ctx.fillStyle = ink; ctx.fill();
    // rim light down one side of the head
    ctx.strokeStyle = rim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(headCX - 1, headCY, headR, headR*1.12, 0, Math.PI*0.75, Math.PI*1.45); ctx.stroke();
  }

  // hats
  if(c.hat === 'peaked'){
    rect(headCX - headR*1.15, headCY - headR*1.55, headR*2.3, Math.max(1,headR*0.55), ink);
    rect(headCX - headR*1.5, headCY - headR*1.05, headR*3.0, Math.max(1,headR*0.30), ink);
  } else if(c.hat === 'slick'){
    rect(headCX - headR*1.02, headCY - headR*1.35, headR*2.04, Math.max(1,headR*0.42), ink);
  } else if(c.hat === 'bun'){
    ctx.beginPath(); ctx.arc(headCX, headCY - headR*1.25, Math.max(1.5, headR*0.42), 0, Math.PI*2);
    ctx.fillStyle = ink; ctx.fill();
  } else if(c.hat === 'veil'){
    poly([
      [headCX - headR*1.1, headCY - headR*1.1],
      [headCX + headR*1.1, headCY - headR*1.1],
      [headCX + headR*1.7, h*0.82],
      [headCX - headR*1.7, h*0.82]
    ], ink);
  }

  // accents
  if(c.band){
    ctx.fillStyle = accent;
    ctx.fillRect(cx + shW/2 - 1, shY + h*0.30, 3, 1);
  }
  if(c.tie){
    ctx.fillStyle = accent;
    ctx.globalAlpha = .8;
    poly([[cx-1, shY+2],[cx+1, shY+2],[cx+1, hipY*0.86],[cx, hipY*0.92],[cx-1, hipY*0.86]]);
    ctx.globalAlpha = 1;
  }
  if(c.torch){
    ctx.fillStyle = accent; ctx.globalAlpha = .55;
    ctx.fillRect(cx + shW/2 + 1, shY + 3, 2, 2);
    ctx.globalAlpha = 1;
  }
  if(c.lantern){
    ctx.fillStyle = accent; ctx.globalAlpha = .9;
    ctx.fillRect(cx + shW/2 + 1, armY + armLen - 3, 3, 3);
    ctx.globalAlpha = .18;
    ctx.beginPath(); ctx.arc(cx + shW/2 + 2, armY + armLen - 2, 6, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  if(c.boxes){
    rect(cx - shW/2 - 3, armY + armLen - 6, 5, 4, '#0a0d12');
    rect(cx + shW/2 - 1, armY + armLen - 8, 4, 4, '#0a0d12');
  }
  if(c.extra){
    // too many arms
    rect(cx - shW/2 - 4, shY + h*0.06, 3, h*0.30, ink);
    rect(cx + shW/2 + 1, shY + h*0.10, 3, h*0.34, ink);
    ctx.fillStyle = accent; ctx.globalAlpha = .5;
    ctx.fillRect(cx - 1, shY + h*0.10, 1, h*0.26);
    ctx.globalAlpha = 1;
  }

  // a thin red seam for the building's own presence
  if(c.glitch){
    for(let y=0;y<h;y+=3){
      if((y/3)%3===0) continue;
      const shift = ((y*37)%7) - 3;
      if(shift === 0) continue;
      const row = ctx.getImageData(0, y, w, 1);
      ctx.putImageData(row, shift, y);
    }
  }
}

/* Replace the six hunter textures with this chapter's entity. */
E.apply = function(scene, n){
  if(!scene || !scene.textures) return;
  const base = scene.textures.exists('hunter_still') ? scene.textures.get('hunter_still').getSourceImage() : null;
  if(!base) return;
  const w = base.width, h = base.height;
  const cfg = CFG[n] || CFG[0];
  const poses = ['still','drift1','drift2','reach','lunge','rear'];
  poses.forEach(pose=>{
    const key = 'hunter_' + pose;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    drawEntity(cv.getContext('2d'), w, h, cfg, pose);
    if(scene.textures.exists(key)) scene.textures.remove(key);
    scene.textures.addCanvas(key, cv);
  });
  if(scene.hunterSprite){
    scene.hunterSprite.setTexture('hunter_still');
    if(cfg.height < 0.7) scene.hunterSprite.setScale(0.92);
    else if(cfg.height > 1.0) scene.hunterSprite.setScale(1.08);
    else scene.hunterSprite.setScale(1);
    try{
      scene.hunterSprite.setTint(n===2 ? 0xdfe9ff : (n===5 ? 0xffd6cc : 0xffffff));
    }catch(e){}
  }
};

/* Small preview of each entity for the ENTITY FILES panel. */
E.previewDataURL = function(n){
  const cfg = CFG[n] || CFG[0];
  const cv = document.createElement('canvas');
  cv.width = 26; cv.height = 40;
  drawEntity(cv.getContext('2d'), 26, 40, cfg, 'still');
  return cv.toDataURL();
};

})();
