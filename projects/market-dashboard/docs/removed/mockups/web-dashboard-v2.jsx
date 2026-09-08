// Web Dashboard v2 — Bloomberg-Terminal × Claude (beige base)
// 1440 desktop · data-first · high density · monospace numerics

const W2_BG = '#F4EFE6';
const W2_CARD = '#FBF8F1';
const W2_INK = '#1A1A1A';
const W2_MUTED = '#9A8E7C';
const W2_HAIR = 'rgba(0,0,0,0.08)';
const W2_HAIR_SOFT = 'rgba(0,0,0,0.05)';
const W2_BRAND = '#CC785C';
const W2_UP = '#006e3f';
const W2_DOWN = '#c62828';
const W2_UP_NEON = '#00d47e';
const W2_DOWN_NEON = '#ff5b5b';

const w2Mono = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace';
const w2Serif = 'Source Serif 4, "Noto Serif TC", Georgia, serif';
const w2Sans = 'Inter, -apple-system, system-ui, sans-serif';

// ─────────────────────────────────────────────────────────
// Top-level page
// ─────────────────────────────────────────────────────────
function WebDashboardV2() {
  return (
    <div style={{ background: W2_BG, color: W2_INK, fontFamily: w2Sans, minHeight: 1700 }}>
      <W2TickerBar />
      <W2NavBar />
      <W2CommandLine />
      <W2IndicesStrip />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, padding: '20px 32px 32px' }}>
        <main style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <W2PortfolioHero />
          <W2WatchlistTable />
          <W2HoldingsTable />
        </main>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <W2AISummary />
          <W2SectorBreakdown />
          <W2NewsFeed />
        </aside>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Ticker bar (full-width black)
// ─────────────────────────────────────────────────────────
function W2TickerBar() {
  const items = [
    { sym: 'SPY', v: 5847.22, d: 0.32 },
    { sym: 'QQQ', v: 514.78, d: -0.24 },
    { sym: 'DIA', v: 428.91, d: 0.51 },
    { sym: 'IWM', v: 232.54, d: 0.18 },
    { sym: 'VIX', v: 14.82, d: -3.21 },
    { sym: 'US10Y', v: 4.218, d: 0.04 },
    { sym: 'BTC', v: 92341, d: 1.24 },
    { sym: 'ETH', v: 3284, d: 0.81 },
    { sym: 'GOLD', v: 2814, d: 0.42 },
    { sym: 'WTI', v: 71.34, d: -0.81 },
    { sym: 'DXY', v: 104.21, d: 0.12 },
    { sym: 'EURUSD', v: 1.0842, d: -0.08 },
    { sym: 'USDJPY', v: 154.21, d: 0.34 },
  ];
  return (
    <div style={{
      background: '#0E0E0E', borderBottom: '1px solid rgba(255,255,255,0.08)',
      height: 32, display: 'flex', alignItems: 'center',
      whiteSpace: 'nowrap',
    }}>
      <div style={{
        background: W2_BRAND, color: '#fff',
        height: '100%', display: 'inline-flex', alignItems: 'center',
        padding: '0 12px', fontSize: 10, fontWeight: 700,
        fontFamily: w2Mono, letterSpacing: '0.12em',
        flexShrink: 0, position: 'relative', zIndex: 2,
      }}>
        ● LIVE · 09:41:23 EDT
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'inline-flex', animation: 'tickerScroll 60s linear infinite', paddingLeft: 16 }}>
        {[...items, ...items].map((it, i) => {
          const up = it.d >= 0;
          const c = up ? W2_UP_NEON : W2_DOWN_NEON;
          return (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'baseline', gap: 7,
              marginRight: 24, fontSize: 11, fontFamily: w2Mono,
            }}>
              <span style={{ color: '#F4EFE6', fontWeight: 700, letterSpacing: '0.04em' }}>{it.sym}</span>
              <span style={{ color: '#F4EFE6', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                {it.v.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span style={{ color: c, fontWeight: 600 }}>
                {up ? '▲' : '▼'} {Math.abs(it.d).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Top nav — terminal feel
// ─────────────────────────────────────────────────────────
function W2NavBar() {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 28,
      padding: '14px 32px', background: W2_BG,
      borderBottom: '1px solid ' + W2_HAIR,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: w2Serif, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
          US Stock Analyzer
        </span>
        <span style={{ fontSize: 10, fontFamily: w2Mono, color: W2_MUTED, letterSpacing: '0.1em' }}>
          v2.4 · TERMINAL
        </span>
      </div>
      <nav style={{ display: 'flex', gap: 0, marginLeft: 8 }}>
        {[
          { l: '儀表板', active: true },
          { l: '追蹤清單' },
          { l: '深度分析' },
          { l: '持股' },
          { l: '篩選器' },
          { l: '新聞' },
        ].map((t) => (
          <button key={t.l} style={{
            padding: '8px 14px', border: 'none', background: 'transparent',
            fontSize: 12, fontWeight: 600,
            color: t.active ? W2_INK : W2_MUTED,
            borderBottom: '2px solid ' + (t.active ? W2_BRAND : 'transparent'),
            marginBottom: -15,
          }}>{t.l}</button>
        ))}
      </nav>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
        <button style={{
          border: '1px solid ' + W2_HAIR, background: W2_CARD,
          padding: '6px 12px', borderRadius: 6,
          fontSize: 11, fontWeight: 600, fontFamily: w2Mono,
          color: W2_INK, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: W2_UP, boxShadow: `0 0 6px ${W2_UP}` }} />
          已連線 · 60S
        </button>
        <button style={{ border: '1px solid ' + W2_HAIR, background: 'transparent', padding: '6px 10px', borderRadius: 6, fontSize: 12 }}>↻</button>
        <button style={{ border: '1px solid ' + W2_HAIR, background: 'transparent', padding: '6px 10px', borderRadius: 6, fontSize: 12 }}>⌥</button>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: W2_INK, color: W2_BG,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, fontFamily: w2Serif,
        }}>J</div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────
// Bloomberg-style command line
// ─────────────────────────────────────────────────────────
function W2CommandLine() {
  return (
    <div style={{ padding: '14px 32px 4px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        background: W2_INK, color: W2_BG, borderRadius: 8,
        overflow: 'hidden', height: 44,
      }}>
        <div style={{
          padding: '0 14px', height: '100%',
          background: W2_BRAND, color: '#fff',
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: w2Mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
        }}>
          <span>⌕</span><span>CMD</span>
        </div>
        <input
          placeholder="輸入代號或指令... 例：NVDA  ·  TSLA DES  ·  SECTOR TECH  ·  AGENT BUFFETT"
          style={{
            flex: 1, height: '100%', padding: '0 14px',
            background: 'transparent', border: 'none', outline: 'none',
            color: W2_BG, fontSize: 13, fontFamily: w2Mono,
          }}
        />
        <div style={{ display: 'flex', gap: 1, padding: 4, height: '100%' }}>
          {['DES', 'CHART', 'PEERS', 'NEWS', 'AGENTS'].map((k) => (
            <button key={k} style={{
              padding: '0 10px', height: '100%',
              background: 'rgba(255,255,255,0.05)', color: '#F4EFE6',
              border: 'none', borderRadius: 4,
              fontSize: 10, fontWeight: 700, fontFamily: w2Mono, letterSpacing: '0.06em',
            }}>{k} ›</button>
          ))}
        </div>
        <div style={{
          padding: '0 14px', fontSize: 10, fontFamily: w2Mono,
          color: 'rgba(244,239,230,0.5)',
        }}>
          ⌘K
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Indices strip — wide cards with sparklines
// ─────────────────────────────────────────────────────────
function W2IndicesStrip() {
  return (
    <div style={{ padding: '14px 32px 0' }}>
      <div style={{
        background: W2_CARD, borderRadius: 12,
        border: '1px solid ' + W2_HAIR,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      }}>
        {MOCK_INDICES.map((q, i) => {
          const up = q.changePct >= 0;
          const color = up ? W2_UP : W2_DOWN;
          return (
            <div key={q.symbol} style={{
              padding: '14px 18px',
              borderRight: i < 2 ? '1px solid ' + W2_HAIR_SOFT : 'none',
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 12,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: w2Mono, letterSpacing: '0.04em' }}>
                    {q.symbol}
                  </span>
                  <span style={{ fontSize: 10, color: W2_MUTED, fontFamily: w2Mono }}>
                    {q.short}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, fontFamily: w2Mono, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    {q.price.toFixed(2)}
                  </span>
                  <span style={{ fontSize: 12, fontFamily: w2Mono, color, fontWeight: 600 }}>
                    {q.change >= 0 ? '+' : ''}{q.change.toFixed(2)}
                  </span>
                  <span style={{
                    fontSize: 11, fontFamily: w2Mono, fontWeight: 700,
                    background: color, color: '#fff',
                    padding: '2px 6px', borderRadius: 3,
                  }}>
                    {up ? '+' : ''}{q.changePct.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div style={{ alignSelf: 'center' }}>
                <Sparkline points={MOCK_SPARKS[q.symbol]} color={color} width={130} height={44} fill />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Portfolio hero — NAV + chart + KPI
// ─────────────────────────────────────────────────────────
function W2PortfolioHero() {
  const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.shares * h.currentPrice, 0);
  const totalCost = MOCK_HOLDINGS.reduce((s, h) => s + h.shares * h.costBasis, 0);
  const totalPL = totalValue - totalCost;
  const totalPLPct = (totalPL / totalCost) * 100;
  const equity = makeSpark(7, 1.6, 0.014).map((v) => totalCost + (v - 100) / 100 * totalCost * 1.4);

  return (
    <section style={{
      background: W2_CARD, borderRadius: 14, border: '1px solid ' + W2_HAIR,
      overflow: 'hidden',
    }}>
      {/* Top row */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', borderBottom: '1px solid ' + W2_HAIR_SOFT }}>
        {/* NAV block */}
        <div style={{ padding: '20px 24px', borderRight: '1px solid ' + W2_HAIR_SOFT }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: W2_MUTED, fontFamily: w2Mono }}>
            NAV · 投組市值 · USD
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
            <span style={{ fontSize: 16, color: W2_MUTED, fontFamily: w2Mono }}>$</span>
            <span style={{
              fontSize: 52, fontWeight: 700, fontFamily: w2Mono,
              letterSpacing: '-0.03em', lineHeight: 0.95,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {fmtMoney(totalValue)}
            </span>
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: W2_UP, fontFamily: w2Mono }}>
              ▲ ${fmtMoney(totalPL)}
            </span>
            <span style={{
              fontSize: 13, fontWeight: 700, fontFamily: w2Mono,
              background: W2_UP, color: '#fff',
              padding: '4px 8px', borderRadius: 4,
            }}>
              +{totalPLPct.toFixed(2)}%
            </span>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 18, fontSize: 11, fontFamily: w2Mono, color: W2_MUTED }}>
            <span>COST <strong style={{ color: W2_INK, fontWeight: 600 }}>${fmtMoney(totalCost)}</strong></span>
            <span>POS <strong style={{ color: W2_INK, fontWeight: 600 }}>{MOCK_HOLDINGS.length}</strong></span>
            <span>CASH <strong style={{ color: W2_INK, fontWeight: 600 }}>$12,400</strong></span>
          </div>
        </div>

        {/* Equity chart */}
        <div style={{ padding: '14px 20px 6px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: W2_MUTED, fontFamily: w2Mono }}>
              EQUITY CURVE · 30D
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL'].map((p, i) => (
                <button key={p} style={{
                  padding: '4px 10px', borderRadius: 4, border: 'none',
                  fontSize: 11, fontWeight: 700, fontFamily: w2Mono,
                  background: i === 2 ? W2_INK : 'transparent',
                  color: i === 2 ? W2_BG : W2_INK,
                }}>{p}</button>
              ))}
            </div>
          </div>
          <div style={{ height: 130, marginTop: 4, marginLeft: -8, marginRight: -8 }}>
            <Sparkline points={equity} color={W2_BRAND} width={760} height={130} fill />
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {[
          { l: '今日 P/L',   v: '+$842',    p: '+0.31%', up: true },
          { l: '本週 P/L',   v: '+$3,420',  p: '+1.27%', up: true },
          { l: '本月 P/L',   v: '+$8,120',  p: '+3.08%', up: true },
          { l: 'YTD P/L',    v: '+$22,108', p: '+8.95%', up: true },
          { l: 'WIN RATE',   v: '74%',      p: '4 of 4', up: true, mono: true },
          { l: 'SHARPE',     v: '1.84',     p: '優', up: true, mono: true },
        ].map((k, i) => (
          <div key={k.l} style={{
            padding: '12px 16px',
            borderRight: i < 5 ? '1px solid ' + W2_HAIR_SOFT : 'none',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: W2_MUTED, fontFamily: w2Mono }}>
              {k.l}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: w2Mono, color: k.up ? W2_UP : W2_DOWN, marginTop: 4 }}>
              {k.v}
            </div>
            <div style={{ fontSize: 10, color: W2_MUTED, fontFamily: w2Mono, marginTop: 1 }}>
              {k.p}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Watchlist table — terminal style
// ─────────────────────────────────────────────────────────
function W2WatchlistTable() {
  const sorted = [...MOCK_WATCHLIST].sort((a, b) => b.changePct - a.changePct);
  return (
    <section style={{ background: W2_CARD, borderRadius: 14, border: '1px solid ' + W2_HAIR, overflow: 'hidden' }}>
      <W2SectionHeader
        eyebrow="WATCHLIST · 10 ISSUES"
        title="追蹤清單"
        right={
          <div style={{ display: 'flex', gap: 6 }}>
            {['全部', '科技', '消費', '通訊', '金融'].map((c, i) => (
              <button key={c} style={{
                padding: '5px 11px', borderRadius: 999,
                border: '1px solid ' + (i === 0 ? W2_INK : W2_HAIR),
                background: i === 0 ? W2_INK : 'transparent',
                color: i === 0 ? W2_BG : W2_INK,
                fontSize: 11, fontWeight: 600,
              }}>{c}</button>
            ))}
            <button style={{
              padding: '5px 11px', borderRadius: 999,
              border: '1px solid ' + W2_HAIR, background: 'transparent',
              fontSize: 11, fontWeight: 600, color: W2_INK,
            }}>＋ 新增</button>
          </div>
        }
      />
      {/* Table head */}
      <div style={{
        display: 'grid', gridTemplateColumns: '40px 220px 100px 110px 130px 90px 80px 80px 80px 60px',
        padding: '8px 18px', background: W2_INK, color: W2_BG,
        fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: w2Mono,
        gap: 10, alignItems: 'center',
      }}>
        <span>#</span>
        <span>代號 · 名稱</span>
        <span style={{ textAlign: 'right' }}>現價</span>
        <span style={{ textAlign: 'right' }}>漲跌</span>
        <span style={{ textAlign: 'right' }}>30D</span>
        <span style={{ textAlign: 'right' }}>市值</span>
        <span style={{ textAlign: 'right' }}>P/E</span>
        <span style={{ textAlign: 'right' }}>52W H</span>
        <span style={{ textAlign: 'right' }}>52W L</span>
        <span style={{ textAlign: 'right' }}>%</span>
      </div>
      {sorted.map((w, i) => {
        const up = w.changePct >= 0;
        const color = up ? W2_UP : W2_DOWN;
        // 52w position (0..1)
        const range = w.yearHigh - w.yearLow;
        const pos = (w.price - w.yearLow) / range;
        return (
          <div key={w.symbol} style={{
            display: 'grid',
            gridTemplateColumns: '40px 220px 100px 110px 130px 90px 80px 80px 80px 60px',
            alignItems: 'center', gap: 10,
            padding: '12px 18px',
            borderTop: i === 0 ? 'none' : '1px solid ' + W2_HAIR_SOFT,
          }}>
            <span style={{ fontSize: 11, fontFamily: w2Mono, color: W2_MUTED }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <LogoTile symbol={w.symbol} size={32} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, fontFamily: w2Mono, lineHeight: 1.1 }}>{w.symbol}</div>
                <div style={{ fontSize: 11, color: W2_MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {w.name}
                </div>
              </div>
            </div>
            <span style={{ textAlign: 'right', fontSize: 13, fontWeight: 600, fontFamily: w2Mono, fontVariantNumeric: 'tabular-nums' }}>
              {w.price.toFixed(2)}
            </span>
            <span style={{ textAlign: 'right', fontSize: 12, fontFamily: w2Mono, color }}>
              {w.change >= 0 ? '+' : ''}{w.change.toFixed(2)}
            </span>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Sparkline points={MOCK_SPARKS[w.symbol]} color={color} width={120} height={24} fill />
            </div>
            <span style={{ textAlign: 'right', fontSize: 11, fontFamily: w2Mono, color: W2_MUTED }}>
              {fmtCap(w.marketCap)}
            </span>
            <span style={{ textAlign: 'right', fontSize: 11, fontFamily: w2Mono, color: W2_MUTED }}>
              {w.pe.toFixed(1)}
            </span>
            <div style={{ position: 'relative', height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2 }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${pos * 100}%`, background: color, borderRadius: 2,
              }} />
              <div style={{
                position: 'absolute', left: `${pos * 100}%`, top: -2,
                width: 1, height: 8, background: W2_INK,
              }} />
            </div>
            <span style={{ textAlign: 'right', fontSize: 11, fontFamily: w2Mono, color: W2_MUTED }}>
              {w.yearLow.toFixed(0)}
            </span>
            <span style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-block', minWidth: 56, textAlign: 'center',
                padding: '4px 6px', borderRadius: 3,
                background: color, color: '#fff',
                fontSize: 11, fontWeight: 700, fontFamily: w2Mono,
              }}>
                {up ? '+' : ''}{w.changePct.toFixed(2)}
              </span>
            </span>
          </div>
        );
      })}
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Holdings table
// ─────────────────────────────────────────────────────────
function W2HoldingsTable() {
  const colors = [W2_BRAND, W2_INK, '#8B6F47', '#A85C44'];
  const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.shares * h.currentPrice, 0);

  return (
    <section style={{ background: W2_CARD, borderRadius: 14, border: '1px solid ' + W2_HAIR, overflow: 'hidden' }}>
      <W2SectionHeader
        eyebrow="PORTFOLIO · MARK-TO-MKT"
        title="持股管理"
        right={
          <button style={{
            padding: '6px 12px', borderRadius: 6,
            border: '1px solid ' + W2_HAIR, background: W2_INK, color: W2_BG,
            fontSize: 11, fontWeight: 700, fontFamily: w2Mono, letterSpacing: '0.04em',
          }}>＋ 新增持倉</button>
        }
      />
      {/* Allocation bar */}
      <div style={{ padding: '0 18px 14px' }}>
        <div style={{ display: 'flex', height: 8, borderRadius: 2, overflow: 'hidden' }}>
          {MOCK_HOLDINGS.map((h, i) => {
            const pct = (h.shares * h.currentPrice / totalValue) * 100;
            return (
              <div key={h.symbol} style={{
                width: `${pct}%`, background: colors[i],
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 10, fontFamily: w2Mono, color: W2_INK, fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}>
                  {h.symbol} {pct.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '40px 220px 100px 110px 130px 110px 110px 80px',
        padding: '8px 18px', background: W2_INK, color: W2_BG,
        fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: w2Mono,
        gap: 10, alignItems: 'center',
      }}>
        <span>#</span>
        <span>POSITION</span>
        <span style={{ textAlign: 'right' }}>SHARES</span>
        <span style={{ textAlign: 'right' }}>AVG COST</span>
        <span style={{ textAlign: 'right' }}>30D · 現價</span>
        <span style={{ textAlign: 'right' }}>市值</span>
        <span style={{ textAlign: 'right' }}>P/L</span>
        <span style={{ textAlign: 'right' }}>%</span>
      </div>
      {MOCK_HOLDINGS.map((h, i) => {
        const value = h.shares * h.currentPrice;
        const cost = h.shares * h.costBasis;
        const pl = value - cost;
        const plPct = (pl / cost) * 100;
        const up = pl >= 0;
        const color = up ? W2_UP : W2_DOWN;
        return (
          <div key={h.symbol} style={{
            display: 'grid',
            gridTemplateColumns: '40px 220px 100px 110px 130px 110px 110px 80px',
            alignItems: 'center', gap: 10,
            padding: '14px 18px',
            borderTop: i === 0 ? 'none' : '1px solid ' + W2_HAIR_SOFT,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: colors[i] }} />
              <span style={{ fontSize: 11, fontFamily: w2Mono, color: W2_MUTED }}>{i + 1}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LogoTile symbol={h.symbol} size={34} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, fontFamily: w2Mono }}>{h.symbol}</div>
                <div style={{ fontSize: 11, color: W2_MUTED }}>{h.name}</div>
              </div>
            </div>
            <span style={{ textAlign: 'right', fontSize: 12, fontFamily: w2Mono, fontWeight: 600 }}>
              {h.shares.toLocaleString()}
            </span>
            <span style={{ textAlign: 'right', fontSize: 12, fontFamily: w2Mono, color: W2_MUTED }}>
              ${h.costBasis.toFixed(2)}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Sparkline points={MOCK_SPARKS[h.symbol]} color={color} width={120} height={20} />
              <span style={{ fontSize: 12, fontFamily: w2Mono, fontWeight: 700, marginTop: 1 }}>
                ${h.currentPrice.toFixed(2)}
              </span>
            </div>
            <span style={{ textAlign: 'right', fontSize: 13, fontFamily: w2Mono, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              ${fmtMoney(value)}
            </span>
            <span style={{ textAlign: 'right', fontSize: 13, fontFamily: w2Mono, fontWeight: 700, color }}>
              {up ? '+' : ''}${fmtMoney(Math.abs(pl), 0)}
            </span>
            <span style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-block', minWidth: 60, textAlign: 'center',
                padding: '4px 6px', borderRadius: 3,
                background: color, color: '#fff',
                fontSize: 11, fontWeight: 700, fontFamily: w2Mono,
              }}>
                {up ? '+' : ''}{plPct.toFixed(2)}
              </span>
            </span>
          </div>
        );
      })}
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// AI summary card (right rail)
// ─────────────────────────────────────────────────────────
function W2AISummary() {
  return (
    <section style={{
      background: W2_INK, color: W2_BG, borderRadius: 14,
      padding: 18, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: W2_BRAND, fontFamily: w2Mono }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: W2_BRAND, boxShadow: `0 0 8px ${W2_BRAND}`, animation: 'dotPulse 1.5s infinite' }} />
        AI BRIEF · CLAUDE 4.6
      </div>
      <h3 style={{ fontFamily: w2Serif, fontSize: 18, margin: '8px 0 4px', fontWeight: 600, letterSpacing: '-0.01em' }}>
        今日投組摘要
      </h3>
      <div style={{ fontSize: 10, color: 'rgba(244,239,230,0.5)', fontFamily: w2Mono }}>
        09:41:18 EDT · 1,284 TOKENS
      </div>
      <div style={{ fontSize: 12.5, lineHeight: 1.55, marginTop: 12, color: 'rgba(244,239,230,0.92)' }}>
        投組受惠於 <strong style={{ color: '#fff' }}>NVDA Blackwell B300 發表</strong>（+3.85%）與半導體類股普遍走強。TSLA 受 Robotaxi 預期支撐 +2.81%。
        <br/><br/>
        建議關注：<strong style={{ color: W2_BRAND }}>持倉集中於 AI 主題（68%）</strong>，可考慮分散至 healthcare 或 consumer staples。
      </div>
      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { l: 'BUY', v: 8, c: W2_UP_NEON },
          { l: 'HOLD', v: 2, c: W2_MUTED },
          { l: 'SELL', v: 0, c: W2_DOWN_NEON },
        ].map((k) => (
          <div key={k.l} style={{
            padding: '10px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ fontSize: 9, fontFamily: w2Mono, color: 'rgba(244,239,230,0.5)', fontWeight: 700, letterSpacing: '0.1em' }}>
              {k.l}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: w2Mono, color: k.c, marginTop: 2 }}>
              {k.v}
            </div>
          </div>
        ))}
      </div>
      <button style={{
        width: '100%', marginTop: 14, padding: '11px 14px',
        background: W2_BRAND, color: '#fff', border: 'none', borderRadius: 8,
        fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span>啟動 13 代理人深度分析</span>
        <span>→</span>
      </button>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Sector breakdown — horizontal bars (no donut slop)
// ─────────────────────────────────────────────────────────
function W2SectorBreakdown() {
  const sectors = [
    { name: 'Technology',    pct: 50, count: 5, color: W2_BRAND },
    { name: 'Communication', pct: 20, count: 2, color: W2_INK },
    { name: 'Cons. Cyclical', pct: 20, count: 2, color: '#8B6F47' },
    { name: 'Financial',     pct: 10, count: 1, color: '#A85C44' },
  ];
  return (
    <section style={{ background: W2_CARD, borderRadius: 14, border: '1px solid ' + W2_HAIR, overflow: 'hidden' }}>
      <W2SectionHeader eyebrow="ALLOCATION · GICS" title="產業分佈" />
      <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {sectors.map((s) => (
          <div key={s.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: W2_INK, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                {s.name}
              </span>
              <span style={{ fontFamily: w2Mono, color: W2_MUTED }}>
                {s.count} · <strong style={{ color: W2_INK }}>{s.pct}%</strong>
              </span>
            </div>
            <div style={{ height: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
              <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{
        padding: '12px 18px', borderTop: '1px solid ' + W2_HAIR_SOFT,
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        background: 'rgba(0,0,0,0.02)',
      }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: w2Mono, color: W2_MUTED, fontWeight: 700, letterSpacing: '0.1em' }}>HHI INDEX</div>
          <div style={{ fontSize: 16, fontFamily: w2Mono, fontWeight: 700 }}>3,400</div>
          <div style={{ fontSize: 10, color: W2_DOWN, fontFamily: w2Mono }}>偏集中</div>
        </div>
        <div>
          <div style={{ fontSize: 9, fontFamily: w2Mono, color: W2_MUTED, fontWeight: 700, letterSpacing: '0.1em' }}>VS S&P 500</div>
          <div style={{ fontSize: 16, fontFamily: w2Mono, fontWeight: 700, color: W2_UP }}>+12.3%</div>
          <div style={{ fontSize: 10, color: W2_MUTED, fontFamily: w2Mono }}>YTD 超額</div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// News feed (right rail)
// ─────────────────────────────────────────────────────────
function W2NewsFeed() {
  const sentColors = {
    positive: { bar: W2_UP, label: '正面' },
    negative: { bar: W2_DOWN, label: '負面' },
    neutral:  { bar: W2_MUTED, label: '中立' },
  };
  return (
    <section style={{ background: W2_CARD, borderRadius: 14, border: '1px solid ' + W2_HAIR, overflow: 'hidden' }}>
      <W2SectionHeader eyebrow="NEWSWIRE · LIVE" title="市場新聞" right={
        <span style={{ fontSize: 10, fontFamily: w2Mono, color: W2_MUTED, fontWeight: 600 }}>
          每 5 分鐘更新
        </span>
      } />
      {MOCK_NEWS.slice(0, 6).map((n, i) => {
        const s = sentColors[n.sentiment] || sentColors.neutral;
        return (
          <div key={i} style={{
            padding: '11px 18px',
            borderTop: i === 0 ? 'none' : '1px solid ' + W2_HAIR_SOFT,
            display: 'grid', gridTemplateColumns: '3px 1fr', gap: 10,
          }}>
            <div style={{ background: s.bar, borderRadius: 2 }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: W2_MUTED, fontFamily: w2Mono, letterSpacing: '0.04em' }}>
                  {n.source.toUpperCase()}
                </span>
                <span style={{ fontSize: 9.5, color: W2_MUTED }}>·</span>
                <span style={{ fontSize: 9.5, color: W2_MUTED }}>{n.time}</span>
                <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: s.bar, fontFamily: w2Mono }}>
                  {s.label}
                </span>
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.4, fontWeight: 500, color: W2_INK }}>
                {n.headline}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Section header — shared
// ─────────────────────────────────────────────────────────
function W2SectionHeader({ eyebrow, title, right }) {
  return (
    <div style={{
      padding: '14px 18px 12px',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      borderBottom: '1px solid ' + W2_HAIR_SOFT,
    }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: W2_BRAND, fontFamily: w2Mono }}>
          {eyebrow}
        </div>
        <h3 style={{ fontFamily: w2Serif, fontSize: 18, fontWeight: 600, margin: '4px 0 0', letterSpacing: '-0.01em' }}>
          {title}
        </h3>
      </div>
      {right}
    </div>
  );
}

Object.assign(window, { WebDashboardV2 });
