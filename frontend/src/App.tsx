import React, { useMemo } from 'react';
import { useMetrics } from './hooks/useMetrics';
import { MissionStatus } from './components/MissionStatus';
import { MetricCard } from './components/MetricCard';
import { AlertPanel } from './components/AlertPanel';
import { DemoPanel } from './components/DemoPanel';
import { METRIC_CONFIGS, MetricKey, Severity } from './types';

const METRIC_KEYS = Object.keys(METRIC_CONFIGS) as MetricKey[];

export default function App() {
  const { snapshot, history, connected, reconnecting } = useMetrics();

  // Build a severity map from active alerts
  const severityMap = useMemo<Record<MetricKey, Severity>>(() => {
    const map = {} as Record<MetricKey, Severity>;
    METRIC_KEYS.forEach(k => { map[k] = 'normal'; });
    if (!snapshot) return map;
    snapshot.alerts.forEach(alert => {
      const key = alert.metric as MetricKey;
      if (key in map) {
        // Critical always wins over warning
        if (alert.severity === 'critical' || map[key] !== 'critical') {
          map[key] = alert.severity;
        }
      }
    });
    return map;
  }, [snapshot]);

  const vitals      = METRIC_KEYS.filter(k => METRIC_CONFIGS[k].category === 'vitals');
  const cabin       = METRIC_KEYS.filter(k => METRIC_CONFIGS[k].category === 'cabin');
  const performance = METRIC_KEYS.filter(k => METRIC_CONFIGS[k].category === 'performance');

  return (
    <div style={{
      minHeight:       '100vh',
      background:      '#030912',
      color:           '#e2e8f0',
      fontFamily:      '-apple-system, "Segoe UI", system-ui, sans-serif',
      padding:         '16px',
      boxSizing:       'border-box',
    }}>
      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #030912; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }
      `}</style>

      {/* Top bar */}
      <MissionStatus snapshot={snapshot} connected={connected} reconnecting={reconnecting} />

      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, alignItems: 'start' }}>

        {/* Left: metrics grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Vitals */}
          <Section label="🫀 Crew Vitals">
            <MetricGrid metricKeys={vitals} snapshot={snapshot} history={history} severityMap={severityMap} />
          </Section>

          {/* Cabin */}
          <Section label="🌬️ Cabin Environment">
            <MetricGrid metricKeys={cabin} snapshot={snapshot} history={history} severityMap={severityMap} />
          </Section>

          {/* Performance */}
          <Section label="🧠 Performance & Wellness">
            <MetricGrid metricKeys={performance} snapshot={snapshot} history={history} severityMap={severityMap} />
          </Section>

          {/* Demo controls */}
          <DemoPanel />
        </div>

        {/* Right: alert panel (sticky) */}
        <div style={{ position: 'sticky', top: 16, maxHeight: 'calc(100vh - 32px)', overflowY: 'auto' }}>
          <AlertPanel alerts={snapshot?.alerts ?? []} />
        </div>
      </div>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div style={{ color: '#5c7a96', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
      {label}
    </div>
    {children}
  </div>
);

// ─── Metric grid ─────────────────────────────────────────────────────────────
interface MetricGridProps {
  metricKeys: MetricKey[];
  snapshot: ReturnType<typeof useMetrics>['snapshot'];
  history: ReturnType<typeof useMetrics>['history'];
  severityMap: Record<MetricKey, Severity>;
}

const MetricGrid: React.FC<MetricGridProps> = ({ metricKeys, snapshot, history, severityMap }) => (
  <div style={{
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap:                 10,
  }}>
    {metricKeys.map(key => {
      const config = METRIC_CONFIGS[key];
      const data   = snapshot?.metrics[key] ?? { value: 0, unit: config.label };
      return (
        <MetricCard
          key={key}
          metricKey={key}
          data={data}
          config={config}
          history={history[key]}
          severity={severityMap[key]}
        />
      );
    })}
  </div>
);
