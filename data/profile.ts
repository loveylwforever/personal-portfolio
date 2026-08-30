export const profile = {
  name: '高健JamieGao',
  initials: 'GJ',
  role: '全栈开发工程师',
  location: '中国 · 上海',
  status: '接受新项目',
  intro: '对技术疯狂热爱，能独立完成复杂应用。',
  email: '214142603@qq.com',
  bio: [
    '从企业系统到金融科技业务，长期做全栈交付：前端体验、后端链路、部署与运维都能独立完成。习惯先把问题拆清楚，再做成稳定能跑的产品。',
    '对新技术保持好奇，但不追热闹。更在意方案是否合理、上线是否稳妥、体验是否顺手。'
  ],
  goal: '把复杂需求做成稳定好用的产品。',
  values: '技术要落到真实价值上，尽量用作品服务更多人。',
  focus: '用 AI 推进各类独立开发，从想法到上线尽量一个人闭环。',
  experience: [
    {
      company: '高伟达',
      title: '高级软件工程师',
      start: '2009.10',
      end: '2015.04',
      current: false,
      details: [
        '长期服务银行核心与支付结算相关系统，覆盖核心维护迭代、账单迁移与新旧系统数据迁移。',
        '参与建行支付结算、农商行新核心改造等项目，完成对账单全套迁移与仿真环境搭建。',
        '深入主机 / 中间件体系（C、ESQL/C、CICS、DB2），具备金融业务与传统核心系统深度经验。'
      ]
    },
    {
      company: '证通股份',
      title: '开发主管',
      start: '2015.04',
      end: '2018.08',
      current: false,
      details: [
        '担任外联服务总线项目负责人 / 开发主管，带队约 12 人建设证通对外枢纽平台。',
        '一端对接券商 / 基金等机构，另一端对接银行、第三方支付、银联、网联等通道。',
        '独立完成网联业务平台、银联快捷支付 2.0 等直连对接，保障多机构接入与投产质量。'
      ]
    },
    {
      company: '中新控股',
      title: '助理经理',
      start: '2018.08',
      end: '2019.09',
      current: false,
      details: [
        '负责支付事业部部分研发管理，主导香港侨达预付费卡系统（自动化发卡与运营支撑）建设。',
        '推动内地 / 香港跨地区协作，覆盖需求、设计、实施与部署全流程。',
        '承担安全审计、渗透测试与上线合规材料准备，推动版本发布与运维流程标准化。'
      ]
    },
    {
      company: '联润信科',
      title: '技术总监',
      start: '2019.09',
      end: '2021.07',
      current: false,
      details: [
        '负责技术团队管理与数据业务产品的架构设计、研发交付与云上运维全流程闭环。',
        '主导服务上云、容器化部署与成本优化，落地多数据源接入、鉴权、限流与熔断策略。',
        '完成数十类数据产品从设计到上线，完善监控告警、应急预案与研发质量把控。'
      ]
    },
    {
      company: '金融壹账通',
      title: '资深开发工程师',
      start: '2021.07',
      end: '至今',
      current: true,
      details: [
        '负责智能语音机器人对话管理中控平台建设与演进，面向金服 / 寿险 / 产险提供外呼与呼入能力。',
        '打通电话平台与 ASR / TTS / NLP / LLM 引擎，支撑贷款前筛、售后回访、营销等场景规模化落地。',
        '建设可观测性与工程化体系，沉淀话术与能力复用，缩短新场景上线周期并减少人工坐席投入。'
      ]
    }
  ],
  social: [
    { label: 'GitHub', url: 'https://github.com/loveylwforever', icon: 'i-lucide-github' },
    { label: 'Bilibili', url: 'https://space.bilibili.com/336117051', icon: 'i-lucide-tv' },
    { label: '小红书', url: 'https://xhslink.cn/o/7oBlcsyyl9z', icon: 'i-lucide-bookmark' }
  ]
} as const

export type Profile = typeof profile
