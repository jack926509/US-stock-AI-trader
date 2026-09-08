// Web stock detail page — TradingView slot, peer comparison, score card, deep analysis (13 agents)

function WebStockDetail() {
  return (
    <div style={{
      width: 1440, minHeight: 1400,
      background: '#F4EFE6', color: '#1A1A1A',
      fontFamily: '-apple-system, "Inter", system-ui, sans-serif', fontSize: 13,
    }}>
      <WebNav />
      <StockHeader />
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '20px 32px 48px' }}>
        {/* Chart + tech analysis */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
          <div>
            <ChartToolbar />
            <ChartPlaceholder height={460} accent="#CC785C" priceUp />
          </div>
          <TechAnalysisCard />
        </div>

        {/* Peer + Score + News */}
        <section style={{ marginTop: 36 }}>
          <h2 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>
            同業比較與評分
          </h2>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2, marginBottom: 16 }}>
            與同產業公司關鍵指標對比，自動換算 0–10 分綜合評分
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
            <PeerComparisonTable />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ScoreCard />
              <PeerNewsList />
            </div>
          </div>
        </section>

        {/* Deep analysis — 13 agents */}
        <section style={{ marginTop: 40 }}>
          <DeepAnalysisHeader />
          <PhaseProgress />
          <AgentGrid />
        </section>
      </div>
    </div>
  );
}

function StockHeader() {
  return (
    <div style={{ background: '#E8E2D5', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '20px 32px' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        <a style={{ fontSize: 11, color: '#6B6357', display: 'inline-flex', alignItems: 'center', gap: 4 }}>← 返回追蹤清單</a>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginTop: 12 }}>
          <LogoTile symbol="NVDA" size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 28, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
                NVIDIA Corporation
              </h1>
              <span style={{ background: 'rgba(0,0,0,0.08)', padding: '3px 8px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#444' }}>NVDA</span>
              <span style={{ fontSize: 11, color: '#6B6357' }}>NASDAQ</span>
              <span style={{ fontSize: 11, color: '#6B6357' }}>↗</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B6357' }}>Technology · Semiconductors · United States</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }}>
              $184.27
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: 13, color: '#006e3f', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>+6.84 (+3.85%)</span>
              <ChangeBadge pct={3.85} size="sm" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 22, fontSize: 11, paddingTop: 6 }}>
            <div><div style={{ color: '#888' }}>市值</div><div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>$4.51T</div></div>
            <div><div style={{ color: '#888' }}>Beta</div><div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>1.68</div></div>
            <div><div style={{ color: '#888' }}>P/E</div><div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>68.2</div></div>
            <div><div style={{ color: '#888' }}>52W</div><div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>$86.6 – $195.4</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartToolbar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'ALL'].map((t, i) => (
          <button key={t} style={{
            padding: '5px 10px', border: 'none', borderRadius: 6,
            background: i === 5 ? '#1A1A1A' : 'transparent',
            color: i === 5 ? '#fff' : '#6B6357',
            fontSize: 11, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {['MA', 'RSI', 'MACD', 'Vol'].map((m, i) => (
          <button key={m} style={{
            padding: '4px 9px', borderRadius: 5,
            border: '1px solid rgba(0,0,0,0.08)',
            background: i === 0 ? 'rgba(204,120,92,0.1)' : '#fff',
            color: i === 0 ? '#CC785C' : '#6B6357',
            fontSize: 10, fontWeight: 600, cursor: 'pointer',
          }}>+ {m}</button>
        ))}
      </div>
    </div>
  );
}

function TechAnalysisCard() {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#6B6357', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>
        技術分析 · TradingView
      </div>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', padding: 18 }}>
        {/* Big gauge */}
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <Gauge value={0.78} label="強烈買進" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
          {[
            { label: '賣出', count: 2, color: '#c62828' },
            { label: '中立', count: 4, color: '#888' },
            { label: '買進', count: 18, color: '#006e3f' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center', padding: 10, background: '#FAF7F0', borderRadius: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          {[
            { name: 'RSI (14)', value: '68.4', sig: '中立' },
            { name: 'MACD', value: '+2.81', sig: '買進' },
            { name: 'MA (50)', value: '171.30', sig: '買進' },
            { name: 'MA (200)', value: '142.18', sig: '買進' },
            { name: 'Stoch (14)', value: '85.2', sig: '超買' },
          ].map((r, i) => (
            <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 11.5, borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)' }}>
              <span style={{ color: '#444' }}>{r.name}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#1A1A1A', fontWeight: 600 }}>{r.value}</span>
              <span style={{ fontSize: 10, color: r.sig === '買進' ? '#006e3f' : r.sig === '超買' ? '#c62828' : '#888', fontWeight: 600 }}>{r.sig}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Gauge({ value, label }) {
  const angle = -90 + value * 180;
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg width="160" height="100" viewBox="0 0 160 100">
        <path d="M 20 90 A 60 60 0 0 1 140 90" stroke="rgba(0,0,0,0.08)" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M 20 90 A 60 60 0 0 1 140 90" stroke="url(#g)" strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={`${value * 188} 200`} />
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0" stopColor="#c62828" />
            <stop offset="0.5" stopColor="#CC785C" />
            <stop offset="1" stopColor="#006e3f" />
          </linearGradient>
        </defs>
        <line x1="80" y1="90" x2={80 + 50 * Math.cos((angle * Math.PI) / 180)} y2={90 + 50 * Math.sin((angle * Math.PI) / 180)} stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="80" cy="90" r="5" fill="#1A1A1A" />
      </svg>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#006e3f', fontFamily: 'Source Serif 4, Georgia, serif', marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

function PeerComparisonTable() {
  const peers = [
    { sym: 'NVDA', name: 'NVIDIA',     pe: 68.2, pb: 52.4, ps: 33.1, roe: 122.4, gm: 75.8, growth: 78.0, rank: 1, score: 8.4, isMe: true },
    { sym: 'AMD',  name: 'AMD',        pe:105.4, pb:  4.2, ps:  6.8, roe:   8.4, gm: 51.2, growth: 24.0, rank: 4, score: 5.2 },
    { sym: 'INTC', name: 'Intel',      pe: null, pb:  1.0, ps:  1.8, roe:  -2.1, gm: 41.0, growth:-12.0, rank: 6, score: 3.1 },
    { sym: 'TSM',  name: 'TSMC',       pe: 28.4, pb:  6.8, ps: 11.2, roe:  28.4, gm: 53.4, growth: 32.0, rank: 2, score: 8.0 },
    { sym: 'AVGO', name: 'Broadcom',   pe: 42.1, pb: 12.4, ps: 18.3, roe:  21.0, gm: 65.8, growth: 51.0, rank: 3, score: 7.2 },
    { sym: 'QCOM', name: 'Qualcomm',   pe: 18.4, pb:  6.7, ps:  4.8, roe:  35.2, gm: 56.4, growth:  9.0, rank: 5, score: 6.4 },
  ];
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontWeight: 600, fontSize: 14 }}>同業 6 檔比較</span>
        <span style={{ fontSize: 10, color: '#888' }}>FMP v4 · 自動匹配</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
        <thead>
          <tr style={{ background: '#FAF7F0' }}>
            {['排名', '代號', 'P/E', 'P/B', 'P/S', 'ROE', '毛利率', '營收成長', '評分'].map((h, i) => (
              <th key={i} style={{
                padding: '8px 10px', textAlign: i <= 1 ? 'left' : 'right',
                fontSize: 9.5, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {peers.map((p) => (
            <tr key={p.sym} style={{ borderTop: '1px solid rgba(0,0,0,0.04)', background: p.isMe ? 'rgba(204,120,92,0.06)' : 'transparent' }}>
              <td style={{ padding: '10px', textAlign: 'left', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: p.rank === 1 ? '#CC785C' : '#888' }}>
                #{p.rank}
              </td>
              <td style={{ padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LogoTile symbol={p.sym} size={22} />
                  <div>
                    <div style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: p.isMe ? '#CC785C' : '#1A1A1A' }}>{p.sym}</div>
                    <div style={{ fontSize: 9, color: '#888' }}>{p.name}</div>
                  </div>
                </div>
              </td>
              {['pe','pb','ps','roe','gm','growth'].map((k) => (
                <td key={k} style={{ padding: '10px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#444' }}>
                  {p[k] == null ? '—' : (k === 'roe' || k === 'gm' || k === 'growth' ? `${p[k].toFixed(1)}%` : p[k].toFixed(1))}
                </td>
              ))}
              <td style={{ padding: '10px', textAlign: 'right' }}>
                <ScorePill v={p.score} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScorePill({ v }) {
  const color = v >= 8 ? '#006e3f' : v >= 6 ? '#CC785C' : v >= 4 ? '#888' : '#c62828';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: `${color}15`, color, fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
      {v.toFixed(1)}
    </span>
  );
}

function ScoreCard() {
  const dims = [
    { label: '獲利能力',     v: 9.2, color: '#006e3f' },
    { label: '成長性',       v: 9.5, color: '#006e3f' },
    { label: '估值合理度',   v: 4.8, color: '#CC785C' },
    { label: '財務健康',     v: 8.6, color: '#006e3f' },
    { label: '現金流',       v: 9.0, color: '#006e3f' },
  ];
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'Source Serif 4, Georgia, serif' }}>綜合評分</span>
        <span style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>SECTOR-ADJUSTED</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
        <span style={{ fontSize: 44, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }}>8.4</span>
        <span style={{ fontSize: 13, color: '#888' }}>/ 10</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#006e3f', fontWeight: 600 }}>STRONG</span>
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {dims.map((d) => (
          <div key={d.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
              <span style={{ color: '#444' }}>{d.label}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: d.color }}>{d.v.toFixed(1)}</span>
            </div>
            <div style={{ height: 5, background: 'rgba(0,0,0,0.05)', borderRadius: 3 }}>
              <div style={{ height: '100%', width: `${d.v * 10}%`, background: d.color, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PeerNewsList() {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', padding: 16 }}>
      <div style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
        近期新聞
      </div>
      {MOCK_NEWS.slice(0, 3).map((n, i) => (
        <div key={i} style={{ padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 11.5, fontWeight: 500, lineHeight: 1.4 }}>{n.headline}</div>
          <div style={{ fontSize: 9.5, color: '#888', marginTop: 4 }}>{n.source} · {n.time}</div>
        </div>
      ))}
    </div>
  );
}

function DeepAnalysisHeader() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2218 100%)',
      borderRadius: 16, padding: '24px 28px',
      color: '#F4EFE6', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#CC785C', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: '#CC785C', boxShadow: '0 0 8px #CC785C' }} />
            CLAUDE SONNET 4.6 · STREAMING
          </div>
          <h2 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 26, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
            13 位 AI 代理人深度分析
          </h2>
          <p style={{ fontSize: 12, color: 'rgba(244,239,230,0.65)', margin: '4px 0 0' }}>
            6 位投資大師 · 多空辯論 · 三方風險辯論 · 投組經理整合 — 預估 2–3 分鐘
          </p>
        </div>
        <button style={{
          padding: '10px 18px', borderRadius: 8, border: 'none',
          background: '#CC785C', color: '#fff',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 6px 16px rgba(204,120,92,0.4)',
        }}>
          重新生成 ↻
        </button>
      </div>
    </div>
  );
}

function PhaseProgress() {
  const phases = [
    { id: 1, label: '6 位投資大師', status: 'active', count: '4/6' },
    { id: 2, label: '多空辯論',   status: 'pending', count: '0/3' },
    { id: 3, label: '風險辯論',   status: 'pending', count: '0/3' },
    { id: 4, label: '投組整合',   status: 'pending', count: '0/1' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, marginBottom: 22 }}>
      {phases.map((p, i) => (
        <React.Fragment key={p.id}>
          <div style={{
            flex: 1, padding: '14px 18px', borderRadius: 10,
            background: p.status === 'active' ? '#fff' : 'rgba(255,255,255,0.5)',
            border: `1.5px solid ${p.status === 'active' ? '#CC785C' : 'rgba(0,0,0,0.07)'}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: p.status === 'active' ? '#CC785C' : 'rgba(0,0,0,0.08)',
              color: p.status === 'active' ? '#fff' : '#888',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
            }}>{p.id}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: p.status === 'active' ? '#1A1A1A' : '#888' }}>{p.label}</div>
              <div style={{ fontSize: 10, color: '#888', fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>
                {p.status === 'active' ? `運行中 · ${p.count}` : `等待中 · ${p.count}`}
              </div>
            </div>
            {p.status === 'active' && (
              <div style={{ display: 'flex', gap: 2 }}>
                {[0, 1, 2].map((d) => (
                  <span key={d} style={{ width: 4, height: 4, borderRadius: 999, background: '#CC785C', opacity: 0.4 + d * 0.2 }} />
                ))}
              </div>
            )}
          </div>
          {i < phases.length - 1 && <span style={{ color: '#bbb', fontSize: 14 }}>→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function AgentGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {AGENTS.map((a) => <AgentCard key={a.id} a={a} />)}
    </div>
  );
}

function AgentCard({ a }) {
  const isMaster = a.group === 'masters';
  const stateColor = a.status === 'complete' ? '#006e3f' : a.status === 'streaming' ? '#CC785C' : '#bbb';
  const stateLabel = a.status === 'complete' ? '完成' : a.status === 'streaming' ? '串流中' : '等待中';
  const groupLabel = { masters: '投資大師', debate: '多空辯論', risk: '風險辯論', pm: '投組整合' }[a.group];
  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      border: `1px solid ${a.status === 'streaming' ? 'rgba(204,120,92,0.4)' : 'rgba(0,0,0,0.06)'}`,
      padding: 16, position: 'relative',
      boxShadow: a.status === 'streaming' ? '0 0 0 3px rgba(204,120,92,0.08)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 8,
          background: isMaster ? '#1A1A1A' : a.group === 'pm' ? '#CC785C' : '#E8E2D5',
          color: isMaster || a.group === 'pm' ? '#fff' : '#1A1A1A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontFamily: 'Source Serif 4, Georgia, serif', fontWeight: 700,
        }}>{a.zh.slice(0, 1)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9.5, color: '#888', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {groupLabel}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'Source Serif 4, Georgia, serif', marginTop: 1 }}>
            {a.zh} <span style={{ fontSize: 10, color: '#888', fontWeight: 400 }}>· {a.en}</span>
          </div>
          <div style={{ fontSize: 10.5, color: '#666', marginTop: 2 }}>{a.tagline}</div>
        </div>
        <span style={{
          fontSize: 9, padding: '2px 7px', borderRadius: 999,
          background: `${stateColor}15`, color: stateColor, fontWeight: 600, whiteSpace: 'nowrap',
        }}>
          {a.status === 'streaming' && <span style={{ display: 'inline-block', width: 4, height: 4, borderRadius: 999, background: stateColor, marginRight: 3, animation: 'dotPulse 1s infinite' }} />}
          {stateLabel}
        </span>
      </div>
      {a.score != null ? (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }}>
              {a.score.toFixed(1)}
            </span>
            <span style={{ fontSize: 10, color: '#888' }}>/ 10</span>
            <span style={{
              marginLeft: 'auto', fontSize: 10, padding: '2px 7px', borderRadius: 4,
              fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
              background: a.conviction === 'STRONG BUY' ? '#006e3f' : a.conviction === 'BUY' ? 'rgba(0,212,126,0.15)' : 'rgba(0,0,0,0.06)',
              color: a.conviction === 'STRONG BUY' ? '#fff' : a.conviction === 'BUY' ? '#006e3f' : '#666',
            }}>{a.conviction}</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, lineHeight: 1.5, color: '#444' }}>
            {a.id === 'buffett' && '寬廣護城河，CUDA 生態鎖定客戶。ROE 122% 卓越，現價接近合理估值上緣，建議分批進場。'}
            {a.id === 'lynch' && 'PEG 0.87，AI 顛覆十倍股潛力，消費者熟悉度高（學生用戶）。屬「快速成長型」分類。'}
            {a.id === 'wood' && 'AI 革命核心受益者，TAM 2030 達 $1.5T，5Y CAGR 預估 38%。Innovation > 估值。'}
            {a.id === 'burry' && '估值偏離歷史均值 +2.4σ，存貨水位異常上升，需密切關注超大型客戶集中度風險...'}
            {a.id === 'ackman' && '資料分析中…評估管理層績效、ROIC 趨勢與資本配置效率…'}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.05)', fontSize: 11, color: '#bbb', fontStyle: 'italic' }}>
          {a.status === 'pending' ? '等待前一階段完成…' : '初始化中…'}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { WebStockDetail });
