'use strict';
/* SILENT MALL: the mall, the hunter, the rules. */
window.__errs = window.__errs || [];
window.addEventListener('error', function(e){
  try{ window.__errs.push((e.error && e.error.stack) ? e.error.stack : String(e.message)); }catch(err){}
});
(function(){
  const M = window.MALL;
  const P = M.PAL;
  const TILE = M.TILE, COLS = M.COLS, ROWS = M.ROWS;
  const WW = M.WORLD_W, WH = M.WORLD_H;
  const VW = 320, VH = 180;
  const Audio = M.Audio;
  const $ = (s)=>document.querySelector(s);
  const MB = ()=>window.mindblown;

  const TUNE = {
    walk:76, sneak:32, hunterStep:15, noiseFill:0.26, noiseDecay:0.22,
    lightLinger:7, bloom:0.55, scan:0.78
  };

  const Input = { keys:new Set(), jx:0, jy:0, joy:false, mag:0 };
  let mode = 'boot';
  let currentChapter = 0;
  const CHAPTERS = [
    { title:'THE CLOSING SHIFT', place:'THE MAIN ATRIUM', entity:'THE LISTENER', speed:15, noise:1, key:{x:45.3,y:11.45},
      body:'11:47 PM. Seven years to the night the mall sealed itself with forty-one people still inside, and you are the last name on the rota. Her paper wristband is in your pocket, still dated tomorrow. The staff door bolts behind you. Your phone has no signal. The emergency doors are locked from the outside.',
      whisper:'A voice from the PA: \u201cPlease remain calm. The mall is not yet empty.\u201d',
      event:'THE LISTENER HAS HEARD YOU.',
      bridge:'You found the keycard in a coat that still smells of rain. The shutter lifts onto a service corridor, and somewhere below you a lift is already coming up.' },
    { title:'BELOW THE FOOD COURT', place:'THE SERVICE LEVEL', entity:'THE USHER', speed:13.5, noise:1.18, key:{x:32.2,y:10.8},
      body:'The service lift opens onto a floor that is not printed on any directory. A maintenance log lists Elias Vale, twenty-three years in the basement. His handwriting gets smaller toward the end, as if he was making room for something. His final shift was never closed, and neither was the corridor he kept clear.',
      whisper:'The intercom: \u201cStaff entrance is for staff only. You are not staff anymore.\u201d',
      event:'THE USHER IS MOVING THE SIGNS.',
      bridge:'The signs point the wrong way on purpose. You stop trusting the arrows and start trusting the smell of smoke coming from the toy wing.' },
    { title:'THE CHILDREN\u2019S WING', place:'THE TOY DEPARTMENT', entity:'THE STATIC CHILD', speed:12.2, noise:1.35, key:{x:10.4,y:11.35},
      body:'She is standing behind the toy-store glass, exactly where you told her to wait. The wristband is dated tomorrow because tomorrow is the day you promised. Every monitor shows her in a different room, always facing the camera, always patient. Her name is written on the back in your handwriting: Anya.',
      whisper:'A small voice: \u201cYou promised you would come back for me.\u201d',
      event:'THE STATIC CHILD IS CLOSE.',
      bridge:'The keycard was in her pocket. She let you take it. That is the first thing tonight that has felt like permission.' },
    { title:'THE LOST & FOUND', place:'THE STOCKROOM', entity:'THE COLLECTOR', speed:11.6, noise:1.4, key:{x:13.5,y:9.5},
      body:'Everything unclaimed comes down here: umbrellas, phones, wedding rings, children. Every box carries a name and a date. Box 41 holds one small shoe and one paper wristband. The box beside it has your name on it, and it was labelled seven years ago, in advance, by someone who knew you would eventually come back.',
      whisper:'A polite voice, filing: \u201cUnclaimed items are held for ninety days. You are past due.\u201d',
      event:'THE COLLECTOR HAS FILED YOU.',
      bridge:'The shelves rearrange behind you as you leave. She is not chasing. She is re-filing the exit somewhere less convenient.' },
    { title:'THE SCREENING ROOM', place:'THE SEALED CINEMA', entity:'THE PROJECTIONIST', speed:11.2, noise:1.45, key:{x:49.5,y:10.5},
      body:'The cinema was sealed with the audience still inside. The projector never stopped, because one man decided that if the film keeps running then the night has not ended. Tonight he screens the only footage that matters: a nineteen-year-old in a crowd, letting go of a small hand, and calling it an accident for seven years.',
      whisper:'The projector clicks: \u201cPlease take your seats. The feature is about to begin again.\u201d',
      event:'THE PROJECTIONIST IS PLAYING YOUR NIGHT.',
      bridge:'The reel runs out. In the silence afterwards you can hear a lift, a shutter, and someone small counting to a hundred.' },
    { title:'THE HEART OF THE MALL', place:'THE MANAGEMENT FLOOR', entity:'THE NIGHT MANAGER', speed:10.8, noise:1.55, key:{x:52.2,y:11.35},
      body:'Mr. Vale signed the closure order at 11:52 PM, before the last person was out, and bricked the only exit that still opened. He believed a mall must stay full, lit and open forever. He got his wish. He does not chase anyone; he schedules them. You are on the rota now, and the shift does not end.',
      whisper:'The PA, now speaking in your own voice: \u201cThank you for staying until closing.\u201d',
      event:'THE NIGHT MANAGER KNOWS YOUR NAME.',
      bridge:'The manager\u2019s keycard opens the last door in the building. Above it there is one more flight of stairs than there should be.' },
    { title:'THE ROOF', place:'THE SERVICE STAIRS', entity:'THE MALL', speed:10.2, noise:1.7, key:{x:30.5,y:10.5},
      body:'The service stairs climb one floor higher than the building has. Above you the sky is the colour of a bruise healing. Her wristband is still in your pocket, soft from being carried. The hatch opens both ways: into the morning alone, or back to the toy department with her name in your hands.',
      whisper:'The PA, in your own voice: \u201cYou said you would come back.\u201d',
      event:'THE MALL IS CLOSING FOR THE LAST TIME.',
      bridge:'5:41 AM.' }
  ];
  const ENTITY_FILES = [
    ['THE LISTENER','Arjun was the night guard on the rota. When the alarm went off he pulled people out through the shutter one at a time, and when he saw a small hand reaching up he went back inside for it. The mall learned the sound of his partner\u2019s footsteps and has been using them to call him through the corridors ever since. He is still answering.','Gameplay: hunts loud movement, thrown objects and impacts.'],
    ['THE USHER','Elias Vale kept the service corridors for twenty-three years. When the sealed cinema exit was discovered, the manager ordered him to keep the corridor clear, so he redirected forty-one people away from the only door that still opened. He obeyed until the alarms stopped, and he has been directing traffic ever since.','Gameplay: false directions and misleading announcements.'],
    ['THE STATIC CHILD','Anya was seven. She was told to wait by the toys and she has done exactly that for seven years. The cameras record her in rooms she cannot reach because she has learned to live in the gap between frames, in the half-second where the mall is not looking. She is not the danger in this building. She is the reason it is still open.','Gameplay: brief sightings, screen distortion and warning whispers.'],
    ['THE COLLECTOR','She ran the Lost & Found counter. She believes everything that goes unclaimed must be filed, labelled and kept, including the people who never came back for them. Box 41 is a small shoe. The box beside it has your name, written the night you left. She has been waiting to complete the record.','Gameplay: rearranges the stockroom and files the exit somewhere else.'],
    ['THE PROJECTIONIST','He was running the late show when the alarms started. He kept the reel turning because stopping it would mean admitting the night was over. He shows the evacuation every night to an audience that cannot leave, and lately he has been splicing your face into the footage.','Gameplay: floods the screen with light and your own memories.'],
    ['THE NIGHT MANAGER','Mr. Vale signed the closure order at 11:52 PM and had the last open exit bricked up, because a mall must stay full, lit and open forever. He does not hunt; he schedules. Everyone inside is another shift that must be completed, and he has already written your name on the rota.','Gameplay: accelerates the hunt and turns the final escape into a timed ordeal.'],
    ['THE MALL','The building absorbed that night as a repeating memory: corridors, announcements and locked doors are its nervous system. It keeps the missing as echoes and recruits the living to complete the shift. It is not cruel. It is simply open, and it intends to stay open.','Gameplay: escalating darkness, altered ambience and recurring spaces.']
  ];
  let game = null, gameScene = null, titleScene = null;
  let gameReady = false, pendingStart = false;
  let soundOn = true, helpOpen = false;
  let runActive = false, runPaused = false, runStartAt = 0;
  let pausedByVisibility = false;
  const ui = {};

  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
  function now(){ return performance.now(); }

  /* ===============================================================
     LEVEL
     =============================================================== */
  function buildMap(){
    const g = Array.from({length:ROWS}, ()=>Array(COLS).fill('#'));
    const F = (x0,y0,x1,y1)=>{
      for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++){
        if(x>0 && x<COLS-1 && y>0 && y<ROWS-1) g[y][x]='.';
      }
    };
    F(2,13,61,18);        // main corridor
    F(26,9,38,22);        // dead fountain plaza
    F(8,10,12,12);        // TOYS bay
    F(16,10,21,12);       // SHOE bay
    F(42,10,47,12);       // security bay
    F(50,10,54,12);       // TAPES bay
    F(57,13,61,18);       // exit vestibule
    for(let y=13;y<=18;y++) g[y][56]='S';  // roll shutter
    return g;
  }
  M.MAP = buildMap();

  function floorTypeAt(tx,ty){
    // Each floor of the building is built of different material.
    const ch = (M.CHAPTER_INDEX|0);
    if(ch===1){                       // service level: bare concrete, drains, standing water
      const k=(tx*7+ty*11)%13;
      if(k===1||k===5) return 'grate';
      if(k===3||k===9) return 'wet';
      return 'crack';
    }
    if(ch===2){                       // toy wing: soft play carpet, checker thresholds
      if(tx>=23 && tx<=39 && ty>=7 && ty<=12) return 'checker';
      return 'carpet';
    }
    if(ch===3){                       // stockroom: dusty concrete, cracked slab
      const k=(tx*7+ty*11)%11;
      if(k===2) return 'grate';
      if(k===6) return 'wet';
      return 'crack';
    }
    if(ch===4){                       // sealed cinema: red house carpet, checker lobby
      if(tx>=40) return 'checker';
      if(tx>=8 && tx<=30) return 'carpet';
      return 'terra';
    }
    if(ch===5){                       // management: polished terrazzo and marble checker
      if((tx+ty)%7===0) return 'checker';
      return 'terra';
    }
    if(ch===6){                       // roof: wet concrete, drains, cracks
      const k=(tx*7+ty*11)%9;
      if(k===0||k===4) return 'wet';
      if(k===2||k===7) return 'grate';
      return 'crack';
    }
    if(tx>=26 && tx<=38 && ty>=9 && ty<=22){
      if(tx>=30 && tx<=34 && ty>=15 && ty<=19) return 'carpet';
      return 'terra';
    }
    if((tx>=8 && tx<=21) || (tx>=42 && tx<=54)) return 'checker';
    const k = (tx*7 + ty*11) % 23;
    if(k===3) return 'wet';
    if(k===7) return 'crack';
    if(k===11) return 'grate';
    if(k===15) return 'checker';
    return 'terra';
  }
  M.floorTypeAt = floorTypeAt;

  const START = { x:4.5, y:15.6 };
  const KEYCARD = { x:45.3, y:11.45 };
  const EXIT = { x:59.5, y:13.35 };
  const EXIT_SIGN = { x:59.5, y:199 };
  const SHUTTER = { x:56.5, y:15.5 };

  const PROPS = [
    { t:'kiosk',    x:5.6,  y:17.45, w:14, h:9,  block:[[5,17]] },
    { t:'vending',  x:10.5, y:17.42, w:16, h:10, block:[[10,17]] },
    { t:'rubber',   x:8.8,  y:13.6,  w:9,  h:7,  block:[[8,13]] },
    { t:'payphone', x:24.35,y:13.35, w:7,  h:7,  block:[[24,13]] },
    { t:'bench',    x:24.3, y:17.2,  w:30, h:7,  block:[[24,17]] },
    { t:'fountain', x:32,   y:17.3,  w:36, h:19, block:[[31,16],[32,16],[33,16],[31,17],[32,17],[33,17]] },
    { t:'bench',    x:28.8, y:14.35, w:30, h:7,  block:[[28,14],[29,14]] },
    { t:'bench',    x:35.6, y:19.5,  w:30, h:7,  block:[[35,19],[36,19]] },
    { t:'palm',     x:27.2, y:10.9,  w:9,  h:7,  block:[[27,10]] },
    { t:'palm',     x:37.4, y:21.2,  w:9,  h:7,  block:[[37,21]] },
    { t:'palm',     x:13.4, y:17.55, w:9,  h:7,  block:[[13,17]] },
    { t:'arcade',   x:43.4, y:11.35, w:13, h:9,  block:[[43,10],[43,11]] },
    { t:'rubber',   x:53.4, y:16.45, w:9,  h:7,  block:[[53,16]] },
    { t:'bench',    x:47.2, y:17.2,  w:30, h:7,  block:[[47,17]] },
    { t:'palm',     x:58.5, y:17.5,  w:9,  h:7,  block:[[58,17]] }
  ];

  const LIGHTS = [
    { x:6,  y:12,   pool:15.5 },
    { x:12, y:12,   pool:15.5 },
    { x:18, y:12,   pool:15.5 },
    { x:24, y:12,   pool:15.5 },
    { x:29, y:8.4,  pool:15.2 },
    { x:35, y:8.4,  pool:15.2 },
    { x:42, y:12,   pool:15.5 },
    { x:48, y:12,   pool:15.5 },
    { x:54, y:12,   pool:15.5 }
  ];

  const SIGN_GLOWS = [
    { x:168, y:119, color:'amber' },
    { x:304, y:119, color:'bone' },
    { x:720, y:119, color:'green' },
    { x:840, y:119, color:'amber' },
    { x:520, y:103, color:'amber' },
    { x:80,  y:167, color:'green' }
  ];

  const FACADE_RUNS = [
    { row:9,  x0:8,  x1:12, kind:'glass', sign:'TOYS',     color:'#f2b13c' },
    { row:9,  x0:16, x1:21, kind:'glass', sign:'SHOE',     color:'#b9a26b' },
    { row:9,  x0:42, x1:47, kind:'glass', sign:'SECURITY', color:'#7fe0b8' },
    { row:9,  x0:50, x1:54, kind:'boards',sign:'TAPES',    color:'#b9a26b' },
    { row:8,  x0:26, x1:38, kind:'glass', sign:'FOOD COURT',color:'#f2b13c' },
    { row:12, x0:2,  x1:7,  kind:'tile',  sign:'MALL',     color:'#7fe0b8' },
    { row:12, x0:13, x1:15, kind:'poster',sign:'CINE',     color:'#8f3a32' },
    { row:12, x0:22, x1:25, kind:'grate', sign:'',         color:'#6b6250' },
    { row:12, x0:39, x1:41, kind:'boards',sign:'NO ENTRY', color:'#6b6350' },
    { row:12, x0:48, x1:49, kind:'poster',sign:'',         color:'#8f3a32' },
    { row:12, x0:55, x1:55, kind:'tile',  sign:'',         color:'#6b6250' },
    { row:12, x0:57, x1:57, kind:'tile',  sign:'',         color:'#6b6250' },
    { row:12, x0:61, x1:61, kind:'tile',  sign:'',         color:'#6b6250' },
    { row:12, x0:58, x1:60, kind:'doors', sign:'',         color:'#ff5a4d' }
  ];
  M.FACADE_PLAN = FACADE_RUNS;
  const BASE_PROPS=JSON.parse(JSON.stringify(PROPS));
  const BASE_LIGHTS=JSON.parse(JSON.stringify(LIGHTS));
  const BASE_FACADES=JSON.parse(JSON.stringify(FACADE_RUNS));

  // Each chapter now has its own walkable floor plan, prop layout and facade language.
  function chapterFloorPlan(index){
    const g=Array.from({length:ROWS},()=>Array(COLS).fill('#'));
    const F=(x0,y0,x1,y1)=>{ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) if(x>0&&x<COLS-1&&y>0&&y<ROWS-1) g[y][x]='.'; };
    if(index===0) return buildMap();
    // All chapters share the shutter approach, but each has a different room topology.
    F(2,14,61,17); F(57,13,61,18);
    if(index===1){ // service tunnels: narrow cross-corridors and four utility bays
      F(11,8,15,23); F(44,8,48,23); F(25,8,38,21);
      F(6,8,20,11); F(40,8,56,11); F(6,20,20,23); F(40,20,56,23);
      F(19,10,27,12); F(37,10,45,12); F(19,19,27,21); F(37,19,45,21);
    } else if(index===2){ // toy wing: broad aisles with narrow display crossovers
      F(7,7,19,12); F(23,7,39,12); F(43,7,56,12);
      F(11,7,14,23); F(29,7,33,23); F(48,7,51,23);
      F(7,20,21,23); F(25,20,39,23); F(43,20,56,23);
      F(17,10,25,12); F(37,10,46,12); F(17,19,25,21); F(37,19,46,21);
    } else if(index===3){ // lost & found: stockroom aisles above and below the concourse
      F(6,6,20,13); F(26,6,38,13); F(44,6,58,13);
      F(6,19,20,26); F(26,19,38,26); F(44,19,58,26);
      F(9,13,11,14); F(30,13,33,14); F(50,13,53,14);
      F(9,17,11,19); F(30,17,33,19); F(50,17,53,19);
    } else if(index===4){ // sealed cinema: auditorium, booth and concession
      F(8,6,30,13); F(8,19,30,26);
      F(40,7,58,13); F(40,19,58,26);
      F(33,10,44,12); F(33,20,44,22);
      F(34,13,38,14); F(34,17,38,19);
    } else if(index===5){ // management floor: a ring around the sealed central chamber
      F(7,8,18,11); F(45,8,56,11); F(7,20,18,23); F(45,20,56,23);
      F(11,8,14,23); F(48,8,51,23); F(22,8,41,11); F(22,20,41,23);
      F(22,10,26,20); F(37,10,41,20); F(26,10,37,20);
      F(18,10,22,12); F(41,10,45,12); F(18,19,22,21); F(41,19,45,21);
    } else { // the roof: open deck, stair heads, planters
      F(4,6,20,13); F(24,6,40,13); F(44,6,61,13);
      F(4,19,20,26); F(24,19,40,26); F(44,19,61,26);
      F(18,9,26,12); F(38,9,46,12);
      F(18,18,26,20); F(38,18,46,20);
    }
    for(let y=13;y<=18;y++) g[y][56]='S';
    return g;
  }
  function applyChapterLayout(index){
    M.MAP=chapterFloorPlan(index);
    const propSets=[
      BASE_PROPS,
      [
        {t:'vending',x:9.5,y:15.3,w:16,h:10,block:[[9,15]]},{t:'payphone',x:17.5,y:9.6,w:7,h:7,block:[[17,9]]},
        {t:'kiosk',x:27.5,y:9.7,w:14,h:9,block:[[27,9]]},{t:'arcade',x:34.5,y:20.5,w:13,h:9,block:[[34,20]]},
        {t:'bench',x:47.5,y:15.5,w:30,h:7,block:[[47,15]]},{t:'rubber',x:13.5,y:21.4,w:9,h:7,block:[[13,21]]}
      ],
      [
        {t:'kiosk',x:9.5,y:9.7,w:14,h:9,block:[[9,9]]},{t:'vending',x:17.5,y:21.4,w:16,h:10,block:[[17,21]]},
        {t:'arcade',x:30.5,y:9.7,w:13,h:9,block:[[30,9]]},{t:'palm',x:34.5,y:21.3,w:9,h:7,block:[[34,21]]},
        {t:'bench',x:49.5,y:9.7,w:30,h:7,block:[[49,9]]},{t:'rubber',x:49.5,y:21.4,w:9,h:7,block:[[49,21]]}
      ],
      [
        {t:'bench',x:12.5,y:9.7,w:30,h:7,block:[[12,9]]},{t:'payphone',x:24.5,y:15.4,w:7,h:7,block:[[24,15]]},
        {t:'fountain',x:31.5,y:15.4,w:36,h:19,block:[[30,14],[31,14],[32,14],[30,15],[31,15],[32,15]]},
        {t:'arcade',x:39.5,y:9.7,w:13,h:9,block:[[39,9]]},{t:'kiosk',x:50.5,y:21.4,w:14,h:9,block:[[50,21]]}
      ],
      [ // lost & found: shelving banks as low benches, counters as kiosks
        {t:'bench',x:8.5,y:12.6,w:30,h:7,block:[[8,12]]},{t:'bench',x:15.5,y:12.6,w:30,h:7,block:[[15,12]]},
        {t:'vending',x:30.5,y:12.7,w:16,h:10,block:[[30,12]]},{t:'rubber',x:35.5,y:12.7,w:9,h:7,block:[[35,12]]},
        {t:'kiosk',x:47.5,y:12.7,w:14,h:9,block:[[47,12]]},{t:'bench',x:53.5,y:12.6,w:30,h:7,block:[[53,12]]},
        {t:'arcade',x:9.5,y:22.4,w:13,h:9,block:[[9,22]]},{t:'palm',x:16.5,y:22.4,w:9,h:7,block:[[16,22]]},
        {t:'bench',x:30.5,y:22.4,w:30,h:7,block:[[30,22]]},{t:'kiosk',x:47.5,y:22.4,w:14,h:9,block:[[47,22]]},
        {t:'payphone',x:54.5,y:22.4,w:7,h:7,block:[[54,22]]}
      ],
      [ // sealed cinema: seat rows as benches, marquee cases as kiosks
        {t:'bench',x:10.5,y:9.6,w:30,h:7,block:[[10,9]]},{t:'bench',x:10.5,y:12.5,w:30,h:7,block:[[10,12]]},
        {t:'arcade',x:24.5,y:9.6,w:13,h:9,block:[[24,9]]},{t:'rubber',x:24.5,y:12.5,w:9,h:7,block:[[24,12]]},
        {t:'bench',x:10.5,y:21.5,w:30,h:7,block:[[10,21]]},{t:'vending',x:24.5,y:21.4,w:16,h:10,block:[[24,21]]},
        {t:'kiosk',x:46.5,y:12.5,w:14,h:9,block:[[46,12]]},{t:'bench',x:52.5,y:9.6,w:30,h:7,block:[[52,9]]},
        {t:'palm',x:54.5,y:21.5,w:9,h:7,block:[[54,21]]}
      ],
      [ // management floor
        {t:'bench',x:9.5,y:9.6,w:30,h:7,block:[[9,9]]},{t:'kiosk',x:14.5,y:9.6,w:14,h:9,block:[[14,9]]},
        {t:'arcade',x:49.5,y:9.6,w:13,h:9,block:[[49,9]]},{t:'payphone',x:54.5,y:9.6,w:7,h:7,block:[[54,9]]},
        {t:'bench',x:9.5,y:22.4,w:30,h:7,block:[[9,22]]},{t:'kiosk',x:15.5,y:22.4,w:14,h:9,block:[[15,22]]},
        {t:'fountain',x:31.5,y:15.4,w:36,h:19,block:[[30,14],[31,14],[32,14],[30,15],[31,15],[32,15]]},
        {t:'bench',x:49.5,y:22.4,w:30,h:7,block:[[49,22]]}
      ],
      [ // the roof: vents, planters, stair housings
        {t:'palm',x:6.5,y:12.6,w:9,h:7,block:[[6,12]]},{t:'bench',x:12.5,y:12.6,w:30,h:7,block:[[12,12]]},
        {t:'vending',x:26.5,y:12.6,w:16,h:10,block:[[26,12]]},{t:'rubber',x:35.5,y:12.6,w:9,h:7,block:[[35,12]]},
        {t:'bench',x:48.5,y:12.6,w:30,h:7,block:[[48,12]]},
        {t:'arcade',x:6.5,y:22.4,w:13,h:9,block:[[6,22]]},{t:'bench',x:26.5,y:22.4,w:30,h:7,block:[[26,22]]},
        {t:'kiosk',x:48.5,y:22.4,w:14,h:9,block:[[48,22]]}
      ]
    ];
    PROPS.splice(0,PROPS.length,...JSON.parse(JSON.stringify(propSets[index])));
    const lightSets=[BASE_LIGHTS,
      [{x:8,y:12,pool:13},{x:14,y:8,pool:12},{x:26,y:8,pool:12},{x:34,y:20,pool:12},{x:46,y:8,pool:12},{x:52,y:12,pool:13}],
      [{x:9,y:6.8,pool:12},{x:14,y:17.5,pool:12},{x:31,y:6.8,pool:12},{x:31,y:22,pool:12},{x:49,y:17.5,pool:12}],
      [{x:12,y:7.5,pool:11},{x:24,y:7.5,pool:11},{x:32,y:15,pool:10},{x:40,y:7.5,pool:11},{x:50,y:7.5,pool:11},{x:32,y:22,pool:10}],
      [{x:12,y:5.5,pool:10},{x:32,y:5.5,pool:10},{x:51,y:5.5,pool:10},{x:12,y:18.5,pool:10},{x:32,y:18.5,pool:10},{x:51,y:18.5,pool:10}],
      [{x:19,y:5.5,pool:11},{x:49,y:6.5,pool:11},{x:19,y:18.5,pool:10},{x:49,y:18.5,pool:10},{x:36,y:15,pool:9}],
      [{x:12,y:7.5,pool:11},{x:24,y:7.5,pool:11},{x:32,y:15,pool:10},{x:40,y:7.5,pool:11},{x:50,y:7.5,pool:11},{x:32,y:22,pool:10}],
      [{x:12,y:5.5,pool:12},{x:32,y:5.5,pool:12},{x:52,y:5.5,pool:12},{x:12,y:18.5,pool:12},{x:32,y:18.5,pool:12},{x:52,y:18.5,pool:12},{x:34,y:15,pool:9}]
    ];
    LIGHTS.splice(0,LIGHTS.length,...JSON.parse(JSON.stringify(lightSets[index])));
    const plans=[BASE_FACADES,
      [{row:7,x0:6,x1:20,kind:'boards',sign:'STAFF ONLY',color:'#b9a26b'},{row:7,x0:40,x1:56,kind:'grate',sign:'SERVICE',color:'#6b6250'},{row:19,x0:6,x1:20,kind:'boards',sign:'BOILER',color:'#8f3a32'}],
      [{row:6,x0:7,x1:19,kind:'glass',sign:'TOYS',color:'#f2b13c'},{row:6,x0:23,x1:39,kind:'glass',sign:'PLAY ZONE',color:'#7fe0b8'},{row:6,x0:43,x1:56,kind:'poster',sign:'FAMILY',color:'#8f3a32'}],
      [{row:7,x0:7,x1:18,kind:'boards',sign:'EXECUTIVE',color:'#b9a26b'},{row:7,x0:22,x1:41,kind:'glass',sign:'MANAGEMENT',color:'#7fe0b8'},{row:7,x0:45,x1:56,kind:'doors',sign:'VALE',color:'#ff5a4d'}],
      [{row:5,x0:6,x1:20,kind:'boards',sign:'LOST & FOUND',color:'#b9a26b'},{row:5,x0:26,x1:38,kind:'grate',sign:'STOCK',color:'#6b6250'},{row:5,x0:44,x1:58,kind:'boards',sign:'UNCLAIMED',color:'#8f3a32'},{row:18,x0:6,x1:20,kind:'poster',sign:'BOX 41',color:'#8f3a32'}],
      [{row:5,x0:8,x1:30,kind:'poster',sign:'SCREEN 1',color:'#8f3a32'},{row:6,x0:40,x1:58,kind:'glass',sign:'PROJECTION',color:'#7fe0b8'},{row:18,x0:8,x1:30,kind:'poster',sign:'SCREEN 2',color:'#8f3a32'},{row:18,x0:40,x1:58,kind:'boards',sign:'CONCESSION',color:'#b9a26b'}],
      [{row:7,x0:7,x1:18,kind:'boards',sign:'EXECUTIVE',color:'#b9a26b'},{row:7,x0:22,x1:41,kind:'glass',sign:'MANAGEMENT',color:'#7fe0b8'},{row:7,x0:45,x1:56,kind:'doors',sign:'VALE',color:'#ff5a4d'}],
      [{row:5,x0:4,x1:20,kind:'grate',sign:'STAIRS',color:'#6b6250'},{row:5,x0:24,x1:40,kind:'boards',sign:'ROOF ACCESS',color:'#b9a26b'},{row:5,x0:44,x1:61,kind:'tile',sign:'HATCH',color:'#7fe0b8'},{row:18,x0:24,x1:40,kind:'grate',sign:'PLANT',color:'#6b6250'}]
    ];
    FACADE_RUNS.splice(0,FACADE_RUNS.length,...JSON.parse(JSON.stringify(plans[index]))); M.FACADE_PLAN=FACADE_RUNS;
  }
  function prepareChapterArt(scene,index){
    M.FACADE_IMAGES=[];
    M.FACADE_PLAN.forEach((r,i)=>{
      const w=(r.x1-r.x0+1)*16, base=(r.row+1)*16;
      const key='chapter_facade_'+index+'_'+i;
      if(!scene.textures.exists(key)) scene.textures.addCanvas(key,M.makeFacade(r.kind,w,r.sign,r.color,100+index*101+i*17));
      M.FACADE_IMAGES.push({key,x:r.x0*16,y:base,w,base});
    });
    const worldKey='chapter_world_'+index;
    if(!scene.textures.exists(worldKey)) scene.textures.addCanvas(worldKey,M.buildWorldBase(M.MAP,floorTypeAt));
    return worldKey;
  }

  // blockers used by the hunter pathfinder
  function makeBlocked(){
    const b = Array.from({length:ROWS}, ()=>Array(COLS).fill(false));
    for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
      b[y][x] = M.MAP[y][x] !== '.';
    }
    for(const p of PROPS) for(const t of p.block){
      if(b[t[1]]) b[t[1]][t[0]] = true;
    }
    return b;
  }

  function losClear(grid, x0,y0,x1,y1){
    let ax=Math.floor(x0/16), ay=Math.floor(y0/16);
    let bx=Math.floor(x1/16), by=Math.floor(y1/16);
    const dx=Math.abs(bx-ax), dy=Math.abs(by-ay);
    const sx=ax<bx?1:-1, sy=ay<by?1:-1;
    let err=dx-dy, guard=0;
    while(guard++ < 200){
      if(ax===bx && ay===by) return true;
      if(ax<0||ay<0||ax>=COLS||ay>=ROWS) return false;
      if(grid[ay][ax] !== '.' ) return false;
      const e2=2*err;
      if(e2 > -dy){ err -= dy; ax += sx; }
      if(e2 < dx){ err += dx; ay += sy; }
    }
    return false;
  }

  function nextPathTile(blocked, sx, sy, tx, ty){
    sx=clamp(sx,0,COLS-1); sy=clamp(sy,0,ROWS-1);
    tx=clamp(tx,0,COLS-1); ty=clamp(ty,0,ROWS-1);
    if(blocked[sy][sx]) {
      // nudge to nearest open neighbour
      for(let ry=-1;ry<=1;ry++) for(let rx=-1;rx<=1;rx++){
        const nx=sx+rx, ny=sy+ry;
        if(nx>=0&&ny>=0&&nx<COLS&&ny<ROWS&&!blocked[ny][nx]){ sx=nx; sy=ny; }
      }
    }
    if(sx===tx && sy===ty) return [tx,ty];
    if(blocked[ty][tx]){
      // target inside something: walk to the nearest open tile
      let best=null, bd=1e9;
      for(let ry=-1;ry<=1;ry++) for(let rx=-1;rx<=1;rx++){
        const nx=tx+rx, ny=ty+ry;
        if(nx<0||ny<0||nx>=COLS||ny>=ROWS||blocked[ny][nx]) continue;
        const dd=Math.abs(nx-sx)+Math.abs(ny-sy);
        if(dd<bd){ bd=dd; best=[nx,ny]; }
      }
      if(best){ tx=best[0]; ty=best[1]; } else return [sx,sy];
    }
    const key=(x,y)=>y*COLS+x;
    const par = new Map();
    const q = [[sx,sy]];
    par.set(key(sx,sy), null);
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    let found=false;
    for(let qi=0; qi<q.length && !found; qi++){
      const [x,y]=q[qi];
      for(const [dx,dy] of dirs){
        const nx=x+dx, ny=y+dy;
        if(nx<0||ny<0||nx>=COLS||ny>=ROWS) continue;
        if(blocked[ny][nx]) continue;
        const k=key(nx,ny);
        if(par.has(k)) continue;
        par.set(k, key(x,y));
        if(nx===tx && ny===ty){ found=true; break; }
        q.push([nx,ny]);
      }
    }
    if(!found) return [sx,sy];
    let k=key(tx,ty), prev=par.get(k), guard=0;
    while(prev!==null && prev!==key(sx,sy) && guard++<3000){
      k=prev; prev=par.get(k);
    }
    return [k%COLS, Math.floor(k/COLS)];
  }

  /* ===============================================================
     BOOT
     =============================================================== */
  class BootScene extends Phaser.Scene {
    constructor(){ super('boot'); }
    create(){
      const T = this.textures;
      const add = (k,cv)=>{ if(!T.exists(k)) T.addCanvas(k,cv); };

      add('boy_idle', M.boy.idle); add('boy_walk1', M.boy.walk1); add('boy_walk2', M.boy.walk2);
      add('boy_sneak', M.boy.sneak); add('boy_startled', M.boy.startled); add('boy_caught', M.boy.caught);
      add('hunter_still', M.hunter.still); add('hunter_drift1', M.hunter.drift1);
      add('hunter_drift2', M.hunter.drift2); add('hunter_reach', M.hunter.reach);
      add('hunter_lunge', M.hunter.lunge); add('hunter_rear', M.hunter.rear);

      add('prop_fountain', M.props.fountain); add('prop_palm', M.props.palm);
      add('prop_bench', M.props.bench); add('prop_arcade', M.props.arcade);
      add('prop_vending', M.props.vending); add('prop_payphone', M.props.payphone);
      add('prop_kiosk', M.props.kiosk); add('prop_rubber', M.props.rubber);

      add('light_dead', M.lights.dead); add('light_flick', M.lights.flick);
      add('light_awake', M.lights.awake); add('light_amber', M.lights.amber);
      add('exit_sign', M.exitSign);
      add('gate', M.gate);
      add('keycard', M.keycard); add('can', M.can);
      add('scare', M.scare);
      add('atrium', M.atrium);
      add('shadow', M.shadow(40,12));

      const blank = M.cvs(2,2);
      add('blank', blank);

      // facades
      M.FACADE_IMAGES = [];
      M.FACADE_PLAN.forEach((r,i)=>{
        const w = (r.x1-r.x0+1)*16;
        const base = (r.row+1)*16;
        const cv = M.makeFacade(r.kind, w, r.sign, r.color, 100+i*17);
        const key = 'fac_'+i;
        add(key, cv);
        M.FACADE_IMAGES.push({ key, x:r.x0*16, y:base, w, base });
      });

      add('worldbase', M.buildWorldBase(M.MAP, floorTypeAt));

      // glow canvases, kept for the DOM fx layer
      M.FX = M.FX || {};
      M.FX.green = M.glowCanvas(128,[190,255,226],1.75);
      M.FX.greenS = M.glowCanvas(96,[230,255,242],1.6);
      M.FX.amber = M.glowCanvas(96,[242,177,60],1.8);
      M.FX.red = M.glowCanvas(128,[255,74,60],1.85);
      M.FX.redS = M.glowCanvas(96,[255,150,136],1.7);
      M.FX.white = M.glowCanvas(96,[255,255,255],1.9);
      add('glow_green', M.FX.green);
      add('glow_greenS', M.FX.greenS);
      add('glow_amber', M.FX.amber);
      add('glow_red', M.FX.red);
      add('glow_redS', M.FX.redS);
      add('glow_white', M.FX.white);

      // darkness holes
      const holes = { hole64:M.holeCanvas(128,1.32), hole96:M.holeCanvas(192,1.32), hole128:M.holeCanvas(256,1.32) };
      M.FX.hole64 = holes.hole64; M.FX.hole96 = holes.hole96; M.FX.hole128 = holes.hole128;
      add('hole64', holes.hole64); add('hole96', holes.hole96); add('hole128', holes.hole128);

      this.scene.start('title');
    }
  }

  /* ===============================================================
     TITLE
     =============================================================== */
  class TitleScene extends Phaser.Scene {
    constructor(){ super('title'); }
    create(){
      mode = 'title';
      titleScene = this;
      gameReady = true;
      gameScene = null;
      this.add.image(0,0,'atrium').setOrigin(0,0).setDepth(0);
      this.cameras.main.fadeIn(900,0,0,0);
      this.cameras.main.setBackgroundColor('#03050a');

      // The CRT is painted with the DOM overlay; a full camera barrel pass
      // at this low internal resolution tears the picture, so it stays off.

      // breathing amber emergency lamp
      this.amber = this.add.image(55,66,'glow_amber').setBlendMode(Phaser.BlendModes.ADD)
        .setScale(1.25).setAlpha(0.55).setDepth(5);
      this.tweens.add({targets:this.amber, alpha:{from:0.3,to:0.72}, scale:{from:1.1,to:1.35},
        duration:3600, yoyo:true, repeat:-1, ease:'Sine.easeInOut'});

      // stuttering fluorescent
      this.tube = this.add.image(160,52,'glow_greenS').setBlendMode(Phaser.BlendModes.ADD)
        .setScale(1.15).setAlpha(0.0).setDepth(5);
      this.tubeT = 0; this.tubeOn = 0;

      // a still white shape on the escalator, visible only when the tube trips
      this.silhouette = this.add.image(282,138,'hunter_still').setOrigin(0.5,1)
        .setScale(0.92).setTint(0x7f93a0).setAlpha(0.0).setDepth(4);

      // dust
      this.motes = [];
      for(let i=0;i<18;i++){
        const r = this.add.rectangle(
          20+Math.random()*280, 8+Math.random()*150, 1, 1,
          Math.random()<0.5?0x7fe0b8:0xe8e0cc, 0.22
        ).setDepth(6);
        this.tweens.add({
          targets:r, y:r.y - 10 - Math.random()*18,
          x:r.x + (Math.random()*18-9),
          alpha:{from:0.08,to:0.35},
          duration:5000+Math.random()*7000, yoyo:true, repeat:-1, ease:'Sine.easeInOut'
        });
        this.motes.push(r);
      }

      clearFx();
      if(pendingStart){ pendingStart=false; this.time.delayedCall(80, ()=>beginGame()); }
    }
    update(t, dt){
      this.tubeT -= dt;
      if(this.tubeT <= 0){
        this.tubeT = 900 + Math.random()*2600;
        this.tubeOn = 90 + Math.random()*220;
      }
      if(this.tubeOn > 0){
        this.tubeOn -= dt;
        const a = 0.25 + Math.random()*0.75;
        this.tube.setAlpha(a).setPosition(160 + (Math.random()*6-3), 52 + (Math.random()*3-1.5));
        this.silhouette.setAlpha(0.05 + Math.random()*0.10);
      } else {
        this.tube.setAlpha(0.0);
        this.silhouette.setAlpha(0.0);
      }
    }
  }

  /* ===============================================================
     GAME
     =============================================================== */
  class GameScene extends Phaser.Scene {
    constructor(){ super('mall'); }

    create(){
      mode = 'game';
      gameScene = this;
      titleScene = null;
      this.ended = false;
      applyChapterLayout(currentChapter);
      M.CHAPTER_INDEX = currentChapter;
      this.chapter = CHAPTERS[currentChapter];
      this.keyPos = this.chapter.key || KEYCARD;
      this.opened = false;
      this.paused = false;
      this.pausedAt = 0;
      this.pauseLen = 0;
      this.noise = 0;
      this.noiseSum = 0;
      this.noiseTime = 0;
      this.bangs = 0;
      this.steps = 0;
      this.dread = 0;
      this.faceX = 1; this.faceY = 0;
      this.walkT = 0; this.stepT = 0; this.stepSide = 1;
      this.rings = [];
      this.prints = [];
      this.hasKey = false;
      this.shutterOpen = false;
      this.firstStep = false;
      this.heartT = 0;
      this.hudT = 0;
      this.chromaBurst = 0;
      this.entityCueShown = false;
      this.entityAbilityAt = this.time ? this.time.now + 5200 : 5200;
      this.usherDecoyUntil = 0; this.staticPhaseUntil = 0; this.bossActive = false; this.bossDeadline = 0;
      this.doorFlash = 0;
      this.flickerT = 0;
      this.motes = Array.from({length:30}, ()=>({
        x:Math.random()*VW, y:Math.random()*VH, vy:-(2+Math.random()*7), vx:(Math.random()*4-2), a:0.05+Math.random()*0.2
      }));
      this.blocked = makeBlocked();
      this.cameras.main.setBackgroundColor('#03050a');

      const worldKey=prepareChapterArt(this,currentChapter);
      this.add.image(0,0,worldKey).setOrigin(0,0).setTint([0xffffff,0xbac8c9,0xc8bfd8,0xe2b9ac,0xa9b6c4,0xd8a89c,0xffd9b0][currentChapter]).setDepth(0);
      this.addFacades();

      this.solids = this.physics.add.staticGroup();
      this.addWallBodies();
      this.addProps();

      this.addShutter();
      this.addExit();
      this.addKeycard();
      this.addPlayer();
      this.addHunter();

      this.addLights();
      this.addDarkness();
      this.setupFx();
      this.setupCamera();
      this.setupUi();

      this.physics.add.collider(this.player, this.solids);
      if(this.shutterBody) this.physics.add.collider(this.player, this.shutterBody);
      this.physics.world.setBounds(0,0,WW,WH);
      this.player.setCollideWorldBounds(true);

      TUNE.hunterStep = this.chapter.speed;
      this.startRun();
      this.cameras.main.fadeIn(750,0,0,0);
      const fxEl = document.getElementById('fx');
      if(fxEl){ fxEl.style.opacity = '0'; setTimeout(()=>{ if(fxEl) fxEl.style.opacity='1'; }, 650); }

      this.time.delayedCall(850, ()=>{
        if(!this.ended) showChapterCutscene(this.chapter, this);
      });
      this.time.delayedCall(1450, ()=>{
        if(this.ended) return;
        Audio.doorClick();
        this.doorFlash = 1;
        this.cameras.main.shake(120,0.002);
      });
      this.time.delayedCall(5200, ()=>{
        if(!this.ended && !this.firstStep) showIntro("MOVE. QUIETLY.", 2600);
      });

      window.__mall = this;
      window.__debug = {
        teleport:(x,y)=>{ this.player.setPosition(x*16,y*16); },
        wake:()=>{ this.lights.forEach((L,i)=>this.wakeLight(i)); },
        bang:()=>this.bangAt(this.player.x+120, this.player.y, 1),
        reveal:()=>{ this.opened=true; this.hunter.sprite.setAlpha(1); this.hunter.state='idle'; },
        noise:(n)=>{ this.noise=n; },
        win:()=>this.win(),
        caught:()=>this.caught(),
        shutter:()=>{ this.hasKey=true; this.openShutter(); },
        chapter:(n)=>{ currentChapter=Math.max(0,Math.min(CHAPTERS.length-1, n|0)); this.scene.restart(); },
        goto:(n)=>{ currentChapter=Math.max(0,Math.min(CHAPTERS.length-1, n|0)); this.scene.restart(); },
        scene:()=>this
      };
    }

    /* ---------- level objects ---------- */
    addFacades(){
      for(const f of M.FACADE_IMAGES){
        this.add.image(f.x, f.y, f.key).setOrigin(0,1).setDepth(f.base);
      }
      // a warm seam where the mall door shut behind you
      this.doorGlow = this.add.image(34, 248, 'glow_amber')
        .setBlendMode(Phaser.BlendModes.ADD).setScale(0.5,0.9).setAlpha(0.25).setDepth(6000);
      this.add.rectangle(31, 248, 4, 40, 0xd8a24a, 0.16).setDepth(5900);
    }

    addWallBodies(){
      for(let y=1;y<ROWS-1;y++){
        let runStart=-1;
        for(let x=1;x<COLS-1;x++){
          const solid = M.MAP[y][x] === '#';
          if(solid && runStart<0) runStart=x;
          if((!solid || x===COLS-2) && runStart>=0){
            const end = solid ? x : x-1;
            const w = (end-runStart+1)*16;
            this.addSolid(runStart*16, y*16, w, 16);
            runStart=-1;
          }
        }
      }
    }

    addSolid(x,y,w,h){
      const s = this.solids.create(x + w/2, y + h/2, 'blank');
      s.setDisplaySize(w,h);
      s.refreshBody();
      s.setVisible(false);
      return s;
    }

    addProps(){
      for(const p of PROPS){
        const px = p.x*16, py = p.y*16;
        const sh = this.add.image(px, py+1, 'shadow').setOrigin(0.5,0.5)
          .setDisplaySize(p.w*1.5, Math.max(6,p.h*0.55)).setAlpha(0.5).setDepth(py-1);
        const img = this.add.image(px, py, 'prop_'+p.t).setOrigin(0.5,1).setDepth(py);
        img.setData('prop', p);
        this.addSolid(px - p.w/2, py - p.h, p.w, p.h);
      }
    }

    addShutter(){
      this.shutterGate = this.add.image(SHUTTER.x*16, 13*16, 'gate')
        .setOrigin(0.5,0).setDepth(290).setAlpha(0.98);
      this.shutterBody = this.physics.add.staticImage(SHUTTER.x*16, 16*16, 'blank');
      this.shutterBody.setDisplaySize(16, 96);
      this.shutterBody.refreshBody();
      this.shutterBody.setVisible(false);
    }

    addExit(){
      this.add.image(EXIT_SIGN.x*16, EXIT_SIGN.y, 'exit_sign').setOrigin(0.5,1).setDepth(7300);
      this.exitSign = { x:EXIT_SIGN.x*16, y:EXIT_SIGN.y - 8, alpha:1 };
      this.add.rectangle(EXIT.x*16, 12.9*16, 9, 26, 0x2a0d0b, 0.55).setDepth(7200);
    }

    addKeycard(){
      this.keySprite = this.add.image(this.keyPos.x*16, this.keyPos.y*16, 'keycard')
        .setOrigin(0.5,1).setDepth(this.keyPos.y*16);
      this.keyGlow = this.add.image(this.keyPos.x*16, this.keyPos.y*16-8, 'glow_greenS')
        .setBlendMode(Phaser.BlendModes.ADD).setScale(0.55).setAlpha(0.35).setDepth(6000);
      this.tweens.add({targets:[this.keySprite], y:'-=2', duration:1100, yoyo:true, repeat:-1, ease:'Sine.easeInOut'});
      this.tweens.add({targets:[this.keyGlow], alpha:{from:0.18,to:0.5}, duration:1400, yoyo:true, repeat:-1});
    }

    addPlayer(){
      this.playerShadow = this.add.image(START.x*16, START.y*16+1, 'shadow')
        .setOrigin(0.5,0.5).setDisplaySize(13,5).setAlpha(0.55).setDepth(START.y*16-1);
      this.player = this.physics.add.sprite(START.x*16, START.y*16, 'boy_idle');
      this.player.setOrigin(0.5,1);
      this.player.setSize(8,8);
      this.player.setOffset(5,19);
      this.player.setDepth(START.y*16);
      this.player.setCollideWorldBounds(true);
    }

    addHunter(){
      this.hunterSprite = this.add.image(18.5*16, 15.5*16, 'hunter_still')
        .setOrigin(0.5,1).setDepth(15.5*16).setAlpha(0);
      this.hunterShadow = this.add.image(18.5*16, 15.5*16+1, 'shadow')
        .setOrigin(0.5,0.5).setDisplaySize(18,6).setAlpha(0).setDepth(15.5*16-1);
      this.hunter = {
        x:18.5*16, y:15.5*16, state:'dormant', alert:0,
        target:{x:18.5*16,y:15.5*16}, lastNoise:{x:18.5*16,y:15.5*16},
        nextStep:0, pauseUntil:0, huntUntil:0, reveal:false, wakeSound:false,
        patrolA:{x:17.5*16,y:15.5*16}, patrolB:{x:25.2*16,y:15.5*16}, patrolDir:1,
        poseFlip:false, rearUntil:0, stepCount:0
      };
    }

    addLights(){
      this.lights = LIGHTS.map((d,i)=>{
        const fx = d.x*16+8, fy = d.y*16+8;
        const sprite = this.add.image(fx, fy, 'light_dead').setOrigin(0.5,1).setDepth(7200);
        const pool = this.add.image(fx, d.pool*16, 'glow_greenS')
          .setBlendMode(Phaser.BlendModes.ADD).setScale(1.5).setAlpha(0).setDepth(6000);
        return { ...d, fx, fy, poolY:d.pool*16, sprite, pool, on:false, energy:0, offAt:0, flick:0, wakeAt:0, idx:i };
      });
      // one amber hazard lamp by the mouth, breathing forever
      this.amberLamp = this.add.image(3.5*16, 12*16+8, 'light_amber').setOrigin(0.5,1).setDepth(7200);
      this.amberPool = this.add.image(3.5*16, 15.5*16, 'glow_amber')
        .setBlendMode(Phaser.BlendModes.ADD).setScale(1.1).setAlpha(0.28).setDepth(6000);
    }

    addDarkness(){
      this.dark = this.add.renderTexture(0,0,VW,VH).setOrigin(0,0).setScrollFactor(0).setDepth(7000);
    }

    setupFx(){
      this.fxEl = document.getElementById('fx');
      this.fxCtx = this.fxEl.getContext('2d');
      this.fxCtx.imageSmoothingEnabled = false;
    }

    setupCamera(){
      this.cameras.main.setBounds(0,0,WW,WH);
      this.cameras.main.startFollow(this.player, true, 0.13, 0.13);
      this.cameras.main.setZoom(1);
      this.cameras.main.setRoundPixels(true);
    }

    setupUi(){
      ui.hud.classList.add('on');
      ui.hud.classList.remove('hide');
      ui.prompt.className = '';
      ui.toast.className = '';
      ui.intro.className = '';
      ui.keyTag.classList.remove('on');
      ui.legend.textContent = touchMode()
        ? 'STICK MOVE, TILT SLOW TO SNEAK   BUTTON ACT'
        : 'WASD / ARROWS MOVE   SHIFT SNEAK   E ACT';
      ui.legend.style.opacity = '1';
    }

    /* ---------- run + run state ---------- */
    startRun(){
      runActive = true;
      runPaused = false;
      runStartAt = now();
      const mb = MB();
      try { mb?.run?.start?.(); } catch(e){}
    }
    endRun(escaped){
      if(!runActive) return;
      runActive = false;
      const sec = (now()-runStartAt)/1000;
      this.runSeconds = sec;
      try { MB()?.run?.end?.({ seconds:Math.round(sec*10)/10, escaped:escaped?1:0 }); } catch(e){}
      try { MB()?.run?.resume?.(); } catch(e){}
      runPaused = false;
      return sec;
    }
    pauseRun(){
      if(runActive && !runPaused){ runPaused = true; try{ MB()?.run?.pause?.(); }catch(e){} }
    }
    resumeRun(){
      if(runActive && runPaused){ runPaused = false; try{ MB()?.run?.resume?.(); }catch(e){} }
    }

    /* ---------- pause ---------- */
    softPause(on){
      if(this.ended) return;
      if(on && !this.paused){
        this.paused = true;
        this.pausedAt = this.time.now;
        this.physics.pause();
        this.tweens.pauseAll();
        this.pauseRun();
      } else if(!on && this.paused){
        this.paused = false;
        this.pauseLen = this.time.now - this.pausedAt;
        this.lights.forEach(L=>{ if(L.on) L.offAt += this.pauseLen; });
        if(this.hunter) this.hunter.nextStep += this.pauseLen;
        this.physics.resume();
        this.tweens.resumeAll();
        this.resumeRun();
        ui.intro.className = '';
      }
    }

    /* ---------- noise + rings ---------- */
    emitRing(wx, wy, max, strength, opts){
      this.rings.push({
        wx, wy, r:2, max, speed:opts&&opts.speed?opts.speed:(strength>0.7?320:230),
        life:0, maxLife:max/ (opts&&opts.speed?opts.speed:(strength>0.7?320:230)),
        strength, hits:new Set(), seed:Math.random()*9999
      });
    }

    flash(amount, ms){
      if(!ui.flash) return;
      ui.flash.style.transition = 'none';
      ui.flash.style.opacity = String(amount);
      clearTimeout(this._flashTO);
      this._flashTO = setTimeout(()=>{
        if(ui.flash){ ui.flash.style.transition = 'opacity '+Math.round(ms||180)+'ms'; ui.flash.style.opacity='0'; }
      }, 16);
    }

    wakeLight(i, opts){
      const L = this.lights[i];
      if(!L) return;
      const was = L.on;
      L.on = true;
      L.energy = 1;
      L.offAt = this.time.now + TUNE.lightLinger*1000 + Math.random()*800;
      L.wakeAt = this.time.now;
      L.flick = 0;
      L.sprite.setTexture('light_awake');
      L.pool.setAlpha(0.5);
      if(!opts || !opts.silent){
        Audio.tube();
        this.flash(0.10, 160);
      }
      if(!was && (!opts||!opts.silent)) this.cameras.main.shake(140, 0.0035);
    }

    wakeNear(wx, wy, radius, seq){
      const list = this.lights.map((L,i)=>({i,d:Math.hypot(L.fx-wx, L.poolY-wy)})).filter(o=>o.d<radius).sort((a,b)=>a.d-b.d);
      list.forEach((o,k)=>this.time.delayedCall(k*(seq||90), ()=>{ if(!this.ended) this.wakeLight(o.i); }));
    }

    surge(){
      this.noise = 0.6;
      this.flash(0.18, 240);
      this.cameras.main.shake(320,0.008);
      Audio.bang(0.7);
      this.wakeNear(this.player.x, this.player.y, 340, 55);
      const h=this.hunter;
      h.state='hunt'; h.huntUntil=this.time.now+2300; h.alert=1;
      h.target={x:this.player.x,y:this.player.y};
      this.toast('TOO LOUD', 1000);
      try{ MB()?.event?.('surge'); }catch(e){}
    }

    bangAt(wx, wy, strength){
      const s = strength==null?1:strength;
      this.bangs++;
      this.noise = clamp(this.noise + 0.55*s, 0, 1);
      this.emitRing(wx, wy, 150+90*s, s, {speed:340});
      this.wakeNear(wx, wy, 190+160*s, 70);
      this.cameras.main.shake(230,0.006);
      this.flash(0.10, 160);
      this.chromaBurst = Math.min(0.5, 0.24 + 0.2*s);
      Audio.bang(0.8*s);
      this.hunterHear(wx, wy, s);
      try{ MB()?.event?.('bang'); }catch(e){}
    }

    hunterHear(wx, wy, strength){
      const h=this.hunter;
      if(h.state==='dormant' || h.state==='hunt') return;
      h.lastNoise={x:wx,y:wy};
      h.target={x:wx,y:wy};
      h.alert=Math.max(h.alert,strength * (this.chapter.noise||1));
      h.state='investigate';
      h.pauseUntil=this.time.now + (strength>0.8?260:520);
      h.nextStep=this.time.now + (strength>0.8?260:520);
      if(!h.wakeSound && strength>0.5){
        h.wakeSound=true;
        if(Math.hypot(this.player.x-h.x,this.player.y-h.y)<320) Audio.hunterWake();
      }
    }

    /* ---------- player action ---------- */
    near(px,py,r){
      return Math.hypot(this.player.x-px, this.player.y-py) < r;
    }

    context(){
      if(this.hasKey===false && this.near(this.keyPos.x*16, this.keyPos.y*16-4, 26)) return { t:'key', label:'TAKE KEYCARD' };
      // the way out wins over the shutter once it is open, so the last step is never ambiguous
      if(this.shutterOpen && this.near(EXIT.x*16, 13.5*16, 46)) return { t:'exit', label:'GET OUT' };
      if(this.near(SHUTTER.x*16, 15.6*16, 52)){
        return this.hasKey ? { t:'shutter', label:'OPEN SHUTTER'} : { t:'locked', label:'LOCKED, NEED A KEYCARD' };
      }
      // noisy props
      for(const p of PROPS){
        if(['vending','payphone','arcade','kiosk'].indexOf(p.t)>=0 && this.near(p.x*16, p.y*16-9, 26)){
          return { t:'bangprop', p, label:'BANG IT' };
        }
      }
      return { t:'throw', label:'THROW CAN' };
    }

    doAction(){
      if(mode!=='game' || this.ended) return;
      if(this.paused){ this.softPause(false); return; }
      if(helpOpen) return;
      const c=this.context();
      if(c.t==='key'){ this.takeKey(); return; }
      if(c.t==='shutter'){ this.openShutter(); return; }
      if(c.t==='locked'){
        this.bangAt(SHUTTER.x*16, 15.5*16, 0.9);
        this.toast('IT NEEDS A KEYCARD', 1600);
        return;
      }
      if(c.t==='exit'){ this.win(); return; }
      if(c.t==='bangprop'){
        this.bangAt(c.p.x*16, c.p.y*16-6, 0.9);
        this.toast('CLANG', 700);
        return;
      }
      this.throwCan();
    }

    takeKey(){
      if(this.hasKey) return;
      this.hasKey = true;
      this.keySprite.destroy();
      this.keyGlow.destroy();
      ui.keyTag.classList.add('on');
      this.toast('KEYCARD', 1200);
      Audio.pickup();
      this.emitRing(this.player.x, this.player.y, 34, 0.16, {speed:160});
      if(window.STORY && window.STORY.interlude && !this.interludeSeen){
        this.interludeSeen = true;
        const scene=this;
        scene.softPause(true);
        window.STORY.interlude(currentChapter, ()=>{ if(scene.paused) scene.softPause(false); });
      }
    }

    throwCan(){
      if(this.throwCool && this.time.now < this.throwCool) return;
      this.throwCool = this.time.now + 700;
      const px=this.player.x, py=this.player.y;
      let dx=this.faceX, dy=this.faceY;
      if(!dx && !dy) dx=1;
      // find landing, stop at a wall
      let lx=px, ly=py-8;
      for(let d=6; d<=66; d+=4){
        const tx=px+dx*d, ty=py+dy*d*0.82-6;
        const bx=Math.floor(tx/16), by=Math.floor(ty/16);
        if(bx<0||by<0||bx>=COLS||by>=ROWS) break;
        if(M.MAP[by][bx]==='#' || (M.MAP[by][bx]==='S' && !this.shutterOpen)) break;
        lx=tx; ly=ty;
      }
      const spr=this.add.image(px, py-10, 'can').setOrigin(0.5,1).setDepth(py);
      Audio.throwCan();
      this.tweens.add({
        targets:spr, x:lx, y:ly, duration:360, ease:'Quad.easeOut',
        onUpdate:()=>{ spr.setDepth(spr.y); },
        onComplete:()=>{
          if(this.ended) return;
          Audio.land();
          this.bangAt(lx, ly, 0.85);
        }
      });
    }

    openShutter(){
      if(this.shutterOpen) return;
      this.shutterOpen = true;
      this.toast('SHUTTER OPEN', 1600);
      Audio.shutter();
      this.cameras.main.shake(420,0.009);
      this.tweens.add({targets:this.shutterGate, scaleY:0.12, duration:950, ease:'Cubic.easeInOut'});
      if(this.shutterBody && this.shutterBody.body) this.shutterBody.body.enable = false;
      for(let y=13;y<=18;y++){ this.blocked[y][56] = false; }
      this.emitRing(SHUTTER.x*16, 15.5*16, 240, 1, {speed:340});
      this.wakeNear(SHUTTER.x*16, 15.5*16, 330, 70);
      this.hunterHear(SHUTTER.x*16, 15.5*16, 1);
      this.flash(0.14, 200);
    }

    /* ---------- hunter ---------- */
    hunterStep(){
      const h=this.hunter;
      const nowT=this.time.now;
      let target = h.target;
      if(h.state==='idle'){
        target = h.patrolDir>0 ? h.patrolB : h.patrolA;
        if(Math.hypot(h.x-target.x,h.y-target.y)<10){
          h.patrolDir *= -1;
          h.nextStep = nowT + 1200 + Math.random()*700;
          return;
        }
      }
      if(h.state==='investigate'){
        if(Math.hypot(h.x-h.target.x,h.y-h.target.y)<14){
          h.state='idle';
          h.alert = Math.max(0, h.alert-0.4);
          h.nextStep = nowT + 1500 + Math.random()*900;
          return;
        }
        target = h.target;
      }
      if(h.state==='hunt'){
        target = { x:this.player.x, y:this.player.y };
        h.target = target;
      }
      const sx=Math.floor(h.x/16), sy=Math.floor(h.y/16);
      const tx=Math.floor(target.x/16), ty=Math.floor(target.y/16);
      let nx=sx, ny=sy;
      if(Math.abs(sx-tx)+Math.abs(sy-ty) <= 1){
        nx=tx; ny=ty;
      } else {
        const p=nextPathTile(this.blocked, sx, sy, tx, ty);
        nx=p[0]; ny=p[1];
      }
      const cx=nx*16+8, cy=ny*16+8;
      let dx=cx-h.x, dy=cy-h.y, d=Math.hypot(dx,dy)||1;
      const step = h.state==='hunt' ? TUNE.hunterStep*(this.bossActive?1.75:1.15) : TUNE.hunterStep;
      if(d>step){ h.x += dx/d*step; h.y += dy/d*step; }
      else { h.x=cx; h.y=cy; }
      h.x=clamp(h.x,16,WW-16); h.y=clamp(h.y,16,WH-16);
      h.stepCount++;
      const distP=Math.hypot(this.player.x-h.x, this.player.y-h.y);
      if(distP<520) Audio.hunterStep();
      // afterimage
      const ghost=this.add.image(h.x, h.y, this.hunterSprite.texture.key)
        .setOrigin(0.5,1).setDepth(h.y-0.2).setTint(0xbfe8dc).setAlpha(0.16).setFlipX(h.poseFlip);
      this.tweens.add({targets:ghost, alpha:0, duration:170, onComplete:()=>ghost.destroy()});
      // pose
      if(h.state==='hunt'){
        h.rearUntil = nowT+220;
        this.hunterSprite.setTexture(h.stepCount%2?'hunter_reach':'hunter_lunge');
      } else if(h.state==='investigate'){
        this.hunterSprite.setTexture(h.stepCount%2?'hunter_drift1':'hunter_drift2');
      } else {
        this.hunterSprite.setTexture('hunter_still');
      }
      if(distP<160) this.dread = Math.min(1, this.dread + 0.08);
      h.nextStep = nowT + (h.state==='hunt'?300:(h.state==='investigate'?620:1350));
    }

    updateHunter(dt){
      const h=this.hunter;
      const nowT=this.time.now;
      // The Usher redirects the Listener toward a false announcement before resuming pursuit.
      if(currentChapter===1 && nowT>this.entityAbilityAt && h.state!=='hunt'){
        this.entityAbilityAt=nowT+10500;
        const decoy={x:(Math.random()<0.5?13:47)*16,y:(Math.random()<0.5?9:21)*16};
        h.target=decoy; h.state='investigate'; h.pauseUntil=nowT+250; h.nextStep=nowT+250;
        this.usherDecoyUntil=nowT+2600;
        showIntro('PA SYSTEM: PLEASE FOLLOW THE GREEN SIGNS.',1800);
        this.flash(0.08,260);
      }
      // The Static Child phases out, then reappears behind the player as a warning.
      if(currentChapter===2 && nowT>this.entityAbilityAt && h.state!=='hunt' && h.state!=='dormant'){
        this.entityAbilityAt=nowT+12500;
        h.state='dormant'; this.hunterSprite.setAlpha(0.12);
        this.staticPhaseUntil=nowT+1800;
        this.chromaBurst=0.42; this.flash(0.12,260);
        showIntro('CAMERA 04: SUBJECT MISSING.',1500);
      }
      if(currentChapter===2 && h.state==='dormant' && this.staticPhaseUntil && nowT>=this.staticPhaseUntil){
        const px=this.player.x, py=this.player.y;
        const tx=clamp(Math.floor((px+(this.faceX*-105))/16),2,COLS-3), ty=clamp(Math.floor((py+(this.faceY*-105))/16),2,ROWS-3);
        if(!this.blocked[ty][tx]){ h.x=tx*16+8; h.y=ty*16+8; }
        h.state='idle'; h.target={x:px,y:py}; h.nextStep=nowT+450;
        this.hunterSprite.setAlpha(0.78); this.hunterSprite.setTexture('hunter_still');
        this.staticPhaseUntil=0;
      }
      if(h.state==='dormant') return;
      const distP=Math.hypot(this.player.x-h.x, this.player.y-h.y);
      if(this.bossActive){
        if(nowT>=this.bossDeadline){ this.bossDeadline=nowT+32000; this.flash(0.1,220); showIntro('THE MANAGER HAS RESET THE SHIFT.',1400); }
        h.state='hunt'; h.huntUntil=this.bossDeadline; h.alert=1;
      }
      const canSee = distP<90 && losClear(this.blocked, h.x,h.y,this.player.x,this.player.y);
      if(canSee && (this.noise>0.12 || distP<34) && h.state!=='hunt'){
        h.state='hunt';
        h.huntUntil=nowT+2300;
        h.alert=1;
        h.target={x:this.player.x,y:this.player.y};
        h.rearUntil=nowT+260;
        this.hunterSprite.setTexture('hunter_rear');
        if(distP<300){
          Audio.hunterWake();
          this.cameras.main.shake(180,0.004);
        }
      }
      if(h.state==='hunt'){
        if(canSee) h.huntUntil=nowT+1500;
        if(nowT>h.huntUntil && (this.noise<0.05 || distP>110)){
          h.state='investigate';
          h.target={x:h.lastSeen?h.lastSeen.x:this.player.x, y:h.lastSeen?h.lastSeen.y:this.player.y};
          h.nextStep=nowT+500;
        }
        h.target={x:this.player.x,y:this.player.y};
        if(canSee) h.lastSeen={x:this.player.x,y:this.player.y};
      }
      if(nowT >= h.nextStep && nowT >= h.pauseUntil) this.hunterStep();
      // decay alert when nothing is happening
      if(h.state==='idle') h.alert=Math.max(0,h.alert-dt*0.12);
      if(distP<15 && h.state!=='dormant'){ this.caught(); return; }

      h.poseFlip = h.target.x < h.x;
      this.hunterSprite.setFlipX(h.poseFlip);
      if(nowT < h.rearUntil && h.state==='hunt') this.hunterSprite.setTexture('hunter_rear');
      this.hunterSprite.setPosition(h.x, h.y).setDepth(h.y);
      this.hunterShadow.setPosition(h.x, h.y+1).setDepth(h.y-1)
        .setAlpha(clamp(0.6 - distP/500, 0.12, 0.55));
      const near = clamp(1 - distP/180, 0, 1);
      this.dread = Math.max(this.dread*(1-dt*0.7), near*(h.state==='hunt'?1:0.75));
    }

    /* ---------- player update ---------- */
    updatePlayer(dt){
      let mx=0,my=0;
      const k=Input.keys;
      if(k.has('a')||k.has('arrowleft')) mx-=1;
      if(k.has('d')||k.has('arrowright')) mx+=1;
      if(k.has('w')||k.has('arrowup')) my-=1;
      if(k.has('s')||k.has('arrowdown')) my+=1;
      if(Input.joy && Input.mag>0.08){ mx=Input.jx; my=Input.jy; }
      let mag=Math.hypot(mx,my);
      if(mag>1){ mx/=mag; my/=mag; mag=1; }
      let sneak = k.has('shift') || (Input.joy && Input.mag>0.05 && Input.mag<0.46);
      if(k.has('shift') && !Input.joy) sneak=true;
      if(mag>0.05){
        if(Math.abs(mx)>Math.abs(my)){ this.faceX=Math.sign(mx); this.faceY=0; }
        else { this.faceX=0; this.faceY=Math.sign(my); }
        let speed = sneak ? TUNE.sneak : TUNE.walk;
        if(Input.joy) speed *= clamp(Input.mag, 0.45, 1);
        this.player.setVelocity(mx*speed, my*speed);
        this.walkT += dt;
        this.stepT -= dt;
        if(this.stepT<=0){
          this.stepT = sneak?0.55:0.30;
          this.steps++;
          const ringMax = sneak?18:56;
          this.emitRing(this.player.x, this.player.y-2, ringMax, sneak?0.12:0.5, {speed:sneak?140:250});
          Audio.step(!sneak, sneak);
          this.prints.push({
            x:this.player.x + (this.faceY!==0?this.stepSide*3:0),
            y:this.player.y + (this.faceX!==0?this.stepSide*2:0),
            age:0, life:2.8, side:this.stepSide
          });
          this.stepSide *= -1;
          const hearR = sneak?30:105;
          const dH = Math.hypot(this.player.x-this.hunter.x, this.player.y-this.hunter.y);
          if(dH < hearR) this.hunterHear(this.player.x, this.player.y, sneak?0.1:0.35);
        }
        this.noise = clamp(this.noise + dt*(sneak?0.035:TUNE.noiseFill), 0, 1);
        if(this.noise>=1) this.surge();
      } else {
        this.player.setVelocity(0,0);
        this.walkT = 0;
        this.noise = Math.max(0, this.noise - dt*TUNE.noiseDecay);
      }
      // animation
      let key='boy_idle';
      if(mag>0.05){
        if(sneak) key='boy_sneak';
        else key = (Math.floor(this.walkT*7)%2)?'boy_walk1':'boy_walk2';
      }
      this.player.setTexture(key);
      this.player.setFlipX(this.faceX<0);
      this.player.setDepth(this.player.y);
      this.playerShadow.setPosition(this.player.x, this.player.y+1).setDepth(this.player.y-1);
      // first step
      if(!this.firstStep && Math.hypot(this.player.x-START.x*16, this.player.y-START.y*16)>4){
        this.firstStep = true;
        this.firstStepEvent();
      }
      // micro camera dread
      const t=this.time.now*0.001;
      this.cameras.main.setFollowOffset(Math.sin(t*17)*this.dread*2.5, Math.cos(t*13)*this.dread*1.8);
    }

    firstStepEvent(){
      this.opened = true;
      this.noise = 0.55;
      Audio.setRoomLevel(0.55, true);
      this.emitRing(this.player.x, this.player.y-2, 165, 1, {speed:300});
      this.time.delayedCall(50, ()=>this.wakeLight(0));
      this.time.delayedCall(190, ()=>this.wakeLight(1));
      this.time.delayedCall(340, ()=>this.wakeLight(2, {silent:true}));
      this.time.delayedCall(500, ()=>{
        if(this.ended) return;
        const h=this.hunter;
        h.state='idle';
        h.alert=0.35;
        h.nextStep=this.time.now+1600;
        h.target={x:this.player.x,y:this.player.y};
        this.hunterSprite.setAlpha(1).setTexture('hunter_still');
        this.hunterShadow.setAlpha(0.5);
        Audio.hunterWake();
        this.cameras.main.shake(200,0.005);
        this.dread=0.25;
      });
      this.flash(0.16,220);
      this.chromaBurst = 0.4;
      this.cameras.main.shake(300,0.006);
      try{ MB()?.event?.('first_noise'); }catch(e){}
    }

    /* ---------- lights ---------- */
    updateLights(dt){
      const t=this.time.now;
      for(const L of this.lights){
        if(!L.on) continue;
        if(t > L.offAt){
          // flicker out
          if(Math.random()<0.35){
            L.on=false; L.energy=0;
            L.sprite.setTexture('light_dead'); L.pool.setAlpha(0);
          } else {
            L.sprite.setTexture('light_flick'); L.energy=0.45;
            L.pool.setAlpha(0.2);
            if(Math.random()<0.4) Audio.flicker();
          }
          continue;
        }
        // occasional stutter while burning
        if(Math.random()<0.006){
          L.sprite.setTexture('light_flick'); L.energy=0.5; L.pool.setAlpha(0.22);
          if(Math.random()<0.5) Audio.flicker();
        } else if(L.sprite.texture.key!=='light_awake'){
          L.sprite.setTexture('light_awake'); L.energy=1; L.pool.setAlpha(0.5);
        }
        L.pool.setAlpha((0.35+Math.random()*0.12)*L.energy);
      }
      // amber lamp breathes
      const a=0.2+0.12*Math.sin(t*0.0011)+Math.random()*0.02;
      this.amberPool.setAlpha(a);
      this.doorGlow.setAlpha(0.16+this.doorFlash*0.8);
      this.doorFlash = Math.max(0, this.doorFlash-dt*1.8);
    }

    /* ---------- rings + fx ---------- */
    updateRings(dt){
      const vx=this.cameras.main.worldView.x, vy=this.cameras.main.worldView.y;
      for(let i=this.rings.length-1;i>=0;i--){
        const R=this.rings[i];
        R.life += dt;
        R.r += R.speed*dt;
        if(R.r>R.max){ this.rings.splice(i,1); continue; }
        // trigger lights + sign glows as the wavefront passes
        for(const L of this.lights){
          if(R.hits.has('L'+L.idx)) continue;
          const d=Math.hypot(L.fx-R.wx, L.poolY-R.wy);
          if(Math.abs(d-R.r)<10 && d<R.max){
            R.hits.add('L'+L.idx);
            if(!L.on || L.energy<0.8) this.wakeLight(L.idx, {silent:Math.random()<0.25});
          }
        }
        for(let si=0; si<SIGN_GLOWS.length; si++){
          const S=SIGN_GLOWS[si];
          if(R.hits.has('S'+si)) continue;
          const d=Math.hypot(S.x-R.wx, S.y-R.wy);
          if(Math.abs(d-R.r)<10 && d<R.max){
            R.hits.add('S'+si);
            this.signGlow(si);
          }
        }
      }
      for(let i=this.prints.length-1;i>=0;i--){
        const p=this.prints[i]; p.age+=dt;
        if(p.age>p.life) this.prints.splice(i,1);
      }
    }

    signGlow(i){
      const S=SIGN_GLOWS[i];
      if(!S) return;
      S.flash = 1.3;
    }

    drawFx(){
      const ctx=this.fxCtx;
      if(!ctx) return;
      ctx.clearRect(0,0,VW,VH);
      ctx.globalCompositeOperation='lighter';
      const cam=this.cameras.main;
      const vx=cam.worldView.x, vy=cam.worldView.y, z=cam.zoom;
      const sx=(x)=>(x-vx)*z;
      const sy=(y)=>(y-vy)*z;

      // ceiling light bloom
      for(const L of this.lights){
        if(L.energy<=0.02) continue;
        const px=sx(L.fx), py=sy(L.poolY);
        const img = L.sprite.texture.key==='light_flick' ? M.FX.greenS : M.FX.green;
        ctx.globalAlpha=0.35*L.energy;
        const s=img.width*1.25;
        ctx.drawImage(img, px-s/2, py-s/2, s, s);
        ctx.globalAlpha=0.5*L.energy;
        const s2=M.FX.greenS.width*0.8;
        ctx.drawImage(M.FX.greenS, px-s2/2, py-s2/2, s2, s2);
      }
      // amber lamp
      ctx.globalAlpha=0.34;
      const as=M.FX.amber.width*1.1;
      ctx.drawImage(M.FX.amber, sx(3.5*16)-as/2, sy(15.3*16)-as/2, as, as);
      // door seam
      ctx.globalAlpha=0.25+this.doorFlash*0.6;
      const ds=M.FX.amber.width*0.55;
      ctx.drawImage(M.FX.amber, sx(34)-ds/2, sy(248)-ds/2, ds, ds);
      // exit sign
      const signPulse=0.6+0.16*Math.sin(this.time.now*0.0022);
      ctx.globalAlpha=signPulse;
      const rs=M.FX.red.width*1.15;
      ctx.drawImage(M.FX.red, sx(EXIT_SIGN.x*16)-rs/2, sy(EXIT_SIGN.y-6)-rs/2, rs, rs);
      ctx.globalAlpha=0.25;
      const rss=M.FX.redS.width*0.7;
      ctx.drawImage(M.FX.redS, sx(EXIT_SIGN.x*16)-rss/2, sy(EXIT_SIGN.y-6)-rss/2, rss, rss);
      if(!this.shutterOpen){
        ctx.globalAlpha=0.2;
        const gs=M.FX.redS.width*0.8;
        ctx.drawImage(M.FX.redS, sx(SHUTTER.x*16)-gs/2, sy(13.2*16)-gs/2, gs, gs);
      }
      // keycard beacon
      if(!this.hasKey && this.keySprite && this.keySprite.active){
        ctx.globalAlpha=0.3+0.16*Math.sin(this.time.now*0.004);
        const ks=M.FX.greenS.width*0.6;
        ctx.drawImage(M.FX.greenS, sx(this.keyPos.x*16)-ks/2, sy(this.keyPos.y*16-9)-ks/2, ks, ks);
      }
      // arcade screen
      ctx.globalAlpha=0.26;
      const car=M.FX.greenS.width*0.5;
      ctx.drawImage(M.FX.greenS, sx(43.4*16)-car/2, sy(11.35*16-13)-car/2, car, car);
      // shop sign stutter
      for(const S of SIGN_GLOWS){
        if(!S.flash) continue;
        S.flash = Math.max(0, S.flash - 0.045);
        const img = S.color==='amber'?M.FX.amber:(S.color==='green'?M.FX.greenS:M.FX.white);
        const flicker = 0.55+Math.random()*0.45;
        ctx.globalAlpha = Math.min(1,S.flash)*0.55*flicker;
        const w=img.width*0.72;
        ctx.drawImage(img, sx(S.x)-w/2, sy(S.y)-w/2, w, w);
      }
      // player flashlight
      this.drawFlashlight(ctx, sx, sy);
      // rings
      for(const R of this.rings){
        if(R.r<1) continue;
        const t = R.r/R.max;
        const a = (1-t*0.65)*R.strength;
        this.drawRing(ctx, sx(R.wx), sy(R.wy), R.r*z, a, R);
      }
      // footprints
      for(const p of this.prints){
        const a = (1-p.age/p.life)*0.5;
        ctx.globalAlpha=a;
        ctx.fillStyle='#7fe0b8';
        const px=Math.round(sx(p.x)), py=Math.round(sy(p.y));
        ctx.fillRect(px-1,py-1,2,3);
        ctx.fillRect(px+(p.side>0?1:-2), py-3, 1, 2);
      }
      // dust
      for(const m of this.motes){
        m.x += m.vx*0.016; m.y += m.vy*0.016;
        if(m.y<-4){ m.y=VH+4; m.x=Math.random()*VW; }
        if(m.x<-4) m.x=VW+4; if(m.x>VW+4) m.x=-4;
        ctx.globalAlpha=m.a;
        ctx.fillStyle='#d8ffe9';
        ctx.fillRect(Math.round(m.x), Math.round(m.y), 1, 1);
      }
      ctx.globalAlpha=1;
      ctx.globalCompositeOperation='source-over';
    }

    drawFlashlight(ctx, sx, sy){
      const p=this.player;
      const px=sx(p.x), py=sy(p.y-8);
      ctx.globalAlpha=0.42;
      const gs=M.FX.amber.width*0.62;
      ctx.drawImage(M.FX.amber, px-gs/2, py-gs/2, gs, gs);
      ctx.globalAlpha=0.2;
      const ws=M.FX.white.width*0.34;
      ctx.drawImage(M.FX.white, px-ws/2, py-ws/2, ws, ws);

      const ang=Math.atan2(this.faceY, this.faceX);
      const bx=px, by=py;
      const reach=86, width=0.48;
      const bayer=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
      const minX=Math.max(0, Math.floor(bx-reach)), maxX=Math.min(VW, Math.ceil(bx+reach));
      const minY=Math.max(0, Math.floor(by-reach)), maxY=Math.min(VH, Math.ceil(by+reach));
      for(let y=minY;y<maxY;y+=2){
        for(let x=minX;x<maxX;x+=2){
          const dx=x-bx, dy=y-by;
          const d=Math.sqrt(dx*dx+dy*dy);
          if(d<8 || d>reach) continue;
          let da=Math.atan2(dy,dx)-ang;
          while(da>Math.PI) da-=Math.PI*2;
          while(da<-Math.PI) da+=Math.PI*2;
          if(Math.abs(da)>width) continue;
          const fall=(1-d/reach)*(1-Math.abs(da)/width);
          const q=(bayer[((y>>1)&3)*4+((x>>1)&3)]+0.5)/16;
          if(fall*1.25 < q) continue;
          ctx.globalAlpha=0.12+fall*0.16;
          ctx.fillStyle='#f2b13c';
          ctx.fillRect(x,y,2,2);
        }
      }
    }

    drawRing(ctx, cx, cy, r, alpha, R){
      if(r<2) return;
      const step=Math.max(0.018, 1.35/r);
      const solidAt=(wx,wy)=>{
        const bx=Math.floor(wx/16), by=Math.floor(wy/16);
        if(bx<0||by<0||bx>=COLS||by>=ROWS) return true;
        const ch=M.MAP[by][bx];
        return ch==='#' || (ch==='S' && !this.shutterOpen);
      };
      const rnd=R?R.seed:1;
      const cols=['#3d7a67','#7fe0b8','#d8ffe9'];
      for(let k=0;k<3;k++){
        const rr=r+(k-1)*1.1;
        ctx.globalAlpha=alpha*(k===1?0.95:0.42);
        ctx.fillStyle=cols[k];
        let ai=0;
        for(let a=0;a<Math.PI*2;a+=step){
          ai++;
          if(((ai+Math.floor(rnd))%9)===0) continue;
          const wx=R.wx+Math.cos(a)*rr;
          const wy=R.wy+Math.sin(a)*rr;
          if(solidAt(wx,wy)) continue;
          const px=Math.round(cx+Math.cos(a)*rr);
          const py=Math.round(cy+Math.sin(a)*rr);
          ctx.fillRect(px,py,1,1);
        }
      }
      // sparse outer glow
      ctx.globalAlpha=alpha*0.18;
      ctx.fillStyle='#7fe0b8';
      const rr2=r+4;
      for(let a=0;a<Math.PI*2;a+=step*2.1){
        const wx=R.wx+Math.cos(a)*rr2, wy=R.wy+Math.sin(a)*rr2;
        if(solidAt(wx,wy)) continue;
        ctx.fillRect(Math.round(cx+Math.cos(a)*rr2), Math.round(cy+Math.sin(a)*rr2), 1, 1);
      }
    }

    /* ---------- darkness ---------- */
    updateDarkness(){
      const cam=this.cameras.main;
      const vx=cam.worldView.x, vy=cam.worldView.y, z=cam.zoom;
      const darkA=clamp(0.925 + this.dread*0.035, 0, 0.975);
      this.dark.clear();
      this.dark.fill(0x02040a, darkA);
      const eraseAt=(key,wx,wy,scale)=>{
        const tex=this.textures.get(key).getSourceImage();
        const w=tex.width*(scale||1), h=tex.height*(scale||1);
        this.dark.erase(key, (wx-vx)*z - w/2, (wy-vy)*z - h/2);
      };
      const p=this.player;
      eraseAt('hole64', p.x, p.y-10, 1);
      eraseAt('hole64', p.x + this.faceX*26, p.y-8 + this.faceY*14, 0.85);
      for(const L of this.lights){
        if(!L.on || L.energy<0.1) continue;
        eraseAt(L.energy>0.6?'hole96':'hole64', L.fx, L.poolY, 1);
      }
      eraseAt('hole64', 3.5*16, 15.2*16, 0.9);
      eraseAt('hole96', EXIT_SIGN.x*16, 14*16, 0.9);
      eraseAt('hole64', 43.4*16, 11.2*16, 0.8);
    }

    /* ---------- HUD ---------- */
    updateHud(){
      const filled=Math.round(this.noise*12);
      const segs=ui.segs;
      for(let i=0;i<segs.length;i++){
        let c='seg';
        if(i<filled) c += i<6?' g':(i<9?' a':' r');
        if(segs[i].className!==c) segs[i].className=c;
      }
      let word='QUIET', col=P.green;
      if(this.noise>0.78){ word='TOO LOUD'; col=P.red; }
      else if(this.noise>0.46){ word='LOUD'; col=P.amber; }
      else if(this.noise>0.16){ word='HUSH'; col=P.teal2; }
      if(ui.noiseWord.textContent!==word) ui.noiseWord.textContent=word;
      ui.noiseWord.style.color=col;

      const dx=(EXIT.x*16)-this.player.x, dy=(EXIT.y*16)-this.player.y;
      const dist=Math.hypot(dx,dy);
      const deg=Math.atan2(dy,dx)*180/Math.PI+90;
      ui.compass.style.transform='rotate('+deg.toFixed(1)+'deg)';
      ui.dist.textContent=Math.max(1,Math.round(dist/16))+'M';

      const c=this.context();
      let text=c.label;
      const touch=touchMode();
      if(c.t!=='locked') text += touch?'  TAP':'  [E]';
      ui.prompt.textContent=text;
      ui.prompt.classList.toggle('on', !this.ended && !helpOpen);
      ui.prompt.classList.toggle('lock', c.t==='locked');

      ui.keyTag.classList.toggle('on', this.hasKey);
      if(this.bossActive && !this.ended){
        ui.noiseWord.textContent='FINAL SHIFT';
        ui.noiseWord.style.color=P.red;
      }
      document.documentElement.style.setProperty('--dread', this.dread.toFixed(3));
      ui.dread.style.opacity=(this.dread*0.62).toFixed(3);
      ui.chroma.style.opacity=Math.min(0.62, this.dread*0.22 + this.chromaBurst).toFixed(3);
      const dur=(11-this.dread*7).toFixed(2)+'s';
      if(ui.glass.style.getPropertyValue('--scanDur')!==dur) ui.glass.style.setProperty('--scanDur', dur);
      const scan=this.dread>0.2?0.88:TUNE.scan;
      if(ui.scanlines.style.opacity!==String(scan)) ui.scanlines.style.opacity=String(scan);
    }

    /* ---------- flow ---------- */
    caught(){
      if(this.ended) return;
      this.ended = true;
      this.state='caught';
      this.player.setVelocity(0,0);
      this.player.setTexture('boy_caught');
      this.endRun(0);
      mode='end';
      Audio.caught();
      this.flash(0.4,120);
      this.cameras.main.shake(600,0.02);
      this.cameras.main.setZoom(1.3);
      try{ ui.tracking.classList.add('on'); }catch(e){}
      ui.glass.classList.add('dead');
      ui.ui.classList.add('scare');
      this.hunterSprite.setTexture('hunter_reach').setAlpha(1);
      this.showScare();
      const sec=this.runSeconds||0;
      const avg=this.noiseTime>0 ? this.noiseSum/this.noiseTime : 0;
      try{ MB()?.event?.('caught',{ seconds:Math.round(sec*10)/10, noise:Math.round(avg*100) }); }catch(e){}
      this.time.delayedCall(980, ()=>{
        try{ ui.tracking.classList.remove('on'); }catch(e){}
        showEndPanel(false, sec, avg*100, this.bangs, this);
      });
    }

    showScare(){
      const s=this.add.image(VW/2, VH/2, 'scare')
        .setScrollFactor(0).setDepth(9990).setScale(1.7).setAlpha(0);
      this.tweens.add({targets:s, alpha:1, scale:2.15, duration:130, ease:'Quad.easeOut'});
      this.time.delayedCall(560, ()=>{
        this.tweens.add({targets:s, alpha:0, duration:160, onComplete:()=>s.destroy()});
      });
    }

    win(){
      if(this.ended) return;
      this.ended = true;
      this.state='won';
      this.player.setVelocity(0,0);
      const sec=this.endRun(1);
      mode='end';
      Audio.escaped();
      this.flash(0.5, 500);
      this.cameras.main.flash(220, 210, 255, 232);
      this.cameras.main.shake(200,0.003);
      this.cameras.main.setZoom(1.12);
      const avg=this.noiseTime>0 ? this.noiseSum/this.noiseTime : 0;
      try{ MB()?.event?.('escaped',{ seconds:Math.round(sec*10)/10, noise:Math.round(avg*100), bangs:this.bangs }); }catch(e){}
      try{ MB()?.event?.('escape_time',{ value:Math.round(sec*10)/10 }); }catch(e){}
      this.time.delayedCall(1050, ()=>{
        if(currentChapter < CHAPTERS.length-1){
          currentChapter++;
          showChapterTransition(this.chapter, CHAPTERS[currentChapter]);
        } else {
          const settle=(kind)=>{
            showEndPanel(true, sec, avg*100, this.bangs, this, kind);
            submitAndBoard(sec);
          };
          if(window.STORY && window.STORY.finalChoice){
            window.STORY.finalChoice((kind)=>{
              if(window.STORY.ending) window.STORY.ending(kind, ()=>settle(kind));
              else settle(kind);
            });
          } else settle('hollow');
        }
      });
    }

    update(time, delta){
      const dt=Math.min(delta/1000, 0.05);
      if(this.ended || this.paused) {
        if(this.ended) this.drawFx();
        return;
      }
      this.updatePlayer(dt);
      if(this.ended) return;
      this.updateHunter(dt);
      if(this.ended) return;
      this.updateLights(dt);
      this.updateRings(dt);
      this.updateDarkness();
      this.drawFx();
      this.hudT -= dt;
      if(this.hudT<=0){ this.hudT=0.09; this.updateHud(); }
      this.noiseSum += this.noise*dt; this.noiseTime += dt;
      this.chromaBurst = Math.max(0, this.chromaBurst - dt*1.9);
      Audio.setRoomLevel(clamp(this.noise,0,1), this.noise>0.02);
      if(this.dread>0.25){
        this.heartT -= dt;
        if(this.heartT<=0){ this.heartT=0.9-this.dread*0.25; Audio.heart(); }
      }
    }
  }

  function storyResume(scene, chapter){
    if(scene && scene.paused) scene.softPause(false);
    showIntro(chapter.event, 2400);
  }
  function showChapterCutscene(chapter, scene){
    const panel=document.getElementById('storyPanel');
    if(!panel) return;
    if(scene && !scene.paused) scene.softPause(true);
    const total=CHAPTERS.length;
    const fillPanel=()=>{
      document.getElementById('storyKicker').textContent='CHAPTER '+String(currentChapter+1).padStart(2,'0')+' / '+String(total).padStart(2,'0')+'  \u2014  '+chapter.place;
      document.getElementById('storyTitle').textContent=chapter.title;
      document.getElementById('storyBody').textContent=chapter.body;
      document.getElementById('storyWhisper').textContent=chapter.whisper;
      document.getElementById('storyContinue').textContent = currentChapter===total-1 ? 'OPEN THE HATCH' : 'ENTER THE MALL';
      panel.classList.add('on');
      document.getElementById('storyContinue').onclick=()=>{
        panel.classList.remove('on');
        document.getElementById('storyContinue').textContent='ENTER THE MALL';
        storyResume(scene, chapter);
      };
    };
    if(window.STORY && window.STORY.chapterIntro){
      const intro=()=>window.STORY.chapterIntro(currentChapter, fillPanel);
      if(currentChapter===0 && !window.__prologueSeen){
        window.__prologueSeen=true;
        if(window.STORY.prologue) window.STORY.prologue(intro); else intro();
      } else intro();
    } else fillPanel();
  }
  function showChapterTransition(previous, next){
    const panel=document.getElementById('storyPanel');
    const total=CHAPTERS.length;
    document.getElementById('storyKicker').textContent='CHAPTER '+String(currentChapter).padStart(2,'0')+' / '+String(total).padStart(2,'0')+' CLEARED \u2014 '+previous.place;
    document.getElementById('storyTitle').textContent=next.title;
    document.getElementById('storyBody').textContent=next.bridge || ('You found a way through. The mall changes around you. Somewhere beyond the next shutter, '+next.entity+' is waiting.');
    document.getElementById('storyWhisper').textContent=next.whisper;
    panel.classList.add('on');
    document.getElementById('storyContinue').textContent='DESCEND TO CHAPTER '+String(currentChapter+1).padStart(2,'0');
    document.getElementById('storyContinue').onclick=()=>{
      panel.classList.remove('on');
      document.getElementById('storyContinue').textContent='ENTER THE MALL';
      if(gameScene) gameScene.scene.restart();
    };
  }
  function openEntityFiles(){
    const host=document.getElementById('loreEntries');
    host.innerHTML='';
    ENTITY_FILES.forEach((entry,i)=>{
      const article=document.createElement('article'); article.className='loreEntry';
      if(window.ENTITIES && window.ENTITIES.previewDataURL){
        try{ const img=document.createElement('img'); img.className='entityArt'; img.alt=''; img.src=window.ENTITIES.previewDataURL(i); article.appendChild(img); }catch(e){}
      }
      const h=document.createElement('h3'); h.textContent=String(i+1).padStart(2,'0')+' / '+entry[0];
      const p=document.createElement('p'); p.textContent=entry[1];
      const small=document.createElement('small'); small.textContent=entry[2];
      article.append(h,p,small); host.appendChild(article);
    });
    document.getElementById('lorePanel').classList.add('on');
  }

  /* ===============================================================
     UI + DOM
     =============================================================== */
  let touch = false;
  function touchMode(){ return touch; }

  function clearFx(){
    const el=document.getElementById('fx');
    if(el){ const c=el.getContext('2d'); c.clearRect(0,0,320,180); }
  }

  function showIntro(text, ms){
    ui.intro.textContent=text;
    ui.intro.classList.add('on');
    clearTimeout(ui._introTO);
    ui._introTO=setTimeout(()=>{ ui.intro.classList.remove('on'); }, ms||2200);
  }
  function showToast(text, ms){
    ui.toast.textContent=text;
    ui.toast.classList.add('on');
    clearTimeout(ui._toastTO);
    ui._toastTO=setTimeout(()=>{ ui.toast.classList.remove('on'); }, ms||1200);
  }

  function showEndPanel(escaped, seconds, noisePct, bangs, scene, endingKind){
    ui.ui.classList.remove('scare');
    ui.endPanel.classList.add('on');
    ui.endTitle.textContent = escaped
      ? (endingKind==='kept' ? 'THE PROMISE KEPT' : (endingKind ? 'THE PROMISE BROKEN' : 'YOU GOT OUT'))
      : 'CAUGHT';
    ui.endTitle.className = escaped ? '' : 'bad';
    ui.endLine.textContent = escaped
      ? (endingKind==='kept'
          ? 'YOU WALK OUT WITH HER NAME. THE MALL LOSES ONE, AND GOES DARK FLOOR BY FLOOR.'
          : (endingKind
              ? 'THE DOORS OPEN. THE TOY DEPARTMENT LIGHT STAYS ON BEHIND YOU.'
              : 'THE DOORS OPEN. THE BUILDING REMAINS AWAKE.'))
      : 'THE MALL KEEPS YOU. IT ALWAYS KEEPS THE ONES WHO PROMISED.';
    ui.endTime.textContent = M.fmt(seconds);
    ui.endStat.textContent = 'NOISE '+Math.round(noisePct)+'%   DISTURBANCES '+bangs;
    ui.board.innerHTML='';
    if(escaped){
      const t=document.createElement('div'); t.className='bTitle'; t.textContent='BEST ESCAPES'; ui.board.appendChild(t);
      const list=document.createElement('div'); list.id='boardList'; ui.board.appendChild(list);
      const loading=document.createElement('div'); loading.className='boardRow'; loading.textContent='READING THE RECORD...'; list.appendChild(loading);
    }
    setTimeout(()=>{ document.getElementById('againBtn').focus({preventScroll:true}); }, 30);
  }

  async function submitAndBoard(seconds){
    const mb=MB();
    if(!mb || !mb.leaderboard){
      const list=document.getElementById('boardList');
      if(list){ list.innerHTML=''; const d=document.createElement('div'); d.className='boardRow'; d.textContent='NO RECORD SIGNAL.'; list.appendChild(d); }
      return;
    }
    try{
      await mb.leaderboard.submit('escape_time', Math.round(seconds*10)/10, { lower:true, label:'Best escape time' });
    }catch(e){}
    try{
      const rows = await mb.leaderboard.top('escape_time', { limit:3 });
      const list=document.getElementById('boardList');
      if(!list) return;
      list.innerHTML='';
      if(!rows || !rows.length){
        const d=document.createElement('div'); d.className='boardRow'; d.textContent='NO ONE ELSE HAS GOT OUT.'; list.appendChild(d);
        return;
      }
      rows.forEach(row=>{
        const r=document.createElement('div'); r.className='boardRow';
        const who=document.createElement(row.profile_url?'a':'span'); who.className='who';
        if(row.profile_url) who.href=row.profile_url;
        who.textContent=(row.rank?row.rank+'. ':'')+(row.username||'guest');
        const val=document.createElement('span'); val.className='val'; val.textContent=M.fmt(row.value);
        r.appendChild(who); r.appendChild(val); list.appendChild(r);
      });
    }catch(e){}
  }

  /* ---------- entry ---------- */
  function beginGame(){
    if(mode!=='title') return;
    currentChapter = 0;
    if(!gameReady){ pendingStart=true; return; }
    mode='transition';
    helpOpen=false; ui.helpPanel.classList.remove('on');
    ui.titleScreen.classList.add('gone');
    Audio.stopTitleHum();
    Audio.crtOff();
    Audio.startRoom();
    Audio.setRoomLevel(0,false);
    clearFx();
    const go=()=>{
      if(!game) return;
      if(gameScene) gameScene.scene.stop();
      try{ game.scene.stop('title'); }catch(e){}
      game.scene.start('mall');
    };
    if(titleScene){
      titleScene.cameras.main.fadeOut(260,0,0,0);
      titleScene.time.delayedCall(270, go);
    } else go();
  }

  function again(){
    if(mode!=='end') return;
    currentChapter = 0;
    mode='game';
    ui.endPanel.classList.remove('on');
    ui.glass.classList.remove('dead');
    ui.ui.classList.remove('scare');
    ui.tracking.classList.remove('on');
    if(gameScene){
      gameScene.scene.restart();
    }
  }

  function toTitle(){
    if(mode!=='end') return;
    mode='title';
    ui.endPanel.classList.remove('on');
    ui.glass.classList.remove('dead');
    ui.ui.classList.remove('scare');
    ui.tracking.classList.remove('on');
    ui.hud.classList.remove('on');
    ui.titleScreen.classList.remove('gone');
    Audio.setRoomLevel(0,false);
    Audio.startTitleHum();
    clearFx();
    runActive=false;
    if(game) game.scene.start('title');
  }

  /* ---------- help + sound ---------- */
  function openHelp(){
    helpOpen=true;
    ui.helpPanel.classList.add('on');
    if(mode==='game' && gameScene) gameScene.softPause(true);
    Audio.ui();
  }
  function closeHelp(){
    helpOpen=false;
    ui.helpPanel.classList.remove('on');
    if(mode==='game' && gameScene) gameScene.softPause(false);
    Audio.ui();
  }

  function setSound(on, fromPlatform){
    soundOn=!!on;
    Audio.setMuted(!soundOn);
    try{ localStorage.setItem('silent_mall_sound', soundOn?'1':'0'); }catch(e){}
    if(!fromPlatform){
      try{ MB()?.sound?.set?.(soundOn); }catch(e){}
    }
    ui.soundBtn.classList.toggle('muted', !soundOn);
    ui.soundBtn.setAttribute('aria-label', soundOn?'Mute sound':'Turn sound on');
    if(soundOn && mode==='title') Audio.startTitleHum();
  }

  function readSoundPref(){
    let on=true;
    try{ const v=localStorage.getItem('silent_mall_sound'); if(v==='0') on=false; }catch(e){}
    const mb=MB();
    try{ if(mb && mb.sound && typeof mb.sound.on==='boolean') on=mb.sound.on; }catch(e){}
    return on;
  }

  /* ---------- input ---------- */
  function keyName(e){
    const k=e.key;
    if(k===' ') return 'space';
    return k.toLowerCase();
  }

  function onKeyDown(e){
    if(e.metaKey || e.ctrlKey || e.altKey) return;
    const k=keyName(e);
    if(['arrowup','arrowdown','arrowleft','arrowright','space'].indexOf(k)>=0) e.preventDefault();
    if(k==='tab') return;

    if(helpOpen){
      if(k==='escape'){ closeHelp(); e.preventDefault(); }
      return;
    }
    if(ui.endPanel.classList.contains('on')){
      if(k==='enter'||k===' ') { again(); e.preventDefault(); }
      else if(k==='escape'||k==='t') { toTitle(); e.preventDefault(); }
      return;
    }
    if(mode==='title'){
      if(k==='escape') return;
      Audio.unlock();
      beginGame();
      return;
    }
    if(mode==='game'){
      if(gameScene && gameScene.paused){ gameScene.softPause(false); e.preventDefault(); return; }
      Input.keys.add(k);
      if(k==='shift') Input.keys.add('shift');
      if((k==='e'||k==='space') && !e.repeat){ if(gameScene) gameScene.doAction(); }
    }
  }

  function onKeyUp(e){
    const k=keyName(e);
    Input.keys.delete(k);
    if(k==='shift') Input.keys.delete('shift');
  }

  function clearKeys(){ Input.keys.clear(); }

  function wireControls(){
    // joystick
    const stick=$('#stick'), knob=$('#knob');
    let id=null, cx=0, cy=0, radius=40;
    const reset=()=>{
      id=null; Input.joy=false; Input.jx=0; Input.jy=0; Input.mag=0;
      knob.style.transform='translate(-50%,-50%)';
      stick.classList.remove('quiet');
    };
    const move=(e)=>{
      if(e.pointerId!==id) return;
      e.preventDefault();
      let dx=e.clientX-cx, dy=e.clientY-cy;
      const d=Math.hypot(dx,dy);
      if(d>radius){ dx=dx/d*radius; dy=dy/d*radius; }
      Input.mag=clamp(d/radius,0,1);
      Input.jx=Input.mag>0.08?dx/radius:0;
      Input.jy=Input.mag>0.08?dy/radius:0;
      knob.style.transform='translate(-50%,-50%) translate('+dx+'px,'+dy+'px)';
      stick.classList.toggle('quiet', Input.mag>0.08 && Input.mag<0.46);
    };
    stick.addEventListener('pointerdown', (e)=>{
      e.preventDefault(); e.stopPropagation();
      Audio.unlock();
      id=e.pointerId;
      const r=stick.getBoundingClientRect();
      cx=r.left+r.width/2; cy=r.top+r.height/2; radius=r.width*0.34;
      Input.joy=true; move(e);
      try{ stick.setPointerCapture(id); }catch(err){}
    });
    stick.addEventListener('pointermove', move);
    const up=(e)=>{ if(e.pointerId===id) reset(); };
    stick.addEventListener('pointerup', up);
    stick.addEventListener('pointercancel', up);
    stick.addEventListener('lostpointercapture', up);

    // action
    const act=$('#action');
    const press=(e)=>{
      e.preventDefault(); e.stopPropagation();
      Audio.unlock();
      act.classList.add('press');
      if(mode==='game' && gameScene){
        if(gameScene.paused) gameScene.softPause(false);
        else gameScene.doAction();
      }
    };
    const release=(e)=>{ act.classList.remove('press'); };
    act.addEventListener('pointerdown', press);
    act.addEventListener('pointerup', release);
    act.addEventListener('pointercancel', release);
    act.addEventListener('pointerleave', (e)=>{ if(e.buttons===0) release(e); });
    act.addEventListener('contextmenu', e=>e.preventDefault());

    // title start by pointer
    $('#stage').addEventListener('pointerdown', (e)=>{
      if(e.target.closest('.hwBtn,.cardLayer,#controls')) return;
      if(mode==='title'){ Audio.unlock(); beginGame(); }
      else if(mode==='game' && gameScene && gameScene.paused && !helpOpen){ gameScene.softPause(false); }
    });
    $('#glass').addEventListener('pointerdown', (e)=>{
      if(mode==='title' && !e.target.closest('.hwBtn,.cardLayer,#controls')){ Audio.unlock(); beginGame(); }
    }, true);
  }

  function wireUi(){
    $('#soundBtn').addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); setSound(!soundOn); Audio.ui(); });
    $('#helpBtn').addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); if(helpOpen) closeHelp(); else openHelp(); });
    $('#helpClose').addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); closeHelp(); });
    $('#loreBtn').addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); openEntityFiles(); });
    $('#loreClose').addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); $('#lorePanel').classList.remove('on'); });
    $('#againBtn').addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); again(); });
    $('#titleBtn').addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); toTitle(); });
    const hw=$('#soundBtn'); hw.addEventListener('pointerdown', e=>e.stopPropagation());
    $('#helpBtn').addEventListener('pointerdown', e=>e.stopPropagation());

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearKeys);
    document.addEventListener('visibilitychange', ()=>{
      if(document.hidden){
        if(mode==='game' && gameScene && !gameScene.ended && !helpOpen){
          pausedByVisibility=true;
          gameScene.softPause(true);
          showIntro('PAUSED. PRESS ANY KEY.', 999999);
        }
        clearKeys();
      }
    });
  }

  /* ---------- grain ---------- */
  function makeGrain(){
    const c=M.cvs(48,48), ctx=c.getContext('2d'), img=ctx.createImageData(48,48), d=img.data;
    for(let i=0;i<48*48;i++){
      const v=Math.random()*255;
      d[i*4]=v; d[i*4+1]=v; d[i*4+2]=v; d[i*4+3]=Math.random()<0.5?80:0;
    }
    ctx.putImageData(img,0,0);
    document.documentElement.style.setProperty('--grain', 'url('+c.toDataURL()+')');
  }

  /* ---------- tune ---------- */
  function applyTune(v){
    if(!v) return;
    if(typeof v.walk_speed==='number') TUNE.walk=v.walk_speed;
    if(typeof v.sneak_speed==='number') TUNE.sneak=v.sneak_speed;
    if(typeof v.hunter_speed==='number') TUNE.hunterStep=v.hunter_speed;
    if(typeof v.noise_fill==='number') TUNE.noiseFill=v.noise_fill;
    if(typeof v.noise_decay==='number') TUNE.noiseDecay=v.noise_decay;
    if(typeof v.light_linger==='number') TUNE.lightLinger=v.light_linger;
    if(typeof v.bloom==='number') TUNE.bloom=v.bloom;
    if(typeof v.scanlines==='number'){ TUNE.scan=0.1+(1-v.scanlines)*0.9; }
    if(ui.scanlines) ui.scanlines.style.opacity=String(TUNE.scan);
    if(gameScene && gameScene.cameras && gameScene.cameras.main.postFX){
      // bloom strength is baked into the pipeline; leave it unless restarted
    }
  }
  function loadTune(){
    const mb=MB();
    if(mb && mb.tune){
      try{
        mb.tune().then(v=>applyTune(v)).catch(()=>{});
        mb.tune.on && mb.tune.on(v=>applyTune(v));
      }catch(e){}
      return;
    }
    fetch('tune.json').then(r=>r.json()).then(f=>{
      const v={};
      for(const k in f){ if(f[k] && typeof f[k].value!=='undefined') v[k]=f[k].value; }
      applyTune(v);
    }).catch(()=>{});
  }

  /* ---------- sizing ---------- */
  function resize(){
    const stage=$('#stage'), glass=$('#glass');
    if(!stage||!glass) return;
    const u=stage.clientWidth / VW;
    glass.style.setProperty('--u', String(u>0?u:1));
  }

  /* ---------- boot ---------- */
  function startPhaser(){
    if(typeof Phaser==='undefined'){
      const t=document.getElementById('titleScreen');
      if(t){ t.querySelector('.sub').textContent='SIGNAL LOST. RELOAD THE CABINET.'; }
      return;
    }
    const cfg={
      type: Phaser.AUTO,
      parent:'game',
      width:VW, height:VH,
      backgroundColor:'#03050a',
      pixelArt:true,
      roundPixels:true,
      antialias:false,
      disableContextMenu:true,
      scale:{ mode:Phaser.Scale.FIT, autoCenter:Phaser.Scale.CENTER_BOTH },
      physics:{ default:'arcade', arcade:{ gravity:{y:0}, debug:false } },
      scene:[BootScene, TitleScene, GameScene]
    };
    try{ game=new Phaser.Game(cfg); window.__game=game; }
    catch(e){ console.error(e); const t=document.getElementById('titleScreen'); if(t) t.querySelector('.sub').textContent='SIGNAL LOST. RELOAD THE CABINET.'; }
  }

  function boot(){
    ui.hud=$('#hud'); ui.noiseWord=$('#noiseWord'); ui.compass=$('#compassArrow'); ui.dist=$('#dist');
    ui.keyTag=$('#keyTag'); ui.prompt=$('#prompt'); ui.legend=$('#legend'); ui.toast=$('#toast');
    ui.intro=$('#introLine'); ui.titleScreen=$('#titleScreen'); ui.endPanel=$('#endPanel');
    ui.endTitle=$('#endTitle'); ui.endLine=$('#endLine'); ui.endTime=$('#endTime'); ui.endStat=$('#endStat');
    ui.board=$('#board'); ui.helpPanel=$('#helpPanel'); ui.flash=$('#flash'); ui.dread=$('#dread');
    ui.chroma=$('#chroma'); ui.glass=$('#glass'); ui.scanlines=$('#scanlines'); ui.tracking=$('#tracking');
    ui.soundBtn=$('#soundBtn'); ui.ui=$('#ui'); ui.stage=$('#stage');

    ui.segs=[];
    const bar=$('#noiseBar');
    for(let i=0;i<12;i++){ const s=document.createElement('div'); s.className='seg'; bar.appendChild(s); ui.segs.push(s); }

    touch = (location.search.indexOf('touch=1')>=0) ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
      (navigator.maxTouchPoints||0)>0;
    if(touch) document.body.classList.add('touch');
    // narrow screens with no touch still get a usable page; touch controls stay for coarse pointers.

    makeGrain();
    wireControls();
    wireUi();
    setSound(readSoundPref(), true);
    try{ if(MB()?.sound?.onchange) MB().sound.onchange(v=>setSound(!!v, true)); }catch(e){}

    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', ()=>setTimeout(resize,120));
    if(window.ResizeObserver){ new ResizeObserver(resize).observe($('#stage')); }
    resize();

    // let the pixel fonts load before the first title paint where possible
    const fonts = (document.fonts && document.fonts.load)
      ? Promise.all([document.fonts.load('700 32px Silkscreen'), document.fonts.load('400 16px VT323')])
      : Promise.resolve();
    Promise.race([fonts.catch(()=>{}), new Promise(r=>setTimeout(r,1200))]).then(()=>{
      resize();
      startPhaser();
      loadTune();
    });

    if(mode==='boot') mode='title';
    Audio.setMuted(!soundOn);
    // first real gesture unlocks audio
    const unlock=()=>{ Audio.unlock(); if(mode==='title' && soundOn) Audio.startTitleHum(); };
    window.addEventListener('pointerdown', unlock, { once:true });
    window.addEventListener('keydown', unlock, { once:true });

    const mb=MB();
    try{
      mb?.measure?.([
        { name:'escaped', kind:'step', label:'Escaped the mall' },
        { name:'caught', kind:'step', label:'Caught by the mannequin' },
        { name:'escape_time', kind:'value', label:'Escape time' },
        { name:'bangs', kind:'count', label:'Disturbances' }
      ]);
    }catch(e){}
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
