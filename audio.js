'use strict';
/* SILENT MALL: synthesized audio. Asset generation was unavailable, so every
   sound here is built from noise, filters and simple oscillators. */
(function(){
  const M = window.MALL = window.MALL || {};

  const A = {
    ctx:null, master:null, comp:null, noiseBuf:null, brownBuf:null,
    on:true, ready:false, titleSrc:null, titleGain:null, titleNodes:null,
    roomGain:null, roomSrc:null, humGain:null, roomActive:false,
    lastHeart:0, mutedByPlatform:false,

    ensure(){
      if(this.ctx){
        if(this.ctx.state === 'suspended') this.ctx.resume().catch(()=>{});
        return this.ready;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return false;
      let ctx;
      try { ctx = new AC(); } catch(e){ return false; }
      this.ctx = ctx;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.knee.value = 20;
      comp.ratio.value = 7;
      comp.attack.value = 0.004;
      comp.release.value = 0.22;
      const master = ctx.createGain();
      master.gain.value = this.on ? 0.62 : 0.0001;
      comp.connect(master);
      master.connect(ctx.destination);
      this.comp = comp;
      this.master = master;

      const len = Math.floor(ctx.sampleRate * 2.2);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for(let i=0;i<len;i++) d[i] = Math.random()*2-1;
      this.noiseBuf = buf;

      const bbuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const bd = bbuf.getChannelData(0);
      let last = 0;
      for(let i=0;i<len;i++){
        last = (last + 0.02*(Math.random()*2-1)) / 1.02;
        bd[i] = last * 3.2;
      }
      this.brownBuf = bbuf;
      this.ready = true;
      if(ctx.state === 'suspended') ctx.resume().catch(()=>{});
      return true;
    },

    now(){ return this.ctx ? this.ctx.currentTime : 0; },

    unlock(){
      const ok = this.ensure();
      if(ok && this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(()=>{});
      return ok;
    },

    setMuted(m){
      this.on = !!m;
      if(this.master) this.master.gain.setTargetAtTime(this.on?0.62:0.0001, this.now(), 0.03);
    },

    tone(freq, dur, opt){
      if(!this.ready || !this.on) return;
      const o = opt || {};
      const ctx = this.ctx, t = ctx.currentTime + (o.when||0);
      const osc = ctx.createOscillator();
      osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(Math.max(20, freq), t);
      if(o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + dur);
      const g = ctx.createGain();
      const peak = Math.max(0.0002, o.gain==null?0.08:o.gain);
      const atk = o.attack==null?0.005:o.attack;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + Math.max(0.002, atk));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      let dest = this.comp;
      if(o.filter){
        const f = ctx.createBiquadFilter();
        f.type = o.filter;
        f.frequency.value = o.freq || 800;
        f.Q.value = o.q || 1;
        osc.connect(f); f.connect(g);
      } else {
        osc.connect(g);
      }
      g.connect(dest);
      osc.start(t); osc.stop(t + dur + 0.03);
    },

    noise(dur, opt){
      if(!this.ready || !this.on) return;
      const o = opt || {};
      const ctx = this.ctx, t = ctx.currentTime + (o.when||0);
      const src = ctx.createBufferSource();
      src.buffer = o.brown ? this.brownBuf : this.noiseBuf;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = o.filter || 'bandpass';
      f.frequency.setValueAtTime(Math.max(30, o.freq || 1200), t);
      if(o.slide) f.frequency.exponentialRampToValueAtTime(Math.max(30, o.slide), t + dur);
      f.Q.value = o.q == null ? 1 : o.q;
      const g = ctx.createGain();
      const peak = Math.max(0.0002, o.gain==null?0.15:o.gain);
      const atk = o.attack==null?0.004:o.attack;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + atk);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(this.comp);
      src.start(t); src.stop(t + dur + 0.05);
    },

    startTitleHum(){
      if(!this.ensure() || !this.on) return;
      if(this.titleSrc) return;
      const ctx = this.ctx;
      const src = ctx.createBufferSource();
      src.buffer = this.brownBuf; src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=180;
      const g = ctx.createGain(); g.gain.value = 0.0001;
      src.connect(lp); lp.connect(g); g.connect(this.comp);
      src.start();
      g.gain.setTargetAtTime(0.035, this.now(), 0.6);
      const o1 = ctx.createOscillator(); o1.type='sine'; o1.frequency.value=60;
      const o2 = ctx.createOscillator(); o2.type='sine'; o2.frequency.value=120;
      const hg = ctx.createGain(); hg.gain.value=0.006;
      const hg2 = ctx.createGain(); hg2.gain.value=0.0025;
      o1.connect(hg); hg.connect(this.comp);
      o2.connect(hg2); hg2.connect(this.comp);
      o1.start(); o2.start();
      // high valve whine, very quiet
      const o3 = ctx.createOscillator(); o3.type='triangle'; o3.frequency.value=2430;
      const hg3 = ctx.createGain(); hg3.gain.value=0.0008;
      o3.connect(hg3); hg3.connect(this.comp); o3.start();
      this.titleSrc = src;
      this.titleGain = g;
      this.titleNodes = [o1,o2,o3];
    },

    stopTitleHum(){
      if(!this.titleSrc) return;
      const t = this.now();
      try {
        this.titleGain.gain.cancelScheduledValues(t);
        this.titleGain.gain.setValueAtTime(this.titleGain.gain.value, t);
        this.titleGain.gain.exponentialRampToValueAtTime(0.0001, t+0.35);
        this.titleSrc.stop(t+0.4);
        this.titleNodes.forEach(o=>{ try{o.stop(t+0.4);}catch(e){} });
      } catch(e){}
      this.titleSrc = null; this.titleGain = null; this.titleNodes = null;
    },

    startRoom(){
      if(!this.ensure()) return;
      if(this.roomSrc) return;
      const ctx = this.ctx;
      const src = ctx.createBufferSource();
      src.buffer = this.brownBuf; src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=190;
      const g = ctx.createGain(); g.gain.value = 0.0001;
      src.connect(lp); lp.connect(g); g.connect(this.comp);
      src.start();
      const hum = ctx.createOscillator(); hum.type='sine'; hum.frequency.value=58;
      const hg = ctx.createGain(); hg.gain.value=0.0001;
      hum.connect(hg); hg.connect(this.comp); hum.start();
      this.roomSrc = src; this.roomGain = g; this.humGain = hg;
    },

    setRoomLevel(level, active){
      if(!this.roomGain) return;
      this.roomActive = !!active;
      const t = this.now();
      const base = active ? (0.008 + Math.max(0,level)*0.055) : 0.0001;
      this.roomGain.gain.setTargetAtTime(base, t, 0.35);
      this.humGain.gain.setTargetAtTime(active ? (0.002 + level*0.01) : 0.0001, t, 0.35);
    },

    step(loud, sneak){
      if(!this.ready || !this.on) return;
      const v = loud ? (0.10 + Math.random()*0.05) : 0.024;
      this.noise(0.075, {filter:'bandpass', freq: sneak?2100:1250, q:1.1, gain:v, slide: sneak?1500:760});
      this.tone(sneak?120:92, 0.06, {gain:v*0.35, type:'sine', slide:52});
    },

    tube(){
      if(!this.ready || !this.on) return;
      this.noise(0.03, {filter:'highpass', freq:2600, gain:0.16});
      this.tone(120, 0.5, {type:'sawtooth', gain:0.045, slide:118, filter:'lowpass', freq:520, q:0.7});
      this.tone(60, 0.65, {type:'sine', gain:0.06, slide:58});
      this.tone(880+Math.random()*200, 0.08, {type:'triangle', gain:0.018, slide:600});
      this.noise(0.18, {filter:'bandpass', freq:3400, q:2, gain:0.035});
    },

    flicker(){
      if(!this.ready || !this.on) return;
      this.noise(0.02, {filter:'highpass', freq:3200, gain:0.05});
      this.noise(0.03, {filter:'highpass', freq:3200, gain:0.04, when:0.05});
    },

    bang(strength){
      if(!this.ready || !this.on) return;
      const s = strength==null?1:strength;
      this.noise(0.32, {filter:'bandpass', freq:2300, q:0.7, gain:0.26*s, slide:900});
      this.noise(0.15, {filter:'highpass', freq:4200, gain:0.12*s});
      this.tone(54, 0.34, {gain:0.17*s, type:'sine', slide:34});
      this.tone(187, 0.4, {gain:0.045*s, type:'triangle'});
      this.tone(293, 0.32, {gain:0.035*s, type:'triangle'});
      this.tone(463, 0.26, {gain:0.022*s, type:'sine'});
      this.noise(0.12, {filter:'bandpass', freq:900, q:1.4, gain:0.12*s, when:0.05});
    },

    land(){
      if(!this.ready || !this.on) return;
      this.tone(640, 0.12, {type:'square', gain:0.02, slide:320});
      this.noise(0.1, {filter:'bandpass', freq:1600, q:1, gain:0.05});
    },

    throwCan(){
      if(!this.ready || !this.on) return;
      this.noise(0.3, {filter:'bandpass', freq:500, q:1.5, gain:0.05, slide:1900});
    },

    hunterStep(){
      if(!this.ready || !this.on) return;
      this.noise(0.14, {filter:'bandpass', freq:820, q:2.4, gain:0.085, slide:260});
      this.tone(38, 0.22, {gain:0.075, type:'sine', slide:30});
      this.tone(1300+Math.random()*300, 0.035, {type:'sine', gain:0.012});
    },

    hunterWake(){
      if(!this.ready || !this.on) return;
      this.noise(0.4, {filter:'bandpass', freq:340, q:3, gain:0.08, slide:180});
      this.tone(41, 0.5, {gain:0.09, type:'sine'});
      this.tone(980, 0.06, {type:'triangle', gain:0.015, slide:400});
    },

    heart(){
      if(!this.ready || !this.on) return;
      const t = this.now();
      if(t - this.lastHeart < 0.4) return;
      this.lastHeart = t;
      this.tone(48, 0.2, {gain:0.11, type:'sine', slide:34});
      this.tone(43, 0.16, {gain:0.075, type:'sine', slide:31, when:0.15});
    },

    caught(){
      if(!this.ready || !this.on) return;
      this.noise(1.1, {filter:'lowpass', freq:3200, gain:0.34, slide:200});
      this.noise(0.5, {filter:'highpass', freq:3000, gain:0.18});
      this.tone(140, 1.25, {gain:0.16, type:'sawtooth', slide:38});
      this.tone(151, 1.1, {gain:0.12, type:'sawtooth', slide:35});
      this.tone(72, 1.3, {gain:0.14, type:'square', slide:26});
      this.tone(31, 1.4, {gain:0.18, type:'sine'});
      this.noise(0.3, {filter:'highpass', freq:5200, gain:0.12, when:0.05});
    },

    escaped(){
      if(!this.ready || !this.on) return;
      this.noise(0.7, {filter:'bandpass', freq:1200, q:0.8, gain:0.08, slide:300});
      this.tone(196, 1.2, {gain:0.035, type:'sine'});
      this.tone(294, 1.1, {gain:0.028, type:'sine', when:0.12});
      this.tone(392, 1.4, {gain:0.026, type:'sine', when:0.24});
      this.tone(523, 1.6, {gain:0.018, type:'triangle', when:0.36});
      this.tone(58, 0.9, {gain:0.06, type:'sine'});
    },

    pickup(){
      if(!this.ready || !this.on) return;
      this.tone(880, 0.05, {type:'square', gain:0.035});
      this.tone(1320, 0.12, {type:'square', gain:0.03, when:0.05});
      this.noise(0.05, {filter:'highpass', freq:4000, gain:0.03});
    },

    shutter(){
      if(!this.ready || !this.on) return;
      this.noise(0.9, {filter:'bandpass', freq:700, q:0.8, gain:0.13, slide:2600});
      this.tone(70, 0.5, {type:'sine', gain:0.07, slide:48});
      this.noise(0.15, {filter:'lowpass', freq:600, gain:0.12, when:0.85});
      this.tone(90, 0.2, {type:'square', gain:0.035, when:0.85});
    },

    doorClick(){
      if(!this.ready || !this.on) return;
      this.noise(0.05, {filter:'highpass', freq:2500, gain:0.09});
      this.tone(160, 0.08, {type:'square', gain:0.03, slide:90});
      this.tone(60, 0.18, {type:'sine', gain:0.05});
    },

    ui(){
      if(!this.ready || !this.on) return;
      this.noise(0.012, {filter:'highpass', freq:4000, gain:0.02});
    },

    crtOff(){
      if(!this.ready || !this.on) return;
      this.tone(420, 0.18, {type:'triangle', gain:0.03, slide:120});
      this.noise(0.16, {filter:'highpass', freq:2200, gain:0.04});
    }
  };

  M.Audio = A;
})();
