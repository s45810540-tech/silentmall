/* SILENT MALL — narrative layer.
   Prologue, seven chapter cinematics, memory fragments and two endings.
   Every sequence is rendered as animated in-browser shots (no video). */
(function(){
'use strict';
const S = window.STORY = window.STORY || {};

/* ------------------------------------------------------------------
   SILHOUETTE + PROP PRIMITIVES
   ------------------------------------------------------------------ */
const BODY = 'M12 1.4c2.9 0 5.3 2.4 5.3 5.3 0 2.4-1 3.8-2.2 4.9l1.6 2.4c2.6 1.9 4.4 5.3 4.4 11V63H2.9V25c0-5.7 1.8-9.1 4.4-11l1.6-2.4c-1.2-1.1-2.2-2.5-2.2-4.9 0-2.9 2.4-5.3 5.3-5.3z';

function fig(x,y,s,delay,cls){
  return '<div class="figWrap '+(cls||'')+'" aria-hidden="true" style="left:'+x+'%;bottom:'+y+'%;--s:'+s+';animation-delay:'+(delay||0)+'ms">'+
         '<i class="figGlow"></i>'+
         '<svg class="fig" viewBox="0 0 24 64"><path d="'+BODY+'" fill="currentColor"/></svg></div>';
}
function child(x,y,s,delay){
  return '<div class="figWrap isChild" aria-hidden="true" style="left:'+x+'%;bottom:'+y+'%;--s:'+s+';animation-delay:'+(delay||0)+'ms">'+
         '<i class="figGlow"></i>'+
         '<svg class="fig" viewBox="0 0 24 64"><path d="'+BODY+'" fill="currentColor"/><circle class="band" cx="19.4" cy="33" r="1.9"/></svg></div>';
}
function slats(n){ let h=''; for(let i=0;i<n;i++) h+='<i class="slat" style="top:'+(i*(100/n)).toFixed(2)+'%;animation-delay:'+(i*40)+'ms"></i>'; return h; }
function lines(n,cls){ let h=''; for(let i=0;i<n;i++) h+='<i class="'+(cls||'line')+'" style="top:'+(8+i*(84/n)).toFixed(2)+'%;width:'+(46+((i*37)%46))+'%;animation-delay:'+(140+i*90)+'ms"></i>'; return h; }
function boxes(n){ let h=''; for(let i=0;i<n;i++) h+='<i class="box" style="left:'+(4+(i%4)*24)+'%;bottom:'+(6+Math.floor(i/4)*26)+'%;animation-delay:'+(i*70)+'ms"></i>'; return h; }
function seats(n){ let h=''; for(let i=0;i<n;i++) h+='<i class="seat" style="left:'+(2+(i%7)*14)+'%;bottom:'+(4+Math.floor(i/7)*9)+'%;animation-delay:'+(i*45)+'ms"></i>'; return h; }
function steps(n){ let h=''; for(let i=0;i<n;i++) h+='<i class="step" style="bottom:'+(i*(62/n)).toFixed(2)+'%;left:'+(6+i*3.4)+'%;animation-delay:'+(i*55)+'ms"></i>'; return h; }
function dust(n){ let h=''; for(let i=0;i<n;i++) h+='<i class="mote" style="left:'+(6+((i*29)%88))+'%;top:'+(10+((i*41)%70))+'%;animation-delay:'+(i*180)+'ms"></i>'; return h; }
function toys(n){ let h=''; for(let i=0;i<n;i++) h+='<i class="toy" style="left:'+(6+(i%6)*15)+'%;bottom:'+(10+Math.floor(i/6)*22)+'%;animation-delay:'+(i*90)+'ms"></i>'; return h; }

/* ------------------------------------------------------------------
   SHOT ART
   ------------------------------------------------------------------ */
function artHTML(shot){
  const a = shot.art;
  const base = '<div class="sky"></div><div class="fog"></div>';
  switch(a){
    case 'atrium':
      return base+
        '<div class="floor"></div><div class="lines">'+lines(7)+'</div>'+
        '<div class="sign" style="left:12%;top:22%"></div><div class="sign" style="right:14%;top:26%"></div>'+
        '<div class="beam" style="left:44%"></div>'+
        fig(47,26,.9,300)+
        '<div class="hazeStrong"></div>';
    case 'crowd':
      return base+
        '<div class="floor"></div>'+
        fig(6,12,1.15,0,'back')+fig(16,10,1.3,120,'back')+fig(26,14,1.05,240,'back')+
        fig(36,11,1.2,80,'back')+fig(58,13,1.1,180,'back')+fig(69,10,1.35,300,'back')+
        fig(80,14,1.2,60,'back')+fig(90,11,1.05,220,'back')+
        '<div class="shake"></div>';
    case 'hands':
      return base+
        '<div class="hand left"></div><div class="hand right"></div>'+
        '<div class="gap"></div><div class="hazeStrong"></div>';
    case 'shutter':
      return base+
        '<div class="floor"></div>'+
        '<div class="shutter"><i class="gap"></i>'+slats(9)+'</div>'+
        '<div class="shutterGlow"></div>'+
        child(30,14,1.05,700);
    case 'plaque':
      return base+
        '<div class="wall"></div>'+
        '<div class="plaque"><b>IN MEMORY</b><span>FORTY-ONE</span><small>THEY DID NOT LEAVE</small></div>'+
        '<div class="plaqueGlow"></div>';
    case 'child':
      return base+
        '<div class="floor"></div><div class="pool"></div>'+
        child(48,20,1.5,200)+
        '<div class="hazeStrong"></div>';
    case 'corridor':
      return base+
        '<div class="corridor"><i class="wallL"></i><i class="wallR"></i><i class="ceil"></i><i class="flr"></i></div>'+
        '<i class="tube" style="left:30%;top:24%;animation-delay:300ms"></i>'+
        '<i class="tube" style="left:52%;top:32%;animation-delay:900ms"></i>'+
        fig(58,34,.55,600,'far')+
        '<div class="fogHeavy"></div>';
    case 'lift':
      return base+
        '<div class="lift"><i class="doorL"></i><i class="doorR"></i><i class="liftLight"></i></div>'+
        '<div class="floor"></div><div class="hazeStrong"></div>';
    case 'log':
      return base+
        '<div class="paper">'+lines(6)+'<i class="line tiny" style="top:88%;width:34%"></i></div>'+
        '<div class="paperGlow"></div>';
    case 'toys':
      return base+
        '<div class="floor"></div><div class="shelfRow" style="top:26%"></div><div class="shelfRow" style="top:52%"></div>'+
        toys(12)+'<div class="pool"></div>'+child(62,16,1.15,500);
    case 'cameras':
      return base+
        '<div class="crtGrid"><i></i><i></i><i></i><i></i><i></i><i></i></div>'+
        '<div class="rec">● REC 04</div>'+child(72,30,.8,600);
    case 'shelves':
      return base+
        '<div class="floor"></div>'+
        '<div class="shelfRow" style="top:20%"></div><div class="shelfRow" style="top:44%"></div><div class="shelfRow" style="top:68%"></div>'+
        boxes(12);
    case 'boxes':
      return base+
        '<div class="floor"></div><div class="shelfRow" style="top:34%"></div>'+
        '<i class="box labelled" style="left:26%;bottom:22%"></i><i class="box labelled" style="left:56%;bottom:22%"></i>'+
        '<div class="paperGlow"></div>';
    case 'cinema':
      return base+
        '<div class="screenWall"></div><div class="floor"></div>'+seats(21)+
        '<div class="screenGlow"></div>';
    case 'beam':
      return base+
        '<div class="beam wide" style="left:18%"></div>'+dust(14)+
        '<div class="projector"></div>';
    case 'screen':
      return base+
        '<div class="screenFrame">'+child(46,18,1.2,300)+'<i class="scanBar"></i></div>'+
        '<div class="screenGlow"></div>';
    case 'office':
      return base+
        '<div class="wall"></div><div class="desk"></div>'+
        '<div class="lamp"></div><div class="nameplate">M. VALE</div>'+
        '<div class="paper" style="right:12%;bottom:26%;width:26%">'+lines(4)+'</div>';
    case 'doors':
      return base+
        '<div class="double"><i class="dL"></i><i class="dR"></i><i class="exitGlow"></i></div>'+
        '<div class="floor"></div>';
    case 'stairs':
      return base+steps(9)+'<div class="rail"></div><div class="fogHeavy"></div>';
    case 'roof':
      return base+
        '<div class="city"></div><div class="rail"></div><div class="roofFloor"></div>'+
        (shot.two ? (child(44,18,1.1,200)+fig(52,18,1.15,340)) : fig(48,18,1.15,200))+
        '<div class="dawnGlow"></div>';
    case 'wristband':
      return base+
        '<div class="bandClose"><b>ANYA</b><span>AGE 7</span><small>TOMORROW</small></div>'+
        '<div class="bandGlow"></div>';
    default:
      return base+'<div class="floor"></div>'+fig(50,20,1.1,200);
  }
}

/* ------------------------------------------------------------------
   NARRATIVE CONTENT
   ------------------------------------------------------------------ */
const PROLOGUE = [
  { art:'atrium', mood:'cold', hold:4200,
    cap:'11:47 PM. THE SHUTTERS COME DOWN ON THE SEVENTH ANNIVERSARY. TONIGHT, FOR THE FIRST TIME, THE MALL LETS YOU IN.' },
  { art:'crowd', mood:'amber', hold:4200,
    cap:'SEVEN YEARS AGO THE FIRE ALARM WENT OFF AND THE ATRIUM BECAME A RIVER OF PEOPLE.' },
  { art:'hands', mood:'red', hold:4600,
    cap:'YOU WERE NINETEEN. YOUR MOTHER WAS DYING IN A HOSPITAL BED ACROSS TOWN. THERE WAS NOBODY ELSE TO LEAVE HER WITH.' },
  { art:'shutter', mood:'red', hold:4800,
    cap:'HER HAND SLIPPED OUT OF YOURS IN THE PUSH. YOU SAID: “WAIT BY THE TOYS. I WILL COME BACK.” THEN THE SHUTTER CLOSED.' },
  { art:'plaque', mood:'cold', hold:4400,
    cap:'FORTY-ONE NAMES. A GAS LEAK, THEY SAID. A DATE ON A PLAQUE IN THE WEST WING THAT NOBODY READS.' },
  { art:'child', mood:'green', hold:4800,
    cap:'SOMEWHERE PAST THE DARK, A SMALL VOICE IS STILL WAITING EXACTLY WHERE YOU LEFT IT.' }
];

const CHAPTER_INTROS = [
  [
    { art:'corridor', mood:'cold', hold:4000, cap:'YOU ARE THE LAST ONE ON THE ROTA. THE STAFF DOOR CLOSES BEHIND YOU AND THE BOLT DOES NOT ANSWER.' },
    { art:'atrium', mood:'cold', hold:4000, cap:'SOMETHING WALKS THE ATRIUM ON A ROUTINE. IT STOPS WHEN YOU STOP. IT IS LISTENING FOR HER FOOTSTEPS IN YOURS.' },
    { art:'plaque', mood:'green', hold:4200, cap:'HE WAS THE GUARD WHO PULLED YOU OUT THROUGH THE SHUTTER. HE WENT BACK IN FOR SOMEONE ELSE AND NEVER CAME OUT.' }
  ],
  [
    { art:'lift', mood:'amber', hold:4000, cap:'THE SERVICE LIFT ONLY GOES DOWN. THE FLOOR IT OPENS ON IS NOT PRINTED ON ANY DIRECTORY.' },
    { art:'corridor', mood:'amber', hold:4200, cap:'ELIAS VALE WAS ORDERED TO KEEP THIS CORRIDOR CLEAR. HE SENT FORTY-ONE PEOPLE THE OTHER WAY AND THANKED THEM FOR COMPLYING.' },
    { art:'log', mood:'amber', hold:4400, cap:'HIS LOG ENDS MID-SENTENCE. HE IS STILL DIRECTING TRAFFIC TOWARD A DOOR THAT HAS NO OTHER SIDE.' }
  ],
  [
    { art:'toys', mood:'cold', hold:4000, cap:'THE TOY DEPARTMENT STILL SMELLS OF NEW PLASTIC. NOTHING IN HERE HAS AGED. NOT EVEN HER.' },
    { art:'child', mood:'green', hold:4600, cap:'SHE IS STANDING WHERE YOU TOLD HER TO STAND. THE PAPER WRISTBAND ON HER WRIST IS DATED TOMORROW.' },
    { art:'cameras', mood:'cold', hold:4200, cap:'THE CAMERAS RECORD HER IN ROOMS SHE CANNOT REACH. SHE HAS LEARNED TO LIVE IN THE GAP BETWEEN FRAMES.' }
  ],
  [
    { art:'shelves', mood:'cold', hold:4200, cap:'EVERYTHING UNCLAIMED COMES DOWN HERE. UMBRELLAS. PHONES. WEDDING RINGS. CHILDREN.' },
    { art:'boxes', mood:'amber', hold:4400, cap:'EVERY BOX HAS A NAME AND A DATE. THERE IS A BOX FOR YOU. IT WAS LABELLED SEVEN YEARS AGO, IN ADVANCE.' },
    { art:'corridor', mood:'cold', hold:4200, cap:'SHE DOES NOT HATE YOU. SHE FILED YOU. THAT IS WORSE.' }
  ],
  [
    { art:'cinema', mood:'red', hold:4200, cap:'THE CINEMA WAS SEALED WITH THE AUDIENCE STILL INSIDE. THE PROJECTOR NEVER STOPPED RUNNING.' },
    { art:'beam', mood:'amber', hold:4200, cap:'HE PLAYS THE EVACUATION EVERY NIGHT, BECAUSE IF THE FILM KEEPS RUNNING THEN THE NIGHT HAS NOT ENDED.' },
    { art:'screen', mood:'red', hold:4800, cap:'TONIGHT HE PUTS YOUR MEMORY ON THE SCREEN: A NINETEEN-YEAR-OLD LETTING GO OF A SMALL HAND AND CALLING IT AN ACCIDENT.' }
  ],
  [
    { art:'office', mood:'red', hold:4400, cap:'MR. VALE SIGNED THE CLOSURE ORDER AT 11:52 PM, BEFORE THE LAST PERSON WAS OUT, AND BRICKED THE ONLY EXIT THAT STILL OPENED.' },
    { art:'doors', mood:'red', hold:4400, cap:'HE BELIEVED A MALL MUST STAY FULL, LIT AND OPEN FOREVER. HE GOT HIS WISH. HE JUST NEVER LEFT.' },
    { art:'corridor', mood:'red', hold:4200, cap:'HE DOES NOT CHASE YOU. HE SCHEDULES YOU. YOU ARE ON THE ROTA NOW, AND THE SHIFT DOES NOT END.' }
  ],
  [
    { art:'stairs', mood:'cold', hold:4200, cap:'THE SERVICE STAIRS GO UP ONE FLOOR MORE THAN THE BUILDING HAS. THE MALL DOES NOT WANT YOU TO SEE MORNING.' },
    { art:'roof', mood:'dawn', hold:4600, cap:'5:41 AM. THE SKY IS THE COLOUR OF A BRUISE HEALING. THE ROOF HATCH OPENS BOTH WAYS.' },
    { art:'wristband', mood:'dawn', hold:4800, cap:'HER WRISTBAND IS IN YOUR POCKET. YOU CAN WALK INTO THE LIGHT ALONE, OR YOU CAN GIVE HER NAME BACK TO HER.' }
  ]
];

const INTERLUDES = [
  [
    { art:'corridor', mood:'cold', hold:3400, cap:'THE KEYCARD IS WARM. SOMEONE CARRIED IT UNTIL THE VERY END.' },
    { art:'log', mood:'green', hold:3800, cap:'SCRATCHED ON THE BACK WITH A NAIL: “DO NOT LET THEM CLOSE IT AGAIN.”' }
  ],
  [
    { art:'lift', mood:'amber', hold:3400, cap:'THE LIFT STILL SMELLS OF WET CONCRETE AND OLD CIGARETTES.' },
    { art:'log', mood:'amber', hold:3800, cap:'“11:58. TOLD THEM THE EXIT WAS THE OTHER WAY. THEY THANKED ME.”' }
  ],
  [
    { art:'wristband', mood:'green', hold:3800, cap:'“ANYA. AGE 7.” THE DATE ON THE BAND IS TOMORROW.' },
    { art:'child', mood:'green', hold:3800, cap:'SHE HAS BEEN SEVEN FOR SEVEN YEARS.' }
  ],
  [
    { art:'boxes', mood:'cold', hold:3800, cap:'BOX 41. UNCLAIMED. CONTENTS: ONE SMALL SHOE. ONE PAPER WRISTBAND.' },
    { art:'shelves', mood:'amber', hold:3800, cap:'YOUR NAME IS ON THE NEXT SHELF. THE DATE ON IT IS TONIGHT.' }
  ],
  [
    { art:'beam', mood:'amber', hold:3600, cap:'THE REEL HAS NO END. IT HAS BEEN TURNING SINCE THE ALARMS STOPPED.' },
    { art:'screen', mood:'red', hold:4000, cap:'ON THE SCREEN A GIRL WAVES AT SOMEONE WHO IS ALREADY RUNNING AWAY.' }
  ],
  [
    { art:'office', mood:'red', hold:3800, cap:'THE CLOSURE ORDER IS STILL ON THE DESK. SIGNED BEFORE THE LAST PERSON WAS OUT.' },
    { art:'log', mood:'red', hold:4000, cap:'IN THE MARGIN, IN SMALLER HANDWRITING: “IT WILL BE QUIET TOMORROW. I CANNOT.”' }
  ],
  [
    { art:'stairs', mood:'cold', hold:3800, cap:'THE STAIRS GO UP ONE MORE FLOOR THAN THE BUILDING HAS.' },
    { art:'roof', mood:'dawn', hold:4000, cap:'5:41 AM. COLD AIR. THE CITY IS WAKING UP WITHOUT YOU.' }
  ]
];

const ENDINGS = {
  kept: [
    { art:'roof', mood:'dawn', hold:4400, cap:'YOU SAY HER NAME OUT LOUD. IT IS THE FIRST TIME IN SEVEN YEARS THAT ANYONE HAS.' },
    { art:'child', mood:'dawn', hold:4600, cap:'“YOU CAME BACK.” SHE SAYS IT LIKE A FACT. LIKE SHE NEVER ONCE DOUBTED IT.' },
    { art:'wristband', mood:'dawn', hold:4400, cap:'YOU TAKE THE BAND OFF HER WRIST. THE PLASTIC HAS GONE SOFT AS SKIN.' },
    { art:'roof', mood:'dawn', two:true, hold:4800, cap:'THE MALL GOES DARK BEHIND YOU, FLOOR BY FLOOR, LIKE SOMEONE FINALLY TURNING OFF THE LIGHTS.' },
    { art:'plaque', mood:'dawn', hold:4800, cap:'THE PLAQUE IN THE WEST WING GETS A SECOND DATE: THE DAY SOMEONE CAME BACK.' }
  ],
  hollow: [
    { art:'roof', mood:'dawn', hold:4600, cap:'THE HATCH OPENS. COLD AIR. THE CITY IS WAKING UP AND DOES NOT KNOW YOUR NAME.' },
    { art:'atrium', mood:'cold', hold:4600, cap:'BEHIND YOU THE TOY DEPARTMENT LIGHT STAYS ON. IT WILL STAY ON TOMORROW. AND THE NIGHT AFTER.' },
    { art:'child', mood:'green', hold:5000, cap:'SHE KEEPS WAITING. YOU KEEP WALKING. THAT IS HOW THE MALL KEEPS YOU.' }
  ]
};

/* ------------------------------------------------------------------
   PLAYER
   ------------------------------------------------------------------ */
let root=null, stageEl=null, capEl=null, metaEl=null, countEl=null, barEl=null, choiceEl=null;
let busy=false, list=null, at=0, advTimer=null, typeTimer=null, doneCb=null, keyHandler=null;

function ensureRoot(){
  if(root && document.body.contains(root)) return root;
  root = document.createElement('div');
  root.id = 'storyCinema';
  root.setAttribute('aria-hidden','true');
  root.innerHTML =
    '<div class="sc-bars top"></div><div class="sc-bars bottom"></div>'+
    '<div class="sc-shot"></div>'+
    '<div class="sc-grain"></div>'+
    '<div class="sc-top"><span class="sc-meta"></span><span class="sc-count"></span></div>'+
    '<div class="sc-cap"></div>'+
    '<div class="sc-bar"><i></i></div>'+
    '<div class="sc-choice"></div>'+
    '<button class="sc-skip" type="button">SKIP ▸</button>';
  const stage = document.getElementById('stage') || document.body;
  stage.appendChild(root);
  stageEl = root.querySelector('.sc-shot');
  capEl = root.querySelector('.sc-cap');
  metaEl = root.querySelector('.sc-meta');
  countEl = root.querySelector('.sc-count');
  barEl = root.querySelector('.sc-bar i');
  choiceEl = root.querySelector('.sc-choice');
  root.querySelector('.sc-skip').addEventListener('click', (e)=>{ e.stopPropagation(); finish(); });
  root.addEventListener('click', ()=>{ if(!choiceEl.classList.contains('on')) advance(); });
  return root;
}

function clearTimers(){
  if(advTimer){ clearTimeout(advTimer); advTimer=null; }
  if(typeTimer){ clearInterval(typeTimer); typeTimer=null; }
}

function typeCap(text, ms){
  if(typeTimer){ clearInterval(typeTimer); typeTimer=null; }
  capEl.textContent = '';
  capEl.classList.remove('typed');
  let i=0;
  const step = Math.max(9, Math.min(26, Math.round((ms||2600)/Math.max(1,text.length))));
  typeTimer = setInterval(()=>{
    i++;
    capEl.textContent = text.slice(0,i);
    if(i>=text.length){ clearInterval(typeTimer); typeTimer=null; capEl.classList.add('typed'); }
  }, step);
}

function showShot(){
  const shot = list[at] || {};
  const total = list.length;
  clearTimers();
  stageEl.innerHTML = artHTML(shot);
  stageEl.dataset.art = shot.art || '';
  stageEl.dataset.mood = shot.mood || 'cold';
  // restart the CSS animations for the new shot
  void stageEl.offsetWidth;
  stageEl.classList.remove('in'); void stageEl.offsetWidth; stageEl.classList.add('in');
  countEl.textContent = String(at+1).padStart(2,'0')+' / '+String(total).padStart(2,'0');
  barEl.style.transform = 'scaleX('+((at+1)/total).toFixed(3)+')';
  const hold = shot.hold || 3800;
  typeCap(shot.cap || '', hold*0.72);
  advTimer = setTimeout(()=>{ advance(); }, hold);
}

function advance(){
  if(!busy) return;
  // if the caption is still typing, complete it first
  if(typeTimer){ clearInterval(typeTimer); typeTimer=null; capEl.textContent = (list[at]&&list[at].cap)||''; capEl.classList.add('typed'); return; }
  if(at < list.length-1){ at++; showShot(); }
  else finish();
}

function finish(){
  if(!busy) return;
  busy = false;
  clearTimers();
  if(root){ root.classList.remove('on'); root.setAttribute('aria-hidden','true'); }
  if(keyHandler){ document.removeEventListener('keydown', keyHandler, true); keyHandler=null; }
  document.body.classList.remove('storyLock');
  const cb = doneCb; doneCb = null;
  list = null;
  if(cb){ try{ cb(); }catch(e){ console.error(e); } }
}

function play(shots, opts){
  opts = opts || {};
  ensureRoot();
  if(busy){ // never stack sequences
    if(opts.onDone) opts.onDone();
    return;
  }
  if(!shots || !shots.length){ if(opts.onDone) opts.onDone(); return; }
  busy = true;
  list = shots; at = 0; doneCb = opts.onDone || null;
  metaEl.textContent = opts.meta || '';
  choiceEl.classList.remove('on'); choiceEl.innerHTML='';
  root.classList.add('on');
  root.setAttribute('aria-hidden','false');
  document.body.classList.add('storyLock');
  keyHandler = (e)=>{
    if(e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); finish(); return; }
    if(e.key===' '||e.key==='Enter'||e.key==='e'||e.key==='E'||e.key==='ArrowRight'){
      e.preventDefault(); e.stopPropagation();
      if(choiceEl.classList.contains('on')) return;
      advance();
    }
  };
  document.addEventListener('keydown', keyHandler, true);
  showShot();
}

/* ------------------------------------------------------------------
   PUBLIC API
   ------------------------------------------------------------------ */
S.busy = ()=>busy;
S.shotsFor = (i)=>CHAPTER_INTROS[i] || [];

S.prologue = function(cb){ play(PROLOGUE, { meta:'PROLOGUE — SEVEN YEARS AGO', onDone:cb }); };
S.chapterIntro = function(i, cb){
  const shots = CHAPTER_INTROS[i] || CHAPTER_INTROS[CHAPTER_INTROS.length-1];
  play(shots, { meta:'CHAPTER '+String(i+1).padStart(2,'0')+' / '+String(CHAPTER_INTROS.length).padStart(2,'0'), onDone:cb });
};
S.interlude = function(i, cb){
  const shots = INTERLUDES[i] || [];
  play(shots, { meta:'MEMORY FRAGMENT', onDone:cb });
};
S.ending = function(kind, cb){
  play(ENDINGS[kind] || ENDINGS.hollow, { meta: kind==='kept' ? 'ENDING — THE PROMISE KEPT' : 'ENDING — THE PROMISE BROKEN', onDone:cb });
};

/* Two-way door on the roof: the player chooses what to carry out. */
S.finalChoice = function(cb){
  ensureRoot();
  root.classList.add('on');
  root.setAttribute('aria-hidden','false');
  document.body.classList.add('storyLock');
  metaEl.textContent = '5:41 AM — THE ROOF HATCH';
  countEl.textContent = '';
  barEl.style.transform = 'scaleX(1)';
  stageEl.dataset.art = 'roof'; stageEl.dataset.mood = 'dawn';
  stageEl.innerHTML = artHTML({ art:'roof', mood:'dawn', two:false });
  capEl.textContent = 'THE HATCH IS OPEN. THE MORNING DOES NOT CARE WHICH OF YOU WALKS OUT.';
  capEl.classList.add('typed');
  choiceEl.innerHTML =
    '<button class="sc-opt keep" type="button"><b>TAKE HER HAND</b><span>Carry her name into the light. Risk everything you came here with.</span></button>'+
    '<button class="sc-opt leave" type="button"><b>WALK OUT ALONE</b><span>Get out alive. Leave the toy department light on behind you.</span></button>';
  choiceEl.classList.add('on');
  const pick = (kind)=>{
    choiceEl.classList.remove('on');
    choiceEl.innerHTML = '';
    root.classList.remove('on');
    document.body.classList.remove('storyLock');
    cb(kind);
  };
  choiceEl.querySelector('.keep').addEventListener('click',(e)=>{ e.stopPropagation(); pick('kept'); });
  choiceEl.querySelector('.leave').addEventListener('click',(e)=>{ e.stopPropagation(); pick('hollow'); });
};

})();
