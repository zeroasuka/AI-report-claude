/* === _util.js === */
/* html-ppt fx :: shared helpers */
(function(){
  window.HPX = window.HPX || {};
  const U = window.HPX._u = {};

  U.css = (el, name, fb) => {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fb;
  };

  U.accent = (el, fb) => U.css(el, '--accent', fb || '#7c5cff');
  U.accent2 = (el, fb) => U.css(el, '--accent-2', fb || '#22d3ee');
  U.text = (el, fb) => U.css(el, '--text-1', fb || '#eaeaf2');

  U.palette = (el) => [
    U.accent(el, '#7c5cff'),
    U.accent2(el, '#22d3ee'),
    U.css(el, '--ok', '#22c55e'),
    U.css(el, '--warn', '#f59e0b'),
    U.css(el, '--danger', '#ef4444'),
  ];

  U.canvas = (el) => {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    const c = document.createElement('canvas');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block;';
    el.appendChild(c);
    const ctx = c.getContext('2d');
    let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio||1));
    const fit = () => {
      const r = el.getBoundingClientRect();
      w = Math.max(1, r.width|0);
      h = Math.max(1, r.height|0);
      c.width = (w*dpr)|0;
      c.height = (h*dpr)|0;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return {
      c, ctx,
      get w(){return w;}, get h(){return h;}, get dpr(){return dpr;},
      destroy(){
        try{ro.disconnect();}catch(e){}
        if (c.parentNode) c.parentNode.removeChild(c);
      }
    };
  };

  U.loop = (fn) => {
    let raf = 0, stopped = false, t0 = performance.now(), last = t0;
    const tick = (t) => {
      if (stopped) return;
      const dt = (t - last) / 1000;
      last = t;
      // delta-time 上限保護：rAF 被暫停後恢復（tab 切換、iOS 捲動）
      // 第一幀 dt 可能累積幾百毫秒，粒子會大跳；直接 skip 這幀
      if (dt < 0.1) fn((t - t0) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { stopped = true; cancelAnimationFrame(raf); };
  };

  U.rand = (a,b) => a + Math.random()*(b-a);
})();

/* === particle-burst.js === */
(function(){
  window.HPX = window.HPX || {};
  window.HPX['particle-burst'] = function(el){
    const U = window.HPX._u;
    const k = U.canvas(el), ctx = k.ctx;
    const pal = U.palette(el);
    let parts = [];
    const spawn = () => {
      const cx = k.w/2, cy = k.h/2;
      const n = 90;
      for (let i=0;i<n;i++){
        const a = Math.random()*Math.PI*2;
        const s = U.rand(80, 260);
        parts.push({
          x: cx, y: cy,
          vx: Math.cos(a)*s, vy: Math.sin(a)*s,
          life: 1, r: U.rand(2,5),
          c: pal[(Math.random()*pal.length)|0]
        });
      }
    };
    spawn();
    let lastSpawn = 0;
    const stop = U.loop((t) => {
      ctx.clearRect(0,0,k.w,k.h);
      if (t - lastSpawn > 2.5) { spawn(); lastSpawn = t; }
      const dt = 1/60;
      parts = parts.filter(p => p.life > 0);
      for (const p of parts){
        p.vy += 220*dt;
        p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx*dt; p.y += p.vy*dt;
        p.life -= 0.012;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
    return { stop(){ stop(); k.destroy(); } };
  };
})();

/* === confetti-cannon.js === */
(function(){
  window.HPX = window.HPX || {};
  window.HPX['confetti-cannon'] = function(el){
    const U = window.HPX._u;
    const k = U.canvas(el), ctx = k.ctx;
    const pal = U.palette(el);
    let parts = [];
    const fire = () => {
      for (let side=0; side<2; side++){
        const x0 = side===0 ? 20 : k.w-20;
        const y0 = k.h - 20;
        for (let i=0;i<40;i++){
          const a = side===0 ? U.rand(-Math.PI*0.7, -Math.PI*0.4) : U.rand(-Math.PI*0.6, -Math.PI*0.3) - Math.PI/2 - Math.PI/6;
          const spd = U.rand(300, 520);
          parts.push({
            x: x0, y: y0,
            vx: Math.cos(a)*spd, vy: Math.sin(a)*spd,
            w: U.rand(6,12), h: U.rand(3,7),
            rot: Math.random()*Math.PI, vr: U.rand(-6,6),
            c: pal[(Math.random()*pal.length)|0],
            life: 1
          });
        }
      }
    };
    fire();
    let last = 0;
    const stop = U.loop((t) => {
      ctx.clearRect(0,0,k.w,k.h);
      if (t - last > 3) { fire(); last = t; }
      const dt = 1/60;
      parts = parts.filter(p => p.life > 0 && p.y < k.h+40);
      for (const p of parts){
        p.vy += 520*dt;
        p.x += p.vx*dt; p.y += p.vy*dt;
        p.rot += p.vr*dt;
        p.life -= 0.006;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    });
    return { stop(){ stop(); k.destroy(); } };
  };
})();

/* === knowledge-graph.js === */
(function(){
  window.HPX = window.HPX || {};
  window.HPX['knowledge-graph'] = function(el){
    const U = window.HPX._u;
    const k = U.canvas(el), ctx = k.ctx;
    const pal = U.palette(el);
    const tx = U.text(el, '#e7e7ef');
    const labels = ['AI','ML','LLM','Graph','Node','Edge','Claude','GPT','RAG','Vector',
      'Embed','Neural','Agent','Tool','Memory','Logic','Data','Train','Infer','Token',
      'Prompt','Chain','Plan','Skill','Cloud','Edge','GPU','Code','Task','Flow'];
    const N = 28;
    const nodes = Array.from({length:N}, (_,i) => ({
      x: U.rand(40, 300), y: U.rand(40, 200),
      vx: 0, vy: 0, label: labels[i%labels.length],
      c: pal[i%pal.length]
    }));
    const edges = [];
    const made = new Set();
    while (edges.length < 50){
      const a = (Math.random()*N)|0, b = (Math.random()*N)|0;
      if (a===b) continue;
      const key = a<b ? a+'-'+b : b+'-'+a;
      if (made.has(key)) continue;
      made.add(key); edges.push([a,b]);
    }
    const stop = U.loop(() => {
      // physics
      for (let i=0;i<N;i++){
        for (let j=i+1;j<N;j++){
          const a=nodes[i], b=nodes[j];
          const dx=b.x-a.x, dy=b.y-a.y;
          let d2=dx*dx+dy*dy; if (d2<1) d2=1;
          const d=Math.sqrt(d2);
          const f=1600/d2;
          const fx=(dx/d)*f, fy=(dy/d)*f;
          a.vx-=fx; a.vy-=fy; b.vx+=fx; b.vy+=fy;
        }
      }
      for (const [i,j] of edges){
        const a=nodes[i], b=nodes[j];
        const dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy)||1;
        const f=(d-90)*0.008;
        const fx=(dx/d)*f, fy=(dy/d)*f;
        a.vx+=fx; a.vy+=fy; b.vx-=fx; b.vy-=fy;
      }
      const cx=k.w/2, cy=k.h/2;
      for (const n of nodes){
        n.vx += (cx-n.x)*0.002;
        n.vy += (cy-n.y)*0.002;
        n.vx *= 0.85; n.vy *= 0.85;
        n.x += n.vx; n.y += n.vy;
      }
      ctx.clearRect(0,0,k.w,k.h);
      ctx.strokeStyle = 'rgba(180,180,220,0.25)'; ctx.lineWidth=1;
      for (const [i,j] of edges){
        const a=nodes[i], b=nodes[j];
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      }
      ctx.font='11px system-ui,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      for (const n of nodes){
        ctx.fillStyle = n.c;
        ctx.beginPath(); ctx.arc(n.x,n.y,7,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = tx;
        ctx.fillText(n.label, n.x, n.y-14);
      }
    });
    return { stop(){ stop(); k.destroy(); } };
  };
})();

/* === constellation.js === */
(function(){
  window.HPX = window.HPX || {};
  window.HPX['constellation'] = function(el){
    const U = window.HPX._u;
    const k = U.canvas(el), ctx = k.ctx;
    const ac = U.accent(el,'#9fb4ff');
    const N = 70;
    let pts = [];
    const seed = () => {
      pts = Array.from({length:N}, () => ({
        x: Math.random()*k.w, y: Math.random()*k.h,
        vx: U.rand(-0.3,0.3), vy: U.rand(-0.3,0.3)
      }));
    };
    seed();
    let lw=k.w, lh=k.h;
    const stop = U.loop(() => {
      if (k.w!==lw||k.h!==lh){ seed(); lw=k.w; lh=k.h; }
      ctx.clearRect(0,0,k.w,k.h);
      for (const p of pts){
        p.x += p.vx; p.y += p.vy;
        if (p.x<0||p.x>k.w) p.vx*=-1;
        if (p.y<0||p.y>k.h) p.vy*=-1;
      }
      for (let i=0;i<N;i++){
        for (let j=i+1;j<N;j++){
          const a=pts[i], b=pts[j];
          const d = Math.hypot(a.x-b.x, a.y-b.y);
          if (d < 150){
            ctx.globalAlpha = 1 - d/150;
            ctx.strokeStyle = ac; ctx.lineWidth=1;
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = ac;
      for (const p of pts){
        ctx.beginPath(); ctx.arc(p.x,p.y,1.8,0,Math.PI*2); ctx.fill();
      }
    });
    return { stop(){ stop(); k.destroy(); } };
  };
})();

/* === magnetic-field.js === */
(function(){
  window.HPX = window.HPX || {};
  window.HPX['magnetic-field'] = function(el){
    const U = window.HPX._u;
    const k = U.canvas(el), ctx = k.ctx;
    const pal = U.palette(el);
    const N = 60;
    const parts = Array.from({length:N}, (_,i) => ({
      phase: Math.random()*Math.PI*2,
      freq: U.rand(0.4, 1.2),
      amp: U.rand(30, 90),
      y0: U.rand(0.15, 0.85),
      c: pal[i%pal.length],
      trail: []
    }));
    const stop = U.loop((t) => {
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(0,0,k.w,k.h);
      for (const p of parts){
        const x = ((t*80 + p.phase*50) % (k.w+100)) - 50;
        const y = k.h*p.y0 + Math.sin(x*0.02 + p.phase + t*p.freq)*p.amp;
        p.trail.push([x,y]);
        if (p.trail.length > 18) p.trail.shift();
        ctx.strokeStyle = p.c;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i=0;i<p.trail.length;i++){
          const [tx,ty] = p.trail[i];
          if (i===0) ctx.moveTo(tx,ty); else ctx.lineTo(tx,ty);
        }
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2); ctx.fill();
      }
    });
    return { stop(){ stop(); k.destroy(); } };
  };
})();

/* === gradient-blob.js === */
(function(){
  window.HPX = window.HPX || {};
  window.HPX['gradient-blob'] = function(el){
    const U = window.HPX._u;
    const k = U.canvas(el), ctx = k.ctx;
    const pal = U.palette(el);
    const blobs = Array.from({length:4}, (_,i) => ({
      x: U.rand(0,1), y: U.rand(0,1),
      vx: U.rand(-0.08,0.08), vy: U.rand(-0.08,0.08),
      r: U.rand(180,320),
      c: pal[i%pal.length]
    }));
    const hex2rgb = (h) => {
      const m = h.replace('#','').match(/.{2}/g);
      if (!m) return [124,92,255];
      return m.map(x=>parseInt(x,16));
    };
    const stop = U.loop((t) => {
      ctx.fillStyle = 'rgba(10,12,22,0.2)';
      ctx.fillRect(0,0,k.w,k.h);
      ctx.globalCompositeOperation = 'lighter';
      for (const b of blobs){
        b.x += b.vx*0.01; b.y += b.vy*0.01;
        if (b.x<0||b.x>1) b.vx*=-1;
        if (b.y<0||b.y>1) b.vy*=-1;
        const px = b.x*k.w, py = b.y*k.h;
        const r = b.r + Math.sin(t*0.8 + b.x*6)*30;
        const [R,G,B] = hex2rgb(b.c);
        const grad = ctx.createRadialGradient(px,py,0,px,py,r);
        grad.addColorStop(0, `rgba(${R},${G},${B},0.55)`);
        grad.addColorStop(1, `rgba(${R},${G},${B},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    });
    return { stop(){ stop(); k.destroy(); } };
  };
})();

/* === shockwave.js === */
(function(){
  window.HPX = window.HPX || {};
  window.HPX['shockwave'] = function(el){
    const U = window.HPX._u;
    const k = U.canvas(el), ctx = k.ctx;
    const ac = U.accent(el,'#7c5cff'), ac2 = U.accent2(el,'#22d3ee');
    let waves = [];
    let last = -1;
    const stop = U.loop((t) => {
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(0,0,k.w,k.h);
      if (t - last > 0.6){ last = t; waves.push({t:0}); }
      const cx=k.w/2, cy=k.h/2;
      const max = Math.hypot(k.w,k.h)/2;
      waves = waves.filter(w => w.t < 1);
      for (const w of waves){
        w.t += 0.012;
        const r = w.t * max;
        const alpha = 1 - w.t;
        ctx.strokeStyle = w.t<0.5?ac2:ac;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 3 + (1-w.t)*3;
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = alpha*0.4;
        ctx.beginPath(); ctx.arc(cx,cy,r*0.92,0,Math.PI*2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // core
      const g = ctx.createRadialGradient(cx,cy,0,cx,cy,40);
      g.addColorStop(0,'rgba(255,255,255,0.9)');
      g.addColorStop(1,'rgba(124,92,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx,cy,40,0,Math.PI*2); ctx.fill();
    });
    return { stop(){ stop(); k.destroy(); } };
  };
})();
