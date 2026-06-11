/* html-ppt :: fx-runtime.js
 * Canvas FX autoloader + lifecycle manager.
 * - Dynamically loads all fx modules listed in FX_LIST
 * - Initializes [data-fx] elements when their slide becomes active
 * - Calls handle.stop() when the slide leaves
 */
(function(){
  'use strict';

  const FX_LIST = [
    '_util',
    'particle-burst','confetti-cannon','knowledge-graph','constellation',
    'magnetic-field','gradient-blob','shockwave'
  ];

  // Resolve base path of this script so it works from any page location.
  const myScript = document.currentScript || (function(){
    const all = document.getElementsByTagName('script');
    for (const s of all){ if (s.src && s.src.indexOf('fx-runtime.js')>-1) return s; }
    return null;
  })();
  const base = myScript ? myScript.src.replace(/fx-runtime\.js.*$/, 'fx/') : 'assets/animations/fx/';

  // 載入合併後的 bundle（原本 7 個獨立請求 → 1 個請求）
  const ready = new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = base.replace(/fx\/$/, 'fx-bundle.js');
    s.async = false;
    s.onload = s.onerror = resolve;
    document.head.appendChild(s);
  });

  window.__hpxActive = window.__hpxActive || new Map();

  function initFxIn(root){
    if (!window.HPX) return;
    const els = root.querySelectorAll('[data-fx]');
    els.forEach((el) => {
      if (window.__hpxActive.has(el)) return;
      const name = el.getAttribute('data-fx');
      const fn = window.HPX[name];
      if (typeof fn !== 'function') return;
      try {
        const handle = fn(el, {}) || { stop(){} };
        window.__hpxActive.set(el, handle);
      } catch(e){ console.warn('[hpx-fx]', name, e); }
    });
  }

  function stopFxIn(root){
    const els = root.querySelectorAll('[data-fx]');
    els.forEach((el) => {
      const h = window.__hpxActive.get(el);
      if (h && typeof h.stop === 'function'){
        try{ h.stop(); }catch(e){}
      }
      window.__hpxActive.delete(el);
    });
  }

  function reinitFxIn(root){
    stopFxIn(root);
    initFxIn(root);
  }
  window.__hpxReinit = reinitFxIn;

  function boot(){
    ready.then(() => {
      const active = document.querySelector('.slide.is-active') || document.querySelector('.slide');
      if (active) initFxIn(active);

      // Watch all slides for class changes (desktop nav)
      const slides = document.querySelectorAll('.slide');
      slides.forEach((sl) => {
        const mo = new MutationObserver((muts) => {
          for (const m of muts){
            if (m.attributeName === 'class'){
              if (sl.classList.contains('is-active')) initFxIn(sl);
              else stopFxIn(sl);
            }
          }
        });
        mo.observe(sl, { attributes: true, attributeFilter: ['class'] });
      });

      // 手機捲動模式：slide 進入 viewport 時才初始化 canvas fx
      if (window.matchMedia('(max-width:768px)').matches && 'IntersectionObserver' in window){
        const io = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) initFxIn(e.target);
          });
        }, { threshold: 0.15 });
        slides.forEach(sl => io.observe(sl));
      }

      // 切換標籤時暫停 / 恢復 canvas fx，避免背景耗電
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          slides.forEach(sl => stopFxIn(sl));
        } else {
          const active = document.querySelector('.slide.is-active') || slides[0];
          if (active) initFxIn(active);
        }
      });
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
