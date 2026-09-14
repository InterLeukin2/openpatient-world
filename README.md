# OpenPatient World

一个从生物过程到个人体验的患者世界模型概念网站。

**在线体验：https://interleukin2.github.io/openpatient-world/**

## 当前可用

- 五层可点击图谱：基因组、细胞与组织、身体状态、记忆与人格、关系与环境。
- 创建自述驱动的概念分身：昵称、可选 MBTI、表达习惯、信任、健康信息理解、现实执行条件。
- 六轮规则驱动的模拟沟通。状态在当前体验内累积，可重置。
- 导出已应用的设定、状态及对话为 JSON。
- GitHub Issue 模板：角色构想和模型接入提案。

这是概念原型，不是临床系统、经过校准的个体数字孪生或人格测评。没有调用 LLM、基因组、细胞、生理或药代模型。没有跨就诊长期记忆、账户、数据库或自动自我改进。参考项目不是已集成服务，也不代表合作。

## 运行与部署

零运行时依赖、无需构建。

```sh
python3 -m http.server 4173 --directory docs --bind 127.0.0.1
```

浏览器访问 http://127.0.0.1:4173 。GitHub Pages 使用 `main` 分支的 `/docs` 目录。

## 规则与数据边界

所有分数是 0–100 的设计示意，不是概率、常模分数或临床指标。

- 邀请表达：信任增加 `round(9 + (100 - healthLiteracy) * 0.06)`。
- 催促下结论：信任减少 14。
- 表达意愿：`0.7 * trust + styleOffset`，其中直接型 22、详细型 16、慢热型 7。
- 方案接受意愿：`0.35 * trust + 0.2 * healthLiteracy + 0.45 * practicalAccess`。
- 所有结果四舍五入并限制在 0–100。MBTI 不参与数值计算。

这些权重仅用于演示反馈关系，尚无实证校准。接受意愿不等于实际依从性，页面也不预测疗效。

输入与对话仅存于当前页面内存。无分析追踪、第三方脚本、模型 API、Cookie 或 localStorage。刷新即清空。导出生成本地文件，不上传。托管服务仍可能记录普通 HTTP 访问日志。跳转 GitHub 后适用 GitHub 的数据处理方式；不要提交真实病历或基因数据。

## 研究方向

以可替换的专病模型连接生物状态和患者行为；用实际观测校准模型；验证信息披露与关系记忆；冻结版本用于公平对照。每个模块需要定义输入输出、单位、时间尺度、证据、适用范围和不确定性。

参考： [PatientSim](https://github.com/dek924/PatientSim)、[IPIP](https://ipip.ori.org/)、[PerTRAIN](https://doi.org/10.5334/pme.2379)、[AlphaGenome](https://www.nature.com/articles/s41586-025-10014-0)、[PhysiCell](https://github.com/MathCancer/PhysiCell)、[Vivarium](https://github.com/vivarium-collective/vivarium-core)。

贡献方式见 [CONTRIBUTING.md](CONTRIBUTING.md)。代码采用 MIT 许可证；外部论文、量表和工具保留各自许可。本项目不复制其量表题目或模型代码。
