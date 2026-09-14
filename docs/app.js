'use strict';
const D=PatientData,E=PatientEngine,$=id=>document.getElementById(id);
const styleNames={reserved:'慢热，问到才说',direct:'直接，主动表达',detailed:'详细，喜欢解释'};
const sliders=[['trust','初始信任','先观察','愿意相信'],['literacy','健康信息理解','需要通俗解释','熟悉健康信息'],['access','现实执行条件','时间、费用受限','条件充足'],['anxiety','初始焦虑','比较平静','担心较多'],['privacy','隐私顾虑','乐于分享','谨慎披露']];
const textFields=['nickname','mbti','style','education','economy','country','language','background'];
let profile,state,scenario,events=[],trajectory=[],comparison=null,selectedPreset='lin',pendingEdits=false;
const node=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
const option=(value,label)=>{const el=node('option',label);el.value=value;return el;};
'INTJ INTP ENTJ ENTP INFJ INFP ENFJ ENFP ISTJ ISFJ ESTJ ESFJ ISTP ISFP ESTP ESFP'.split(' ').forEach(type=>$('mbti').append(option(type,type)));
sliders.forEach(([id,title,left,right])=>{
  const field=node('div',undefined,'slider-field'),label=node('label',title),output=node('output');
  label.htmlFor=id;output.id=id+'-value';output.setAttribute('for',id);label.append(output);
  const input=node('input');input.id=id;input.type='range';input.min=0;input.max=100;input.value=50;
  const ends=node('div',undefined,'range-ends');ends.append(node('span',left),node('span',right));field.append(label,input,ends);$('sliders').append(field);
});
D.scenarios.forEach(s=>$('scenario').append(option(s.id,s.name)));
D.profiles.forEach(p=>{
  const button=node('button',undefined,'preset');button.type='button';button.dataset.profile=p.id;button.setAttribute('aria-pressed','false');
  button.append(node('span',Array.from(p.nickname)[0],'preset-avatar'),node('strong',p.title),node('small',p.summary),node('span','信任 '+p.trust+' / 焦虑 '+p.anxiety,'preset-numbers'));
  button.addEventListener('click',()=>loadProfile(p));$('presets').append(button);
});
Object.entries(D.actions).filter(([id])=>id!=='neutral').forEach(([id,action])=>{
  const button=node('button',action.name);button.id=id;button.type='button';button.title=action.text;button.addEventListener('click',()=>interact(id,action.text,'快捷动作：'+action.name));$('action-options').append(button);
});
function updateSliders(){sliders.forEach(([id])=>{$(id+'-value').textContent=$(id).value;$(id).style.setProperty('--value',$(id).value+'%');});}
function readProfile(){const result={id:selectedPreset};textFields.forEach(id=>result[id]=$(id).value.trim());result.nickname=result.nickname||'我的分身';sliders.forEach(([id])=>result[id]=Number($(id).value));return result;}
function clearComparison(){comparison=null;$('compare-chart').setAttribute('hidden','');$('compare-empty').hidden=false;$('compare-result').textContent='';}
function loadProfile(p){selectedPreset=p.id;textFields.forEach(id=>$(id).value=p[id]);sliders.forEach(([id])=>$(id).value=p[id]);$('scenario').value=p.scenario;updateSliders();start(true);}
function start(applyProfile=false){
  if(applyProfile||!profile){profile=readProfile();pendingEdits=false;}
  scenario=D.scenarios.find(s=>s.id===$('scenario').value);state=E.initial(profile);events=[];trajectory=[{...state}];clearComparison();
  $('patient-name').textContent=profile.nickname+'的分身';$('scenario-description').textContent=scenario.description;
  $('chat-log').replaceChildren();message('patient',scenario.opening);$('message').value='';
  $('trace-text').textContent='相同起点可重复实验。选择快捷动作或输入一句话开始。';
  $('profile-notice').textContent=pendingEdits?'会话已重置，但表单仍有未应用的修改；当前使用旧设定。':'已应用设定。后续修改需点击应用；导出与 A/B 使用已应用版本。';
  document.querySelectorAll('[data-profile]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.profile===profile.id)));
  render();
}
function message(role,body){
  const line=node('div',undefined,'message '+role),avatar=node('span',role==='patient'?Array.from(profile.nickname)[0]:'问','message-avatar');avatar.setAttribute('aria-hidden','true');
  const content=node('div');content.append(node('small',role==='patient'?profile.nickname+' · '+styleNames[profile.style]:'沟通者'),node('p',body));line.append(avatar,content);$('chat-log').append(line);$('chat-log').scrollTop=$('chat-log').scrollHeight;
}
const svgNode=(tag,attributes,text)=>{const el=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attributes).forEach(([k,v])=>el.setAttribute(k,v));if(text!==undefined)el.textContent=text;return el;};
function chart(id,series,maxTurns,height){
  const svg=$(id),x=i=>35+i/maxTurns*610,y=v=>height-25-v/100*(height-42);svg.replaceChildren();
  [0,50,100].forEach(value=>{svg.append(svgNode('line',{x1:35,x2:645,y1:y(value),y2:y(value),class:'grid-line'}),svgNode('text',{x:3,y:y(value)+4},String(value)));});
  for(let i=0;i<=maxTurns;i+=maxTurns===12?3:1)svg.append(svgNode('text',{x:x(i),y:height-5,'text-anchor':'middle'},i===0?'起点':String(i)));
  series.forEach(({values,color})=>{
    const d=values.map((value,i)=>(i?'L':'M')+x(i).toFixed(2)+' '+y(value).toFixed(2)).join(' ');
    svg.append(svgNode('path',{d,stroke:color,class:'curve'}));
    values.forEach((value,i)=>svg.append(svgNode('circle',{cx:x(i),cy:y(value),r:2.8,fill:color})));
  });
}
function render(){
  ['trust','anxiety','disclosure','readiness'].forEach(key=>{const metric=$('metric-'+key);metric.replaceChildren(node('span',String(state[key])),node('small','/100'));$('bar-'+key).style.width=state[key]+'%';});
  const ended=state.turn>=E.MAX_TURNS;$('session-count').textContent=state.turn+' / '+E.MAX_TURNS+' 轮';
  $('action-options').querySelectorAll('button').forEach(b=>b.disabled=ended);$('message').disabled=ended;$('message-form').querySelector('button').disabled=ended;
  chart('session-chart',[{values:trajectory.map(s=>s.trust),color:'#59d5e0'},{values:trajectory.map(s=>s.anxiety),color:'#ffae9c'},{values:trajectory.map(s=>s.disclosure),color:'#91a9ff'}],12,145);
  $('chart-summary').textContent='第 '+state.turn+' 轮：信任 '+state.trust+'，焦虑 '+state.anxiety+'，表达意愿 '+state.disclosure;
  $('session-chart').setAttribute('aria-label',$('chart-summary').textContent);
}
function interact(action,text,reason){
  if(state.turn>=E.MAX_TURNS)return;
  const before={...state};state=E.step(profile,state,scenario,action);const response=E.reply(profile,state,scenario,action);
  message('clinician',text);message('patient',response);events.push({turn:state.turn,action,input:text,classification:reason,response,before,after:{...state}});trajectory.push({...state});
  const signed=n=>(n>=0?'+':'')+n;
  $('trace-text').textContent=reason+' 信任 '+signed(state.trust-before.trust)+'，焦虑 '+signed(state.anxiety-before.anxiety)+'，理解 '+signed(state.understanding-before.understanding)+'。'+(state.turn===12?'会话已结束，可导出或重置。':'');
  render();
}
$('profile-form').addEventListener('submit',event=>{event.preventDefault();start(true);});
$('profile-form').addEventListener('input',()=>{selectedPreset='custom';pendingEdits=true;updateSliders();$('profile-notice').textContent='有未应用的修改。请点击应用；当前会话、对照和导出仍使用旧设定。';});
$('scenario').addEventListener('change',()=>start(false));
$('reset').addEventListener('click',()=>start(false));
$('message-form').addEventListener('submit',event=>{event.preventDefault();const text=$('message').value.trim();if(!text){$('trace-text').textContent='请先输入一句话，或选择上方快捷动作。';$('message').focus();return;}const result=E.classify(text);interact(result.action,text,result.reason);$('message').value='';});
function runComparison(){
  comparison={profile:structuredClone(profile),scenario:scenario.id,...E.compare(profile,scenario)};
  $('compare-empty').hidden=true;$('compare-chart').removeAttribute('hidden');
  const a=comparison.supportive.states,b=comparison.pressure.states;
  chart('compare-chart',[{values:a.map(s=>s.trust),color:'#59d5e0'},{values:b.map(s=>s.trust),color:'#ffae9c'}],6,210);
  $('compare-result').textContent=profile.nickname+' · '+scenario.name+'：起始信任 '+profile.trust+' → A '+a.at(-1).trust+' / B '+b.at(-1).trust+'；终点相差 '+(a.at(-1).trust-b.at(-1).trust)+' 分。两组仅改变沟通动作序列。';
  $('compare-chart').setAttribute('aria-label',$('compare-result').textContent);
}
$('compare').addEventListener('click',runComparison);
$('hero-compare').addEventListener('click',()=>{runComparison();$('comparison').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});});
function download(filename,payload){const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const anchor=node('a');anchor.href=url;anchor.download=filename;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export').addEventListener('click',()=>download('openpatient-experiment.json',{schemaVersion:D.version,kind:'synthetic_communication_experiment',clinicalValidation:false,biologicalModelConnected:false,exportedAt:new Date().toISOString(),provenance:D.provenance,profile,scenario,initialState:trajectory[0],finalState:state,trajectory,events,comparison,rules:D.actions,notice:'Heuristic scores; not clinical predictions. Local keyword matching, no LLM. Context labels do not determine scores.'}));
$('export-dataset').addEventListener('click',()=>download('openpatient-synthetic-dataset.json',D));
D.layers.forEach(layer=>{const button=node('button',layer.name);button.dataset.layer=layer.id;button.type='button';button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>selectLayer(layer.id));$('layer-tabs').append(button);$('schema-layer').append(option(layer.id,layer.name));});
function selectLayer(id){
  const layer=D.layers.find(l=>l.id===id);document.querySelectorAll('[data-layer]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layer===id)));
  $('layer-title').textContent=layer.name;$('layer-description').textContent=layer.description;$('layer-status').textContent=layer.status;$('scale-label').textContent=layer.scale;$('visual-title').textContent=layer.english;
  $('schema-layer').value=id;$('schema-title').textContent=layer.name;$('schema-source').textContent='参考 / 规划：'+layer.source+'。字段定义不代表已接入模型。';$('schema-fields').replaceChildren();
  layer.fields.forEach(fields=>{const row=node('tr');fields.forEach(field=>row.append(node('td',field)));$('schema-fields').append(row);});
  window.PatientAtlas.setLayer(id);
}
$('schema-layer').addEventListener('change',()=>selectLayer($('schema-layer').value));
D.research.forEach(item=>{const card=node('a',undefined,'research-card');card.href=item.url;card.target='_blank';card.rel='noopener noreferrer';const top=node('div',undefined,'research-top');top.append(node('h4',item.name),node('span',item.area+' ↗'));card.append(top,node('p',item.text),node('small',item.boundary));$('research-grid').append(card);});
$('profile-count').textContent=D.profiles.length;$('scenario-count').textContent=D.scenarios.length;
selectLayer('body');loadProfile(D.profiles[0]);
