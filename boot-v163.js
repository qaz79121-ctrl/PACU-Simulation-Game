(function(){
  const root=document.getElementById('app');
  root.innerHTML='<main class="home"><section class="hero"><div class="eyebrow">PACU DIGITAL SIMULATION</div><h1>PACU 藥物任務站</h1><p>遊戲載入中…</p></section></main>';
  import('./app-v163.js').catch(function(err){
    console.error('PACU startup error',err);
    root.innerHTML='<main class="home"><section class="hero"><div class="eyebrow">STARTUP DIAGNOSTIC</div><h1>遊戲啟動失敗</h1><p>這次不會再顯示空白頁。請把下方錯誤訊息截圖傳給我：</p><pre style="white-space:pre-wrap;background:#102f3d;color:white;padding:18px;border-radius:12px;max-width:900px;overflow:auto">'+
      String(err && (err.stack||err.message)||err).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})+
      '</pre></section></main>';
  });
})();