'use strict';
/* SILENT MALL: painted pixel art, all generated in code. */
(function(){
  const M = window.MALL = window.MALL || {};
  M.TILE = 16;
  M.COLS = 64;
  M.ROWS = 30;
  M.WORLD_W = M.COLS * M.TILE;
  M.WORLD_H = M.ROWS * M.TILE;

  M.PAL = {
    ink:'#04070c', void:'#07080f', indigo:'#101a26', indigo2:'#162635',
    slate:'#1e3547', slate2:'#2b4a56', teal:'#3d6b62', teal2:'#54897c',
    bone:'#e8e0cc', bone2:'#c9c1ac', bone3:'#97917f',
    amber:'#f2b13c', amber2:'#a87928', amberDim:'#6d4c1e',
    red:'#d8332a', red2:'#8f201a', redBright:'#ff5a4d',
    green:'#7fe0b8', greenPale:'#d8ffe9', greenDim:'#3d7a67',
    black:'#0a0f15', white:'#f6f2e5'
  };

  const P = M.PAL;

  M.clamp = (v,a,b)=>v<a?a:(v>b?b:v);
  M.lerp = (a,b,t)=>a+(b-a)*t;
  M.fmt = (t)=>{
    t = Math.max(0,t);
    const m = Math.floor(t/60), s = Math.floor(t%60), d = Math.floor((t*10)%10);
    return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+d;
  };
  M.mulberry32 = function(a){
    return function(){
      a|=0; a = (a + 0x6D2B79F5)|0;
      let t = Math.imul(a ^ (a>>>15), 1|a);
      t = (t + Math.imul(t ^ (t>>>7), 61|t)) ^ t;
      return ((t ^ (t>>>14))>>>0)/4294967296;
    };
  };

  function cvs(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
  M.cvs = cvs;
  function R(ctx,x,y,w,h,col){ ctx.fillStyle=col; ctx.fillRect(x,y,w,h); }
  M.R = R;

  const BAYER = [0,8,2,10, 12,4,14,6, 3,11,1,9, 15,7,13,5];

  function ditherRect(x, tx, ty, w, h, c1, c2, amount, rnd){
    const ctx = x;
    const r = rnd || Math.random;
    for(let y=0;y<h;y++) for(let xx=0;xx<w;xx++){
      const q = (BAYER[((ty+y)&3)*4 + ((tx+xx)&3)] + 0.5)/16;
      ctx.fillStyle = (q < amount) ? c2 : c1;
      ctx.fillRect(tx+xx, ty+y, 1, 1);
    }
  }
  M.ditherRect = ditherRect;

  function ellipse(x, cx, cy, rx, ry, col){
    x.fillStyle = col;
    for(let y=-ry;y<=ry;y++){
      const v = 1 - (y*y)/(ry*ry);
      if(v<=0) continue;
      const w = Math.floor(rx*Math.sqrt(v));
      x.fillRect(Math.round(cx-w), Math.round(cy+y), w*2+1, 1);
    }
  }
  M.ellipse = ellipse;

  function ditherEllipse(x, cx, cy, rx, ry, col, amount, seed){
    const r = seed ? M.mulberry32(seed) : Math.random;
    for(let y=-ry;y<=ry;y++){
      for(let xx=-rx;xx<=rx;xx++){
        const d = (xx*xx)/(rx*rx) + (y*y)/(ry*ry);
        if(d>1) continue;
        const q = (BAYER[((cy+y)&3)*4 + ((cx+xx)&3)] + 0.5)/16;
        const a = (1-d) * amount;
        if(q < a){ x.fillStyle = col; x.fillRect(cx+xx, cy+y, 1, 1); }
      }
    }
  }
  M.ditherEllipse = ditherEllipse;

  /* ---------------- tiny 3x5 pixel type ---------------- */
  const F3 = {
    A:['010','101','111','101','101'], B:['110','101','110','101','110'],
    C:['011','100','100','100','011'], D:['110','101','101','101','110'],
    E:['111','100','110','100','111'], F:['111','100','110','100','100'],
    G:['011','100','101','101','011'], H:['101','101','111','101','101'],
    I:['111','010','010','010','111'], J:['001','001','001','101','010'],
    K:['101','101','110','101','101'], L:['100','100','100','100','111'],
    M:['101','111','111','101','101'], N:['101','111','111','111','101'],
    O:['010','101','101','101','010'], P:['110','101','110','100','100'],
    Q:['010','101','101','111','011'], R:['110','101','110','101','101'],
    S:['011','100','010','001','110'], T:['111','010','010','010','010'],
    U:['101','101','101','101','111'], V:['101','101','101','101','010'],
    W:['101','101','111','111','101'], X:['101','101','010','101','101'],
    Y:['101','101','010','010','010'], Z:['111','001','010','100','111'],
    '0':['111','101','101','101','111'], '1':['010','110','010','010','111'],
    '2':['111','001','111','100','111'], '3':['111','001','011','001','111'],
    '4':['101','101','111','001','001'], '5':['111','100','111','001','111'],
    '6':['111','100','111','101','111'], '7':['111','001','001','010','010'],
    '8':['111','101','111','101','111'], '9':['111','101','111','001','111'],
    '.':['000','000','000','000','010'], ':':['000','010','000','010','000'],
    '-':['000','000','111','000','000'], "'":['010','010','000','000','000'],
    '/':['001','001','010','100','100'], '!':['010','010','010','000','010'],
    ' ':['000','000','000','000','000'], '?':['111','001','011','000','010']
  };
  M.F3 = F3;

  M.tinyText = function(ctx, text, x, y, s, color, align){
    text = String(text).toUpperCase();
    s = s || 1;
    const adv = 4*s;
    let w = text.length*adv - s;
    if(align==='center') x = Math.round(x - w/2);
    else if(align==='right') x = Math.round(x - w);
    ctx.fillStyle = color;
    for(let i=0;i<text.length;i++){
      const g = F3[text[i]] || F3['?'];
      for(let ry=0;ry<5;ry++){
        const row = g[ry];
        for(let rx=0;rx<3;rx++){
          if(row[rx]==='1') ctx.fillRect(x + rx*s, y + ry*s, s, s);
        }
      }
      x += adv;
    }
    return w;
  };
  M.tinyTextWidth = (text,s)=>{ s=s||1; return String(text).length*(4*s)-s; };

  /* ---------------- glow + darkness-hole sprites ---------------- */
  function glowCanvas(size, rgb, power){
    const c = cvs(size,size), ctx = c.getContext('2d');
    const img = ctx.createImageData(size,size), d = img.data;
    const half = size/2;
    for(let y=0;y<size;y++) for(let x=0;x<size;x++){
      const dx = (x+0.5-half)/half, dy = (y+0.5-half)/half;
      const r = Math.sqrt(dx*dx+dy*dy);
      if(r>1) continue;
      let a = Math.pow(1-r, power||1.6);
      const q = (BAYER[(y&3)*4+(x&3)] + 0.5)/16;
      if(a < 0.985 && a < q) continue;
      const i = (y*size+x)*4;
      d[i]=rgb[0]; d[i+1]=rgb[1]; d[i+2]=rgb[2];
      d[i+3] = Math.round(255 * M.clamp(a*1.12,0,1));
    }
    ctx.putImageData(img,0,0);
    return c;
  }
  function holeCanvas(size, power){
    const c = cvs(size,size), ctx = c.getContext('2d');
    const img = ctx.createImageData(size,size), d = img.data;
    const half = size/2;
    for(let y=0;y<size;y++) for(let x=0;x<size;x++){
      const dx = (x+0.5-half)/half, dy = (y+0.5-half)/half;
      const r = Math.sqrt(dx*dx+dy*dy);
      if(r>1) continue;
      let a = Math.pow(1-r, power||1.35);
      const q = (BAYER[(y&3)*4+(x&3)] + 0.5)/16;
      if(a < 0.94 && a < q) continue;
      const i = (y*size+x)*4;
      d[i]=255; d[i+1]=255; d[i+2]=255; d[i+3]=Math.round(255*M.clamp(a*1.08,0,1));
    }
    ctx.putImageData(img,0,0);
    return c;
  }
  M.glowCanvas = glowCanvas;
  M.holeCanvas = holeCanvas;

  /* ---------------- floor tiles ---------------- */
  function tileTerrazzo(v, seed){
    const c=cvs(16,16), x=c.getContext('2d'); const r=M.mulberry32(seed);
    R(x,0,0,16,16, v? '#7e7b6b':'#868270');
    R(x,0,0,16,1,'#585a50'); R(x,0,0,1,16,'#585a50');
    R(x,0,15,16,1,'#6b6a5c'); R(x,15,0,1,16,'#6b6a5c');
    for(let i=0;i<26;i++){
      const xx=Math.floor(r()*16), yy=Math.floor(r()*16);
      const k=r();
      R(x,xx,yy,1,1, k<0.45?'#5b5c50':(k<0.8?'#a9a58f':'#c3bda6'));
    }
    ditherRect(x,0,0,16,16,'#7e7b6b','#6e6c5c',0.08,r);
    return c;
  }
  function tileChecker(v, seed){
    const c=cvs(16,16), x=c.getContext('2d'); const r=M.mulberry32(seed);
    for(let yy=0;yy<16;yy+=8) for(let xx=0;xx<16;xx+=8){
      const light = ((xx/8 + yy/8) % 2)===0;
      R(x,xx,yy,8,8, light?'#b0a892':'#252d31');
      if(!light) ditherRect(x,xx,yy,8,8,'#252d31','#171d21',0.3,r);
    }
    R(x,0,0,16,1,'#4b4d45'); R(x,0,0,1,16,'#4b4d45');
    for(let i=0;i<9;i++){
      const xx=Math.floor(r()*16), yy=Math.floor(r()*16);
      R(x,xx,yy,1,1, r()<0.5?'#5e6055':'#e0d8c1');
    }
    return c;
  }
  function tileWet(v, seed){
    const c=cvs(16,16), x=c.getContext('2d'); const r=M.mulberry32(seed);
    R(x,0,0,16,16,'#5d6968');
    ditherRect(x,0,0,16,16,'#5d6968','#495655',0.34,r);
    R(x,0,0,16,1,'#3f4c4d'); R(x,0,0,1,16,'#3f4c4d');
    ditherEllipse(x, 8, 10, 5, 4, '#2b3436', 0.9, seed+9);
    ditherEllipse(x, 5, 10, 2, 1, '#7d8a87', 0.5, seed+3);
    for(let i=0;i<6;i++) R(x,Math.floor(r()*16),Math.floor(r()*16),1,1,'#77837f');
    return c;
  }
  function tileCrack(v, seed){
    const c=cvs(16,16), x=c.getContext('2d'); const r=M.mulberry32(seed);
    R(x,0,0,16,16,'#767466');
    ditherRect(x,0,0,16,16,'#767466','#636254',0.22,r);
    R(x,0,0,16,1,'#4f5148'); R(x,0,0,1,16,'#4f5148');
    const ox=Math.floor(r()*12)+2, oy=2;
    let xx=ox, yy=oy;
    for(let i=0;i<11;i++){
      R(x,xx,yy,1,1,'#242827'); if(r()<0.45) R(x,xx+1,yy,1,1,'#242827');
      xx += r()<0.5?-1:1;
      if(r()<0.25) R(x,xx,yy,1,2,'#242827');
      yy += 1;
      if(yy>14) break;
    }
    R(x,Math.floor(r()*14),Math.floor(r()*14),1,1,'#b2ac95');
    return c;
  }
  function tileCarpet(v, seed){
    const c=cvs(16,16), x=c.getContext('2d'); const r=M.mulberry32(seed);
    R(x,0,0,16,16,'#5d2d2d');
    ditherRect(x,0,0,16,16,'#5d2d2d','#472020',0.35,r);
    ditherRect(x,0,0,16,16,'#6b3735','#512728',0.12,r);
    for(let i=0;i<14;i++) R(x,Math.floor(r()*16),Math.floor(r()*16),1,1, r()<0.5?'#733f39':'#381919');
    R(x,0,0,16,1,'#3a1b1c'); R(x,0,0,1,16,'#3a1b1c');
    return c;
  }
  function tileGrate(v, seed){
    const c=cvs(16,16), x=c.getContext('2d'); const r=M.mulberry32(seed);
    R(x,0,0,16,16,'#2b3334'); R(x,1,1,14,14,'#151b1d');
    for(let yy=2;yy<15;yy+=3){
      R(x,1,yy,14,1,'#465251');
      R(x,1,yy+1,14,1,'#080c0d');
    }
    R(x,0,0,16,1,'#424b4a'); R(x,0,0,1,16,'#424b4a');
    for(let i=0;i<5;i++) R(x,Math.floor(r()*14)+1,Math.floor(r()*14)+1,1,1,'#776b4f');
    return c;
  }

  M.tiles = {
    terra:[tileTerrazzo(0,11),tileTerrazzo(1,29)],
    checker:[tileChecker(0,7),tileChecker(1,41)],
    wet:[tileWet(0,13),tileWet(1,53)],
    crack:[tileCrack(0,17),tileCrack(1,67)],
    carpet:[tileCarpet(0,19),tileCarpet(1,71)],
    grate:[tileGrate(0,23),tileGrate(1,79)]
  };

  /* ---------------- wall top caps ---------------- */
  function wallCap(v, seed){
    const c=cvs(16,16), x=c.getContext('2d'); const r=M.mulberry32(seed);
    R(x,0,0,16,16,'#1b2931');
    ditherRect(x,0,0,16,16,'#1b2931','#141f26',0.28,r);
    R(x,0,0,16,2,'#33484d'); R(x,0,2,16,1,'#263a3e');
    R(x,0,0,2,16,'#24363b');
    R(x,0,13,16,3,'#0b1318'); R(x,0,15,16,1,'#05090d');
    R(x,2,3,1,4,'#0e181d'); R(x,12,3,1,3,'#0e181d');
    R(x,7,3,1,6,'#0d171c'); R(x,3,9,4,1,'#0d171c');
    if(v) { R(x,9,6,3,2,'#3f5a5a'); }
    return c;
  }
  M.wallCaps = [wallCap(0,101), wallCap(1,109)];

  /* ---------------- facades ---------------- */
  function facadeBase(w,h){
    const c=cvs(w,h), x=c.getContext('2d'); const r=M.mulberry32(w*131+h*71);
    R(x,0,0,w,h,'#0a1217');
    // top metal ledge
    R(x,0,0,w,2,'#2a3b40'); R(x,0,2,w,1,'#3f565a');
    // sign band
    R(x,1,4,w-2,9,'#0b1418'); R(x,1,4,w-2,1,'#253c40');
    // storefront area base
    R(x,0,13,w,31,'#101b20');
    // baseboard
    R(x,0,44,w,4,'#0a1115'); R(x,0,44,w,1,'#22363a');
    return {c,x,r};
  }
  function signOn(x,w,text,color,glow){
    const tw = M.tinyTextWidth(text,1);
    const sx = Math.floor((w-tw)/2);
    if(glow){
      for(let i=0;i<3;i++) ditherRect(x, sx-3+i, 5+i, tw+6-i*2, 1, 'transparent', color, 0.16);
    }
    M.tinyText(x, text, sx, 6, 1, color);
    // a couple of dead pixels in the sign
    x.fillStyle='#05090b';
    x.fillRect(sx+Math.floor(tw*0.42),6,1,1);
  }
  function facadeGlass(w, text, signColor, lit, seed){
    const {c,x,r} = facadeBase(w,48);
    signOn(x,w,text,signColor,lit);
    // glass
    R(x,2,15,w-4,27,'#050a0e');
    for(let bx=2;bx<w-2;bx+=12){
      R(x,bx,15,1,27,'#1a2a2e'); R(x,bx+1,15,1,27,'#0a1215');
    }
    // reflections
    for(let i=0;i<4;i++){
      const sx=4+Math.floor(r()*(w-10)); const sy=16+Math.floor(r()*10);
      for(let k=0;k<3;k++) R(x,sx+k,sy+k,1,1, lit?'#2c4f4b':'#1b3236');
    }
    // interior silhouettes
    if(w>=60){
      R(x,Math.floor(w*0.2),30,10,8,'#0a1013');
      R(x,Math.floor(w*0.2)+2,27,6,3,'#0a1013');
    }
    // door
    const dx=Math.floor(w/2)-5;
    R(x,dx,18,10,24,'#0a1215');
    R(x,dx+1,19,8,22,'#101d20');
    R(x,dx+1,19,1,22, lit?'#2c5148':'#1a3034');
    R(x,dx+5,19,1,22,'#0a1215');
    // grime
    ditherRect(x,2,38,w-4,5,'#050a0e','#000000',0.35,r);
    // tag
    if(w>40) M.tinyText(x, 'CLOSED', 4, 39, 1, '#2c4a44');
    return c;
  }
  function facadeShutter(w, text, seed){
    const {c,x,r} = facadeBase(w,48);
    signOn(x,w,text,'#5a6a62',false);
    R(x,1,14,w-2,30,'#232d30');
    for(let yy=15;yy<43;yy+=3){
      R(x,1,yy,w-2,2,'#2f3b3d');
      R(x,1,yy+2,w-2,1,'#11181b');
    }
    // rust
    for(let i=0;i<Math.floor(w*0.5);i++) R(x,1+Math.floor(r()*(w-2)),15+Math.floor(r()*27),1,1, r()<0.5?'#6a4a2c':'#4a3a26');
    // lock box
    R(x,Math.floor(w/2)-3,36,6,6,'#141c1e');
    R(x,Math.floor(w/2)-1,38,2,2,'#8a7a52');
    // small closed sign
    if(w>36) M.tinyText(x,'CLOSED', Math.floor(w/2)-10, 18, 1, '#6b5a45');
    return c;
  }
  function facadeBoards(w, text, seed){
    const {c,x,r} = facadeBase(w,48);
    signOn(x,w,text,'#6b6350',false);
    R(x,1,14,w-2,30,'#6b6656');
    for(let yy=14;yy<44;yy+=5){
      R(x,1,yy,w-2,4,'#827b67');
      R(x,1,yy,w-2,1,'#9a9179');
      R(x,1,yy+4,w-2,1,'#4a473c');
      const off=Math.floor(r()*6);
      R(x,2+off,yy+2,1,1,'#2a2822');
      R(x,w-3-off,yy+2,1,1,'#2a2822');
    }
    // torn poster
    R(x,Math.floor(w*0.6),22,10,14,'#b9b29b');
    R(x,Math.floor(w*0.6)+1,23,8,7,'#7b4040');
    R(x,Math.floor(w*0.6)+2,31,6,1,'#4b463a');
    R(x,Math.floor(w*0.6)+2,33,4,1,'#4b463a');
    return c;
  }
  function facadePoster(w, text, seed){
    const {c,x,r} = facadeBase(w,48);
    signOn(x,w,text,'#7a7362',false);
    // tile
    R(x,1,14,w-2,30,'#35544f');
    for(let yy=14;yy<44;yy+=6) R(x,1,yy,w-2,1,'#263f3c');
    for(let xx=1;xx<w-1;xx+=8) R(x,xx,14,1,30,'#263f3c');
    // posters
    const posters = Math.max(1, Math.floor(w/18));
    for(let i=0;i<posters;i++){
      const pw=12, ph=17;
      const px=3 + i*Math.floor((w-6)/posters) + 2;
      const py=17 + Math.floor(r()*3);
      R(x,px,py,pw,ph,'#0b1114');
      const col = i%3===0?'#8f3a32':(i%3===1?'#b9a26b':'#4d7a6e');
      R(x,px+1,py+1,pw-2,ph-2,'#a9a28c');
      R(x,px+1,py+1,pw-2,6,col);
      R(x,px+3,py+9,6,1,'#4c483d');
      R(x,px+3,py+11,5,1,'#4c483d');
      R(x,px+3,py+13,4,1,'#4c483d');
      // torn corner
      R(x,px+pw-3,py+ph-3,2,2,'#35544f');
    }
    ditherRect(x,1,38,w-2,6,'#35544f','#0a1217',0.4,r);
    return c;
  }
  function facadeGrate(w, text, seed){
    const {c,x,r} = facadeBase(w,48);
    signOn(x,w,text,'#6b6250',false);
    R(x,1,14,w-2,30,'#304b47');
    for(let yy=14;yy<44;yy+=5) R(x,1,yy,w-2,1,'#223936');
    // vent
    const vx=Math.floor(w/2)-8, vy=21;
    R(x,vx,vy,16,15,'#1a2424');
    R(x,vx+1,vy+1,14,13,'#0b1213');
    for(let yy=vy+2;yy<vy+13;yy+=3) R(x,vx+2,yy,12,1,'#5f5a48');
    R(x,vx,vy,16,1,'#6d6650');
    for(let i=0;i<8;i++) R(x,vx+1+Math.floor(r()*14),vy+1+Math.floor(r()*13),1,1,'#8a5d2e');
    return c;
  }
  function facadePayphone(w, text, seed){
    const {c,x,r} = facadeBase(w,48);
    signOn(x,w,text,'#5f6a5c',false);
    R(x,1,14,w-2,30,'#33504b');
    for(let yy=14;yy<44;yy+=6) R(x,1,yy,w-2,1,'#253d3a');
    // phone box
    const vx=Math.floor(w/2)-6, vy=17;
    R(x,vx,vy,12,22,'#10191b');
    R(x,vx+1,vy+1,10,20,'#1b2a2c');
    R(x,vx+2,vy+2,8,5,'#08200f');
    M.tinyText(x,'CALL',vx+2,vy+3,1,'#4f9f66');
    // handset
    R(x,vx+2,vy+10,2,6,'#2c3d3c');
    R(x,vx+8,vy+10,2,6,'#2c3d3c');
    R(x,vx+2,vy+9,8,2,'#4b5e5a');
    // cord
    R(x,vx+5,vy+12,1,6,'#2a3836'); R(x,vx+6,vy+16,2,1,'#2a3836');
    return c;
  }
  function facadeTile(w, text, signColor, seed){
    const {c,x,r} = facadeBase(w,48);
    signOn(x,w,text,signColor,false);
    R(x,1,14,w-2,30,'#385450');
    for(let yy=14;yy<44;yy+=6){ R(x,1,yy,w-2,1,'#29423f'); }
    for(let xx=1;xx<w-1;xx+=8){ R(x,xx,14,1,30,'#29423f'); }
    ditherRect(x,1,32,w-2,12,'#385450','#152825',0.28,r);
    for(let i=0;i<4;i++) R(x,2+Math.floor(r()*(w-4)),15+Math.floor(r()*26),1,1,'#596f63');
    return c;
  }
  function facadeDoors(w, seed){
    const {c,x,r} = facadeBase(w,48);
    signOn(x,w,'EXIT','#ff5a4d',true);
    R(x,2,14,w-4,30,'#0b1114');
    // double doors
    const dw=Math.floor((w-8)/2);
    for(let d=0;d<2;d++){
      const dx=4+d*(dw+1);
      R(x,dx,16,dw,28,'#1b2a2d');
      R(x,dx+1,17,dw-2,26,'#223538');
      R(x,dx+1,18,dw-2,9,'#162427');
      R(x,dx+2,31,dw-4,2,'#8e8568'); // push bar
      R(x,dx+2,34,dw-4,1,'#0c1416');
    }
    // red emergency lamps
    R(x,3,15,2,2,'#ff5a4d'); R(x,w-5,15,2,2,'#ff5a4d');
    for(let i=0;i<4;i++) ditherEllipse(x, 4, 16, 5, 4, '#d8332a', 0.2, seed+i);
    return c;
  }

  M.facades = {};
  M.makeFacade = function(kind, w, sign, color, seed){
    switch(kind){
      case 'glass': return facadeGlass(w, sign||'', color||'#7fe0b8', true, seed||7);
      case 'darkglass': return facadeGlass(w, sign||'', color||'#5f8378', false, seed||7);
      case 'shutter': return facadeShutter(w, sign||'', seed||7);
      case 'boards': return facadeBoards(w, sign||'', seed||7);
      case 'poster': return facadePoster(w, sign||'', seed||7);
      case 'grate': return facadeGrate(w, sign||'', seed||7);
      case 'payphone': return facadePayphone(w, sign||'', seed||7);
      case 'doors': return facadeDoors(w, seed||7);
      default: return facadeTile(w, sign||'', color||'#7a7362', seed||7);
    }
  };

  /* ---------------- pickups and debris ---------------- */
  function keycard(){
    const c=cvs(12,9), x=c.getContext('2d');
    R(x,0,1,12,7,'#04070c');
    R(x,1,2,10,5,'#0f2b22');
    R(x,2,3,8,3,'#7fe0b8');
    R(x,2,3,8,1,'#d8ffe9');
    R(x,2,5,4,1,'#0a1a15');
    R(x,9,3,1,3,'#c9a24a');
    return c;
  }
  function can(){
    const c=cvs(7,6), x=c.getContext('2d');
    R(x,1,0,5,1,'#04070c');
    R(x,0,1,7,4,'#04070c');
    R(x,1,1,5,4,'#7d4a3a');
    R(x,1,1,2,4,'#b76a4d');
    R(x,2,2,3,2,'#d8d0bb');
    R(x,1,5,5,1,'#04070c');
    return c;
  }
  M.keycard = keycard();
  M.can = can();

  function gate(){
    const c=cvs(18,96), x=c.getContext('2d'); const r=M.mulberry32(777);
    // rolled housing at the top
    R(x,0,0,18,6,'#1d2a2e'); R(x,0,0,18,2,'#3b5054'); R(x,0,5,18,1,'#080d10');
    // gate slats
    R(x,1,6,16,87,'#2b3639');
    for(let yy=7;yy<92;yy+=4){
      R(x,1,yy,16,2,'#39484b');
      R(x,1,yy+2,16,1,'#131b1e');
      R(x,1,yy,16,1,'#45575a');
    }
    // side rails
    R(x,0,6,1,88,'#111a1d'); R(x,17,6,1,88,'#111a1d');
    R(x,2,6,1,88,'#1b2629'); R(x,15,6,1,88,'#1b2629');
    // bottom bar
    R(x,0,92,18,4,'#0d1417'); R(x,1,92,16,1,'#4a5c5f');
    // rust + grime
    for(let i=0;i<26;i++) R(x,2+Math.floor(r()*14),8+Math.floor(r()*82),1,1, r()<0.5?'#5a4328':'#46382a');
    // lock box
    R(x,5,78,8,9,'#0b1114'); R(x,6,79,6,7,'#1d292c');
    R(x,7,81,4,2,'#d8332a'); R(x,8,81,2,1,'#ff8f7f');
    // small red glow through the top gap
    ditherRect(x,1,6,16,3,'#2b3639','#d8332a',0.12,r);
    return c;
  }
  M.gate = gate();

  /* ---------------- props ---------------- */
  function shadow(w,h){
    const c=cvs(w,h), x=c.getContext('2d');
    ditherEllipse(x, Math.floor(w/2), Math.floor(h/2), Math.floor(w/2)-1, Math.floor(h/2)-1, '#000000', 0.85, 77);
    return c;
  }
  M.shadow = shadow;

  function fountain(){
    const c=cvs(46,40), x=c.getContext('2d'); const r=M.mulberry32(301);
    // contact shadow
    ditherEllipse(x,23,33,22,6,'#000000',0.75,3);
    // basin front + rim
    ellipse(x,23,22,22,12,'#6d6a5a');
    ellipse(x,23,20,22,12,'#a9a28a');
    ellipse(x,23,19,20,10,'#7f7a67');
    ellipse(x,23,19,18,9,'#222f30');
    ellipse(x,23,20,16,7,'#182426');
    ditherEllipse(x,23,20,15,6,'#0d181a',0.55,7);
    // coins
    for(let i=0;i<26;i++){
      const a=r()*Math.PI*2, rad=r()*13;
      const px=Math.round(23+Math.cos(a)*rad), py=Math.round(20+Math.sin(a)*rad*0.55);
      R(x,px,py,1,1, r()<0.55?'#c8a54c':'#8f8d76');
    }
    // pedestal
    R(x,20,9,6,13,'#8f8a76'); R(x,21,9,4,13,'#b8b19a');
    R(x,20,9,6,1,'#cec7ae'); R(x,18,7,10,4,'#7a7564');
    R(x,18,6,10,1,'#a9a28a');
    // broken spout
    R(x,22,4,2,4,'#5d5a4c');
    // cracks / grime
    R(x,18,24,1,4,'#443f35'); R(x,30,23,1,3,'#443f35');
    ditherEllipse(x,23,27,20,5,'#5c5a4c',0.23,11);
    return c;
  }
  function palm(){
    const c=cvs(24,38), x=c.getContext('2d'); const r=M.mulberry32(302);
    ditherEllipse(x,12,35,9,3,'#000000',0.7,4);
    // pot
    R(x,7,27,10,9,'#6b4b3b'); R(x,8,28,8,7,'#8a6450');
    R(x,6,27,12,2,'#9b7358'); R(x,7,31,10,1,'#4c3328');
    R(x,9,34,1,2,'#3a271f'); R(x,13,29,1,3,'#3a271f');
    // trunk
    for(let i=0;i<18;i++){
      const px=12+Math.round(Math.sin(i*0.55)*1.2), py=27-i;
      R(x,px,py,2,1, i%4===0?'#8a7a55':'#6c6248');
    }
    // fronds
    const fr=[[-10,-8],[-7,-12],[3,-13],[10,-9],[-12,-3],[12,-4],[-6,-4],[5,-5]];
    for(let f=0;f<fr.length;f++){
      const [tx,ty]=fr[f];
      let px=12, py=9;
      const steps=10;
      for(let i=1;i<=steps;i++){
        const q=i/steps;
        px=12+tx*q + Math.sin(q*3+f)*2;
        py=9+ty*q + q*q*7;
        R(x,Math.round(px),Math.round(py),2,1, f%2?'#3d6b62':'#2b4d47');
        if(i%3===0) R(x,Math.round(px)-1,Math.round(py)+1,1,1,'#54897c');
      }
    }
    return c;
  }
  function bench(){
    const c=cvs(38,20), x=c.getContext('2d');
    ditherEllipse(x,19,17,17,3,'#000000',0.6,5);
    // legs
    R(x,4,11,2,8,'#1d292b'); R(x,32,11,2,8,'#1d292b');
    R(x,5,17,12,2,'#1d292b');
    // seat slats
    for(let i=0;i<3;i++){
      const yy=8+i*3;
      R(x,2,yy,34,3,'#6b5238'); R(x,2,yy,34,1,'#96764e');
      R(x,2,yy+2,34,1,'#423222');
    }
    // back
    for(let i=0;i<2;i++){
      const yy=2+i*3;
      R(x,4,yy,30,2,'#5a452f'); R(x,4,yy,30,1,'#856843');
    }
    R(x,4,1,2,8,'#1d292b'); R(x,32,1,2,8,'#1d292b');
    return c;
  }
  function arcade(){
    const c=cvs(24,34), x=c.getContext('2d');
    ditherEllipse(x,12,31,11,3,'#000000',0.7,6);
    // glow behind
    ditherEllipse(x,12,15,14,12,'#7fe0b8',0.18,8);
    R(x,4,4,16,28,'#0d171f');
    R(x,5,5,14,26,'#1a2b35');
    R(x,3,9,18,14,'#101c22');
    R(x,6,10,12,10,'#081410');
    // screen
    R(x,7,11,10,8,'#0a2a1e');
    R(x,8,12,8,6,'#7fe0b8');
    R(x,9,13,2,2,'#0a2a1e'); R(x,13,15,2,1,'#0a2a1e');
    R(x,10,14,1,2,'#0a2a1e');
    for(let i=0;i<5;i++) R(x,8+i,18,1,1,'#7fe0b8');
    // marquee
    R(x,5,5,14,3,'#3d2a66');
    M.tinyText(x,'GHOST',8,6,1,'#c9bff0');
    // control deck
    R(x,4,23,16,3,'#0b1318');
    R(x,8,22,1,1,'#d8332a'); R(x,12,22,1,1,'#f2b13c');
    R(x,6,27,12,3,'#080e12');
    R(x,9,29,6,1,'#2b3c42');
    // coin slot
    R(x,16,25,2,3,'#f2b13c');
    return c;
  }
  function vending(){
    const c=cvs(22,38), x=c.getContext('2d'); const r=M.mulberry32(88);
    ditherEllipse(x,11,35,10,3,'#000000',0.7,9);
    R(x,2,4,18,31,'#0c1419');
    R(x,3,5,16,29,'#253b42');
    R(x,4,15,14,18,'#0a1a16');
    // lit panel
    R(x,5,16,12,16,'#12322a');
    for(let yy=0;yy<3;yy++) for(let xx=0;xx<4;xx++){
      const cols=['#d8332a','#f2b13c','#7fe0b8','#c9c1ac'];
      R(x,6+xx*3,17+yy*5,2,4,cols[(xx+yy)%4]);
    }
    R(x,5,14,12,2,'#7fe0b8');
    R(x,5,33,12,2,'#0a0f12');
    // top sign
    R(x,2,2,18,4,'#392a20');
    M.tinyText(x,'DRINK',4,3,1,'#f2b13c');
    // coin slot
    R(x,16,33,2,2,'#8a7a52');
    for(let i=0;i<6;i++) R(x,3+Math.floor(r()*15),5+Math.floor(r()*27),1,1,'#101a1e');
    return c;
  }
  function payphoneProp(){
    const c=cvs(14,28), x=c.getContext('2d');
    ditherEllipse(x,7,25,5,2,'#000000',0.6,10);
    R(x,2,3,10,22,'#0c1517');
    R(x,3,4,8,20,'#1d2e30');
    R(x,4,5,6,4,'#08200f');
    M.tinyText(x,'CALL',4,6,1,'#4f9f66');
    R(x,4,11,1,6,'#3e514d'); R(x,9,11,1,6,'#3e514d');
    R(x,4,10,6,2,'#556863');
    R(x,6,13,1,7,'#2a3836');
    R(x,6,20,3,1,'#2a3836');
    return c;
  }
  function kiosk(){
    const c=cvs(20,34), x=c.getContext('2d');
    ditherEllipse(x,10,31,9,3,'#000000',0.6,11);
    R(x,3,2,14,27,'#0d161a'); R(x,4,3,12,25,'#223238');
    R(x,5,5,10,10,'#0a1215');
    R(x,6,6,8,8,'#142a26');
    // map
    R(x,7,7,2,6,'#2f5a4c'); R(x,10,9,3,1,'#2f5a4c'); R(x,9,12,1,1,'#2f5a4c');
    R(x,11,12,1,1,'#d8332a');
    R(x,5,17,10,2,'#7fe0b8');
    M.tinyText(x,'MAP',7,20,1,'#5f8378');
    R(x,7,27,6,4,'#0a1114');
    return c;
  }
  function rubberPlant(){
    const c=cvs(20,28), x=c.getContext('2d'); const r=M.mulberry32(402);
    ditherEllipse(x,10,25,8,2,'#000000',0.6,12);
    R(x,6,20,8,7,'#4a3428'); R(x,7,21,6,5,'#6b4b39');
    R(x,6,20,8,1,'#86604a');
    const leaves=[[-6,-13],[-3,-17],[3,-18],[7,-14],[-8,-6],[8,-7],[-1,-9],[2,-6]];
    for(let i=0;i<leaves.length;i++){
      const [tx,ty]=leaves[i];
      for(let k=0;k<8;k++){
        const q=k/8;
        R(x,Math.round(10+tx*q),Math.round(20+ty*q),1+(k%2),1, i%2?'#1d3a33':'#2f5a4c');
      }
      R(x,Math.round(10+tx*0.6),Math.round(20+ty*0.6),2,1,'#3d6b62');
    }
    return c;
  }

  M.props = {
    fountain:fountain(), palm:palm(), bench:bench(), arcade:arcade(),
    vending:vending(), payphone:payphoneProp(), kiosk:kiosk(), rubber:rubberPlant()
  };

  /* ---------------- ceiling lights ---------------- */
  function tube(state){
    const c=cvs(42,16), x=c.getContext('2d');
    // housing
    R(x,0,2,42,6,'#1c292d'); R(x,1,3,40,3,'#2b3b3f');
    R(x,3,4,36,2,'#0e1619');
    R(x,0,8,42,1,'#080d10');
    // end caps
    R(x,2,5,3,2,'#46575a'); R(x,37,5,3,2,'#46575a');
    if(state===0){
      R(x,6,5,30,1,'#45504f');
      R(x,8,5,6,1,'#59635f');
    } else if(state===1){
      R(x,6,5,30,1,'#4a5754');
      R(x,6,5,13,1,'#d8ffe9'); R(x,19,5,4,1,'#7fe0b8');
      R(x,25,5,8,1,'#d8ffe9');
      // sparkle
      R(x,7,4,1,1,'#ffffff'); R(x,28,4,1,1,'#ffffff');
    } else {
      R(x,6,5,30,1,'#f4fff9'); R(x,6,4,30,1,'#d8ffe9');
      R(x,6,6,30,1,'#7fe0b8');
      for(let i=0;i<20;i++) R(x,6+i*1.5,3,1,1,'#ffffff');
    }
    return c;
  }
  function hazard(){
    const c=cvs(24,22), x=c.getContext('2d');
    R(x,10,0,4,3,'#2c3a3c'); R(x,8,2,8,2,'#405458');
    // cage
    R(x,5,5,14,10,'#1b282b');
    R(x,6,6,12,8,'#2c3d3f');
    // bulb
    R(x,9,8,6,5,'#f2b13c'); R(x,10,9,4,3,'#ffe0a0');
    // bars
    R(x,7,5,1,11,'#0e1619'); R(x,12,5,1,11,'#0e1619'); R(x,16,5,1,11,'#0e1619');
    R(x,5,15,14,1,'#0e1619');
    // glow
    ditherEllipse(x,12,11,10,8,'#f2b13c',0.2,13);
    return c;
  }
  M.lights = { dead:tube(0), flick:tube(1), awake:tube(2), amber:hazard() };

  /* ---------------- exit sign ---------------- */
  function exitSign(){
    const c=cvs(38,20), x=c.getContext('2d');
    // halo
    ditherEllipse(x,19,10,18,10,'#d8332a',0.22,14);
    ditherEllipse(x,19,10,13,7,'#ff5a4d',0.28,15);
    // housing
    R(x,3,3,32,15,'#0b0d10');
    R(x,4,4,30,13,'#151216');
    R(x,4,16,30,1,'#2c2326');
    // sign
    R(x,5,5,28,10,'#1a0908');
    R(x,6,6,26,8,'#300b09');
    M.tinyText(x,'EXIT',8,7,2,'#ff5a4d','center');
    // hot core
    R(x,14,8,10,1,'#ffd0c8');
    // metal top
    R(x,4,2,30,2,'#3a4446'); R(x,5,1,28,1,'#5c6a6a');
    return c;
  }
  M.exitSign = exitSign();

  /* ---------------- figures ---------------- */
  const BOY = {
    out:'#04070c', hood:'#1b2b45', hoodD:'#0d1626', hoodL:'#33516b',
    face:'#cfc9b8', faceD:'#9d9786', eye:'#eafff6', pack:'#2f3d30',
    packL:'#52664a', boot:'#0a0f16', bootL:'#1b2630', strap:'#54897c'
  };
  function boy(pose){
    const c=cvs(18,28), x=c.getContext('2d');
    const B=BOY;
    const crouch = pose==='sneak';
    const top = crouch?4:2;
    const bodyY = crouch?12:11;
    const legY = crouch?20:20;
    const o=B.out;
    // outline blob
    R(x,5,top,8,3,o); R(x,4,top+1,10,8,o); R(x,5,top+8,8,4,o);
    R(x,4,bodyY,10,9,o); R(x,3,bodyY+2,12,6,o);
    R(x,5,legY,9,7,o); R(x,4,legY+5,10,2,o);
    // hood
    R(x,5,top+1,8,2,B.hood);
    R(x,5,top+1,4,8,B.hoodL);
    R(x,6,top+3,6,5,B.hood);
    // face
    R(x,7,top+3,5,5,B.face);
    R(x,7,top+3,5,1,B.faceD);
    R(x,8,top+4,1,1,B.eye); R(x,10,top+4,1,1,B.eye);
    R(x,9,top+7,1,1,'#6f6a5d');
    // hood rim / highlight
    R(x,4,top+2,1,7,B.hoodL);
    R(x,11,top+2,1,7,B.hood);
    R(x,6,top+9,6,1,B.hoodD);
    // body
    R(x,5,bodyY,8,8,B.hood);
    R(x,5,bodyY,2,8,B.hoodL);
    R(x,11,bodyY,2,8,B.hoodD);
    // backpack
    R(x,4,bodyY+1,2,6,B.pack); R(x,4,bodyY+1,1,6,B.packL);
    // strap
    R(x,6,bodyY,1,1,B.strap); R(x,7,bodyY+1,1,1,B.strap); R(x,8,bodyY+2,1,1,B.strap); R(x,9,bodyY+3,1,1,B.strap);
    R(x,10,bodyY+4,1,1,B.strap);
    // pocket
    R(x,7,bodyY+5,4,1,B.hoodD);
    // arms
    if(pose==='caught'){
      R(x,2,top+8,3,5,o); R(x,3,top+9,2,4,B.hood);
      R(x,13,top+8,3,5,o); R(x,13,top+9,2,4,B.hood);
      R(x,3,top+7,2,2,B.face); R(x,13,top+7,2,2,B.face);
    } else if(pose==='startled'){
      R(x,2,bodyY+1,3,5,o); R(x,3,bodyY+2,2,4,B.hood);
      R(x,13,bodyY+1,3,5,o); R(x,13,bodyY+2,2,4,B.hood);
      R(x,3,bodyY+5,2,2,B.face); R(x,13,bodyY+5,2,2,B.face);
      R(x,8,top+3,1,1,'#ffffff'); R(x,10,top+3,1,1,'#ffffff');
      R(x,8,top+5,3,1,'#3a2b2b');
    } else {
      R(x,3,bodyY+1,3,6,o); R(x,4,bodyY+2,2,5,B.hood);
      R(x,12,bodyY+1,3,6,o); R(x,13,bodyY+2,2,5,B.hood);
      // hands
      R(x,4,bodyY+6,2,2,B.face); R(x,13,bodyY+6,2,2,B.face);
      // torch
      R(x,13,bodyY+7,3,2,'#222a2a'); R(x,15,bodyY+7,1,1,'#f2b13c');
      R(x,16,bodyY+7,1,1,'#c59537');
    }
    // legs
    if(pose==='walk1'){
      R(x,5,legY,3,5,B.hoodD); R(x,10,legY,3,4,B.hood);
      R(x,3,legY+5,4,2,o); R(x,11,legY+4,4,2,o);
      R(x,4,legY+5,3,2,B.boot); R(x,12,legY+4,3,2,B.boot);
      R(x,4,legY+6,3,1,B.bootL); R(x,12,legY+5,3,1,B.bootL);
    } else if(pose==='walk2'){
      R(x,5,legY,3,4,B.hoodD); R(x,10,legY,3,5,B.hood);
      R(x,3,legY+4,4,2,o); R(x,11,legY+5,4,2,o);
      R(x,4,legY+4,3,2,B.boot); R(x,12,legY+5,3,2,B.boot);
      R(x,4,legY+5,3,1,B.bootL); R(x,12,legY+6,3,1,B.bootL);
    } else if(pose==='sneak'){
      R(x,5,legY,3,4,B.hoodD); R(x,10,legY,3,4,B.hoodD);
      R(x,3,legY+4,4,2,o); R(x,11,legY+4,4,2,o);
      R(x,4,legY+4,3,2,B.boot); R(x,12,legY+4,3,2,B.boot);
    } else {
      R(x,5,legY,3,6,B.hoodD); R(x,10,legY,3,6,B.hood);
      R(x,4,legY+6,4,2,B.boot); R(x,11,legY+6,4,2,B.boot);
      R(x,4,legY+7,4,1,B.bootL); R(x,11,legY+7,4,1,B.bootL);
    }
    // outline fixes
    R(x,3,bodyY,1,7,o); R(x,14,bodyY,1,7,o);
    R(x,4,legY+7,4,1,o); R(x,11,legY+7,4,1,o);
    return c;
  }
  M.boy = {
    idle:boy('idle'), walk1:boy('walk1'), walk2:boy('walk2'),
    sneak:boy('sneak'), startled:boy('startled'), caught:boy('caught')
  };

  const MAN = {
    out:'#05070a', bone:'#e8e0cc', boneD:'#b2ac9c', boneS:'#8c877a',
    boneL:'#fbf7ea', seam:'#5d5950', hollow:'#161110', crack:'#2b2420'
  };
  function hunter(pose){
    const tall = pose==='rear';
    const W=24, H=tall?56:48;
    const c=cvs(W,H), x=c.getContext('2d');
    const M2=MAN;
    const base=H-1;
    const hip=base-14, chest=base-26, headB=base-34;
    // outline
    R(x,7,headB-9,10,12,M2.out);
    R(x,6,chest-2,12,hip-chest+5,M2.out);
    R(x,4,chest,3,20,M2.out); R(x,17,chest,3,20,M2.out);
    R(x,7,hip,4,16,M2.out); R(x,13,hip,4,16,M2.out);
    R(x,5,base-2,7,3,M2.out); R(x,12,base-2,7,3,M2.out);
    // head oval tilted
    const hx = tall?8:7;
    R(x,hx+1,headB-8,8,3,M2.bone);
    R(x,hx,headB-6,10,7,M2.bone);
    R(x,hx+1,headB+1,8,3,M2.bone);
    R(x,hx+1,headB-8,3,3,M2.boneL);
    R(x,hx+7,headB-5,2,6,M2.boneD);
    R(x,hx+2,headB-3,1,4,M2.boneL);
    // neck seam
    R(x,9,headB+4,7,2,M2.seam);
    // torso
    R(x,7,chest,10,hip-chest,M2.bone);
    R(x,7,chest,4,hip-chest,M2.boneL);
    R(x,14,chest,3,hip-chest,M2.boneD);
    R(x,10,chest+2,2,12,M2.boneL);
    // hip seams
    R(x,8,hip,8,1,M2.seam); R(x,10,hip+1,1,3,M2.seam);
    // shoulder crack
    R(x,5,chest,4,7,M2.hollow);
    R(x,4,chest+1,2,3,M2.crack);
    R(x,8,chest+4,1,2,M2.crack);
    R(x,5,chest-1,3,1,M2.boneL);
    // arms (too long)
    const armTop=chest+1;
    R(x,4,armTop,3,20,M2.bone); R(x,4,armTop,1,20,M2.boneL); R(x,6,armTop,1,20,M2.boneD);
    R(x,17,armTop,3,20,M2.bone); R(x,19,armTop,1,20,M2.boneD); R(x,17,armTop,1,20,M2.boneL);
    if(pose==='reach' || pose==='lunge'){
      // arms forward, seen from above
      R(x,2,chest+8,7,4,M2.bone); R(x,3,chest+8,4,1,M2.boneL);
      R(x,15,chest+8,7,4,M2.bone); R(x,18,chest+8,3,1,M2.boneD);
      R(x,3,chest+12,4,3,M2.bone); R(x,17,chest+12,4,3,M2.bone);
    } else if(tall){
      R(x,3,chest-2,3,16,M2.bone); R(x,18,chest-2,3,16,M2.bone);
      R(x,4,chest-2,1,16,M2.boneL); R(x,18,chest-2,1,16,M2.boneL);
    }
    // hands
    if(!(pose==='reach'||pose==='lunge')){
      R(x,4,armTop+20,2,3,M2.boneD); R(x,18,armTop+20,2,3,M2.boneD);
    }
    // legs
    const legTop=hip+1;
    R(x,8,legTop,3,13,M2.bone); R(x,8,legTop,1,13,M2.boneL); R(x,10,legTop,1,13,M2.boneD);
    R(x,14,legTop,3,13,M2.bone); R(x,14,legTop,1,13,M2.boneL); R(x,16,legTop,1,13,M2.boneD);
    R(x,7,legTop-1,1,9,M2.seam); R(x,13,legTop-1,1,9,M2.seam);
    // feet
    R(x,6,base-1,5,2,M2.boneD); R(x,13,base-1,5,2,M2.boneD);
    // glossy highlight band
    R(x,10,chest+5,1,9,M2.boneL);
    R(x,8,legTop+3,1,6,M2.boneL);
    if(pose==='drift1'){
      R(x,7,base-3,4,1,M2.out); R(x,14,base-1,4,1,M2.out);
      R(x,7,base-3,3,2,M2.boneD);
    } else if(pose==='drift2'){
      R(x,5,base-2,4,1,M2.out); R(x,15,base-4,4,1,M2.out);
      R(x,15,base-4,3,2,M2.boneD);
    }
    return c;
  }
  M.hunter = {
    still:hunter('still'), drift1:hunter('drift1'), drift2:hunter('drift2'),
    reach:hunter('reach'), lunge:hunter('lunge'), rear:hunter('rear')
  };

  function scare(){
    const c=cvs(160,180), x=c.getContext('2d');
    R(x,0,0,160,180,'#05070a');
    // huge face
    ditherEllipse(x,80,84,62,78,'#0b0d10',0.8,22);
    ellipse(x,80,84,58,74,'#0a0c0f');
    ellipse(x,80,84,54,70,'#d8d0bb');
    ellipse(x,80,78,50,64,'#e8e0cc');
    ditherEllipse(x,88,92,46,56,'#b9b19c',0.35,23);
    // no eyes, hollow shadow
    ditherEllipse(x,64,68,14,18,'#3a352d',0.75,24);
    ditherEllipse(x,98,68,14,18,'#3a352d',0.75,25);
    ditherEllipse(x,64,68,8,11,'#0c0a08',0.95,26);
    ditherEllipse(x,98,68,8,11,'#0c0a08',0.95,27);
    // crack down the face
    let cx=92, cy=20;
    for(let i=0;i<70;i++){
      R(x,cx,cy,1,2,'#161210');
      cx += (i%5<2)?-1:1;
      cy += 1;
      if(i===35) R(x,cx+2,cy,2,1,'#161210');
    }
    // shoulder crack
    R(x,20,150,44,30,'#0b0a09');
    R(x,26,142,8,12,'#161210');
    // glossy band
    R(x,54,18,3,120,'#f6f2e7'); R(x,50,24,2,100,'#fffdf4');
    // static
    const r=M.mulberry32(99);
    for(let i=0;i<350;i++){
      const xx=Math.floor(r()*160), yy=Math.floor(r()*180);
      R(x,xx,yy,1,1, r()<0.5?'#3a1a18':'#1a2a2a');
    }
    return c;
  }
  M.scare = scare();

  /* ---------------- title atrium ---------------- */
  function atrium(){
    const c=cvs(320,180), x=c.getContext('2d'); const r=M.mulberry32(1987);
    // back wall dither
    for(let y=0;y<180;y++){
      const t = y/180;
      const col = t<0.45 ? (t<0.2?'#080d14':'#0a121b') : (t<0.7?'#0b1520':'#080d14');
      R(x,0,y,320,1,col);
    }
    ditherRect(x,0,0,320,120,'#0a121b','#101e2a',0.24,r);
    // skylight
    R(x,84,6,154,46,'#0c151f');
    R(x,88,10,146,38,'#0a1a22');
    for(let yy=10;yy<48;yy+=8) R(x,88,yy,146,1,'#233a44');
    for(let xx=88;xx<234;xx+=18) R(x,xx,10,1,38,'#233a44');
    ditherRect(x,88,10,146,38,'#0a1a22','#173a3c',0.22,r);
    R(x,150,12,10,4,'#2c5a52'); R(x,120,22,2,2,'#7fe0b8'); R(x,190,18,1,1,'#7fe0b8');
    // skylight crack
    let cx=120,cy=10;
    for(let i=0;i<30;i++){ R(x,cx,cy,1,1,'#050a0c'); cx+=r()<0.6?1:-1; cy+=1; }
    // ceiling tubes
    R(x,0,32,80,4,'#141f25'); R(x,0,33,80,1,'#3d4f52');
    R(x,210,44,110,4,'#141f25'); R(x,240,45,50,1,'#4e6264');
    // second floor railing
    R(x,0,54,320,2,'#1c3038');
    R(x,0,58,320,1,'#2c4650');
    for(let xx=6;xx<320;xx+=18) R(x,xx,54,1,6,'#1a2c33');
    // shop row
    const shops=[
      {x:4,w:44,sign:'TOYS',col:'#8f3a32'},
      {x:52,w:38,sign:'SHOE',col:'#b9a26b'},
      {x:94,w:50,sign:'TAPES',col:'#4d7a6e'},
      {x:148,w:42,sign:'FOOD',col:'#8f6f2f'},
      {x:194,w:46,sign:'CINE',col:'#8f3a32'},
      {x:244,w:40,sign:'SEC',col:'#5f8378'},
      {x:288,w:28,sign:'MALL',col:'#6b6350'}
    ];
    for(const s of shops){
      R(x,s.x,86,s.w,58,'#080d11');
      R(x,s.x,86,s.w,1,'#263c40');
      R(x,s.x,92,s.w,8,'#0b1418');
      if(r()<0.6) M.tinyText(x,s.sign,s.x+2,94,1,s.col);
      // glass / shutter
      if(r()<0.45){
        R(x,s.x+2,102,s.w-4,40,'#050a0e');
        for(let k=s.x+4;k<s.x+s.w-4;k+=9) R(x,k,102,1,40,'#14282c');
        // mannequin silhouette
        R(x,s.x+8,110,3,14,'#1b2c30'); R(x,s.x+7,108,5,3,'#1b2c30');
      } else {
        R(x,s.x+2,102,s.w-4,40,'#232d30');
        for(let yy=104;yy<142;yy+=4) R(x,s.x+2,yy,s.w-4,1,'#11181b');
      }
      R(x,s.x,144,s.w,2,'#0a1115');
    }
    // escalator
    for(let i=0;i<46;i++){
      const px=224+i*2, py=148-Math.floor(i*1.55);
      R(x,px,py,14,2,'#1b2a30');
      R(x,px+1,py,12,1,'#334c52');
      if(i%3===0) R(x,px,py+2,14,1,'#0b1418');
    }
    R(x,222,146,16,3,'#3d6b62');
    R(x,216,150,10,4,'#22383c');
    // fountain
    ditherEllipse(x,160,150,46,10,'#000000',0.6,31);
    ellipse(x,160,144,44,14,'#3a4a44');
    ellipse(x,160,141,42,12,'#59685c');
    ellipse(x,160,140,36,9,'#101c1e');
    ellipse(x,160,140,30,7,'#0a1416');
    R(x,157,126,6,16,'#59685c'); R(x,158,126,3,16,'#7d8a76');
    R(x,154,123,12,4,'#4c5b50');
    for(let i=0;i<16;i++){
      const a=r()*6.28, rad=r()*26;
      R(x,Math.round(160+Math.cos(a)*rad),Math.round(140+Math.sin(a)*rad*0.25),1,1, '#b9a26b');
    }
    // palms
    for(const px of [40,282,20,306]){
      R(x,px+3,142,4,16,'#24342e');
      for(let f=0;f<5;f++){
        for(let k=0;k<9;k++){
          const q=k/9;
          R(x,Math.round(px+5+Math.cos(f*1.3)*12*q),Math.round(142-14*q-q*q*8),1,1,'#2b4d47');
        }
      }
      R(x,px+1,156,10,8,'#3a2b22');
    }
    // floor
    ditherRect(x,0,158,320,22,'#0a1116','#060b0f',0.4,r);
    for(let xx=0;xx<320;xx+=16) R(x,xx,158,1,22,'#101a20');
    for(let yy=160;yy<180;yy+=8) R(x,0,yy,320,1,'#101a20');
    // amber lamp
    R(x,54,66,2,14,'#2a3a3c');
    R(x,50,62,10,6,'#1b282b');
    R(x,52,64,6,3,'#f2b13c');
    for(let yy=64;yy<80;yy+=3) R(x,54,yy,2,1,'#0e1619');
    ditherEllipse(x,55,66,18,14,'#f2b13c',0.2,41);
    // red exit sign
    R(x,268,70,16,8,'#140807');
    M.tinyText(x,'EXIT',270,71,1,'#ff5a4d');
    ditherEllipse(x,276,74,15,10,'#d8332a',0.22,42);
    // dead tubes
    for(let i=0;i<4;i++) R(x,20+i*74,52,50,2,'#1b262b');
    // dust
    for(let i=0;i<60;i++){
      R(x,Math.floor(r()*320),Math.floor(r()*160),1,1, r()<0.6?'#24383c':'#3d5e58');
    }
    return c;
  }
  M.atrium = atrium();

  /* ---------------- world base painter ---------------- */
  M.buildWorldBase = function(grid, floorTypeAt){
    const W=M.WORLD_W, H=M.WORLD_H;
    const c=cvs(W,H), x=c.getContext('2d');
    const r=M.mulberry32(5150);
    // floors
    for(let ty=0;ty<M.ROWS;ty++) for(let tx=0;tx<M.COLS;tx++){
      const ch = grid[ty][tx];
      if(ch!=='.' && ch!=='S') continue;
      const type = ch==='S' ? 'grate' : (floorTypeAt ? floorTypeAt(tx,ty) : 'terra');
      const arr = M.tiles[type] || M.tiles.terra;
      const v = (tx*7 + ty*11) % arr.length;
      x.drawImage(arr[v], tx*16, ty*16);
    }
    // contact shadows + wall caps
    for(let ty=0;ty<M.ROWS;ty++) for(let tx=0;tx<M.COLS;tx++){
      const ch = grid[ty][tx];
      if(ch==='.' || ch==='S') continue;
      const cap = M.wallCaps[(tx*5+ty*3)%2];
      x.drawImage(cap, tx*16, ty*16);
    }
    // wall shadows cast onto floor below a wall
    for(let ty=0;ty<M.ROWS;ty++) for(let tx=0;tx<M.COLS;tx++){
      if(grid[ty][tx]!=='.') continue;
      if(ty>0 && grid[ty-1][tx]!=='.' && grid[ty-1][tx]!=='S'){
        for(let k=0;k<4;k++) ditherRect(x, tx*16, ty*16+k, 16, 1, '#070c10', '#000000', 0.35+k*0.15, r);
      }
      if(tx>0 && grid[ty][tx-1]!=='.' && grid[ty][tx-1]!=='S'){
        for(let k=0;k<3;k++) ditherRect(x, tx*16+k, ty*16, 1, 16, '#070c10', '#000000', 0.3+k*0.15, r);
      }
    }
    // decals
    for(let ty=0;ty<M.ROWS;ty++) for(let tx=0;tx<M.COLS;tx++){
      if(grid[ty][tx]!=='.') continue;
      const px=tx*16, py=ty*16;
      const q=r();
      if(q<0.055){
        ditherEllipse(x, px+8, py+8, 4+Math.floor(r()*3), 2+Math.floor(r()*3), '#080d0e', 0.6, Math.floor(r()*9999));
      } else if(q<0.085){
        let cx=px+4+Math.floor(r()*8), cy=py+4;
        for(let i=0;i<7;i++){ R(x,cx,cy,1,1,'#1a2020'); cx+=r()<0.6?1:-1; cy+=1; }
      } else if(q<0.105){
        R(x,px+5+Math.floor(r()*5),py+6+Math.floor(r()*5),3,2,'#8f8974');
        R(x,px+6,py+7,1,1,'#3f3c33');
      } else if(q<0.125){
        const cx=px+5+Math.floor(r()*6), cy=py+9;
        R(x,cx,cy,4,2,'#3d4a4a'); R(x,cx,cy,1,2,'#8a7a52');
      }
    }
    // wet patch around fountain
    for(let a=0;a<60;a++){
      const ang=r()*Math.PI*2, rad=18+r()*34;
      const px=Math.round(32*16+Math.cos(ang)*rad), py=Math.round(17*16+Math.sin(ang)*rad*0.55);
      R(x,px,py,1,1,'#101d1e');
      if(r()<0.15) R(x,px,py,2,1,'#1e3434');
    }
    // subtle carpet border in the plaza
    return c;
  };
})();
