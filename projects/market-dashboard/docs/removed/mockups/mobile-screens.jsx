// Mobile (iOS) screens — Bloomberg-Terminal-inspired, beige base
// Designed at 402 × 874 (iPhone 16 Pro)
// Density: high (data-first), but with strong typographic hierarchy

const MOBILE_W = 402;

// ── Shell ────────────────────────────────────────────────
function MobileShell({ children, tab = 'dashboard', showTicker = true, padTop = 0 }) {
  return (
    <div style={{
      width: MOBILE_W, height: 874,
      background: '#F4EFE6', position: 'relative', overflow: 'hidden',
      fontFamily: '-apple-system, "SF Pro Text", "Inter", system-ui, sans-serif',
      color: '#1A1A1A',
    }}>
      <IOSStatusBar dark={false} time="9:41" />
      {showTicker && <TickerBar />}
      <div style={{
        position: 'absolute',
        top: 50 + (showTicker ? 28 : 0) + padTop,
        left: 0, right: 0, bottom: 0,
        overflowY: 'auto',
      }}>
        {children}
      </div>
      <MobileTabBar tab={tab} />
    </div>
  );
}

// Bloomberg-style scrolling ticker bar
function TickerBar() {
  const items = [
    { sym: 'SPY', v: 5847.22, d: 0.32 },
    { sym: 'QQQ', v: 514.78, d: -0.24 },
    { sym: 'DIA', v: 428.91, d: 0.51 },
    { sym: 'IWM', v: 232.54, d: 0.18 },
    { sym: 'VIX', v: 14.82, d: -3.21 },
    { sym: '10Y', v: 4.218, d: 0.04, isPct: true },
    { sym: 'BTC', v: 92341, d: 1.24 },
    { sym: 'GOLD', v: 2814, d: 0.42 },
    { sym: 'WTI', v: 71.34, d: -0.81 },
    { sym: 'DXY', v: 104.21, d: 0.12 },
  ];
  return (
    <div style={{
      position: 'absolute', top: 50, left: 0, right: 0, height: 28,
      background: '#1A1A1A',
      display: 'flex', alignItems: 'center',
      overflow: 'hidden', whiteSpace: 'nowrap',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      zIndex: 5,
    }}>
      <div style={{ display: 'inline-flex', animation: 'tickerScroll 40s linear infinite', paddingLeft: 12 }}>
        {[...items, ...items].map((it, i) => {
          const up = it.d >= 0;
          const c = up ? '#00d47e' : '#ff5b5b';
          return (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, marginRight: 18, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
              <span style={{ color: '#F4EFE6', fontWeight: 700, letterSpacing: '0.04em' }}>{it.sym}</span>
              <span style={{ color: '#F4EFE6', fontWeight: 500 }}>
                {it.v.toLocaleString(undefined, { maximumFractionDigits: it.isPct ? 3 : 2 })}
              </span>
              <span style={{ color: c, fontWeight: 600 }}>
                {up ? '▲' : '▼'} {Math.abs(it.d).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Tab bar — 5 tabs, beige glass, terminal-style minimal icons
function MobileTabBar({ tab }) {
  const tabs = [
    { id: 'dashboard', label: '儀表板', icon: <IconGrid /> },
    { id: 'watchlist', label: '清單',   icon: <IconList /> },
    { id: 'analysis',  label: '分析',   icon: <IconAtom /> },
    { id: 'portfolio', label: '持股',   icon: <IconWallet /> },
    { id: 'profile',   label: '我',     icon: <IconUser /> },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'rgba(244,239,230,0.94)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '0.5px solid rgba(0,0,0,0.08)',
      padding: '6px 8px 26px',
      display: 'flex', justifyContent: 'space-around',
      zIndex: 10,
    }}>
      {tabs.map((t) => {
        const active = tab === t.id;
        return (
          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 8px' }}>
            <span style={{ color: active ? '#CC785C' : '#9A8E7C' }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: active ? '#CC785C' : '#9A8E7C', letterSpacing: '0.02em' }}>
              {t.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab bar icons (custom-drawn, terminal-thin) ──────────
function IconGrid() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" /><rect x="12" y="3" width="7" height="7" /><rect x="3" y="12" width="7" height="7" /><rect x="12" y="12" width="7" height="7" /></svg>;
}
function IconList() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="4" y1="6" x2="18" y2="6"/><line x1="4" y1="11" x2="18" y2="11"/><line x1="4" y1="16" x2="13" y2="16"/></svg>;
}
function IconAtom() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="2"/><ellipse cx="11" cy="11" rx="9" ry="3.5"/><ellipse cx="11" cy="11" rx="9" ry="3.5" transform="rotate(60 11 11)"/><ellipse cx="11" cy="11" rx="9" ry="3.5" transform="rotate(120 11 11)"/></svg>;
}
function IconWallet() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="6" width="16" height="12" rx="2"/><path d="M3 9h13a2 2 0 0 1 0 4H3"/><circle cx="15" cy="11" r="0.8" fill="currentColor"/></svg>;
}
function IconUser() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="8" r="3.5"/><path d="M4 19c0-3.5 3-6 7-6s7 2.5 7 6"/></svg>;
}

// ── Page header (small, dense) ───────────────────────────
function PageHeader({ title, subtitle, right }) {
  return (
    <div style={{ padding: '10px 16px 6px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        <h1 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {title}
        </h1>
        {subtitle && <div style={{ fontSize: 11, color: '#9A8E7C', marginTop: 3, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.02em' }}>
          {subtitle}
        </div>}
      </div>
      {right}
    </div>
  );
}

// Section label — small caps, terminal feel
function SectionLabel({ children, action, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', margin: '20px 0 8px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1A1A1A' }}>
          {children}
        </span>
        {count != null && <span style={{ fontSize: 10, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>
          [{count}]
        </span>}
      </div>
      {action && <span style={{ fontSize: 11, color: '#CC785C', fontWeight: 600 }}>{action}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 01. DASHBOARD — Terminal-style command center
// ─────────────────────────────────────────────────────────
function MobileDashboard() {
  const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.shares * h.currentPrice, 0);
  const totalCost = MOCK_HOLDINGS.reduce((s, h) => s + h.shares * h.costBasis, 0);
  const totalPL = totalValue - totalCost;
  const totalPLPct = (totalPL / totalCost) * 100;
  const equity = makeSpark(7, 1.5, 0.012).map((v) => totalCost + (v - 100) / 100 * totalCost * 1.4);

  return (
    <MobileShell tab="dashboard">
      <div style={{ paddingBottom: 100 }}>
        <PageHeader
          title="儀表板"
          subtitle="2026-04-26  09:41:23  EDT"
          right={
            <button style={{
              border: '1px solid rgba(0,0,0,0.12)', background: 'transparent',
              borderRadius: 8, padding: '6px 10px',
              fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
              color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: '#00a86b', boxShadow: '0 0 6px #00a86b' }} />
              LIVE
            </button>
          }
        />

        {/* Hero — combined NAV / equity card */}
        <div style={{ padding: '0 16px', marginTop: 6 }}>
          <div style={{
            background: '#FBF8F1',
            borderRadius: 14,
            border: '1px solid rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}>
            {/* Top: NAV */}
            <div style={{ padding: '14px 16px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A8E7C' }}>
                  NAV · 投組市值
                </span>
                <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: '#9A8E7C' }}>
                  USD · UNRLZ
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>$</span>
                <span style={{ fontSize: 38, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtMoney(totalValue)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#006e3f' }}>
                  ▲ ${fmtMoney(totalPL)}
                </span>
                <span style={{ fontSize: 12, color: '#006e3f', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                  +{totalPLPct.toFixed(2)}%
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>
                  COST ${fmtMoney(totalCost)}
                </span>
              </div>
            </div>

            {/* Equity sparkline */}
            <div style={{ padding: '0 8px', position: 'relative', height: 90 }}>
              <Sparkline points={equity} color="#CC785C" width={MOBILE_W - 32} height={90} fill />
              <div style={{
                position: 'absolute', top: 4, right: 14,
                fontSize: 9, color: '#9A8E7C',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                30D · INTRADAY
              </div>
            </div>

            {/* Period selector */}
            <div style={{ display: 'flex', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              {['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL'].map((p, i) => (
                <button key={p} style={{
                  flex: 1, padding: '8px 0', border: 'none',
                  background: i === 2 ? '#1A1A1A' : 'transparent',
                  color: i === 2 ? '#F4EFE6' : '#1A1A1A',
                  fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
                  borderRight: i < 6 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                }}>{p}</button>
              ))}
            </div>

            {/* KPI bar */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              borderTop: '1px solid rgba(0,0,0,0.06)',
            }}>
              {[
                { l: '今日',  v: '+$842',    p: '+0.31%', up: true },
                { l: '本週',  v: '+$3.4K',   p: '+1.27%', up: true },
                { l: '本月',  v: '+$8.1K',   p: '+3.08%', up: true },
                { l: 'YTD',   v: '+$22.1K',  p: '+8.95%', up: true },
              ].map((k, i) => (
                <div key={k.l} style={{
                  padding: '10px 8px',
                  borderRight: i < 3 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 9, color: '#9A8E7C', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>{k.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: k.up ? '#006e3f' : '#c62828', marginTop: 3 }}>
                    {k.v}
                  </div>
                  <div style={{ fontSize: 10, color: k.up ? '#006e3f' : '#c62828', fontFamily: 'JetBrains Mono, monospace', opacity: 0.75 }}>
                    {k.p}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick action row */}
        <div style={{ padding: '14px 16px 0', display: 'flex', gap: 8 }}>
          {[
            { l: '搜尋', icon: '⌕' },
            { l: '篩選', icon: '⛬' },
            { l: 'AI 問答', icon: '✦' },
            { l: '提醒', icon: '◔' },
          ].map((a) => (
            <button key={a.l} style={{
              flex: 1, padding: '10px 4px', borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.08)',
              background: '#FBF8F1', color: '#1A1A1A',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              fontSize: 11, fontWeight: 600,
            }}>
              <span style={{ fontSize: 16, color: '#CC785C' }}>{a.icon}</span>
              {a.l}
            </button>
          ))}
        </div>

        {/* Indices grid — terminal-style */}
        <SectionLabel count={3} action="更多 ›">主要指數</SectionLabel>
        <div style={{ padding: '0 16px' }}>
          <div style={{
            background: '#FBF8F1', borderRadius: 12,
            border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden',
          }}>
            {MOCK_INDICES.map((q, i) => {
              const up = q.changePct >= 0;
              const color = up ? '#006e3f' : '#c62828';
              return (
                <div key={q.symbol} style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 80px 90px',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.06)',
                  gap: 10,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{q.symbol}</div>
                    <div style={{ fontSize: 9, color: '#9A8E7C' }}>{q.short}</div>
                  </div>
                  <div style={{ height: 28 }}>
                    <Sparkline points={MOCK_SPARKS[q.symbol]} color={color} width={130} height={28} fill />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                      {q.price.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 10, color, fontFamily: 'JetBrains Mono, monospace' }}>
                      {q.change >= 0 ? '+' : ''}{q.change.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block', minWidth: 64, padding: '3px 8px',
                      borderRadius: 4, fontSize: 11, fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace',
                      background: color, color: '#fff',
                      textAlign: 'center',
                    }}>
                      {fmtPct(q.changePct).replace('+', '+')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Movers */}
        <SectionLabel action="查看全部 ›" count="10">市場異動 · 追蹤清單</SectionLabel>
        <div style={{ padding: '0 16px' }}>
          <div style={{ background: '#FBF8F1', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '32px 1fr 70px 70px 60px',
              padding: '8px 14px', background: '#F0EADF',
              fontSize: 9, fontWeight: 700, color: '#9A8E7C',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              alignItems: 'center', gap: 8,
            }}>
              <span></span>
              <span>代號 · 名稱</span>
              <span style={{ textAlign: 'right' }}>現價</span>
              <span style={{ textAlign: 'right' }}>30D</span>
              <span style={{ textAlign: 'right' }}>%</span>
            </div>
            {[...MOCK_WATCHLIST].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 6).map((w, i) => {
              const up = w.changePct >= 0;
              const color = up ? '#006e3f' : '#c62828';
              return (
                <div key={w.symbol} style={{
                  display: 'grid', gridTemplateColumns: '32px 1fr 70px 70px 60px',
                  alignItems: 'center', gap: 8,
                  padding: '10px 14px',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)',
                }}>
                  <LogoTile symbol={w.symbol} size={26} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.1 }}>{w.symbol}</div>
                    <div style={{ fontSize: 9.5, color: '#9A8E7C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.name}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                    {w.price.toFixed(2)}
                  </div>
                  <div>
                    <Sparkline points={MOCK_SPARKS[w.symbol]} color={color} width={64} height={20} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                      color: '#fff', background: color,
                      padding: '2px 6px', borderRadius: 3,
                      display: 'inline-block', minWidth: 50, textAlign: 'center',
                    }}>
                      {up ? '+' : ''}{w.changePct.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* News rail — compact */}
        <SectionLabel action="更多 ›" count="5">市場新聞</SectionLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 1, background: '#FBF8F1', marginLeft: 16, marginRight: 16, borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {MOCK_NEWS.slice(0, 4).map((n, i) => {
            const sCol = n.sentiment === 'positive' ? '#006e3f' : n.sentiment === 'negative' ? '#c62828' : '#9A8E7C';
            return (
              <div key={i} style={{ padding: '10px 14px', borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ width: 4, height: 4, borderRadius: 999, background: sCol }} />
                  <span style={{ fontSize: 9.5, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                    {n.source.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 9.5, color: '#9A8E7C' }}>·</span>
                  <span style={{ fontSize: 9.5, color: '#9A8E7C' }}>{n.time}</span>
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.4, fontWeight: 500, color: '#1A1A1A' }}>
                  {n.headline}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}

// ─────────────────────────────────────────────────────────
// 02. WATCHLIST — Bloomberg-style sortable table
// ─────────────────────────────────────────────────────────
function MobileWatchlist() {
  const [sort, setSort] = React.useState('change');
  const [filter, setFilter] = React.useState('all');

  return (
    <MobileShell tab="watchlist">
      <div style={{ paddingBottom: 100 }}>
        <PageHeader
          title="追蹤清單"
          subtitle="10 ISSUES · REFRESH 60S · LAST 09:41:23"
          right={
            <button style={{
              border: '1px solid rgba(0,0,0,0.12)', background: '#FBF8F1',
              borderRadius: 8, width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#1A1A1A',
            }}>＋</button>
          }
        />

        {/* Filter chips */}
        <div style={{ padding: '4px 16px 8px', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {[
            { id: 'all', l: '全部', n: 10 },
            { id: 'tech', l: '科技', n: 5 },
            { id: 'consumer', l: '消費', n: 2 },
            { id: 'comm', l: '通訊', n: 2 },
            { id: 'fin', l: '金融', n: 1 },
          ].map((f) => (
            <button key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                flex: '0 0 auto', padding: '5px 11px', borderRadius: 999,
                border: '1px solid ' + (filter === f.id ? '#1A1A1A' : 'rgba(0,0,0,0.12)'),
                background: filter === f.id ? '#1A1A1A' : 'transparent',
                color: filter === f.id ? '#F4EFE6' : '#1A1A1A',
                fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
              {f.l} {f.n}
            </button>
          ))}
        </div>

        {/* Sort header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '120px 1fr 60px 56px',
          padding: '8px 16px', background: '#1A1A1A', color: '#F4EFE6',
          fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          gap: 8, alignItems: 'center',
        }}>
          <span>代號 · 名稱</span>
          <span style={{ textAlign: 'right' }}>現價 · 30D</span>
          <span style={{ textAlign: 'right' }}>市值</span>
          <span style={{ textAlign: 'right' }}>% ↓</span>
        </div>

        {/* Rows */}
        <div style={{ background: '#FBF8F1' }}>
          {[...MOCK_WATCHLIST].sort((a, b) => b.changePct - a.changePct).map((w, i) => {
            const up = w.changePct >= 0;
            const color = up ? '#006e3f' : '#c62828';
            return (
              <div key={w.symbol} style={{
                display: 'grid', gridTemplateColumns: '120px 1fr 60px 56px',
                gap: 8, alignItems: 'center',
                padding: '11px 16px',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <LogoTile symbol={w.symbol} size={28} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.1 }}>{w.symbol}</div>
                    <div style={{ fontSize: 9.5, color: '#9A8E7C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.sector}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <Sparkline points={MOCK_SPARKS[w.symbol]} color={color} width={110} height={20} />
                  <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                    {w.price.toFixed(2)}
                  </span>
                </div>
                <div style={{ textAlign: 'right', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#9A8E7C' }}>
                  {fmtCap(w.marketCap)}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                    color: '#fff', background: color,
                    padding: '3px 5px', borderRadius: 3,
                    display: 'inline-block', minWidth: 48, textAlign: 'center',
                  }}>
                    {up ? '+' : ''}{w.changePct.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating sort/filter bar */}
        <div style={{ padding: '14px 16px 0', display: 'flex', gap: 8 }}>
          <button style={{
            flex: 1, padding: '11px', borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.1)', background: '#FBF8F1',
            fontSize: 12, fontWeight: 600,
          }}>↕ 排序：漲跌幅 ↓</button>
          <button style={{
            flex: 1, padding: '11px', borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.1)', background: '#FBF8F1',
            fontSize: 12, fontWeight: 600,
          }}>⛬ 進階篩選</button>
        </div>
      </div>
    </MobileShell>
  );
}

// ─────────────────────────────────────────────────────────
// 03. STOCK DETAIL — Bloomberg-style data sheet
// ─────────────────────────────────────────────────────────
function MobileStockDetail() {
  const [tab, setTab] = React.useState('overview');
  return (
    <MobileShell tab="watchlist" showTicker={false}>
      <div style={{ paddingBottom: 100 }}>
        {/* Header bar */}
        <div style={{
          padding: '8px 16px 12px', borderBottom: '1px solid rgba(0,0,0,0.07)',
          background: '#FBF8F1',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>‹</span>
            <div style={{ display: 'flex', gap: 14, fontSize: 14, color: '#1A1A1A' }}>
              <span>★</span>
              <span>⤴</span>
              <span>⋯</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <LogoTile symbol="NVDA" size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.02em' }}>NVDA</span>
                <span style={{ fontSize: 10, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>US · NASDAQ · TECH</span>
              </div>
              <div style={{ fontSize: 13, color: '#1A1A1A', fontFamily: 'Source Serif 4, Georgia, serif', fontWeight: 500 }}>
                NVIDIA Corporation
              </div>
            </div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em', lineHeight: 1 }}>
                184.27
              </div>
              <div style={{ fontSize: 10.5, color: '#9A8E7C', marginTop: 3, fontFamily: 'JetBrains Mono, monospace' }}>
                USD · LAST 09:41:18 EDT
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-block', padding: '4px 10px', borderRadius: 4,
                fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                background: '#006e3f', color: '#fff',
              }}>
                ▲ +6.84  +3.85%
              </span>
              <div style={{ fontSize: 10, color: '#9A8E7C', marginTop: 3, fontFamily: 'JetBrains Mono, monospace' }}>
                VOL 412.8M · AVG 285.1M
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ padding: '10px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            {['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y'].map((p, i) => (
              <span key={p} style={{
                padding: '4px 8px', fontSize: 10.5, fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                color: i === 2 ? '#F4EFE6' : '#1A1A1A',
                background: i === 2 ? '#1A1A1A' : 'transparent',
                borderRadius: 4,
              }}>{p}</span>
            ))}
          </div>
          <ChartPlaceholder height={210} accent="#CC785C" priceUp />
        </div>

        {/* Quote sheet — Bloomberg style 2-col */}
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{
            background: '#FBF8F1', borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.08)',
            display: 'grid', gridTemplateColumns: '1fr 1fr',
          }}>
            {[
              ['OPEN',     '180.42'],
              ['HIGH',     '186.10'],
              ['LOW',      '178.95'],
              ['PREV CLS', '177.43'],
              ['52W H',    '195.40'],
              ['52W L',    ' 86.62'],
              ['MKT CAP',  '$4.51T'],
              ['P/E TTM',  ' 68.20'],
              ['EPS TTM',  '  2.70'],
              ['DIV YLD',  '  0.04%'],
              ['BETA',     '  1.68'],
              ['SHARES',   '24.5B'],
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '7px 12px',
                borderBottom: i < 10 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                borderRight: i % 2 === 0 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                <span style={{ color: '#9A8E7C', fontWeight: 700, letterSpacing: '0.04em' }}>{r[0]}</span>
                <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{r[1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab strip */}
        <div style={{ marginTop: 18, borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', padding: '0 16px', gap: 18 }}>
          {[
            { id: 'overview', l: '概覽' },
            { id: 'tech', l: '技術' },
            { id: 'fin', l: '財務' },
            { id: 'peer', l: '同業' },
            { id: 'news', l: '新聞' },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '10px 0', border: 'none', background: 'transparent',
              fontSize: 12, fontWeight: 600,
              color: tab === t.id ? '#1A1A1A' : '#9A8E7C',
              borderBottom: '2px solid ' + (tab === t.id ? '#CC785C' : 'transparent'),
              marginBottom: -1,
            }}>{t.l}</button>
          ))}
        </div>

        {/* Tab content — Score */}
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{
            background: '#FBF8F1', borderRadius: 12,
            border: '1px solid rgba(0,0,0,0.08)', padding: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A8E7C' }}>
                綜合評分 · SECTOR-ADJUSTED
              </span>
              <span style={{ fontSize: 10, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>5/5 維度</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 38, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em', lineHeight: 1 }}>8.4</span>
              <span style={{ fontSize: 13, color: '#9A8E7C' }}>/ 10</span>
              <span style={{
                marginLeft: 'auto', fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                background: '#006e3f', color: '#fff',
                padding: '4px 10px', borderRadius: 4,
              }}>STRONG</span>
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
                  <div key={d.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: '#1A1A1A', width: 70 }}>{d.l}</span>
                    <div style={{ flex: 1, height: 5, background: 'rgba(0,0,0,0.05)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${d.v * 10}%`, background: c, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: c, fontSize: 12, width: 28, textAlign: 'right' }}>
                      {d.v.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '14px 16px 0' }}>
          <button style={{
            width: '100%', padding: '14px 16px', borderRadius: 12, border: 'none',
            background: '#1A1A1A', color: '#F4EFE6',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#CC785C' }}>
                AI ANALYSIS · CLAUDE 4.6
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 3, fontFamily: 'Source Serif 4, Georgia, serif' }}>
                啟動 13 位 AI 代理人深度分析
              </div>
            </div>
            <span style={{ fontSize: 16, color: '#CC785C' }}>→</span>
          </button>
        </div>

        {/* Peer mini-table */}
        <SectionLabel count={6}>同業排行</SectionLabel>
        <div style={{ padding: '0 16px' }}>
          <div style={{ background: '#FBF8F1', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {[
              { rank: 1, sym: 'NVDA', pe: 68.2, score: 8.4, isMe: true },
              { rank: 2, sym: 'TSM',  pe: 28.4, score: 8.0 },
              { rank: 3, sym: 'AVGO', pe: 42.1, score: 7.2 },
              { rank: 4, sym: 'AMD',  pe: 105.4, score: 5.2 },
            ].map((p, i) => (
              <div key={p.sym} style={{
                display: 'grid', gridTemplateColumns: '24px 32px 1fr 60px 50px',
                alignItems: 'center', gap: 10,
                padding: '10px 14px',
                borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.06)',
                background: p.isMe ? 'rgba(204,120,92,0.07)' : 'transparent',
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: p.rank === 1 ? '#CC785C' : '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>#{p.rank}</span>
                <LogoTile symbol={p.sym} size={26} />
                <span style={{ fontSize: 12.5, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{p.sym}</span>
                <span style={{ fontSize: 11, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right' }}>P/E {p.pe.toFixed(1)}</span>
                <ScorePillM v={p.score} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

function ScorePillM({ v }) {
  const color = v >= 8 ? '#006e3f' : v >= 6 ? '#CC785C' : v >= 4 ? '#9A8E7C' : '#c62828';
  return (
    <span style={{
      display: 'inline-block', textAlign: 'center', minWidth: 40,
      padding: '3px 6px', borderRadius: 3,
      background: color, color: '#fff',
      fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
    }}>{v.toFixed(1)}</span>
  );
}

// ─────────────────────────────────────────────────────────
// 04. DEEP ANALYSIS — terminal stream view
// ─────────────────────────────────────────────────────────
function MobileDeepAnalysis() {
  return (
    <MobileShell tab="analysis" showTicker={false}>
      <div style={{ paddingBottom: 100 }}>
        {/* Header */}
        <div style={{ padding: '10px 16px 14px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#1A1A1A' }}>‹ NVDA</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 9.5, color: '#CC785C', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: '#CC785C', boxShadow: '0 0 8px #CC785C', animation: 'dotPulse 1.5s infinite' }} />
              CLAUDE 4.6 · LIVE
            </div>
            <span style={{ fontSize: 14, color: '#1A1A1A' }}>⋯</span>
          </div>
          <h1 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 22, fontWeight: 600, margin: '10px 0 2px', letterSpacing: '-0.02em' }}>
            13 位 AI 代理人深度分析
          </h1>
          <div style={{ fontSize: 11, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>
            ELAPSED 38S · ETA ~2:30 · TOKENS 14,892
          </div>
        </div>

        {/* Phase progress — horizontal stepper */}
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {[
              { id: 1, label: '大師', count: '4/6', state: 'active' },
              { id: 2, label: '辯論', count: '0/3', state: 'pending' },
              { id: 3, label: '風險', count: '0/3', state: 'pending' },
              { id: 4, label: '整合', count: '0/1', state: 'pending' },
            ].map((p, i, arr) => {
              const active = p.state === 'active';
              return (
                <React.Fragment key={p.id}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 999,
                      background: active ? '#CC785C' : '#F0EADF',
                      color: active ? '#fff' : '#9A8E7C',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                      border: '2px solid ' + (active ? '#CC785C' : 'transparent'),
                    }}>{p.id}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: active ? '#1A1A1A' : '#9A8E7C', marginTop: 4 }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: 9.5, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>
                      {p.count}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ flex: 0.6, height: 1, background: 'rgba(0,0,0,0.1)', marginTop: -22 }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Consensus preview */}
        <div style={{ padding: '20px 16px 0' }}>
          <div style={{
            background: '#1A1A1A', color: '#F4EFE6', borderRadius: 12, padding: 16,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#CC785C' }}>
              REAL-TIME CONSENSUS · 4 OF 13
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 9, color: 'rgba(244,239,230,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>AVG SCORE</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }}>7.9</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: 'rgba(244,239,230,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>BUY / HOLD / SELL</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', marginTop: 4, color: '#00d47e' }}>
                  3 / 1 / 0
                </div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: 'rgba(244,239,230,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>CONVICTION</div>
                <div style={{
                  display: 'inline-block', marginTop: 4,
                  padding: '3px 8px', borderRadius: 3,
                  background: '#00d47e', color: '#1A1A1A',
                  fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                }}>BUY</div>
              </div>
            </div>
          </div>
        </div>

        {/* Streaming agent feed */}
        <SectionLabel count={`${AGENTS.length}`}>代理人即時輸出</SectionLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {AGENTS.slice(0, 8).map((a) => <MobileAgentCard key={a.id} a={a} />)}
        </div>
      </div>
    </MobileShell>
  );
}

function MobileAgentCard({ a }) {
  const isActive = a.status === 'streaming';
  const isComplete = a.status === 'complete';
  const stateColor = isComplete ? '#006e3f' : isActive ? '#CC785C' : '#9A8E7C';
  const stateLabel = isComplete ? '完成' : isActive ? '生成中' : '等待';

  return (
    <div style={{
      background: '#FBF8F1', borderRadius: 10,
      border: '1px solid ' + (isActive ? 'rgba(204,120,92,0.4)' : 'rgba(0,0,0,0.08)'),
      overflow: 'hidden',
      boxShadow: isActive ? '0 0 0 3px rgba(204,120,92,0.06)' : 'none',
    }}>
      <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 6,
          background: a.group === 'pm' ? '#CC785C' : a.group === 'masters' ? '#1A1A1A' : '#E8E2D5',
          color: a.group === 'pm' || a.group === 'masters' ? '#F4EFE6' : '#1A1A1A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontFamily: 'Source Serif 4, Georgia, serif', fontWeight: 700,
          flexShrink: 0,
        }}>{a.zh.slice(0, 1)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>
              {{ masters: 'MASTER', debate: 'DEBATE', risk: 'RISK', pm: 'PM' }[a.group]}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'Source Serif 4, Georgia, serif' }}>{a.zh}</span>
            <span style={{ fontSize: 10, color: '#9A8E7C' }}>· {a.en}</span>
          </div>
          <div style={{ fontSize: 10, color: '#9A8E7C', marginTop: 1 }}>{a.tagline}</div>
        </div>
        {a.score != null && (
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.01em' }}>
            {a.score.toFixed(1)}
          </span>
        )}
        <span style={{
          fontSize: 9, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
          padding: '3px 6px', borderRadius: 3,
          background: stateColor, color: '#fff', whiteSpace: 'nowrap',
        }}>
          {stateLabel}
        </span>
      </div>
      {isComplete && a.score != null && (
        <div style={{ padding: '8px 14px 12px', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: 11.5, lineHeight: 1.45, color: '#1A1A1A' }}>
            {a.id === 'buffett' && '寬廣護城河，CUDA 生態鎖客戶。ROE 122% 卓越，現價接近合理估值上緣，建議分批進場。'}
            {a.id === 'lynch' && 'PEG 0.87，AI 顛覆十倍股潛力，消費者熟悉度高。屬「快速成長型」分類。'}
            {a.id === 'wood' && 'AI 革命核心受益者，TAM 2030 達 $1.5T，5Y CAGR 預估 38%。創新 > 估值。'}
          </div>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 9.5, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
              padding: '2px 6px', borderRadius: 3,
              background: a.conviction === 'STRONG BUY' ? '#006e3f' : '#00a86b', color: '#fff',
            }}>{a.conviction}</span>
            <span style={{ fontSize: 9.5, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>
              CONFIDENCE 87% · TGT $245
            </span>
          </div>
        </div>
      )}
      {isActive && (
        <div style={{ padding: '8px 14px 12px', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'rgba(204,120,92,0.04)' }}>
          <div style={{ fontSize: 11.5, lineHeight: 1.45, color: '#1A1A1A', fontFamily: 'JetBrains Mono, monospace' }}>
            分析資產負債表異常項目，存貨水位較去年同期+18%，DSO...
            <span style={{ display: 'inline-block', width: 6, height: 12, background: '#CC785C', verticalAlign: 'middle', marginLeft: 2, animation: 'dotPulse 1s infinite' }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 05. PORTFOLIO — Allocation matrix
// ─────────────────────────────────────────────────────────
function MobilePortfolio() {
  const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.shares * h.currentPrice, 0);
  const totalCost = MOCK_HOLDINGS.reduce((s, h) => s + h.shares * h.costBasis, 0);
  const totalPL = totalValue - totalCost;
  const totalPLPct = (totalPL / totalCost) * 100;
  const colors = ['#CC785C', '#1A1A1A', '#8B6F47', '#A85C44'];

  return (
    <MobileShell tab="portfolio">
      <div style={{ paddingBottom: 100 }}>
        <PageHeader title="持股" subtitle="4 POSITIONS · MARK-TO-MKT" />

        {/* Hero NAV — same architecture as dashboard but different shape */}
        <div style={{ padding: '0 16px' }}>
          <div style={{
            background: '#1A1A1A', color: '#F4EFE6', borderRadius: 14,
            padding: '16px 16px 12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(244,239,230,0.6)' }}>
                MARKET VALUE
              </span>
              <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(244,239,230,0.5)' }}>
                COST ${fmtMoney(totalCost)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
              <span style={{ fontSize: 14, color: 'rgba(244,239,230,0.5)' }}>$</span>
              <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {fmtMoney(totalValue)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#00d47e', fontFamily: 'JetBrains Mono, monospace' }}>
                ▲ ${fmtMoney(totalPL)}
              </span>
              <span style={{ fontSize: 11, padding: '3px 7px', borderRadius: 3, background: '#00d47e', color: '#1A1A1A', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                +{totalPLPct.toFixed(2)}%
              </span>
            </div>

            {/* Inline allocation bar */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', height: 8, borderRadius: 2, overflow: 'hidden' }}>
                {MOCK_HOLDINGS.map((h, i) => {
                  const pct = (h.shares * h.currentPrice / totalValue) * 100;
                  return <div key={h.symbol} style={{ width: `${pct}%`, background: colors[i] }} />;
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, gap: 6 }}>
                {MOCK_HOLDINGS.map((h, i) => {
                  const pct = (h.shares * h.currentPrice / totalValue) * 100;
                  return (
                    <div key={h.symbol} style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 1, background: colors[i] }} />
                        <span style={{ fontSize: 10, fontWeight: 700 }}>{h.symbol}</span>
                      </div>
                      <span style={{ fontSize: 10, color: 'rgba(244,239,230,0.7)', marginLeft: 10 }}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ padding: '14px 16px 4px', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {['全部', '獲利', '虧損', '今日漲', '今日跌'].map((c, i) => (
            <button key={c} style={{
              flex: '0 0 auto', padding: '5px 12px', borderRadius: 999,
              border: '1px solid ' + (i === 0 ? '#1A1A1A' : 'rgba(0,0,0,0.12)'),
              background: i === 0 ? '#1A1A1A' : 'transparent',
              color: i === 0 ? '#F4EFE6' : '#1A1A1A',
              fontSize: 11, fontWeight: 600,
            }}>{c}</button>
          ))}
        </div>

        {/* Holdings — terminal row format */}
        <div style={{ padding: '4px 16px 0' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '120px 1fr 70px 60px',
            padding: '8px 14px', background: '#1A1A1A', color: '#F4EFE6',
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
            gap: 8, alignItems: 'center', borderRadius: '10px 10px 0 0',
          }}>
            <span>POSITION</span>
            <span style={{ textAlign: 'right' }}>市值 · 30D</span>
            <span style={{ textAlign: 'right' }}>P/L</span>
            <span style={{ textAlign: 'right' }}>%</span>
          </div>
          <div style={{
            background: '#FBF8F1',
            border: '1px solid rgba(0,0,0,0.08)', borderTop: 'none',
            borderRadius: '0 0 10px 10px', overflow: 'hidden',
          }}>
            {MOCK_HOLDINGS.map((h, i) => {
              const value = h.shares * h.currentPrice;
              const cost = h.shares * h.costBasis;
              const pl = value - cost;
              const plPct = (pl / cost) * 100;
              const up = pl >= 0;
              const color = up ? '#006e3f' : '#c62828';
              return (
                <div key={h.symbol} style={{
                  display: 'grid', gridTemplateColumns: '120px 1fr 70px 60px',
                  alignItems: 'center', gap: 8,
                  padding: '12px 14px',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.06)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <LogoTile symbol={h.symbol} size={28} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{h.symbol}</div>
                      <div style={{ fontSize: 9, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>
                        {h.shares}@${h.costBasis.toFixed(0)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <Sparkline points={MOCK_SPARKS[h.symbol]} color={color} width={110} height={20} />
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                      ${fmtMoney(value)}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color }}>
                    {up ? '+' : ''}${fmtMoney(Math.abs(pl), 0)}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                      color: '#fff', background: color,
                      padding: '3px 5px', borderRadius: 3,
                      display: 'inline-block', minWidth: 50, textAlign: 'center',
                    }}>{up ? '+' : ''}{plPct.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance summary */}
        <SectionLabel>績效摘要</SectionLabel>
        <div style={{ padding: '0 16px' }}>
          <div style={{
            background: '#FBF8F1', borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.08)',
            display: 'grid', gridTemplateColumns: '1fr 1fr',
          }}>
            {[
              ['BEST PERFORMER', 'TSLA', '+66.1%', '#006e3f'],
              ['WORST PERFORMER', 'GOOGL', '+17.6%', '#006e3f'],
              ['AVG GAIN',       '+33.4%', '4 of 4', '#006e3f'],
              ['DAYS HELD',      '162',    'WTD AVG', '#1A1A1A'],
            ].map((r, i) => (
              <div key={i} style={{
                padding: '12px 14px',
                borderBottom: i < 2 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                borderRight: i % 2 === 0 ? '1px solid rgba(0,0,0,0.06)' : 'none',
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#9A8E7C', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>{r[0]}</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: r[3], marginTop: 3 }}>{r[1]}</div>
                <div style={{ fontSize: 10, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>{r[2]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

// ─────────────────────────────────────────────────────────
// 06. FILTERS — new screen (industry / market cap / score)
// ─────────────────────────────────────────────────────────
function MobileFilters() {
  return (
    <MobileShell tab="watchlist" showTicker={false}>
      <div style={{ paddingBottom: 100 }}>
        <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14 }}>‹ 取消</span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>進階篩選</span>
          <span style={{ fontSize: 12, color: '#CC785C', fontWeight: 600 }}>重設</span>
        </div>

        <div style={{ padding: 16 }}>
          {/* Result count */}
          <div style={{
            background: '#1A1A1A', color: '#F4EFE6', borderRadius: 10,
            padding: '12px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,239,230,0.6)' }}>
              MATCHING ISSUES
            </span>
            <span style={{ fontSize: 26, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              42
            </span>
          </div>

          {/* Sectors */}
          <FilterSection label="產業" count="GICS 11">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                ['Technology', true, 5], ['Communication', true, 2], ['Consumer Cyclical', false, 0],
                ['Healthcare', false, 0], ['Financial', false, 0], ['Industrials', false, 0],
                ['Energy', false, 0], ['Utilities', false, 0],
              ].map(([n, on, c]) => (
                <span key={n} style={{
                  padding: '6px 12px', borderRadius: 999,
                  fontSize: 11, fontWeight: 600,
                  border: '1px solid ' + (on ? '#1A1A1A' : 'rgba(0,0,0,0.12)'),
                  background: on ? '#1A1A1A' : 'transparent',
                  color: on ? '#F4EFE6' : '#1A1A1A',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}>
                  {n}
                  {c > 0 && <span style={{ fontSize: 9, opacity: 0.7, fontFamily: 'JetBrains Mono, monospace' }}>{c}</span>}
                </span>
              ))}
            </div>
          </FilterSection>

          {/* Market cap range — terminal-style range */}
          <FilterSection label="市值區間" count="$10B – $5T">
            <div style={{
              padding: '14px 12px 12px',
              background: '#FBF8F1', borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.08)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: '#1A1A1A' }}>$10B</span>
                <span style={{ color: '#9A8E7C' }}>—</span>
                <span style={{ fontWeight: 700, color: '#1A1A1A' }}>$5T</span>
              </div>
              {/* Track */}
              <div style={{ position: 'relative', height: 24 }}>
                {/* Histogram bars */}
                <div style={{ position: 'absolute', left: 0, right: 0, top: 4, display: 'flex', alignItems: 'flex-end', height: 16, gap: 2 }}>
                  {[3, 7, 12, 18, 22, 19, 14, 10, 7, 5, 3, 2, 4, 8, 12].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: h, background: i >= 2 && i <= 12 ? '#CC785C' : 'rgba(0,0,0,0.12)' }} />
                  ))}
                </div>
                {/* Track */}
                <div style={{ position: 'absolute', left: 0, right: 0, top: 21, height: 2, background: 'rgba(0,0,0,0.1)' }} />
                <div style={{ position: 'absolute', left: '14%', right: '14%', top: 21, height: 2, background: '#1A1A1A' }} />
                {/* Handles */}
                <div style={{ position: 'absolute', left: '14%', top: 17, width: 10, height: 10, background: '#1A1A1A', borderRadius: 999, border: '2px solid #FBF8F1' }} />
                <div style={{ position: 'absolute', right: '14%', top: 17, width: 10, height: 10, background: '#1A1A1A', borderRadius: 999, border: '2px solid #FBF8F1' }} />
              </div>
            </div>
          </FilterSection>

          {/* Score range */}
          <FilterSection label="綜合評分" count="≥ 7.0 / 10">
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { l: '≥ 9', sub: '頂級', on: false },
                { l: '≥ 7', sub: '優秀', on: true },
                { l: '≥ 5', sub: '中等', on: false },
                { l: '≥ 0', sub: '全部', on: false },
              ].map((b, i) => (
                <button key={i} style={{
                  flex: 1, padding: '10px 6px', borderRadius: 8,
                  border: '1px solid ' + (b.on ? '#1A1A1A' : 'rgba(0,0,0,0.12)'),
                  background: b.on ? '#1A1A1A' : '#FBF8F1',
                  color: b.on ? '#F4EFE6' : '#1A1A1A',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{b.l}</span>
                  <span style={{ fontSize: 9, opacity: 0.7 }}>{b.sub}</span>
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Conviction toggles */}
          <FilterSection label="AI 評等">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['STRONG BUY', '#006e3f', true,  12],
                ['BUY',        '#00a86b', true,  18],
                ['HOLD',       '#9A8E7C', false, 8],
                ['SELL',       '#CC785C', false, 3],
                ['STRONG SELL', '#c62828', false, 1],
              ].map(([l, c, on, n]) => (
                <div key={l} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8,
                  background: '#FBF8F1', border: '1px solid rgba(0,0,0,0.08)',
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: c }} />
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', flex: 1 }}>{l}</span>
                  <span style={{ fontSize: 11, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>{n}</span>
                  <ToggleSwitch on={on} />
                </div>
              ))}
            </div>
          </FilterSection>

          {/* Misc fundamentals */}
          <FilterSection label="基本面條件">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: '#FBF8F1', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              {[
                ['P/E', '< 30',      '12 符合', false],
                ['ROE', '≥ 15%',     '24 符合', true],
                ['毛利率', '≥ 40%',  '18 符合', true],
                ['營收成長', '≥ 10%', '16 符合', true],
                ['股息率', '≥ 0%',    '— 不限', false],
              ].map(([l, op, n, on], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', minWidth: 60 }}>{l}</span>
                  <span style={{ fontSize: 11, color: '#1A1A1A', fontFamily: 'JetBrains Mono, monospace', flex: 1 }}>{op}</span>
                  <span style={{ fontSize: 10, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>{n}</span>
                  <ToggleSwitch on={on} />
                </div>
              ))}
            </div>
          </FilterSection>
        </div>

        {/* Sticky apply */}
        <div style={{
          position: 'sticky', bottom: 0, padding: '12px 16px',
          background: 'rgba(244,239,230,0.94)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.08)',
        }}>
          <button style={{
            width: '100%', padding: 14, borderRadius: 10, border: 'none',
            background: '#1A1A1A', color: '#F4EFE6',
            fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            套用篩選 · 顯示 <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#CC785C' }}>42</span> 檔股票
          </button>
        </div>
      </div>
    </MobileShell>
  );
}

function FilterSection({ label, count, children }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1A1A1A' }}>
          {label}
        </span>
        {count && <span style={{ fontSize: 10, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>{count}</span>}
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({ on }) {
  return (
    <div style={{
      width: 36, height: 20, borderRadius: 999,
      background: on ? '#CC785C' : 'rgba(0,0,0,0.15)',
      position: 'relative', transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 18 : 2,
        width: 16, height: 16, borderRadius: 999, background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 07. PROFILE / Settings
// ─────────────────────────────────────────────────────────
function MobileProfile() {
  return (
    <MobileShell tab="profile" showTicker={false}>
      <div style={{ paddingBottom: 100 }}>
        {/* Profile header */}
        <div style={{ padding: '14px 16px 18px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: '#1A1A1A', color: '#F4EFE6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, fontFamily: 'Source Serif 4, Georgia, serif',
          }}>J</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontFamily: 'Source Serif 4, Georgia, serif', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Jack Chen
            </div>
            <div style={{ fontSize: 11, color: '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>jack926509 · PRO</div>
          </div>
          <button style={{
            border: '1px solid rgba(0,0,0,0.12)', background: 'transparent',
            borderRadius: 8, padding: '6px 12px',
            fontSize: 11, fontWeight: 600,
          }}>編輯</button>
        </div>

        {/* AI usage stats */}
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{
            background: '#1A1A1A', color: '#F4EFE6', borderRadius: 12,
            padding: 16, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#CC785C' }}>
                AI USAGE · APRIL
              </span>
              <span style={{ fontSize: 9, color: 'rgba(244,239,230,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>
                CLAUDE 4.6
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
              <Stat l="ANALYSES" v="14" sub="of 50" />
              <Stat l="TOKENS"   v="284K" sub="of 2M" />
              <Stat l="STREAKS"  v="12d"  sub="best 23d" />
            </div>
            <div style={{ marginTop: 12, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: '28%', background: '#CC785C', borderRadius: 2 }} />
            </div>
          </div>
        </div>

        <SectionLabel>偏好設定</SectionLabel>
        <SettingsGroup>
          <SettingsRow icon="◐" label="主題" detail="淺色 · 米色" />
          <SettingsRow icon="◷" label="刷新頻率" detail="60 秒" />
          <SettingsRow icon="◊" label="預設貨幣" detail="USD" />
          <SettingsRow icon="◯" label="圖表類型" detail="蠟燭 + MA" />
        </SettingsGroup>

        <SectionLabel>通知</SectionLabel>
        <SettingsGroup>
          <SettingsRow icon="!" label="價格警示" detail="3 個" toggle />
          <SettingsRow icon="ℙ" label="盤前 / 盤後" detail="" toggle on />
          <SettingsRow icon="∆" label="深度分析完成" detail="" toggle on />
          <SettingsRow icon="◇" label="新聞情緒突發" detail="" toggle />
        </SettingsGroup>

        <SectionLabel>資料來源</SectionLabel>
        <SettingsGroup>
          <SettingsRow icon="⌬" label="FMP API" detail="Premium · 已連線" rightColor="#006e3f" />
          <SettingsRow icon="⤳" label="TradingView" detail="已連線" rightColor="#006e3f" />
          <SettingsRow icon="✦" label="Anthropic API" detail="Claude 4.6" rightColor="#006e3f" />
        </SettingsGroup>

        <SectionLabel>關於</SectionLabel>
        <SettingsGroup>
          <SettingsRow icon="?" label="支援" />
          <SettingsRow icon="§" label="隱私權與條款" />
          <SettingsRow icon="v" label="版本" detail="2.4.1 · build 1024" />
        </SettingsGroup>
      </div>
    </MobileShell>
  );
}

function Stat({ l, v, sub }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(244,239,230,0.5)', fontWeight: 700 }}>{l}</div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em', marginTop: 2 }}>{v}</div>
      <div style={{ fontSize: 9, color: 'rgba(244,239,230,0.45)', fontFamily: 'JetBrains Mono, monospace' }}>{sub}</div>
    </div>
  );
}

function SettingsGroup({ children }) {
  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ background: '#FBF8F1', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ icon, label, detail, rightColor, toggle, on }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderTop: '1px solid rgba(0,0,0,0.05)',
    }}>
      <span style={{
        width: 26, height: 26, borderRadius: 6,
        background: '#F4EFE6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, color: '#CC785C', fontWeight: 700,
      }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{label}</span>
      {detail && <span style={{ fontSize: 11, color: rightColor || '#9A8E7C', fontFamily: 'JetBrains Mono, monospace' }}>{detail}</span>}
      {toggle && <ToggleSwitch on={on} />}
      {!toggle && <span style={{ fontSize: 12, color: '#bbb' }}>›</span>}
    </div>
  );
}

Object.assign(window, {
  MobileDashboard, MobileWatchlist, MobileStockDetail,
  MobileDeepAnalysis, MobilePortfolio, MobileFilters, MobileProfile,
});
