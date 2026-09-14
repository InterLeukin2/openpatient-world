const test=require('node:test');
const assert=require('node:assert/strict');
const D=require('../docs/data.js');
const E=require('../docs/engine.js');

test('dataset IDs, counts, references and numeric bounds',()=>{
  assert.equal(D.profiles.length,6);assert.equal(D.scenarios.length,4);assert.equal(D.layers.length,5);
  for(const collection of [D.profiles,D.scenarios,D.layers])assert.equal(new Set(collection.map(x=>x.id)).size,collection.length);
  D.profiles.forEach(p=>{['trust','literacy','access','anxiety','privacy'].forEach(k=>assert.ok(Number.isInteger(p[k])&&p[k]>=0&&p[k]<=100));assert.ok(D.scenarios.some(s=>s.id===p.scenario));});
});
test('known cumulative transitions, derived metrics and input immutability',()=>{
  const p=D.profiles[0],s=D.scenarios[0],before=E.initial(p),copy=JSON.stringify(before);
  assert.deepEqual(before,{turn:0,trust:40,anxiety:60,understanding:55,disclosure:19,readiness:49});
  const next=E.step(p,before,s,'empathetic');assert.equal(next.trust,49);assert.equal(next.anxiety,52);assert.equal(next.understanding,56);
  assert.equal(E.step(p,next,s,'rushed').trust,36);assert.equal(JSON.stringify(before),copy);
});
test('every profile, scenario, action stays bounded and stops at 12',()=>{
  for(const p of D.profiles)for(const s of D.scenarios)for(const action of Object.keys(D.actions)){
    let state=E.initial(p);for(let i=0;i<20;i++){state=E.step(p,state,s,action);Object.entries(state).filter(([k])=>k!=='turn').forEach(([,v])=>assert.ok(Number.isInteger(v)&&v>=0&&v<=100));}
    assert.equal(state.turn,12);assert.deepEqual(E.step(p,state,s,action),state);
  }
});
test('A/B is deterministic, same origin and does not mutate profile',()=>{
  const p=D.profiles[0],s=D.scenarios[0],copy=JSON.stringify(p),result=E.compare(p,s);
  assert.deepEqual(result,E.compare(p,s));assert.equal(JSON.stringify(p),copy);
  assert.deepEqual(result.supportive.states[0],result.pressure.states[0]);assert.equal(result.supportive.states.length,7);
  assert.equal(result.supportive.states.at(-1).trust,86);assert.equal(result.pressure.states.at(-1).trust,0);
});
test('context labels and MBTI never affect numeric behavior',()=>{
  const p=D.profiles[0],other={...p,mbti:'ENTJ',education:'不同教育',economy:'其他',country:'其他国家',language:'其他语言',background:'其他背景'};
  assert.deepEqual(E.compare(p,D.scenarios[0]),E.compare(other,D.scenarios[0]));
});
test('text matching, conflicts, no match and branch responses',()=>{
  assert.equal(E.classify('你担心什么？我们一起讨论').action,'empathetic');
  assert.equal(E.classify('我来解释这个意思').action,'explain');
  assert.equal(E.classify('目前无法保证结果，存在未知').action,'boundary');
  assert.equal(E.classify('保证没事，照做就行').action,'rushed');
  assert.equal(E.classify('不确定，但是保证没事').action,'neutral');
  assert.equal(E.classify('hello there').action,'neutral');
  const p=D.profiles[5],s=D.scenarios[1];assert.match(E.reply(p,E.initial(p),s,'boundary'),/信息的边界/);
});
