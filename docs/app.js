'use strict';
const layers={
  genome:['01','基因组','研究方向：连接遗传变异与分子调控预测。基因信息不能直接推导完整病程，也不会决定 MBTI 或人格。','尚未接入'],
  cell:['02','细胞与组织','研究方向：在指定细胞和组织环境中模拟扰动响应。跨尺度联系需要独立验证，不能把表达预测当作完整人体模拟。','尚未接入'],
  body:['03','身体状态','研究方向：由专病生理模型管理症状、检查、时间和治疗反应，并通过观测更新。当前页面不生成任何临床预测。','尚未接入'],
  mind:['04','记忆与人格','相对稳定的个性，与不断变化的信任和情绪共同影响：我们注意到什么，又愿意说出什么。','本页示意'],
  relation:['05','关系与环境','沟通方式会留下痕迹；时间、费用和支持条件限制行动。本页用透明的示意规则展示这些关系，尚无跨就诊长期记忆。','本页示意']
};
document.querySelectorAll('[data-layer]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-layer]').forEach(node=>{node.classList.remove('active');node.setAttribute('aria-pressed','false');});
  button.classList.add('active');button.setAttribute('aria-pressed','true');
  const [number,title,description,status]=layers[button.dataset.layer];
  document.getElementById('layer-number').textContent=number+' / 05';
  document.getElementById('layer-title').textContent=title;
  document.getElementById('layer-description').textContent=description;
  document.getElementById('layer-status').textContent=status;
}));
const el=id=>document.getElementById(id);
const styleNames={reserved:'慢热，问到才说',direct:'直接，主动表达',detailed:'详细，喜欢解释'};
const clamp=value=>Math.min(100,Math.max(0,Math.round(value)));
let profile, state, history;
function readProfile(){return {nickname:el('nickname').value.trim()||'我的分身',mbti:el('mbti').value,style:el('style').value,initialTrust:Number(el('trust').value),healthLiteracy:Number(el('literacy').value),practicalAccess:Number(el('access').value)};}
function measures(){return {disclosure:clamp(state.trust*.7+(profile.style==='direct'?22:profile.style==='detailed'?16:7)),readiness:clamp(state.trust*.35+profile.healthLiteracy*.2+profile.practicalAccess*.45)};}
function message(role,body){const div=document.createElement('div');div.className='message '+role;const label=document.createElement('small');label.textContent=role==='clinician'?'沟通者':profile.nickname;const p=document.createElement('p');p.textContent=body;div.append(label,p);el('chat-log').append(div);el('chat-log').scrollTop=el('chat-log').scrollHeight;}
function render(){const {disclosure,readiness}=measures();for(const [key,value] of Object.entries({trust:state.trust,disclosure,readiness})){el('metric-'+key).replaceChildren(document.createTextNode(String(value)));const suffix=document.createElement('span');suffix.textContent='/100';el('metric-'+key).append(suffix);el('bar-'+key).style.width=value+'%';}el('session-count').textContent=`互动 ${state.turn} / 6`;['empathetic','rushed'].forEach(id=>el(id).disabled=state.turn>=6);}
function start(){profile=readProfile();state={trust:profile.initialTrust,turn:0};history=[];el('patient-name').textContent=profile.nickname+'的概念分身';el('patient-meta').textContent=styleNames[profile.style]+(profile.mbti==='unset'?'':' · '+profile.mbti)+' · 合成情境';document.querySelector('.avatar').textContent=Array.from(profile.nickname)[0];el('chat-log').replaceChildren();message('patient',profile.style==='direct'?'我想先说清楚：我担心这个方案做不到，能一起商量吗？':profile.style==='detailed'?'我这次来有几件事想问。上次听完还是有点不确定，也担心后面的安排会影响日常生活。':'嗯……我有一点担心，不知道该从哪里说。');el('trace-text').textContent='请选择沟通方式。每次互动会保留上一轮状态。';el('profile-notice').textContent='当前设定已应用。修改后请重新开始体验。';render();}
function interact(kind){if(state.turn>=6)return;const previous=state.trust;const delta=kind==='empathetic'?Math.round(9+(100-profile.healthLiteracy)*.06):-14;state.trust=clamp(state.trust+delta);state.turn++;const clinician=kind==='empathetic'?'你最担心什么？我们一起找能做到的办法。':'不用想这么多，照着方案做就行。';let reply;
  if(kind==='empathetic'){
    reply=state.trust<35?'谢谢你问我。我还想再听听解释，现在还不太放心。':profile.practicalAccess<45?'那我说实话：时间和费用都有些困难。能不能一起想一个我做得到的安排？':profile.healthLiteracy<45?'我有些词没听懂。可以用日常的说法解释，再让我复述一下吗？':'你愿意听我说，我放心了一些。我想把担心的事情说清楚，再一起讨论安排。';
  }else{reply=state.trust<25?'我还是没明白，也不太想继续说了。':profile.style==='direct'?'我需要知道原因。我的担心还没解决，不能直接让我照做。':'好……但我其实还没弄明白，也不确定能不能做到。';}
  if(profile.style==='detailed'&&kind==='empathetic')reply+=' 我想逐项确认，也希望下次能接着今天的话题。';
  message('clinician',clinician);message('patient',reply);const current=measures();history.push({turn:state.turn,action:kind,clinician,patient:reply,trustBefore:previous,trustAfter:state.trust,...current});
  const actual=state.trust-previous;el('trace-text').textContent=`第 ${state.turn} 次互动：${kind==='empathetic'?'解释并邀请表达':'催促并下结论'} → 信任 ${actual>=0?'+':''}${actual}。表达意愿随信任更新；接受意愿同时受理解程度与现实条件约束。${state.turn===6?'本次体验结束，可导出记录或重置。':''}`;render();
}
el('profile-form').addEventListener('submit',event=>{event.preventDefault();start();});
['trust','literacy','access'].forEach(id=>el(id).addEventListener('input',()=>{el(id+'-value').textContent=el(id).value;el('profile-notice').textContent='设定已修改，点击“用这些设定开始体验”后生效。';}));
['nickname','mbti','style'].forEach(id=>el(id).addEventListener('input',()=>{el('profile-notice').textContent='设定已修改，重新开始后生效；导出使用已应用的设定。';}));
el('empathetic').addEventListener('click',()=>interact('empathetic'));
el('rushed').addEventListener('click',()=>interact('rushed'));
el('reset').addEventListener('click',start);
el('export').addEventListener('click',()=>{const payload={schemaVersion:'0.1.0',kind:'conceptual_self_described_persona',clinicalValidation:false,biologicalModelConnected:false,notice:'Synthetic scenario and illustrative heuristic scores. Not a medical or psychological assessment. MBTI is a label only. No persistent or cross-visit memory.',exportedAt:new Date().toISOString(),profile,state:{...state,...measures()},history};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='openpatient-persona.json';document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
start();
