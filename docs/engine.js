'use strict';
const PatientEngine = (() => {
  const D = typeof module !== 'undefined' ? require('./data.js') : PatientData;
  const clamp = value => Math.max(0, Math.min(100, Math.round(value)));
  const MAX_TURNS = 12;
  function measures(profile,state) {
    const style = {reserved:7,direct:22,detailed:16}[profile.style];
    return {disclosure:clamp(.65*state.trust+style-.12*profile.privacy-.1*state.anxiety),readiness:clamp(.3*state.trust+.25*state.understanding+.45*profile.access-.1*state.anxiety)};
  }
  function initial(profile) {
    const state={turn:0,trust:profile.trust,anxiety:profile.anxiety,understanding:profile.literacy};
    return {...state,...measures(profile,state)};
  }
  function step(profile,state,scenario,action) {
    if(state.turn>=MAX_TURNS) return {...state};
    const rule=D.actions[action];
    if(!rule) throw new Error('Unknown communication action');
    const next={turn:state.turn+1,trust:clamp(state.trust+rule.trust*(action==='rushed'?scenario.pressure:1)+(action==='boundary'?profile.privacy*.04:0)),anxiety:clamp(state.anxiety+rule.anxiety*scenario.pressure),understanding:clamp(state.understanding+rule.understanding)};
    return {...next,...measures(profile,next)};
  }
  function classify(text) {
    const checks=[['boundary',/不能保证|不保证|无法保证|不确定|未知|隐私|未经同意|不能确定|无法确定/],['rushed',/保证没事|一定没事|绝对安全|照做|别问|不要再问|不用想|闭嘴|必须听/],['explain',/解释|复述|理解|听懂|简单|通俗|意思/],['empathetic',/担心|担忧|一起|感受|倾听|在意|顾虑|愿意说|理解你/]];
    const matches=checks.filter(([,regex])=>regex.test(text));
    if(matches.some(([id])=>id==='boundary')&&matches.some(([id])=>id==='rushed')) return {action:'neutral',reason:'同时命中边界与施压词，按中性处理；请用快捷动作明确实验条件。'};
    const match=matches[0];
    return match?{action:match[0],reason:`命中“${text.match(match[1])[0]}”，采用「${D.actions[match[0]].name}」规则。`}:{action:'neutral',reason:'未命中已定义词组，状态不变；这不是对句子质量的判断。'};
  }
  function reply(profile,state,scenario,action) {
    if(action==='neutral') return '这句话我还想再确认一下。你能具体解释，或者问问我在担心什么吗？';
    if(action==='rushed') return state.trust<25?'我觉得你没有听见我的顾虑。我现在不想再说更多了。':'你说得很肯定，但我的问题还在。能不能先听我说完？';
    if(action==='boundary'&&profile.privacy>=60) return '谢谢你说明信息的边界。我可以先讲一部分，再决定是否补充。';
    if(action==='boundary') return '虽然还会担心，但你说明了哪些尚不确定，我更愿意继续讨论。';
    if(action==='explain') return state.understanding<60?'这样比刚才好理解。我试着用自己的话说一遍，你帮我确认可以吗？':'这次我听明白了一些。我想确认：理解这个安排，不等于我已经能执行，对吗？';
    const prefix=state.trust<35?'我还需要一点时间，不过可以先说说。':'你愿意听，我放心了一些。';
    const concern=profile.access<40?'最难的是时间和费用，我希望讨论一个做得到的安排。':state.anxiety>65?`我反复想到${scenario.concern}，还是很难放松。`:`我想具体说说${scenario.concern}。`;
    return prefix+concern+(profile.style==='detailed'?' 我还想逐项确认，并把没解决的问题留到下一次。':'');
  }
  function compare(profile,scenario) {
    const sequences={supportive:['empathetic','explain','boundary','empathetic','explain','boundary'],pressure:Array(6).fill('rushed')};
    return Object.fromEntries(Object.entries(sequences).map(([name,actions])=>{const states=[initial(profile)];actions.forEach(action=>states.push(step(profile,states.at(-1),scenario,action)));return [name,{actions,states}];}));
  }
  return {clamp,initial,step,classify,reply,compare,MAX_TURNS};
})();
if(typeof module!=='undefined') module.exports=PatientEngine;
