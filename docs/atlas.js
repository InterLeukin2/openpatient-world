'use strict';
// Procedural scale diagrams. These are not biological simulation outputs.
window.PatientAtlas = (() => {
  const canvas=document.getElementById('world-canvas');
  const ctx=canvas.getContext('2d');
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=media.matches,visible=true,frame=0,last=0,angle=.32,layer='body',drag=null,width=600,height=363;
  const count=1400;
  const frac=n=>n-Math.floor(n);
  const point=(i,kind)=>{
    const u=frac(i*.61803398875),v=frac(i*.41421356237),a=u*Math.PI*2,z=2*v-1,r=Math.sqrt(1-z*z);
    if(kind==='genome'){
      const side=i%2===0?1:-1,t=(i/count)*Math.PI*7;
      if(i%5===0){const f=frac(i*.37)*2-1;return [Math.cos(t)*f*.9,(i/count-.5)*4.3,Math.sin(t)*f*.9];}
      return [Math.cos(t)*side*.9+(u-.5)*.07,(i/count-.5)*4.3,Math.sin(t)*side*.9];
    }
    if(kind==='cell'){
      const c=i%7,theta=c*2.4,rad=c===0?0:1.12;
      return [Math.cos(theta)*rad+r*Math.cos(a)*.65,Math.sin(theta)*rad+r*Math.sin(a)*.65,z*.65+(c%3-1)*.3];
    }
    if(kind==='mind') return [r*Math.cos(a)*1.65,r*Math.sin(a)*1.3-.2,z*1.3];
    if(kind==='relation'){
      const ring=i%4,t=i*.053;
      return [Math.cos(t)*(ring*.38+.65),Math.sin(t)*(ring*.26+.45),Math.sin(t*2+ring)*.6];
    }
    // Ellipsoid envelopes encode a schematic head, torso and limbs.
    const parts=[[-0,-1.65,0,.39,.45,.35],[0,-.52,0,.69,.81,.33],[0,.32,0,.52,.36,.32],[-.88,-.2,0,.19,.94,.19],[.88,-.2,0,.19,.94,.19],[-.28,1.25,0,.23,1.03,.22],[.28,1.25,0,.23,1.03,.22]];
    const pick=i%10,part=parts[pick<2?0:pick<5?1:pick===5?2:pick===6?3:pick===7?4:pick===8?5:6];
    return [part[0]+r*Math.cos(a)*part[3],part[1]+z*part[4],part[2]+r*Math.sin(a)*part[5]];
  };
  let positions=Array.from({length:count},(_,i)=>point(i,'body'));
  let targets=positions.map(p=>[...p]);
  function draw(time=0){
    if(!ctx)return;
    ctx.clearRect(0,0,width,height);
    const scale=Math.min(width*.23,height*.185),cx=width*.53,cy=height*.49;
    ctx.strokeStyle='#5774bb35';ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(cx,cy+scale*2.35,scale*1.65,scale*.27,0,0,Math.PI*2);ctx.stroke();
    const projected=[];
    for(let i=0;i<count;i++){
      const p=positions[i],t=targets[i];
      for(let j=0;j<3;j++)p[j]+=(t[j]-p[j])*(paused?1:.085);
      const x=p[0]*Math.cos(angle)+p[2]*Math.sin(angle),z=-p[0]*Math.sin(angle)+p[2]*Math.cos(angle),perspective=5.8/(5.8+z);
      projected.push({x:cx+x*scale*perspective,y:cy+p[1]*scale*perspective,z,i});
    }
    projected.sort((a,b)=>b.z-a.z);
    for(const p of projected){
      const alpha=Math.min(.95,Math.max(.15,.58-p.z*.23));
      ctx.fillStyle=p.i%6===0?`rgba(166,185,255,${alpha})`:`rgba(89,213,224,${alpha})`;
      ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.65,1.25-p.z*.22),0,Math.PI*2);ctx.fill();
    }
    if(layer==='mind'||layer==='relation'){
      const nodes=projected.filter(p=>p.i%47===0);
      ctx.strokeStyle='#8aaaff28';ctx.lineWidth=.7;
      nodes.forEach((p,i)=>nodes.slice(i+1).forEach(q=>{const d=Math.hypot(p.x-q.x,p.y-q.y);if(d<scale*.75){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}}));
    }
    // Moving scan guide is explicitly a visual locator, not a measured signal.
    if(!paused){const scan=cy+Math.sin(time*.00045)*scale*1.8;ctx.strokeStyle='#91a9ff24';ctx.beginPath();ctx.moveTo(cx-scale*1.5,scan);ctx.lineTo(cx+scale*1.5,scan);ctx.stroke();}
  }
  function loop(time){frame=0;if(paused||!visible||document.hidden)return;if(time-last>30){angle+=.002;draw(time);last=time;}frame=requestAnimationFrame(loop);}
  function schedule(){if(!frame&&!paused&&visible&&!document.hidden)frame=requestAnimationFrame(loop);}
  function sync(){cancelAnimationFrame(frame);frame=0;draw();schedule();const button=document.getElementById('motion-toggle');button.textContent=paused?'播放动效 ▷':'暂停动效 Ⅱ';button.setAttribute('aria-pressed',String(paused));document.body.classList.toggle('motion-paused',paused);}
  function resize(){const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else schedule();}).observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
  document.getElementById('motion-toggle').addEventListener('click',()=>{paused=!paused;sync();});
  media.addEventListener('change',()=>{paused=media.matches;sync();});
  document.getElementById('rotate-view').addEventListener('click',()=>{angle+=.4;draw();});
  canvas.addEventListener('pointerdown',event=>{drag=event.clientX;canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointermove',event=>{if(drag!==null){angle+=(event.clientX-drag)*.008;drag=event.clientX;draw();}});
  const release=()=>{drag=null;};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
  sync();
  return {setLayer(id){layer=id;targets=Array.from({length:count},(_,i)=>point(i,id));draw();schedule();}};
})();
