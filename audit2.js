const { chromium } = require('playwright');
const path=require('path');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p=await b.newPage({viewport:{width:1366,height:900}});
  await p.goto('file://'+path.resolve('index.html'),{waitUntil:'load'}).catch(()=>{});
  await p.evaluate(()=>{document.getElementById('welcome')?.classList.add('hide');});
  const N=await p.evaluate(()=>window.N);
  const prob=[];
  for(let i=0;i<N;i++){
    await p.evaluate((idx)=>{window.maxUnlocked=window.N-1; goTo(+idx,1);}, i);
    await p.waitForTimeout(1100); // dejar terminar animaciones
    const r=await p.evaluate(()=>{
      const s=document.querySelector('.slide.active'), w=s.querySelector('.wrap');
      const out=[]; let sale=[];
      if(s.scrollWidth>s.clientWidth+2) out.push('SCROLL-H '+(s.scrollWidth-s.clientWidth));
      if(w){ const wr=w.getBoundingClientRect();
        w.querySelectorAll('*').forEach(el=>{ const b=el.getBoundingClientRect();
          if(b.width>0 && (b.right>wr.right+2||b.left<wr.left-2)) sale.push(el.className||el.tagName); });
      }
      const over=s.scrollHeight-s.clientHeight;
      const h2=s.querySelector('h2');
      return {t:h2?h2.textContent.trim().slice(0,40):'(portada/cierre)', over, sale:sale.slice(0,4), n:sale.length, out};
    });
    const m=[...r.out];
    if(r.n>0) m.push('SALE-ANCHO('+r.n+'): '+r.sale.join(', '));
    if(r.over>60) m.push('ALTO +'+r.over+'px');
    if(m.length) prob.push((i+1)+'. '+r.t+' → '+m.join(' | '));
  }
  console.log('=== HALLAZGOS REALES (animaciones terminadas) ===');
  prob.forEach(x=>console.log(x));
  console.log('total:', prob.length,'de',N);
  await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
