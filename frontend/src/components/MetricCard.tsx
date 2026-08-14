import React from 'react';
import { MetricValue, MetricConfig, MetricHistory, Severity } from '../types';
import { SparkLine } from './SparkLine';

interface MetricCardProps {
  metricKey: string;
  data: MetricValue;
  config: MetricConfig;
  history: MetricHistory;
  severity: Severity;
  dangerScore: number; // 0.0 (normal) → 1.0 (max critical)
}

/**
 * Interpolates between two hex colors by a 0–1 factor.
 */
function lerpColor(a: string, b: string, t: number): string {
  const ah = a.replace('#', '');
  const bh = b.replace('#', '');
  const ar = parseInt(ah.slice(0, 2), 16);
  const ag = parseInt(ah.slice(2, 4), 16);
  const ab = parseInt(ah.slice(4, 6), 16);
  const br = parseInt(bh.slice(0, 2), 16);
  const bg = parseInt(bh.slice(2, 4), 16);
  const bb = parseInt(bh.slice(4, 6), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b2 = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`;
}

// Color stops: normal → warning → critical
const COLOR_NORMAL   = { bg: '0d1b2a', border: '1e3a5f', text: '4fc3f7' };
const COLOR_WARNING  = { bg: '1a1400', border: 'c87c00', text: 'f0a500' };
const COLOR_CRITICAL = { bg: '1a0000', border: 'ef4444', text: 'f87171' };

function getGradientColors(dangerScore: number) {
  // 0.0–0.5 = normal → warning, 0.5–1.0 = warning → critical
  if (dangerScore <= 0.5) {
    const t = dangerScore * 2;
    return {
      bg:     '#' + lerpColor(COLOR_NORMAL.bg,   COLOR_WARNING.bg,   t).replace('#', ''),
      border: '#' + lerpColor(COLOR_NORMAL.border, COLOR_WARNING.border, t).replace('#', ''),
      text:   '#' + lerpColor(COLOR_NORMAL.text,  COLOR_WARNING.text,  t).replace('#', ''),
    };
  } else {
    const t = (dangerScore - 0.5) * 2;
    return {
      bg:     '#' + lerpColor(COLOR_WARNING.bg,   COLOR_CRITICAL.bg,   t).replace('#', ''),
      border: '#' + lerpColor(COLOR_WARNING.border, COLOR_CRITICAL.border, t).replace('#', ''),
      text:   '#' + lerpColor(COLOR_WARNING.text,  COLOR_CRITICAL.text,  t).replace('#', ''),
    };
  }
}

export const MetricCard: React.FC<MetricCardProps> = ({
  metricKey, data, config, history, severity, dangerScore,
}) => {
  const colors = getGradientColors(dangerScore);

  // Gauge: how far the value sits within the full critical range
  const [lo, hi] = config.criticalRange;
  const safeLo = lo === 0 ? 0 : lo;
  const safeHi = hi === 100 ? 100 : hi;
  const range = safeHi - safeLo;
  const percent = range > 0
    ? Math.max(0, Math.min(100, ((data.value - safeLo) / range) * 100))
    : 50;

  const gaugeColor = dangerScore < 0.01 ? '#4fc3f7'
    : lerpColor('4fc3f7', dangerScore < 0.5 ? 'f0a500' : 'ef4444', dangerScore);

  // Label shown on card when in warning/critical zone
  const zoneLabel = severity === 'critical' ? 'DANGER'
    : severity === 'warning' ? 'WARNING' : null;

  return (
    <div style={{
      background:    colors.bg,
      border:        `1px solid ${colors.border}`,
      borderRadius:  12,
      padding:       '14px 16px',
      display:       'flex',
      flexDirection: 'column',
      gap:           6,
      position:      'relative',
      overflow:      'hidden',
      transition:    'background 1.2s ease, border-color 1.2s ease',
    }}>
      {/* Zone label badge — WARNING or DANGER on the card itself */}
      {zoneLabel && (
        <div style={{
          position:     'absolute',
          top:          10,
          right:        10,
          display:      'flex',
          alignItems:   'center',
          gap:          5,
        }}>
          {severity === 'critical' && (
            <div style={{
              width:        7,
              height:       7,
              borderRadius: '50%',
              background:   '#ef4444',
              boxShadow:    '0 0 7px #ef4444',
              animation:    'pulse 1.2s ease-in-out infinite',
              flexShrink:   0,
            }} />
          )}
          <span style={{
            fontSize:      9,
            fontWeight:    700,
            letterSpacing: '0.09em',
            color:         severity === 'critical' ? '#f87171' : '#f0a500',
            opacity:       0.9,
          }}>
            {zoneLabel}
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 16 }}>{config.icon}</span>
        <span style={{ fontSize: 11, color: '#8baac4', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {config.label}
        </span>
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontSize: 32, fontWeight: 700,
          color: colors.text,
          fontVariantNumeric: 'tabular-nums',
          transition: 'color 1.2s ease',
        }}>
          {data.value.toFixed(config.decimals)}
        </span>
        <span style={{ fontSize: 12, color: '#5c7a96' }}>{data.unit}</span>
      </div>

      {/* Gauge bar */}
      <div style={{ height: 3, background: '#0a1220', borderRadius: 2 }}>
        <div style={{
          height:       3,
          width:        `${percent}%`,
          background:   gaugeColor,
          borderRadius: 2,
          transition:   'width 0.6s ease, background 1.2s ease',
        }} />
      </div>

      {/* Sparkline */}
      <SparkLine
        data={history}
        color={gaugeColor}
        normalLow={config.normalRange[0]}
        normalHigh={config.normalRange[1]}
      />

      {/* Normal range label */}
      <div style={{ fontSize: 10, color: '#3d5a73' }}>
        Normal: {config.normalRange[0]}–{config.normalRange[1]} {data.unit}
      </div>
    </div>
  );
};
