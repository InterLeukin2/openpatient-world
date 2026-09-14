'use strict';
// Authored synthetic examples: no real patient data or validated psychometrics.
const PatientData = {
  version: '0.2.0',
  provenance: '项目创作的合成情境；全部参数为演示设定，非实测数据。',
  profiles: [
    {id:'lin',nickname:'小林',title:'慢热的观察者',summary:'担心被忽略，需要时间建立信任。',mbti:'INFP',style:'reserved',trust:40,literacy:55,access:65,anxiety:60,privacy:65,education:'本科',economy:'基本充足',country:'中国',language:'普通话',background:'未设定',scenario:'followup'},
    {id:'chen',nickname:'陈老师',title:'追问依据的人',summary:'熟悉健康信息，希望理解每一步依据。',mbti:'INTJ',style:'direct',trust:45,literacy:85,access:75,anxiety:35,privacy:45,education:'研究生',economy:'较充足',country:'中国',language:'普通话',background:'未设定',scenario:'uncertainty'},
    {id:'zhou',nickname:'小周',title:'被日程挤满的人',summary:'愿意沟通，但时间和费用限制实际选择。',mbti:'unset',style:'direct',trust:65,literacy:60,access:25,anxiety:55,privacy:30,education:'专科',economy:'预算受限',country:'中国',language:'普通话',background:'未设定',scenario:'cost'},
    {id:'an',nickname:'阿安',title:'跨语言的就诊者',summary:'需要更简单的措辞，不代表理解能力较低。',mbti:'ISFJ',style:'reserved',trust:50,literacy:35,access:55,anxiety:65,privacy:50,education:'本科',economy:'基本充足',country:'自定义',language:'中文（非首选语言）',background:'未设定',scenario:'first'},
    {id:'qiao',nickname:'乔乔',title:'带着很多担心',summary:'搜索过大量信息，想逐一确认自己的疑虑。',mbti:'ENFP',style:'detailed',trust:35,literacy:65,access:70,anxiety:85,privacy:40,education:'本科',economy:'基本充足',country:'中国',language:'普通话',background:'未设定',scenario:'uncertainty'},
    {id:'mu',nickname:'阿沐',title:'重视私人边界',summary:'先确认信息用途，再决定愿意说多少。',mbti:'unset',style:'detailed',trust:30,literacy:70,access:60,anxiety:50,privacy:90,education:'自定义',economy:'基本充足',country:'自定义',language:'普通话',background:'未设定',scenario:'first'}
  ],
  scenarios: [
    {id:'followup',name:'复诊与信任',tag:'关系延续',description:'上次就诊的疑问没有完全解决。这一次，患者想知道自己的顾虑是否会被认真对待。',opening:'上次回去以后，我还是有些不确定……不知道这次能不能多问几句。',concern:'上次没被回应的担心',pressure:1,goal:'观察沟通如何改变信任与披露。'},
    {id:'first',name:'初诊与隐私',tag:'信息披露',description:'首次见面需要说明一些私人情况。患者对资料会被谁看到、用于什么目的还不放心。',opening:'这些信息一定要说吗？我想先知道会怎么使用。',concern:'个人信息的用途和边界',pressure:1.1,goal:'观察高隐私顾虑是否得到回应。'},
    {id:'cost',name:'现实条件与选择',tag:'执行障碍',description:'讨论后续安排时，患者担心费用、请假和交通。这里不提供真实检查或治疗方案。',opening:'不是我不想配合，但费用和时间真的有些困难。',concern:'时间、费用和交通安排',pressure:1.2,goal:'区分接受意愿与实际执行条件。'},
    {id:'uncertainty',name:'网络信息与疑虑',tag:'不确定性',description:'患者读到相互矛盾的网络信息，希望得到确定答案。测试解释与绝对保证的不同影响。',opening:'网上说法完全不一样，你能保证我一定没事吗？',concern:'信息冲突，以及得不到确定答案的焦虑',pressure:1.3,goal:'测试如何回应不确定性，而非评估真实疾病风险。'}
  ],
  actions: {
    empathetic:{name:'倾听与共情',text:'我理解你的担心。你最在意哪一部分？我们一起讨论。',trust:9,anxiety:-8,understanding:1},
    explain:{name:'解释与确认',text:'我用简单的话解释，再请你说说自己的理解，好吗？',trust:6,anxiety:-5,understanding:10},
    boundary:{name:'承认不确定性',text:'目前不能保证结果。我会说明已知和未知，也尊重你的隐私与选择。',trust:5,anxiety:-3,understanding:5},
    rushed:{name:'施压与绝对保证',text:'不用担心，保证没事。不要再问了，照做就行。',trust:-13,anxiety:10,understanding:-3},
    neutral:{name:'未匹配／中性',text:'我听到了。',trust:0,anxiety:0,understanding:0}
  },
  layers: [
    {id:'genome',name:'基因组',english:'GENOME',scale:'分子尺度',status:'接口规划',description:'从序列和变异出发，连接特定组织中的调控效应预测。不是从基因直接推导人格或完整病程。',fields:[['sequence / variant','参考序列、变异坐标','未接入'],['tissue_context','组织与细胞背景','未接入'],['regulatory_effect','模型特定的效应输出','无预测数据']],source:'AlphaGenome'},
    {id:'cell',name:'细胞与组织',english:'CELL & TISSUE',scale:'微观尺度',status:'接口规划',description:'细胞状态、微环境与相互作用组成局部系统。粒子是尺度示意，不是真实显微成像或模拟输出。',fields:[['cell_state','细胞状态向量','未接入'],['microenvironment','空间位置、底物与单位','未接入'],['simulation_time','模型定义的时间步','未运行']],source:'PhysiCell / Vivarium'},
    {id:'body',name:'身体状态',english:'PHYSIOLOGY',scale:'个体尺度',status:'接口规划',description:'未来以专病模型连接观测、症状和治疗暴露。当前不生成生命体征、化验结果或疗效预测。',fields:[['observations','观测值、单位、时间','未接入'],['symptoms','症状及感知','仅合成叙事'],['treatment_exposure','实际暴露与时间','未接入']],source:'待选择专病模型'},
    {id:'mind',name:'记忆与人格',english:'MEMORY & SELF',scale:'行为尺度',status:'规则演示',description:'把自述标签、稳定起点和动态状态拆开。信任、焦虑、理解与披露在同一会话内逐轮更新。',fields:[['persona','表达习惯、可选 MBTI','可编辑'],['state','信任、焦虑、理解、披露','启发式 0–100'],['event_history','动作与前后状态','会话内可导出']],source:'PatientSim / IPIP / PerTRAIN'},
    {id:'relation',name:'关系与环境',english:'RELATIONSHIPS',scale:'社会尺度',status:'规则演示',description:'理解背景不等于贴标签。教育、国家与族群仅作上下文；直接控制现实条件与隐私顾虑，不由背景自动赋值。',fields:[['context','教育、经济、语言、国家与背景','自述标签'],['practical_access','时间和费用的执行约束','手动设定'],['privacy_concern','披露的私人边界','手动设定']],source:'本项目显式假设'}
  ],
  research: [
    {name:'PatientSim',area:'患者角色',text:'临床档案与多轴患者角色建模；提供角色一致性评估思路。',boundary:'本页未调用该模型，也未使用 MIMIC 数据。',url:'https://github.com/dek924/PatientSim'},
    {name:'IPIP',area:'人格变量',text:'公共领域人格条目资源，可作为未来维度化测量的起点。',boundary:'本页不是 IPIP 测评，没有常模或人格评分。',url:'https://ipip.ori.org/'},
    {name:'PerTRAIN',area:'动态互动',text:'研究对沟通方式作出人际响应的虚拟患者原型。',boundary:'本页状态权重由项目设定，不是论文参数。',url:'https://doi.org/10.5334/pme.2379'},
    {name:'AlphaGenome',area:'基因调控',text:'序列驱动的功能基因组预测与变异效应分析。',boundary:'不等于完整细胞、人体或人格模拟。',url:'https://www.alphagenomedocs.com/'},
    {name:'PhysiCell',area:'多细胞系统',text:'基于细胞代理的多细胞系统建模框架。',boundary:'需要明确生物系统、参数与独立验证。',url:'https://github.com/MathCancer/PhysiCell'},
    {name:'Vivarium',area:'模型组合',text:'通过过程与状态接口组织多尺度模型。',boundary:'组合接口本身不保证跨尺度预测有效。',url:'https://github.com/vivarium-collective/vivarium-core'}
  ]
};
if (typeof module !== 'undefined') module.exports = PatientData;
