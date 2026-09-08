// Web (desktop) dashboard — optimized version of the original repo Dashboard
// Uses Claude Design palette: bg #F4EFE6, fg #1A1A1A, brand #CC785C

const { useState } = React;

function WebDashboard() {
  const [activeTab, setActiveTab] = useState('watchlist'); // watchlist | gainers | sectors
  const totalCost = MOCK_HOLDINGS.reduce((s, h) => s + h.shares * h.costBasis, 0);
  const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.shares * h.currentPrice, 0);
  const totalPL = totalValue - totalCost;
  const totalPLPct = (totalPL / totalCost) * 100;

  return (
    <div style={{
      width: 1440, minHeight: 1100,
      background: '#F4EFE6',
      color: '#1A1A1A',
      fontFamily: '-apple-system, "Inter", system-ui, sans-serif',
      fontSize: 13,
    }}>
      <WebNav />
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '20px 32px 48px' }}>
        {/* Hero strip — indices */}
        <IndicesStrip />

        {/* Portfolio hero — large stat block (the optimization: more dramatic, integrated chart) */}
        <PortfolioHero totalValue={totalValue} totalCost={totalCost} totalPL={totalPL} totalPLPct={totalPLPct} />

        {/* Holdings list + Side panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginTop: 20 }}>
          <HoldingsTable />
          <SidePanel />
        </div>

        {/* Watchlist with tabs */}
        <div style={{ marginTop: 32 }}>
          <WatchlistSection activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Market mover ribbon + News */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginTop: 32 }}>
          <SectorBreakdown />
          <NewsRail />
        </div>
      </div>
    </div>
  );
}

// ── Top nav ──────────────────────────────────────────────────
function WebNav() {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'rgba(244,239,230,0.92)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(0,0,0,0.07)',
    }}>
      <div style={{
        maxWidth: 1360, margin: '0 auto',
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: '#CC785C', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, letterSpacing: '-0.02em',
            }}>US</div>
            <span style={{ fontSize: 17, fontWeight: 600, fontFamily: 'Source Serif 4, Georgia, serif', letterSpacing: '-0.01em' }}>
              US Stock Analyzer
            </span>
          </div>
          <nav style={{ display: 'flex', gap: 4, fontSize: 13 }}>
            {['儀表板', '個股分析', '深度分析', '我的持股', '追蹤清單'].map((it, i) => (
              <a key={it} style={{
                padding: '6px 12px', borderRadius: 6,
                color: i === 0 ? '#1A1A1A' : '#6B6357',
                background: i === 0 ? 'rgba(204,120,92,0.1)' : 'transparent',
                fontWeight: i === 0 ? 600 : 500,
                cursor: 'pointer',
              }}>{it}</a>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SearchBox />
          <button style={{
            padding: '7px 12px', borderRadius: 7,
            border: '1px solid rgba(0,0,0,0.1)',
            background: '#fff',
            color: '#6B6357', fontSize: 12, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6,
            cursor: 'pointer',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.8.9 6.5 2.5"/><polyline points="21 4 21 12 13 12"/></svg>
            刷新
          </button>
          <button style={{
            padding: '7px 14px', borderRadius: 7,
            border: 'none', background: '#CC785C',
            color: '#fff', fontSize: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 5,
            cursor: 'pointer',
          }}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>＋</span> 新增股票
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchBox() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 12px', borderRadius: 7,
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.08)',
      width: 240,
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <span style={{ fontSize: 12, color: '#999', flex: 1 }}>搜尋代號或公司名稱…</span>
      <kbd style={{
        fontSize: 10, color: '#999',
        background: 'rgba(0,0,0,0.05)',
        padding: '1px 5px', borderRadius: 4,
        fontFamily: 'JetBrains Mono, monospace',
      }}>⌘K</kbd>
    </div>
  );
}

// ── Indices strip ────────────────────────────────────────────
function IndicesStrip() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 12, marginBottom: 24,
    }}>
      {MOCK_INDICES.map((q) => {
        const up = q.changePct >= 0;
        const color = up ? '#006e3f' : '#c62828';
        return (
          <div key={q.symbol} style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid rgba(0,0,0,0.06)',
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#888', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {q.short}
                <span style={{ marginLeft: 6, fontFamily: 'JetBrains Mono, monospace', color: '#bbb' }}>{q.symbol}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
                <span style={{
                  fontSize: 22, fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {q.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <ChangeBadge pct={q.changePct} size="sm" />
                <span style={{
                  fontSize: 11, color, opacity: 0.7,
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {q.change >= 0 ? '+' : ''}{q.change.toFixed(2)}
                </span>
              </div>
            </div>
            <div style={{ width: 80, height: 36 }}>
              <Sparkline points={MOCK_SPARKS[q.symbol]} color={color} width={80} height={36} fill />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Portfolio hero ───────────────────────────────────────────
function PortfolioHero({ totalValue, totalCost, totalPL, totalPLPct }) {
  const up = totalPL >= 0;
  const color = up ? '#006e3f' : '#c62828';
  // build 30-day pseudo equity curve
  const equity = makeSpark(7, 1.5, 0.012).map((v) => totalCost + (v - 100) / 100 * totalCost * 1.4);

  return (
    <section style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid rgba(0,0,0,0.06)',
      padding: 24,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24,
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <h2 style={{
            fontSize: 18, fontWeight: 600,
            fontFamily: 'Source Serif 4, Georgia, serif',
            margin: 0, letterSpacing: '-0.01em',
          }}>我的持股</h2>
          <span style={{ fontSize: 12, color: '#888' }}>{MOCK_HOLDINGS.length} 檔 · 即時更新</span>
        </div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 18 }}>
          已實際買入 — 每分鐘自動更新現價、未實現損益、總市值
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 14, color: '#888' }}>$</span>
          <span style={{
            fontSize: 56, fontWeight: 700,
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>{fmtMoney(totalValue, 0)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <span style={{
            fontSize: 16, fontWeight: 600, color,
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {up ? '+' : '-'}${fmtMoney(Math.abs(totalPL))}
          </span>
          <ChangeBadge pct={totalPLPct} />
          <span style={{ fontSize: 11, color: '#888' }}>未實現損益 · 總成本 ${fmtMoney(totalCost)}</span>
        </div>

        {/* Mini stat row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14, marginTop: 22,
          paddingTop: 18, borderTop: '1px solid rgba(0,0,0,0.06)',
        }}>
          {[
            { label: '今日損益', value: '+$842', color: '#006e3f', sub: '+0.86%' },
            { label: '本週',     value: '+$3,420', color: '#006e3f', sub: '+3.51%' },
            { label: '年初至今', value: '+$22,148', color: '#006e3f', sub: '+28.4%' },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                {s.label}
              </div>
              <div style={{
                fontSize: 17, fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                color: s.color,
                marginTop: 3,
              }}>{s.value}</div>
              <div style={{ fontSize: 11, color: s.color, opacity: 0.7, fontFamily: 'JetBrains Mono, monospace' }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equity curve */}
      <div style={{
        background: '#FAF7F0',
        borderRadius: 12,
        padding: 18,
        position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#888', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            投組市值走勢 · 30 天
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['1D', '1W', '1M', '3M', 'YTD'].map((p, i) => (
              <button key={p} style={{
                border: 'none',
                background: i === 2 ? '#1A1A1A' : 'transparent',
                color: i === 2 ? '#fff' : '#6B6357',
                fontSize: 10, fontWeight: 500,
                padding: '3px 8px', borderRadius: 5,
                fontFamily: 'JetBrains Mono, monospace',
                cursor: 'pointer',
              }}>{p}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative', minHeight: 180 }}>
          <Sparkline points={equity} color="#CC785C" width={520} height={180} fill />
          <div style={{
            position: 'absolute', top: 12, right: 60,
            background: '#1A1A1A', color: '#fff',
            padding: '6px 10px', borderRadius: 6,
            fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            ${fmtMoney(totalValue)}
            <div style={{ fontSize: 9, opacity: 0.6, marginTop: 1 }}>2026-04-26 · NOW</div>
          </div>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 10, color: '#aaa',
          fontFamily: 'JetBrains Mono, monospace',
          marginTop: 6,
        }}>
          <span>03-27</span><span>04-05</span><span>04-13</span><span>04-19</span><span>04-26</span>
        </div>
      </div>
    </section>
  );
}

// ── Holdings table ───────────────────────────────────────────
function HoldingsTable() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Source Serif 4, Georgia, serif' }}>
          持股明細
        </span>
        <button style={{
          fontSize: 11, color: '#CC785C', background: 'transparent',
          border: 'none', cursor: 'pointer', fontWeight: 500,
        }}>＋ 新增持股</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#FAF7F0' }}>
            {['代號', '股數', '平均成本', '現價', '市值', '今日', '未實現損益', '走勢'].map((h, i) => (
              <th key={h} style={{
                padding: '8px 12px',
                textAlign: i === 0 ? 'left' : i === 7 ? 'center' : 'right',
                fontSize: 10, fontWeight: 600,
                color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOCK_HOLDINGS.map((h) => {
            const value = h.shares * h.currentPrice;
            const cost = h.shares * h.costBasis;
            const pl = value - cost;
            const plPct = (pl / cost) * 100;
            const dayChg = MOCK_WATCHLIST.find((w) => w.symbol === h.symbol)?.changePct ?? 0;
            const up = pl >= 0;
            const color = up ? '#006e3f' : '#c62828';
            return (
              <tr key={h.symbol} style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <LogoTile symbol={h.symbol} size={28} />
                    <div>
                      <div style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{h.symbol}</div>
                      <div style={{ fontSize: 10, color: '#888' }}>{h.name}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#555' }}>
                  {h.shares}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#888' }}>
                  ${h.costBasis.toFixed(2)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                  ${h.currentPrice.toFixed(2)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                  ${fmtMoney(value)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <ChangeBadge pct={dayChg} size="sm" />
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color, fontWeight: 600 }}>
                  <div>{up ? '+' : ''}${fmtMoney(Math.abs(pl))}</div>
                  <div style={{ fontSize: 10, opacity: 0.75 }}>{fmtPct(plPct)}</div>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <Sparkline points={MOCK_SPARKS[h.symbol]} color={color} width={70} height={22} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Side panel ───────────────────────────────────────────────
function SidePanel() {
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Avg P/E */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', padding: 16 }}>
        <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          清單平均 P/E
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', marginTop: 4, letterSpacing: '-0.02em' }}>
          48.3
        </div>
        <div style={{ fontSize: 11, color: '#888' }}>10 支 · S&P 平均 24.6</div>
      </div>

      {/* Top gainers */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: '#006e3f' }}>▲</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Top 5 漲幅
          </span>
        </div>
        {[...MOCK_WATCHLIST].sort((a, b) => b.changePct - a.changePct).slice(0, 5).map((w) => (
          <div key={w.symbol} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 0', fontSize: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LogoTile symbol={w.symbol} size={20} />
              <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{w.symbol}</span>
            </div>
            <span style={{ color: '#006e3f', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
              {fmtPct(w.changePct)}
            </span>
          </div>
        ))}
      </div>

      {/* Top losers */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: '#c62828' }}>▼</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Top 5 跌幅
          </span>
        </div>
        {[...MOCK_WATCHLIST].sort((a, b) => a.changePct - b.changePct).slice(0, 5).map((w) => (
          <div key={w.symbol} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 0', fontSize: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LogoTile symbol={w.symbol} size={20} />
              <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{w.symbol}</span>
            </div>
            <span style={{ color: '#c62828', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
              {fmtPct(w.changePct)}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ── Watchlist with tabs ──────────────────────────────────────
function WatchlistSection({ activeTab, setActiveTab }) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>
            追蹤清單
          </h2>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
            10 支關注但未持倉的股票 · 60 秒自動刷新
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 8, background: 'rgba(0,0,0,0.05)' }}>
          {[
            { id: 'watchlist', label: '全部 · 10' },
            { id: 'gainers', label: '漲幅' },
            { id: 'sectors', label: '依產業' },
          ].map((t) => (
            <button key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '6px 12px', border: 'none', borderRadius: 6,
                background: activeTab === t.id ? '#fff' : 'transparent',
                color: activeTab === t.id ? '#1A1A1A' : '#6B6357',
                fontSize: 12, fontWeight: 500,
                cursor: 'pointer',
                boxShadow: activeTab === t.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{
        background: '#fff', borderRadius: 12,
        border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#FAF7F0' }}>
              {['代碼', '公司名稱', '現價', '漲跌幅', '30 日走勢', '市值', 'P/E', '52 週區間', ''].map((h, i) => (
                <th key={i} style={{
                  padding: '10px 12px', textAlign: i === 0 || i === 1 ? 'left' : 'right',
                  fontSize: 10, fontWeight: 600, color: '#888',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_WATCHLIST.map((w) => {
              const up = w.changePct >= 0;
              const color = up ? '#006e3f' : '#c62828';
              const range = w.yearHigh - w.yearLow;
              const pos = (w.price - w.yearLow) / range;
              return (
                <tr key={w.symbol} style={{ borderTop: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <LogoTile symbol={w.symbol} size={28} />
                      <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{w.symbol}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: '#555' }}>{w.name}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                    ${w.price.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <ChangeBadge pct={w.changePct} size="sm" />
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                    <Sparkline points={MOCK_SPARKS[w.symbol]} color={color} width={80} height={24} />
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#555' }}>
                    {fmtCap(w.marketCap)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#555' }}>
                    {w.pe.toFixed(1)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-block', width: 90, height: 4,
                      background: 'rgba(0,0,0,0.07)', borderRadius: 2,
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', left: `${pos * 100}%`,
                        top: -3, width: 2, height: 10,
                        background: '#CC785C', borderRadius: 1,
                      }} />
                    </div>
                    <div style={{ fontSize: 9, color: '#888', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                      ${w.yearLow.toFixed(0)} – ${w.yearHigh.toFixed(0)}
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#bbb' }}>
                    <span style={{ fontSize: 14, cursor: 'pointer' }}>›</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Sector breakdown ─────────────────────────────────────────
function SectorBreakdown() {
  const sectors = [
    { name: 'Technology',              count: 5, color: '#CC785C' },
    { name: 'Communication Services',  count: 2, color: '#1A1A1A' },
    { name: 'Consumer Cyclical',       count: 2, color: '#8B6F47' },
    { name: 'Financial Services',      count: 1, color: '#A85C44' },
  ];
  const total = sectors.reduce((s, x) => s + x.count, 0);
  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.06)',
      padding: 24,
    }}>
      <h3 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 16, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>
        產業分佈
      </h3>
      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
        追蹤清單依 GICS 分類佔比
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginTop: 22 }}>
        {/* Donut */}
        <DonutChart data={sectors} size={170} />
        {/* Legend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sectors.map((s) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
              <span style={{ fontSize: 12, color: '#444', flex: 1 }}>{s.name}</span>
              <span style={{ fontSize: 12, color: '#888', fontFamily: 'JetBrains Mono, monospace' }}>
                {s.count} 支
              </span>
              <span style={{ fontSize: 11, color: '#888', fontFamily: 'JetBrains Mono, monospace', width: 40, textAlign: 'right' }}>
                {((s.count / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DonutChart({ data, size = 160 }) {
  const total = data.reduce((s, x) => s + x.count, 0);
  const r = size * 0.42;
  const cx = size / 2, cy = size / 2;
  let cumulative = 0;
  return (
    <svg width={size} height={size}>
      {data.map((d, i) => {
        const portion = d.count / total;
        const start = cumulative * Math.PI * 2 - Math.PI / 2;
        cumulative += portion;
        const end = cumulative * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + r * Math.cos(start);
        const y1 = cy + r * Math.sin(start);
        const x2 = cx + r * Math.cos(end);
        const y2 = cy + r * Math.sin(end);
        const large = portion > 0.5 ? 1 : 0;
        return (
          <path key={i}
            d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
            fill={d.color}
            stroke="#fff" strokeWidth="2.5"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="#fff" />
      <text x={cx} y={cy - 2} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="22" fontWeight="700" fill="#1A1A1A">
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#888">
        股票
      </text>
    </svg>
  );
}

// ── News rail ────────────────────────────────────────────────
function NewsRail() {
  const sentColors = {
    positive: { dot: '#006e3f', label: '正面', bg: 'rgba(0,212,126,0.1)' },
    negative: { dot: '#c62828', label: '負面', bg: 'rgba(255,71,87,0.1)' },
    neutral:  { dot: '#888',    label: '中性', bg: 'rgba(0,0,0,0.05)' },
  };
  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.06)',
      padding: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 16, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>
          市場新聞
        </h3>
        <a style={{ fontSize: 11, color: '#CC785C', fontWeight: 500, cursor: 'pointer' }}>查看全部 →</a>
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' }}>
        {MOCK_NEWS.map((n, i) => {
          const s = sentColors[n.sentiment];
          return (
            <div key={i} style={{
              padding: '12px 0',
              borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.05)',
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: 12.5, color: '#1A1A1A', lineHeight: 1.4, fontWeight: 500 }}>
                {n.headline}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{
                  fontSize: 10, padding: '2px 7px', borderRadius: 999,
                  background: s.bg, color: s.dot, fontWeight: 600,
                }}>{s.label}</span>
                <span style={{ fontSize: 10, color: '#888' }}>{n.source}</span>
                <span style={{ fontSize: 10, color: '#bbb' }}>·</span>
                <span style={{ fontSize: 10, color: '#888' }}>{n.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { WebDashboard });
