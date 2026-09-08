// Web Stock Detail v2 — Bloomberg Terminal × Claude beige
// Layout: top header → command line → chart + quote sheet (60/40) → score + 13 agents

const SD2_BG = '#F4EFE6';
const SD2_CARD = '#FBF8F1';
const SD2_INK = '#1A1A1A';
const SD2_MUTED = '#9A8E7C';
const SD2_HAIR = 'rgba(0,0,0,0.08)';
const SD2_HAIR_SOFT = 'rgba(0,0,0,0.05)';
const SD2_BRAND = '#CC785C';
const SD2_UP = '#006e3f';
const SD2_DOWN = '#c62828';
const SD2_UP_NEON = '#00d47e';

const sd2Mono = 'JetBrains Mono, ui-monospace, monospace';
const sd2Serif = 'Source Serif 4, "Noto Serif TC", Georgia, serif';
const sd2Sans = 'Inter, -apple-system, system-ui, sans-serif';

function WebStockDetailV2() {
  return (
    <div style={{ background: SD2_BG, color: SD2_INK, fontFamily: sd2Sans, minHeight: 2200 }}>
      <SD2TickerBar />
      <SD2NavBar />
      <SD2StockHeader />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, padding: '20px 32px' }}>
        <main style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SD2ChartCard />
          <SD2TechAndPeers />
          <SD2DeepAnalysis />
        </main>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SD2QuoteSheet />
          <SD2ScoreCard />
          <SD2NewsList />
        </aside>
      </div>
    </div>
  );
}

// Ticker bar (reuse — slimmer)
function SD2TickerBar() {
  const items = [
    { sym: 'SPY', v: 5847.22, d: 0.32 },
    { sym: 'QQQ', v: 514.78, d: -0.24 },
    { sym: 'NVDA', v: 184.27, d: 3.85 },
    { sym: 'TSLA', v: 412.55, d: 2.81 },
    { sym: 'AAPL', v: 232.18, d: 1.15 },
    { sym: 'GOOGL', v: 187.42, d: -0.42 },
    { sym: 'AMD', v: 134.21, d: -1.14 },
    { sym: 'AVGO', v: 1684, d: 2.21 },
    { sym: 'TSM', v: 218.42, d: 1.82 },
    { sym: 'VIX', v: 14.82, d: -3.21 },
  ];
  return (
    <div style={{
      background: '#0E0E0E', height: 32,
      display: 'flex', alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{
        background: SD2_BRAND, color: '#fff',
        padding: '0 12px', height: '100%',
        display: 'flex', alignItems: 'center',
        fontSize: 10, fontWeight: 700, fontFamily: sd2Mono, letterSpacing: '0.12em', flexShrink: 0,
        position: 'relative', zIndex: 2,
      }}>● LIVE · NYSE OPEN</div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'inline-flex', animation: 'tickerScroll 50s linear infinite', paddingLeft: 16, whiteSpace: 'nowrap' }}>
        {[...items, ...items].map((it, i) => {
          const up = it.d >= 0;
          const c = up ? '#00d47e' : '#ff5b5b';
          return (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 7, marginRight: 24, fontSize: 11, fontFamily: sd2Mono }}>
              <span style={{ color: '#F4EFE6', fontWeight: 700, letterSpacing: '0.04em' }}>{it.sym}</span>
              <span style={{ color: '#F4EFE6' }}>{it.v.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              <span style={{ color: c, fontWeight: 600 }}>{up ? '▲' : '▼'} {Math.abs(it.d).toFixed(2)}%</span>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function SD2NavBar() {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 22,
      padding: '12px 32px', background: SD2_BG,
      borderBottom: '1px solid ' + SD2_HAIR,
    }}>
      <span style={{ fontSize: 12, color: SD2_MUTED, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>‹ 儀表板</span>
        <span>·</span>
        <span>追蹤清單</span>
        <span>·</span>
        <span style={{ color: SD2_INK, fontWeight: 700 }}>NVDA</span>
      </span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid ' + SD2_HAIR, background: SD2_CARD, fontSize: 11, fontWeight: 600 }}>★ 加入追蹤</button>
        <button style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid ' + SD2_HAIR, background: SD2_CARD, fontSize: 11, fontWeight: 600 }}>＋ 加入持倉</button>
        <button style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid ' + SD2_HAIR, background: SD2_CARD, fontSize: 11, fontWeight: 600 }}>⤴ 分享</button>
      </div>
    </header>
  );
}

// Stock header — large NVDA panel
function SD2StockHeader() {
  return (
    <div style={{
      padding: '20px 32px',
      background: SD2_BG,
      borderBottom: '1px solid ' + SD2_HAIR,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
        <LogoTile symbol="NVDA" size={64} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 30, fontWeight: 700, fontFamily: sd2Mono, letterSpacing: '-0.01em' }}>NVDA</span>
            <span style={{ fontSize: 18, fontFamily: sd2Serif, fontWeight: 500, color: SD2_INK }}>NVIDIA Corporation</span>
            <span style={{ fontSize: 11, fontFamily: sd2Mono, color: SD2_MUTED, letterSpacing: '0.06em' }}>
              US · NASDAQ · TECHNOLOGY · SEMICONDUCTORS
            </span>
            <span style={{
              fontSize: 10, fontFamily: sd2Mono, fontWeight: 700,
              padding: '2px 6px', borderRadius: 3,
              background: SD2_INK, color: SD2_BG, letterSpacing: '0.08em',
            }}>★ FOLLOW · 1.2M</span>
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-end', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 18, color: SD2_MUTED, fontFamily: sd2Mono }}>$</span>
                <span style={{
                  fontSize: 56, fontWeight: 700, fontFamily: sd2Mono,
                  letterSpacing: '-0.03em', lineHeight: 0.95,
                  fontVariantNumeric: 'tabular-nums',
                }}>184.27</span>
              </div>
              <div style={{ fontSize: 11, color: SD2_MUTED, fontFamily: sd2Mono, marginTop: 4 }}>
                LAST 09:41:18 EDT · UPDATED 60S AGO
              </div>
            </div>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 6,
                background: SD2_UP, color: '#fff',
                fontSize: 16, fontWeight: 700, fontFamily: sd2Mono,
              }}>
                ▲ +6.84  +3.85%
              </div>
              <div style={{ fontSize: 11, color: SD2_MUTED, fontFamily: sd2Mono, marginTop: 4 }}>
                VOL 412.8M · AVG 285.1M · 144%
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {[
                { l: 'PRE',  v: '186.20', d: '+1.05%' },
                { l: 'POST', v: '184.45', d: '+0.10%' },
              ].map((b) => (
                <div key={b.l} style={{
                  padding: '8px 12px', borderRadius: 8,
                  background: SD2_CARD, border: '1px solid ' + SD2_HAIR,
                  textAlign: 'right',
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: SD2_MUTED, fontFamily: sd2Mono }}>
                    {b.l} MARKET
                  </div>
                  <div style={{ fontSize: 14, fontFamily: sd2Mono, fontWeight: 700, marginTop: 3 }}>
                    {b.v}
                  </div>
                  <div style={{ fontSize: 10, fontFamily: sd2Mono, color: SD2_UP }}>
                    {b.d}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Chart card with toolbar
function SD2ChartCard() {
  return (
    <section style={{ background: SD2_CARD, borderRadius: 14, border: '1px solid ' + SD2_HAIR, overflow: 'hidden' }}>
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid ' + SD2_HAIR_SOFT,
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'ALL'].map((p, i) => (
            <button key={p} style={{
              padding: '6px 12px', borderRadius: 4, border: 'none',
              fontSize: 11, fontWeight: 700, fontFamily: sd2Mono,
              background: i === 2 ? SD2_INK : 'transparent',
              color: i === 2 ? SD2_BG : SD2_INK,
            }}>{p}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {['CANDLE', 'LINE', 'AREA'].map((t, i) => (
            <button key={t} style={{
              padding: '5px 10px', borderRadius: 4, border: '1px solid ' + SD2_HAIR,
              background: i === 0 ? SD2_INK : 'transparent',
              color: i === 0 ? SD2_BG : SD2_INK,
              fontSize: 10, fontWeight: 700, fontFamily: sd2Mono,
            }}>{t}</button>
          ))}
          <span style={{ width: 1, height: 18, background: SD2_HAIR }} />
          {['MA', 'RSI', 'VOL', 'MACD'].map((t) => (
            <button key={t} style={{
              padding: '5px 10px', borderRadius: 4, border: '1px solid ' + SD2_HAIR,
              background: 'transparent',
              fontSize: 10, fontWeight: 700, fontFamily: sd2Mono, color: SD2_INK,
            }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <ChartPlaceholder height={360} accent={SD2_BRAND} priceUp />
      </div>
      {/* OHLC strip below */}
      <div style={{
        padding: '10px 16px', display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
        gap: 10, borderTop: '1px solid ' + SD2_HAIR_SOFT,
        background: 'rgba(0,0,0,0.02)',
      }}>
        {[
          ['OPEN', '180.42'],
          ['HIGH', '186.10'],
          ['LOW',  '178.95'],
          ['CLOSE','184.27'],
          ['VWAP', '183.71'],
          ['VOL',  '412.8M'],
          ['MA50', '171.34'],
          ['MA200','142.18'],
        ].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: 9, fontWeight: 700, color: SD2_MUTED, fontFamily: sd2Mono, letterSpacing: '0.1em' }}>{l}</div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: sd2Mono, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Tech indicators row + peer comparison
function SD2TechAndPeers() {
  return (
    <section style={{ background: SD2_CARD, borderRadius: 14, border: '1px solid ' + SD2_HAIR, overflow: 'hidden' }}>
      <SD2SectionHeader eyebrow="PEER COMPARISON · GICS SEMICONDUCTORS" title="同業比較" right={
        <span style={{ fontSize: 10, fontFamily: sd2Mono, color: SD2_MUTED }}>5 PEERS · SECTOR-ADJUSTED</span>
      }/>

      {/* Tech indicators bar */}
      <div style={{
        padding: '12px 18px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 10, borderBottom: '1px solid ' + SD2_HAIR_SOFT,
      }}>
        {[
          { l: 'RSI 14', v: 67.4, max: 100, hint: '中性偏多', c: SD2_BRAND },
          { l: 'MACD', v: '+1.42', d: 'BULLISH', c: SD2_UP, badge: true },
          { l: 'STOCH', v: 78.2, max: 100, hint: '超買區', c: SD2_DOWN },
          { l: 'BB %B', v: 0.84, max: 1, hint: '上軌', c: SD2_BRAND },
          { l: 'ADX', v: 32.5, max: 100, hint: '強趨勢', c: SD2_UP },
          { l: 'VOLUME', v: '144%', d: 'AVG +44%', c: SD2_UP, badge: true },
        ].map((m, i) => (
          <div key={i}>
            <div style={{ fontSize: 9, fontWeight: 700, color: SD2_MUTED, fontFamily: sd2Mono, letterSpacing: '0.1em' }}>{m.l}</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: sd2Mono, color: m.c, marginTop: 2 }}>
              {m.v}
            </div>
            {m.badge ? (
              <div style={{ fontSize: 9, fontFamily: sd2Mono, color: m.c, fontWeight: 700, marginTop: 2 }}>{m.d}</div>
            ) : (
              <>
                <div style={{ height: 3, background: 'rgba(0,0,0,0.06)', borderRadius: 2, marginTop: 4 }}>
                  <div style={{ width: `${(m.v / m.max) * 100}%`, height: '100%', background: m.c, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 9, color: SD2_MUTED, fontFamily: sd2Mono, marginTop: 2 }}>{m.hint}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Peer table */}
      <div style={{
        display: 'grid', gridTemplateColumns: '40px 200px 90px 80px 80px 90px 90px 100px 70px',
        padding: '8px 18px', background: SD2_INK, color: SD2_BG,
        fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: sd2Mono,
        gap: 10, alignItems: 'center',
      }}>
        <span>RANK</span>
        <span>PEER</span>
        <span style={{ textAlign: 'right' }}>P/E</span>
        <span style={{ textAlign: 'right' }}>P/B</span>
        <span style={{ textAlign: 'right' }}>P/S</span>
        <span style={{ textAlign: 'right' }}>ROE</span>
        <span style={{ textAlign: 'right' }}>毛利率</span>
        <span style={{ textAlign: 'right' }}>營收成長</span>
        <span style={{ textAlign: 'right' }}>SCORE</span>
      </div>
      {[
        { rank: 1, sym: 'NVDA', name: 'NVIDIA',     pe: 68.2,  pb: 52.4, ps: 33.1, roe: 122.4, gm: 75.8, growth: 78.0, score: 8.4, isMe: true },
        { rank: 2, sym: 'TSM',  name: 'TSMC',       pe: 28.4,  pb: 7.2,  ps: 11.8, roe: 28.4,  gm: 53.8, growth: 28.5, score: 8.0 },
        { rank: 3, sym: 'AVGO', name: 'Broadcom',   pe: 42.1,  pb: 11.5, ps: 18.2, roe: 32.8,  gm: 75.2, growth: 47.2, score: 7.2 },
        { rank: 4, sym: 'QCOM', name: 'Qualcomm',   pe: 18.6,  pb: 8.4,  ps: 4.9,  roe: 38.4,  gm: 56.4, growth: 18.8, score: 6.4 },
        { rank: 5, sym: 'AMD',  name: 'AMD',        pe: 105.4, pb: 4.2,  ps: 9.8,  roe: 8.4,   gm: 52.4, growth: 24.0, score: 5.2 },
      ].map((p, i, arr) => (
        <div key={p.sym} style={{
          display: 'grid', gridTemplateColumns: '40px 200px 90px 80px 80px 90px 90px 100px 70px',
          alignItems: 'center', gap: 10,
          padding: '12px 18px',
          borderTop: i === 0 ? 'none' : '1px solid ' + SD2_HAIR_SOFT,
          background: p.isMe ? 'rgba(204,120,92,0.07)' : 'transparent',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24, borderRadius: 4,
            background: p.rank === 1 ? SD2_BRAND : 'rgba(0,0,0,0.06)',
            color: p.rank === 1 ? '#fff' : SD2_INK,
            fontSize: 11, fontWeight: 700, fontFamily: sd2Mono,
          }}>{p.rank}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoTile symbol={p.sym} size={28} />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, fontFamily: sd2Mono }}>{p.sym}</div>
              <div style={{ fontSize: 10.5, color: SD2_MUTED }}>{p.name}</div>
            </div>
          </div>
          <span style={{ textAlign: 'right', fontSize: 12, fontFamily: sd2Mono }}>{p.pe.toFixed(1)}</span>
          <span style={{ textAlign: 'right', fontSize: 12, fontFamily: sd2Mono }}>{p.pb.toFixed(1)}</span>
          <span style={{ textAlign: 'right', fontSize: 12, fontFamily: sd2Mono }}>{p.ps.toFixed(1)}</span>
          <span style={{ textAlign: 'right', fontSize: 12, fontFamily: sd2Mono, color: p.roe > 50 ? SD2_UP : SD2_INK, fontWeight: p.roe > 50 ? 700 : 400 }}>
            {p.roe.toFixed(1)}%
          </span>
          <span style={{ textAlign: 'right', fontSize: 12, fontFamily: sd2Mono }}>{p.gm.toFixed(1)}%</span>
          <span style={{ textAlign: 'right', fontSize: 12, fontFamily: sd2Mono, color: SD2_UP, fontWeight: 600 }}>
            +{p.growth.toFixed(1)}%
          </span>
          <span style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block', textAlign: 'center', minWidth: 50,
              padding: '4px 6px', borderRadius: 3,
              background: p.score >= 8 ? SD2_UP : p.score >= 6 ? SD2_BRAND : p.score >= 4 ? SD2_MUTED : SD2_DOWN,
              color: '#fff',
              fontSize: 12, fontWeight: 700, fontFamily: sd2Mono,
            }}>
              {p.score.toFixed(1)}
            </span>
          </span>
        </div>
      ))}
    </section>
  );
}

// Quote sheet — Bloomberg vertical right-rail
function SD2QuoteSheet() {
  return (
    <section style={{ background: SD2_CARD, borderRadius: 14, border: '1px solid ' + SD2_HAIR, overflow: 'hidden' }}>
      <SD2SectionHeader eyebrow="DESCRIPTION · DES" title="報價單" />
      <div>
        {[
          ['OPEN',         '180.42'],
          ['HIGH',         '186.10'],
          ['LOW',          '178.95'],
          ['PREV CLOSE',   '177.43'],
          ['52W HIGH',     '195.40  (5/24/25)'],
          ['52W LOW',      ' 86.62  (4/02/25)'],
          ['MARKET CAP',   '$4.51T'],
          ['SHARES OUT',   '24.5B'],
          ['FLOAT',        '24.1B  (98.4%)'],
          ['BETA (5Y)',    '1.68'],
          ['P/E TTM',      '68.20'],
          ['EPS TTM',      '$2.70'],
          ['FWD P/E',      '42.40'],
          ['DIV / YIELD',  '$0.04 / 0.02%'],
          ['NEXT EARN',    '5/22/26 AMC'],
          ['IPO',          '01/22/1999'],
        ].map(([l, v], i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '8px 18px',
            borderTop: i === 0 ? 'none' : '1px solid ' + SD2_HAIR_SOFT,
            fontSize: 11, fontFamily: sd2Mono,
          }}>
            <span style={{ color: SD2_MUTED, fontWeight: 700, letterSpacing: '0.04em' }}>{l}</span>
            <span style={{ color: SD2_INK, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// Score card with 5 dimensions
function SD2ScoreCard() {
  return (
    <section style={{ background: SD2_INK, color: SD2_BG, borderRadius: 14, padding: 18, position: 'relative', overflow: 'hidden' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SD2_BRAND, fontFamily: sd2Mono }}>
        COMPOSITE SCORE · SECTOR ADJUSTED
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
        <span style={{ fontSize: 56, fontWeight: 700, fontFamily: sd2Mono, letterSpacing: '-0.03em', lineHeight: 1 }}>8.4</span>
        <span style={{ fontSize: 18, color: 'rgba(244,239,230,0.5)', fontFamily: sd2Mono }}>/ 10</span>
        <span style={{
          marginLeft: 'auto', fontSize: 12, fontWeight: 700, fontFamily: sd2Mono,
          background: SD2_UP_NEON, color: SD2_INK,
          padding: '5px 10px', borderRadius: 4,
        }}>STRONG</span>
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { l: '獲利能力', v: 9.2, en: 'PROFIT' },
          { l: '成長性',   v: 9.5, en: 'GROWTH' },
          { l: '估值合理', v: 4.8, en: 'VALUE' },
          { l: '財務健康', v: 8.6, en: 'HEALTH' },
          { l: '現金流',   v: 9.0, en: 'CASH' },
        ].map((d) => {
          const c = d.v >= 7 ? SD2_UP_NEON : d.v >= 5 ? SD2_BRAND : '#ff5b5b';
          return (
            <div key={d.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 100 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#F4EFE6' }}>{d.l}</div>
                <div style={{ fontSize: 9, fontFamily: sd2Mono, color: 'rgba(244,239,230,0.4)', letterSpacing: '0.06em' }}>{d.en}</div>
              </div>
              <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${d.v * 10}%`, background: c, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: sd2Mono, color: c, width: 36, textAlign: 'right' }}>
                {d.v.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// News list
function SD2NewsList() {
  return (
    <section style={{ background: SD2_CARD, borderRadius: 14, border: '1px solid ' + SD2_HAIR, overflow: 'hidden' }}>
      <SD2SectionHeader eyebrow="RELATED · NVDA" title="相關新聞" />
      {MOCK_NEWS.slice(0, 5).map((n, i) => {
        const c = n.sentiment === 'positive' ? SD2_UP : n.sentiment === 'negative' ? SD2_DOWN : SD2_MUTED;
        return (
          <div key={i} style={{
            padding: '11px 18px',
            borderTop: i === 0 ? 'none' : '1px solid ' + SD2_HAIR_SOFT,
            display: 'grid', gridTemplateColumns: '3px 1fr', gap: 10,
          }}>
            <div style={{ background: c, borderRadius: 2 }} />
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: SD2_MUTED, fontFamily: sd2Mono }}>{n.source.toUpperCase()}</span>
                <span style={{ fontSize: 9.5, color: SD2_MUTED }}>· {n.time}</span>
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.4, fontWeight: 500 }}>{n.headline}</div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

// Deep analysis — 13 agents (light theme — paper / dossier)
function SD2DeepAnalysis() {
  return (
    <section style={{ background: SD2_CARD, color: SD2_INK, borderRadius: 14, overflow: 'hidden', border: '1px solid ' + SD2_HAIR }}>
      {/* Header — beige paper, brand accent rule on left */}
      <div style={{ padding: '20px 22px', borderBottom: '1px solid ' + SD2_HAIR, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 20, bottom: 20, width: 3, background: SD2_BRAND }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SD2_BRAND, fontFamily: sd2Mono }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: SD2_BRAND, boxShadow: `0 0 8px ${SD2_BRAND}`, animation: 'dotPulse 1.5s infinite' }} />
              CLAUDE 4.6 · LIVE STREAM
            </div>
            <h2 style={{ fontFamily: sd2Serif, fontSize: 26, margin: '6px 0 4px', fontWeight: 600, letterSpacing: '-0.01em', color: SD2_INK }}>
              13 位 AI 代理人深度分析
            </h2>
            <div style={{ fontSize: 11, color: SD2_MUTED, fontFamily: sd2Mono, letterSpacing: '0.04em' }}>
              ELAPSED 38S · ETA ~2:30 · TOKENS 14,892 / 50,000
            </div>
          </div>
          <button style={{
            padding: '10px 16px', borderRadius: 8, border: 'none',
            background: SD2_INK, color: SD2_BG,
            fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ⏸ PAUSE STREAM
          </button>
        </div>
        {/* Phase progress */}
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 0 }}>
          {[
            { id: 1, label: '6 位投資大師', count: '4 / 6', state: 'active' },
            { id: 2, label: '3 方辯論',     count: '0 / 3', state: 'pending' },
            { id: 3, label: '3 風險分析',   count: '0 / 3', state: 'pending' },
            { id: 4, label: '投組整合',     count: '0 / 1', state: 'pending' },
          ].map((p, i, arr) => {
            const active = p.state === 'active';
            return (
              <React.Fragment key={p.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 999,
                    background: active ? SD2_BRAND : '#FFFFFF',
                    color: active ? '#fff' : SD2_MUTED,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, fontFamily: sd2Mono,
                    border: active ? `2px solid ${SD2_BRAND}` : '1px solid ' + SD2_HAIR,
                  }}>{p.id}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: active ? SD2_INK : SD2_MUTED }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: 10, fontFamily: sd2Mono, color: SD2_MUTED, letterSpacing: '0.06em' }}>
                      {p.count}
                    </div>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: SD2_HAIR, margin: '0 16px' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Consensus row — light, with delicate dividers */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        background: '#FFFFFF',
        borderBottom: '1px solid ' + SD2_HAIR,
      }}>
        {[
          { l: 'AVG SCORE', v: '7.9', sub: '4 of 13 reported', c: SD2_UP },
          { l: 'CONSENSUS', v: 'BUY', sub: 'High conviction',  c: SD2_UP, badge: true },
          { l: 'RANGE', v: '6.8 — 9.0', sub: 'σ = 0.84', c: SD2_INK },
          { l: 'PRICE TGT', v: '$245', sub: '+33% upside',     c: SD2_BRAND },
        ].map((k, i) => (
          <div key={k.l} style={{
            padding: '16px 20px',
            borderRight: i < 3 ? '1px solid ' + SD2_HAIR_SOFT : 'none',
          }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color: SD2_MUTED, fontFamily: sd2Mono }}>
              {k.l}
            </div>
            <div style={{
              fontSize: 26, fontWeight: 700, fontFamily: sd2Mono, color: k.c,
              letterSpacing: '-0.02em', marginTop: 6,
              ...(k.badge ? { display: 'inline-block', background: k.c, color: '#fff', padding: '3px 12px', borderRadius: 4, fontSize: 16 } : {}),
            }}>
              {k.v}
            </div>
            <div style={{ fontSize: 10.5, color: SD2_MUTED, fontFamily: sd2Mono, marginTop: 6 }}>
              {k.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Group selector */}
      <div style={{
        padding: '14px 22px', display: 'flex', gap: 8,
        borderBottom: '1px solid ' + SD2_HAIR,
        background: SD2_CARD,
      }}>
        {[
          { id: 'all',   l: '全部',     n: 13, on: true },
          { id: 'm',     l: '投資大師', n: 6,  on: false },
          { id: 'd',     l: '辯論',     n: 3,  on: false },
          { id: 'r',     l: '風險',     n: 3,  on: false },
          { id: 'pm',    l: 'PM 整合',  n: 1,  on: false },
        ].map((g) => (
          <button key={g.id} style={{
            padding: '6px 14px', borderRadius: 999,
            border: '1px solid ' + (g.on ? SD2_INK : SD2_HAIR),
            background: g.on ? SD2_INK : '#FFFFFF',
            color: g.on ? SD2_BG : SD2_INK,
            fontSize: 11, fontWeight: 600, fontFamily: sd2Sans,
          }}>
            {g.l} <span style={{ fontFamily: sd2Mono, opacity: 0.6, marginLeft: 4 }}>{g.n}</span>
          </button>
        ))}
      </div>

      {/* Agents grid 3x — on subtle off-white panel for separation */}
      <div style={{
        padding: 22,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14,
        background: '#FAF6EE',
      }}>
        {AGENTS.map((a) => <SD2AgentCard key={a.id} a={a} />)}
      </div>
    </section>
  );
}

function SD2AgentCard({ a }) {
  const isActive = a.status === 'streaming';
  const isComplete = a.status === 'complete';
  const isPending = !isActive && !isComplete;

  // Group accent — left rule color identifies agent group
  const groupAccent = {
    masters: '#3B6F4D',  // forest green — masters / wisdom
    debate:  '#7A5BD9',  // muted purple — debate
    risk:    '#C25B3F',  // brick — risk
    pm:      SD2_BRAND,  // brand — pm
  }[a.group];
  const groupLabel = { masters: 'MASTER', debate: 'DEBATE', risk: 'RISK', pm: 'PM' }[a.group];

  const stateColor = isComplete ? SD2_UP : isActive ? SD2_BRAND : SD2_MUTED;
  const stateLabel = isComplete ? '完成' : isActive ? '生成中' : '等待';

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid ' + (isActive ? SD2_BRAND : SD2_HAIR),
      borderRadius: 10, padding: '14px 14px 14px 16px',
      position: 'relative', overflow: 'hidden',
      boxShadow: isActive ? `0 0 0 3px rgba(204,120,92,0.10), 0 1px 0 rgba(0,0,0,0.02)` : '0 1px 0 rgba(0,0,0,0.02)',
      opacity: isPending ? 0.72 : 1,
    }}>
      {/* Group accent rule */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: groupAccent }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 6,
          background: a.group === 'pm' ? SD2_BRAND : '#F4EFE6',
          color: a.group === 'pm' ? '#fff' : SD2_INK,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontFamily: sd2Serif, fontWeight: 700,
          flexShrink: 0,
          border: a.group === 'pm' ? 'none' : '1px solid ' + SD2_HAIR,
        }}>{a.zh.slice(0, 1)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontFamily: sd2Mono, color: groupAccent, fontWeight: 700, letterSpacing: '0.1em' }}>
            {groupLabel}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: sd2Serif, color: SD2_INK }}>
            {a.zh} <span style={{ fontSize: 10, color: SD2_MUTED, fontFamily: sd2Sans }}>· {a.en}</span>
          </div>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, fontFamily: sd2Mono,
          padding: '3px 7px', borderRadius: 3,
          background: isComplete ? SD2_UP : isActive ? SD2_BRAND : '#F4EFE6',
          color: isPending ? SD2_MUTED : '#fff',
          border: isPending ? '1px solid ' + SD2_HAIR : 'none',
          whiteSpace: 'nowrap', letterSpacing: '0.06em',
        }}>
          {stateLabel}
        </span>
      </div>
      <div style={{ fontSize: 10.5, color: SD2_MUTED, marginTop: 8, lineHeight: 1.45 }}>
        {a.tagline}
      </div>
      {isComplete && a.score != null && (
        <>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 26, fontWeight: 700, fontFamily: sd2Mono, color: SD2_INK, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {a.score.toFixed(1)}
            </span>
            <span style={{ fontSize: 10, color: SD2_MUTED, fontFamily: sd2Mono }}>/ 10</span>
            <span style={{
              marginLeft: 'auto',
              fontSize: 9.5, fontWeight: 700, fontFamily: sd2Mono,
              padding: '3px 8px', borderRadius: 3,
              background: a.conviction === 'STRONG BUY' ? SD2_UP : a.conviction === 'BUY' ? '#3B6F4D' : a.conviction === 'HOLD' ? SD2_MUTED : SD2_DOWN,
              color: '#fff', letterSpacing: '0.06em',
            }}>{a.conviction}</span>
          </div>
          <div style={{
            marginTop: 10, padding: '10px 12px',
            background: '#FAF6EE',
            border: '1px solid ' + SD2_HAIR_SOFT,
            borderRadius: 6,
            fontSize: 10.5, lineHeight: 1.5, color: SD2_INK,
          }}>
            {a.id === 'buffett' && '寬廣護城河，CUDA 生態鎖客戶。ROE 122% 卓越。建議分批進場。'}
            {a.id === 'lynch' && 'PEG 0.87，AI 顛覆十倍股潛力。屬「快速成長型」分類。'}
            {a.id === 'wood' && 'AI 革命核心受益者，TAM 2030 達 $1.5T。創新 > 估值。'}
            {a.id === 'graham' && '當前估值偏離安全邊際，建議等回檔。但生態系護城河深。'}
            {a.id === 'munger' && '質地一流的企業，反向思考：失敗情境機率 < 15%。'}
            {a.id === 'dalio' && '通膨環境下，技術龍頭具相對防禦性。建議週期配置 5-8%。'}
          </div>
        </>
      )}
      {isActive && (
        <div style={{
          marginTop: 12, padding: '10px 12px',
          background: 'rgba(204,120,92,0.08)',
          border: '1px solid rgba(204,120,92,0.25)',
          borderRadius: 6,
          fontSize: 10.5, lineHeight: 1.5, color: SD2_INK,
          fontFamily: sd2Mono,
        }}>
          分析資產負債表異常項目，存貨水位較去年同期 +18%，DSO 從 47 升至 53...
          <span style={{
            display: 'inline-block', width: 5, height: 11,
            background: SD2_BRAND, verticalAlign: 'middle', marginLeft: 2,
            animation: 'dotPulse 1s infinite',
          }} />
        </div>
      )}
      {isPending && (
        <div style={{
          marginTop: 12, padding: '10px 12px',
          background: '#FAF6EE',
          border: '1px dashed ' + SD2_HAIR,
          borderRadius: 6,
          fontSize: 10, lineHeight: 1.4, color: SD2_MUTED,
          fontFamily: sd2Mono, letterSpacing: '0.04em',
          textAlign: 'center',
        }}>
          排隊中 · QUEUED
        </div>
      )}
    </div>
  );
}

function SD2SectionHeader({ eyebrow, title, right }) {
  return (
    <div style={{
      padding: '14px 18px 12px',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      borderBottom: '1px solid ' + SD2_HAIR_SOFT,
    }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SD2_BRAND, fontFamily: sd2Mono }}>
          {eyebrow}
        </div>
        <h3 style={{ fontFamily: sd2Serif, fontSize: 18, fontWeight: 600, margin: '4px 0 0', letterSpacing: '-0.01em' }}>
          {title}
        </h3>
      </div>
      {right}
    </div>
  );
}

Object.assign(window, { WebStockDetailV2 });
