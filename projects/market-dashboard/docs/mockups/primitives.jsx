// Shared UI primitives — sparkline, logo placeholder, formatting helpers, badges

const fmtMoney = (v, d = 0) => v.toLocaleString(undefined, { maximumFractionDigits: d });
const fmtCap = (v) => {
  if (!v) return '—';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6)  return `$${(v / 1e6).toFixed(2)}M`;
  return `$${v.toFixed(0)}`;
};
const fmtPct = (v, d = 2) => `${v >= 0 ? '+' : ''}${v.toFixed(d)}%`;
const fmtPrice = (v) => `$${v.toFixed(2)}`;

// Striped logo placeholder (we don't draw real brand logos)
function LogoTile({ symbol, size = 28 }) {
  // Hash to a deterministic warm/neutral hue from Claude palette
  const hash = [...symbol].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hues = ['#CC785C', '#1A1A1A', '#8B6F47', '#6B6357', '#A85C44'];
  const bg = hues[hash % hues.length];
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: size * 0.22,
        background: bg,
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 700,
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        letterSpacing: '-0.02em',
        flexShrink: 0,
      }}
    >
      {symbol.slice(0, symbol.length > 4 ? 3 : 2)}
    </div>
  );
}

// Sparkline (SVG path)
function Sparkline({ points, color = '#006e3f', width = 80, height = 24, fill = false }) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);
  const path = points.map((p, i) => {
    const x = i * step;
    const y = height - ((p - min) / range) * height;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      {fill && (
        <path
          d={`${path} L${width},${height} L0,${height} Z`}
          fill={color}
          opacity={0.12}
        />
      )}
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function ChangeBadge({ pct, size = 'md' }) {
  const up = pct >= 0;
  const color = up ? '#006e3f' : '#c62828';
  const bg    = up ? 'rgba(0,212,126,0.12)' : 'rgba(255,71,87,0.12)';
  const py = size === 'sm' ? 1 : 2;
  const px = size === 'sm' ? 6 : 8;
  const fs = size === 'sm' ? 10.5 : 11.5;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      padding: `${py}px ${px}px`, borderRadius: 999,
      color, background: bg,
      fontSize: fs, fontWeight: 600,
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontVariantNumeric: 'tabular-nums',
    }}>
      <span style={{ fontSize: fs * 0.85 }}>{up ? '▲' : '▼'}</span>
      {fmtPct(pct).replace('+', '')}
    </span>
  );
}

// Pixel-y candlestick chart placeholder (no real data — sketches what TradingView slot looks like)
function ChartPlaceholder({ height = 320, accent = '#CC785C', priceUp = true }) {
  const bars = 60;
  const arr = [];
  let prev = 50;
  for (let i = 0; i < bars; i++) {
    const r = Math.sin(i * 0.4) * 6 + Math.cos(i * 0.27) * 4 + (priceUp ? i * 0.3 : -i * 0.2);
    const open = prev;
    const close = prev + r + (Math.random() - 0.5) * 4;
    const high = Math.max(open, close) + Math.random() * 3;
    const low  = Math.min(open, close) - Math.random() * 3;
    arr.push({ open, close, high, low, up: close >= open });
    prev = close;
  }
  const allVals = arr.flatMap((b) => [b.high, b.low]);
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min;
  const w = 100;
  const barW = w / bars;
  const y = (v) => ((max - v) / range) * height;

  return (
    <div style={{
      position: 'relative',
      height, width: '100%',
      background: '#fff',
      borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.07)',
      overflow: 'hidden',
    }}>
      {/* gridlines */}
      {[0.25, 0.5, 0.75].map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, right: 0, top: `${p * 100}%`,
          borderTop: '1px dashed rgba(0,0,0,0.05)',
        }} />
      ))}
      {/* y-axis labels */}
      <div style={{ position: 'absolute', right: 8, top: 8, fontSize: 10, color: '#999', fontFamily: 'JetBrains Mono, monospace' }}>
        ${(prev + 130).toFixed(2)}
      </div>
      <div style={{ position: 'absolute', right: 8, bottom: 8, fontSize: 10, color: '#999', fontFamily: 'JetBrains Mono, monospace' }}>
        ${(prev + 110).toFixed(2)}
      </div>
      {/* candles */}
      <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
        {arr.map((b, i) => {
          const x = i * barW + barW * 0.15;
          const cw = barW * 0.7;
          const cx = x + cw / 2;
          const c = b.up ? '#00a86b' : '#ff4757';
          return (
            <g key={i}>
              <line x1={cx} x2={cx} y1={y(b.high)} y2={y(b.low)} stroke={c} strokeWidth={0.3} />
              <rect
                x={x} y={y(Math.max(b.open, b.close))}
                width={cw} height={Math.max(0.5, Math.abs(y(b.close) - y(b.open)))}
                fill={c}
              />
            </g>
          );
        })}
      </svg>
      {/* current price line */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        top: `${50 + (priceUp ? -15 : 15)}%`,
        borderTop: `1px dashed ${accent}`,
      }}>
        <span style={{
          position: 'absolute', right: 0, top: -10,
          background: accent, color: '#fff',
          fontSize: 10, padding: '2px 6px',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 600,
        }}>
          ${(prev + 124).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

Object.assign(window, {
  fmtMoney, fmtCap, fmtPct, fmtPrice,
  LogoTile, Sparkline, ChangeBadge, ChartPlaceholder,
});
