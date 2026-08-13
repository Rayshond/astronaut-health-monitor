import React from 'react';
import { MetricValue, MetricConfig, MetricHistory, Severity } from '../types';
import { SparkLine } from './SparkLine';

interface MetricCardProps {
  metricKey: string;
  data: MetricValue;
  config: MetricConfig;
  history: MetricHistory;
  severity: Severity;
}

const SEVERITY_COLORS: Record<Severity, { bg: string; border: string; text: string; spark: string }> = {
  normal:   { bg: '#0d1b2a',        border: '#1e3a5f',  text: '#4fc3f7',  spark: '#4fc3f7' },
  warning:  { bg: '#1a1500',        border: '#f59e0b',  text: '#fbbf24',  spark: '#fbbf24' },
  critical: { bg: '#1a0000',        border: '#ef4444',  text: '#f87171',  spark: '#f87171' },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  metricKey, data, config, history, severity,
}) => {
  const colors = SEVERITY_COLORS[severity];

  // Visual gauge: 0–100% of the normal range
  const [lo, hi] = config.normalRange;
  const percent = Math.max(0, Math.min(100, ((data.value - lo) / (hi - lo)) * 100));
  const gaugeColor = severity === 'normal' ? '#4fc3f7'
    : severity === 'warning' ? '#fbbf24' : '#ef4444';

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
      transition:    'border-color 0.3s',
    }}>
      {/* Severity pulse dot */}
      {severity !== 'normal' && (
        <div style={{
          position:     'absolute',
          top:          10,
          right:        10,
          width:        8,
          height:       8,
          borderRadius: '50%',
          background:   gaugeColor,
          boxShadow:    `0 0 8px ${gaugeColor}`,
          animation:    'pulse 1.2s ease-in-out infinite',
        }} />
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
        <span style={{ fontSize: 32, fontWeight: 700, color: colors.text, fontVariantNumeric: 'tabular-nums' }}>
          {data.value.toFixed(config.decimals)}
        </span>
        <span style={{ fontSize: 12, color: '#5c7a96' }}>{data.unit}</span>
      </div>

      {/* Gauge bar */}
      <div style={{ height: 3, background: '#162334', borderRadius: 2 }}>
        <div style={{
          height:       3,
          width:        `${percent}%`,
          background:   gaugeColor,
          borderRadius: 2,
          transition:   'width 0.5s ease, background 0.3s',
        }} />
      </div>

      {/* Sparkline */}
      <SparkLine
        data={history}
        color={colors.spark}
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
