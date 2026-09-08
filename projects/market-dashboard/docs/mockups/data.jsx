// Mock data shared across web + mobile mocks
// Faithful to FmpQuote / Watchlist shape from the repo

const MOCK_INDICES = [
  { symbol: 'SPY',  short: 'S&P 500',    price: 5847.22, change:  18.43, changePct:  0.32 },
  { symbol: 'QQQ',  short: 'NASDAQ 100', price:  514.78, change:  -1.24, changePct: -0.24 },
  { symbol: 'DIA',  short: 'Dow Jones',  price:  428.91, change:   2.18, changePct:  0.51 },
];

const MOCK_WATCHLIST = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation',         sector: 'Technology',         price: 184.27, change:  6.84, changePct:  3.85, marketCap: 4.51e12, pe: 68.2,  yearHigh: 195.40, yearLow: 86.62 },
  { symbol: 'TSLA', name: 'Tesla, Inc.',                sector: 'Consumer Cyclical',  price: 412.55, change: 11.27, changePct:  2.81, marketCap: 1.32e12, pe: 92.1,  yearHigh: 488.54, yearLow: 178.50 },
  { symbol: 'AAPL', name: 'Apple Inc.',                 sector: 'Technology',         price: 232.18, change:  1.42, changePct:  0.62, marketCap: 3.51e12, pe: 33.4,  yearHigh: 260.10, yearLow: 188.54 },
  { symbol: 'MSFT', name: 'Microsoft Corporation',      sector: 'Technology',         price: 442.71, change: -1.83, changePct: -0.41, marketCap: 3.29e12, pe: 36.8,  yearHigh: 468.35, yearLow: 348.32 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.',             sector: 'Communication Services', price: 198.04, change:  3.18, changePct:  1.63, marketCap: 2.43e12, pe: 24.7, yearHigh: 207.05, yearLow: 130.67 },
  { symbol: 'META', name: 'Meta Platforms, Inc.',       sector: 'Communication Services', price: 612.40, change:  9.21, changePct:  1.53, marketCap: 1.55e12, pe: 27.3, yearHigh: 638.40, yearLow: 414.50 },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.',           sector: 'Consumer Cyclical',  price: 226.85, change: -2.11, changePct: -0.92, marketCap: 2.38e12, pe: 47.2,  yearHigh: 242.06, yearLow: 151.61 },
  { symbol: 'AMD',  name: 'Advanced Micro Devices',     sector: 'Technology',         price: 158.34, change: -3.46, changePct: -2.14, marketCap: 2.56e11, pe: 105.4, yearHigh: 187.28, yearLow:  94.40 },
  { symbol: 'PLTR', name: 'Palantir Technologies',      sector: 'Technology',         price:  82.41, change:  4.27, changePct:  5.46, marketCap: 1.92e11, pe: 348.0, yearHigh:  92.04, yearLow:  20.30 },
  { symbol: 'COIN', name: 'Coinbase Global, Inc.',      sector: 'Financial Services', price: 318.62, change: -8.42, changePct: -2.57, marketCap: 8.21e10, pe: 57.8,  yearHigh: 372.54, yearLow: 142.58 },
];

const MOCK_HOLDINGS = [
  { symbol: 'NVDA', name: 'NVIDIA',     shares: 50,  costBasis: 124.50, currentPrice: 184.27 },
  { symbol: 'AAPL', name: 'Apple',      shares: 30,  costBasis: 198.20, currentPrice: 232.18 },
  { symbol: 'TSLA', name: 'Tesla',      shares: 15,  costBasis: 248.30, currentPrice: 412.55 },
  { symbol: 'GOOGL', name: 'Alphabet',  shares: 25,  costBasis: 168.40, currentPrice: 198.04 },
];

const MOCK_NEWS = [
  { headline: 'NVIDIA 推出新一代 Blackwell B300 GPU，AI 訓練性能再提升 40%', source: 'Reuters',    time: '2 小時前',  sentiment: 'positive' },
  { headline: '聯準會釋放降息訊號，科技股普遍走高',                           source: 'Bloomberg',  time: '4 小時前',  sentiment: 'positive' },
  { headline: '中國半導體禁令擴大，供應鏈緊張持續',                           source: 'WSJ',        time: '6 小時前',  sentiment: 'negative' },
  { headline: 'Q3 財報季開跑，分析師預期整體 EPS 成長 8.4%',                  source: 'CNBC',       time: '8 小時前',  sentiment: 'neutral' },
  { headline: 'AI 資本支出持續攀升，雲端三巨頭年度投資破 3000 億美元',         source: 'Financial Times', time: '12 小時前', sentiment: 'positive' },
];

// 13 AI agents (matches repo: 6 masters + 3 debate + 3 risk + 1 portfolio)
const AGENTS = [
  { id: 'buffett',  group: 'masters',  zh: '巴菲特',     en: 'Buffett',      tagline: '護城河 / ROE / 安全邊際', status: 'complete', conviction: 'BUY',  score: 8.4 },
  { id: 'lynch',    group: 'masters',  zh: '彼得·林奇',  en: 'Lynch',        tagline: 'PEG / 十倍股分類',         status: 'complete', conviction: 'BUY',  score: 7.8 },
  { id: 'wood',     group: 'masters',  zh: '伍德',       en: 'Wood',         tagline: '顛覆式創新 / TAM',          status: 'complete', conviction: 'STRONG BUY', score: 9.1 },
  { id: 'burry',    group: 'masters',  zh: '貝瑞',       en: 'Burry',        tagline: '逆向 / 資產負債表',         status: 'streaming', conviction: 'HOLD', score: 6.2 },
  { id: 'ackman',   group: 'masters',  zh: '艾克曼',     en: 'Ackman',       tagline: '集中持股 / 活動家',         status: 'streaming', conviction: '—', score: null },
  { id: 'taleb',    group: 'masters',  zh: '塔雷伯',     en: 'Taleb',        tagline: '反脆弱 / 黑天鵝抗性',       status: 'pending',   conviction: '—', score: null },
  { id: 'bull',     group: 'debate',   zh: '多方',       en: 'Bull',         tagline: '看多論述',                  status: 'pending',   conviction: '—', score: null },
  { id: 'bear',     group: 'debate',   zh: '空方',       en: 'Bear',         tagline: '看空論述',                  status: 'pending',   conviction: '—', score: null },
  { id: 'manager',  group: 'debate',   zh: '研究主管',   en: 'Manager',      tagline: '多空裁決',                  status: 'pending',   conviction: '—', score: null },
  { id: 'aggressive', group: 'risk',   zh: '激進派',     en: 'Aggressive',   tagline: '高倉位邏輯',                status: 'pending',   conviction: '—', score: null },
  { id: 'conservative', group: 'risk', zh: '保守派',     en: 'Conservative', tagline: '低倉位邏輯',                status: 'pending',   conviction: '—', score: null },
  { id: 'neutral',  group: 'risk',     zh: '中立派',     en: 'Neutral',      tagline: '平衡視角',                  status: 'pending',   conviction: '—', score: null },
  { id: 'portfolio', group: 'pm',      zh: '投組經理',   en: 'PM',           tagline: '最終整合決策',              status: 'pending',   conviction: '—', score: null },
];

// Sparkline points (faux 30-day) — relative
function makeSpark(seed, trend = 0, volatility = 0.04) {
  let v = 100;
  const out = [];
  let s = seed;
  for (let i = 0; i < 30; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = (s / 233280 - 0.5) * 2;
    v = v * (1 + r * volatility + trend * 0.005);
    out.push(v);
  }
  return out;
}

const MOCK_SPARKS = {
  NVDA:  makeSpark(11,  1.2),
  TSLA:  makeSpark(22,  0.8),
  AAPL:  makeSpark(33,  0.3),
  MSFT:  makeSpark(44, -0.2),
  GOOGL: makeSpark(55,  0.6),
  META:  makeSpark(66,  0.7),
  AMZN:  makeSpark(77, -0.4),
  AMD:   makeSpark(88, -0.9),
  PLTR:  makeSpark(99,  2.1),
  COIN:  makeSpark(13, -0.6),
  SPY:   makeSpark(7,   0.4, 0.018),
  QQQ:   makeSpark(8,   0.3, 0.022),
  DIA:   makeSpark(9,   0.5, 0.015),
};

Object.assign(window, { MOCK_INDICES, MOCK_WATCHLIST, MOCK_HOLDINGS, MOCK_NEWS, AGENTS, MOCK_SPARKS, makeSpark });
