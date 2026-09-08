// Mobile (iOS) screens — dashboard, stock detail, deep analysis, portfolio
// Designed at 402×874 (iPhone 16 Pro). Uses Claude Design palette.

function MobileDashboard() {
  const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.shares * h.currentPrice, 0);
  const totalCost = MOCK_HOLDINGS.reduce((s, h) => s + h.shares * h.costBasis, 0);
  const totalPL = totalValue - totalCost;
  const totalPLPct = (totalPL / totalCost) * 100;
  return (
    <MobileShell tab="dashboard">
      <div style={{ padding: '14px 16px 100px', background: '#F4EFE6', minHeight: '100%' }}>
        {/* Greeting */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <div>
            <div style={{ fontSize: 11, color: '#888' }}>4 月 26 日 · 週日</div>
            <h1 style={{ fontSize: 22, margin: '2px 0 0', fontFamily: 'Source Serif 4, Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em' }}>
              早安，Jack
            </h1>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: '#1A1A1A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'Source Serif 4, Georgia, serif' }}>J</div>
        </div>

        {/* Equity hero */}
        <div style={{ background: '#1A1A1A', borderRadius: 18, padding: 18, marginTop: 14, color: '#F4EFE6', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: 10, color: 'rgba(244,239,230,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            投組總市值
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            <span style={{ fontSize: 12, opacity: 0.6 }}>$</span>
            <span style={{ fontSize: 38, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}>
              {fmtMoney(totalValue)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#00d47e' }}>
              +${fmtMoney(totalPL)}
            </span>
            <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: 'rgba(0,212,126,0.2)', color: '#00d47e', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
              +{totalPLPct.toFixed(2)}%
            </span>
          </div>
          {/* mini sparkline */}
          <div style={{ marginTop: 12, opacity: 0.85 }}>
            <Sparkline points={makeSpark(7, 1.5)} color="#CC785C" width={340} height={50} fill />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            {['1D', '1W', '1M', '3M', 'YTD'].map((p, i) => (
              <span key={p} style={{
                padding: '4px 10px', borderRadius: 999,
                background: i === 2 ? 'rgba(204,120,92,0.85)' : 'transparent',
                color: i === 2 ? '#fff' : 'rgba(244,239,230,0.6)',
                fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
              }}>{p}</span>
            ))}
          </div>
        </div>

        {/* Indices row */}
        <div style={{ marginTop: 18, display: 'flex', gap: 8, overflowX: 'auto' }}>
          {MOCK_INDICES.map((q) => {
            const up = q.changePct >= 0;
            const color = up ? '#006e3f' : '#c62828';
            return (
              <div key={q.symbol} style={{ flex: '1 0 110px', background: '#fff', borderRadius: 12, padding: 12, border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 9.5, color: '#888', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{q.short}</div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                  {q.price.toFixed(2)}
                </div>
                <div style={{ fontSize: 10.5, color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                  {fmtPct(q.changePct)}
                </div>
                <div style={{ marginTop: 4 }}>
                  <Sparkline points={MOCK_SPARKS[q.symbol]} color={color} width={92} height={20} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Section: Holdings preview */}
        <SectionHeader title="我的持股" subtitle={`${MOCK_HOLDINGS.length} 檔 · 即時更新`} action="管理" />
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {MOCK_HOLDINGS.map((h, i) => {
            const value = h.shares * h.currentPrice;
            const pl = (h.currentPrice - h.costBasis) * h.shares;
            const plPct = ((h.currentPrice - h.costBasis) / h.costBasis) * 100;
            const up = pl >= 0;
            const color = up ? '#006e3f' : '#c62828';
            return (
              <div key={h.symbol} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)' }}>
                <LogoTile symbol={h.symbol} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{h.symbol}</span>
                    <span style={{ fontSize: 10, color: '#888' }}>· {h.shares} 股</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: '#888', marginTop: 1 }}>市值 ${fmtMoney(value)}</div>
                </div>
                <div style={{ width: 60, height: 22 }}>
                  <Sparkline points={MOCK_SPARKS[h.symbol]} color={color} width={60} height={22} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>${h.currentPrice.toFixed(2)}</div>
                  <div style={{ fontSize: 10.5, color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{fmtPct(plPct)}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section: Watchlist preview */}
        <SectionHeader title="追蹤清單" subtitle="10 支 · 60 秒刷新" action="查看全部" />
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {MOCK_WATCHLIST.slice(0, 5).map((w, i) => {
            const up = w.changePct >= 0;
            const color = up ? '#006e3f' : '#c62828';
            return (
              <div key={w.symbol} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)' }}>
                <LogoTile symbol={w.symbol} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{w.symbol}</div>
                  <div style={{ fontSize: 10, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.name}</div>
                </div>
                <div style={{ width: 50, height: 22 }}>
                  <Sparkline points={MOCK_SPARKS[w.symbol]} color={color} width={50} height={22} />
                </div>
                <div style={{ textAlign: 'right', minWidth: 60 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>${w.price.toFixed(2)}</div>
                  <ChangeBadge pct={w.changePct} size="sm" />
                </div>
              </div>
            );
          })}
        </div>

        {/* News */}
        <SectionHeader title="市場新聞" action="更多" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOCK_NEWS.slice(0, 3).map((n, i) => {
            const sCol = n.sentiment === 'positive' ? '#006e3f' : n.sentiment === 'negative' ? '#c62828' : '#888';
            const sBg  = n.sentiment === 'positive' ? 'rgba(0,212,126,0.1)' : n.sentiment === 'negative' ? 'rgba(255,71,87,0.1)' : 'rgba(0,0,0,0.05)';
            const sLab = n.sentiment === 'positive' ? '正面' : n.sentiment === 'negative' ? '負面' : '中性';
            return (
              <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 14, border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.42 }}>{n.headline}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7 }}>
                  <span style={{ fontSize: 9.5, padding: '2px 7px', borderRadius: 999, color: sCol, background: sBg, fontWeight: 600 }}>{sLab}</span>
                  <span style={{ fontSize: 10, color: '#888' }}>{n.source}</span>
                  <span style={{ fontSize: 10, color: '#bbb' }}>·</span>
                  <span style={{ fontSize: 10, color: '#888' }}>{n.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}

// ── Mobile shell: status bar + content + tab bar ─────────
function MobileShell({ children, tab = 'dashboard', dark = false }) {
  return (
    <div style={{ width: 402, height: 874, background: '#F4EFE6', position: 'relative', overflow: 'hidden', fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif' }}>
      <IOSStatusBar dark={dark} time="9:41" />
      <div style={{ position: 'absolute', top: 50, left: 0, right: 0, bottom: 0, overflowY: 'auto' }}>
        {children}
      </div>
      <MobileTabBar tab={tab} />
    </div>
  );
}

function MobileTabBar({ tab }) {
  const tabs = [
    { id: 'dashboard', label: '儀表板', icon: '◻' },
    { id: 'watchlist', label: '清單',   icon: '☆' },
    { id: 'analysis',  label: '深度分析', icon: '⚛' },
    { id: 'portfolio', label: '持股',   icon: '$' },
    { id: 'profile',   label: '我',     icon: '◯' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'rgba(244,239,230,0.92)',
      backdropFilter: 'blur(20px)',
      borderTop: '0.5px solid rgba(0,0,0,0.1)',
      padding: '8px 0 28px',
      display: 'flex', justifyContent: 'space-around',
    }}>
      {tabs.map((t) => {
        const active = tab === t.id;
        return (
          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 20, color: active ? '#CC785C' : '#888' }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: active ? '#CC785C' : '#888' }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '24px 2px 10px' }}>
      <div>
        <h2 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 17, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
        {subtitle && <div style={{ fontSize: 10.5, color: '#888', marginTop: 1 }}>{subtitle}</div>}
      </div>
      {action && <a style={{ fontSize: 12, color: '#CC785C', fontWeight: 500 }}>{action} ›</a>}
    </div>
  );
}

// ── Mobile stock detail ──────────────────────────────────
function MobileStockDetail() {
  return (
    <MobileShell tab="watchlist">
      <div style={{ background: '#F4EFE6', minHeight: '100%', paddingBottom: 100 }}>
        {/* Header */}
        <div style={{ background: '#E8E2D5', padding: '8px 16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 14, color: '#1A1A1A' }}>‹ 返回</span>
            <span style={{ fontSize: 16, color: '#888' }}>★</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LogoTile symbol="NVDA" size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontFamily: 'Source Serif 4, Georgia, serif', fontWeight: 600, letterSpacing: '-0.01em' }}>NVIDIA Corp.</div>
              <div style={{ fontSize: 11, color: '#888' }}>NVDA · NASDAQ · Semiconductors</div>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }}>$184.27</span>
            <ChangeBadge pct={3.85} />
            <span style={{ fontSize: 12, color: '#006e3f', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>+$6.84</span>
          </div>
        </div>

        {/* Chart */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL'].map((p, i) => (
              <span key={p} style={{
                padding: '5px 10px', fontSize: 11, fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace',
                color: i === 2 ? '#fff' : '#6B6357',
                background: i === 2 ? '#1A1A1A' : 'transparent',
                borderRadius: 6,
              }}>{p}</span>
            ))}
          </div>
          <ChartPlaceholder height={220} accent="#CC785C" priceUp />
        </div>

        {/* Quick stats */}
        <div style={{ padding: '0 16px' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 12, border: '1px solid rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { l: '市值',    v: '$4.51T' },
              { l: 'P/E',    v: '68.2'   },
              { l: '52W 高', v: '$195.4' },
              { l: '52W 低', v: '$86.6'  },
              { l: 'Beta',   v: '1.68'   },
              { l: '股息',   v: '0.04%'  },
            ].map((s) => (
              <div key={s.l} style={{ textAlign: 'center', padding: 6 }}>
                <div style={{ fontSize: 9.5, color: '#888', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.l}</div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Score card */}
        <div style={{ padding: '16px 16px 0' }}>
          <SectionHeader title="綜合評分" subtitle="行業基準調整 · 五維度" />
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>8.4</span>
              <span style={{ fontSize: 12, color: '#888' }}>/ 10</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, padding: '3px 9px', borderRadius: 999, background: '#006e3f', color: '#fff', fontWeight: 700 }}>STRONG</span>
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { l: '獲利能力', v: 9.2 },
                { l: '成長性',   v: 9.5 },
                { l: '估值合理', v: 4.8 },
                { l: '財務健康', v: 8.6 },
                { l: '現金流',   v: 9.0 },
              ].map((d) => {
                const c = d.v >= 7 ? '#006e3f' : d.v >= 5 ? '#CC785C' : '#c62828';
                return (
                  <div key={d.l}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 3 }}>
                      <span style={{ color: '#444' }}>{d.l}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: c }}>{d.v.toFixed(1)}</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(0,0,0,0.05)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${d.v * 10}%`, background: c, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA: Run deep analysis */}
        <div style={{ padding: '20px 16px 0' }}>
          <button style={{
            width: '100%', padding: '14px 16px', borderRadius: 14, border: 'none',
            background: '#1A1A1A', color: '#F4EFE6',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer',
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>深度分析 · 13 位 AI 代理人</div>
              <div style={{ fontSize: 10.5, opacity: 0.6, marginTop: 1 }}>巴菲特・林奇・伍德・貝瑞・艾克曼・塔雷伯…</div>
            </div>
            <span style={{ fontSize: 14, color: '#CC785C' }}>啟動 ›</span>
          </button>
        </div>

        {/* Peer comparison preview */}
        <div style={{ padding: '0 16px' }}>
          <SectionHeader title="同業比較" subtitle="6 檔同業排名" />
          <div style={{ background: '#fff', borderRadius: 14, padding: 12, border: '1px solid rgba(0,0,0,0.05)' }}>
            {[
              { sym: 'NVDA', pe: 68.2, score: 8.4, isMe: true,  rank: 1 },
              { sym: 'TSM',  pe: 28.4, score: 8.0, rank: 2 },
              { sym: 'AVGO', pe: 42.1, score: 7.2, rank: 3 },
              { sym: 'AMD',  pe: 105.4, score: 5.2, rank: 4 },
            ].map((p, i) => (
              <div key={p.sym} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)', background: p.isMe ? 'rgba(204,120,92,0.06)' : 'transparent', margin: '0 -4px', paddingLeft: 8, paddingRight: 8, borderRadius: p.isMe ? 8 : 0 }}>
                <span style={{ fontSize: 10, color: '#888', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, width: 18 }}>#{p.rank}</span>
                <LogoTile symbol={p.sym} size={26} />
                <span style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 12 }}>{p.sym}</span>
                <span style={{ fontSize: 11, color: '#888', fontFamily: 'JetBrains Mono, monospace' }}>P/E {p.pe.toFixed(1)}</span>
                <ScorePill v={p.score} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

// ── Mobile deep analysis ─────────────────────────────────
function MobileDeepAnalysis() {
  return (
    <MobileShell tab="analysis" dark>
      <div style={{ background: '#1A1A1A', color: '#F4EFE6', minHeight: '100%', paddingBottom: 100 }}>
        {/* Header */}
        <div style={{ padding: '14px 16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: '#F4EFE6' }}>‹</span>
            <span style={{ fontSize: 12, color: 'rgba(244,239,230,0.6)' }}>NVDA · 深度分析</span>
            <span style={{ fontSize: 14, color: '#F4EFE6' }}>⋯</span>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9.5, color: '#CC785C', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: '#CC785C', boxShadow: '0 0 8px #CC785C', animation: 'dotPulse 1.5s infinite' }} />
              CLAUDE 4.6 · STREAMING
            </div>
            <h1 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 24, fontWeight: 600, margin: '8px 0 0', letterSpacing: '-0.02em' }}>
              13 位 AI 代理人
            </h1>
            <p style={{ fontSize: 11, color: 'rgba(244,239,230,0.55)', margin: '4px 0 0' }}>
              4 階段 · 預估 2–3 分鐘 · 已執行 38 秒
            </p>
          </div>
        </div>

        {/* Phase progress */}
        <div style={{ padding: '0 16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14 }}>
            {[
              { id: 1, label: '6 位投資大師', count: '3/6', state: 'active' },
              { id: 2, label: '多空辯論', count: '0/3', state: 'pending' },
              { id: 3, label: '三方風險辯論', count: '0/3', state: 'pending' },
              { id: 4, label: '投組經理整合', count: '0/1', state: 'pending' },
            ].map((p, i) => {
              const active = p.state === 'active';
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 999,
                    background: active ? '#CC785C' : 'rgba(255,255,255,0.08)',
                    color: active ? '#fff' : 'rgba(244,239,230,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                  }}>{p.id}</div>
                  <span style={{ flex: 1, fontSize: 12.5, color: active ? '#F4EFE6' : 'rgba(244,239,230,0.5)', fontWeight: active ? 600 : 400 }}>
                    {p.label}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(244,239,230,0.5)' }}>
                    {p.count}
                  </span>
                  {active && (
                    <span style={{ fontSize: 10, color: '#CC785C', fontWeight: 600 }}>RUN</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent stream cards */}
        <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {AGENTS.slice(0, 7).map((a) => <MobileAgentCard key={a.id} a={a} />)}
        </div>
      </div>
    </MobileShell>
  );
}

function MobileAgentCard({ a }) {
  const isActive = a.status === 'streaming';
  const stateColor = a.status === 'complete' ? '#00d47e' : a.status === 'streaming' ? '#CC785C' : 'rgba(244,239,230,0.3)';
  const stateLabel = a.status === 'complete' ? '完成' : a.status === 'streaming' ? '生成中' : '等待';
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', borderRadius: 14,
      border: `1px solid ${isActive ? 'rgba(204,120,92,0.4)' : 'rgba(255,255,255,0.06)'}`,
      padding: 14, color: '#F4EFE6',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: a.group === 'pm' ? '#CC785C' : 'rgba(255,255,255,0.08)',
          color: '#F4EFE6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontFamily: 'Source Serif 4, Georgia, serif', fontWeight: 700,
        }}>{a.zh.slice(0, 1)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, color: 'rgba(244,239,230,0.5)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {{ masters: '投資大師', debate: '多空辯論', risk: '風險辯論', pm: '投組整合' }[a.group]}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Source Serif 4, Georgia, serif' }}>
            {a.zh} <span style={{ fontSize: 10, color: 'rgba(244,239,230,0.4)', fontWeight: 400 }}>· {a.en}</span>
          </div>
        </div>
        {a.score != null && (
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#F4EFE6' }}>
            {a.score.toFixed(1)}
          </span>
        )}
        <span style={{
          fontSize: 9, padding: '2px 7px', borderRadius: 999,
          background: `${stateColor}25`, color: stateColor, fontWeight: 700,
        }}>
          {stateLabel}
        </span>
      </div>
      {a.score != null && (
        <div style={{ marginTop: 10, fontSize: 11.5, lineHeight: 1.45, color: 'rgba(244,239,230,0.75)' }}>
          {a.id === 'buffett' && '寬廣護城河，CUDA 生態鎖客戶。ROE 122% 卓越，建議分批進場。'}
          {a.id === 'lynch' && 'PEG 0.87，AI 顛覆十倍股潛力。屬「快速成長型」分類。'}
          {a.id === 'wood' && 'AI 革命核心，TAM 2030 達 $1.5T，5Y CAGR 38%。'}
          {a.id === 'burry' && '估值偏離歷史均值 +2.4σ，存貨水位異常上升…'}
        </div>
      )}
      {isActive && (
        <div style={{ marginTop: 8, display: 'flex', gap: 4, alignItems: 'center' }}>
          {[0, 1, 2].map((d) => (
            <span key={d} style={{ width: 4, height: 4, borderRadius: 999, background: '#CC785C', opacity: 0.4 + d * 0.2, animation: 'dotPulse 1.2s infinite', animationDelay: `${d * 0.1}s` }} />
          ))}
          <span style={{ fontSize: 10, color: 'rgba(244,239,230,0.5)', marginLeft: 6 }}>正在生成…</span>
        </div>
      )}
    </div>
  );
}

// ── Mobile portfolio ─────────────────────────────────────
function MobilePortfolio() {
  const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.shares * h.currentPrice, 0);
  const totalCost = MOCK_HOLDINGS.reduce((s, h) => s + h.shares * h.costBasis, 0);
  const totalPL = totalValue - totalCost;
  const totalPLPct = (totalPL / totalCost) * 100;

  return (
    <MobileShell tab="portfolio">
      <div style={{ background: '#F4EFE6', minHeight: '100%', paddingBottom: 100, padding: '12px 16px' }}>
        <h1 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 22, fontWeight: 600, margin: '4px 0 12px', letterSpacing: '-0.02em' }}>
          我的持股
        </h1>

        {/* Hero */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 18, border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            總市值
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: '#888' }}>$</span>
            <span style={{ fontSize: 32, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }}>{fmtMoney(totalValue)}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#006e3f', fontFamily: 'JetBrains Mono, monospace' }}>+${fmtMoney(totalPL)}</span>
            <ChangeBadge pct={totalPLPct} size="sm" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <div>
              <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>成本</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>${fmtMoney(totalCost)}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>今日</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#006e3f', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>+$842</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>YTD</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#006e3f', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>+28.4%</div>
            </div>
          </div>
        </div>

        {/* Allocation donut */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 18, border: '1px solid rgba(0,0,0,0.05)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
          <DonutChart data={[
            { name: 'NVDA', count: 9213, color: '#CC785C' },
            { name: 'AAPL', count: 6965, color: '#1A1A1A' },
            { name: 'TSLA', count: 6188, color: '#8B6F47' },
            { name: 'GOOGL', count: 4951, color: '#A85C44' },
          ]} size={130} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {MOCK_HOLDINGS.map((h, i) => {
              const pct = (h.shares * h.currentPrice / totalValue) * 100;
              const colors = ['#CC785C', '#1A1A1A', '#8B6F47', '#A85C44'];
              return (
                <div key={h.symbol} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: colors[i] }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, flex: 1 }}>{h.symbol}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#888' }}>{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Holdings */}
        <SectionHeader title="持股明細" action="＋ 新增" />
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {MOCK_HOLDINGS.map((h, i) => {
            const value = h.shares * h.currentPrice;
            const cost = h.shares * h.costBasis;
            const pl = value - cost;
            const plPct = (pl / cost) * 100;
            const up = pl >= 0;
            const color = up ? '#006e3f' : '#c62828';
            return (
              <div key={h.symbol} style={{ padding: '14px', borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <LogoTile symbol={h.symbol} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 14 }}>{h.symbol}</span>
                      <span style={{ fontSize: 10, color: '#888' }}>· {h.name}</span>
                    </div>
                    <div style={{ fontSize: 10.5, color: '#888', marginTop: 1, fontFamily: 'JetBrains Mono, monospace' }}>
                      {h.shares} 股 @ ${h.costBasis.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                      ${fmtMoney(value)}
                    </div>
                    <div style={{ fontSize: 11, color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                      {up ? '+' : '-'}${fmtMoney(Math.abs(pl))} ({fmtPct(plPct)})
                    </div>
                  </div>
                </div>
                {/* Mini progress bar showing cost vs current */}
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkline points={MOCK_SPARKS[h.symbol]} color={color} width={140} height={24} fill />
                  <div style={{ flex: 1, fontSize: 9, color: '#888', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right' }}>
                    現價 ${h.currentPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}

Object.assign(window, { MobileDashboard, MobileStockDetail, MobileDeepAnalysis, MobilePortfolio });
