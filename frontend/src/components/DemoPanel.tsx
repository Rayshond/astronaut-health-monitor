import React, { useState } from 'react';

const METRICS = [
  { key: 'heart_rate',       label: 'Heart Rate' },
  { key: 'spo2',             label: 'Blood Oxygen' },
  { key: 'respiratory_rate', label: 'Respiratory Rate' },
  { key: 'systolic_bp',      label: 'Systolic BP' },
  { key: 'body_temp',        label: 'Body Temp' },
  { key: 'cabin_co2',        label: 'Cabin CO₂' },
  { key: 'cabin_o2',         label: 'Cabin O₂' },
  { key: 'radiation_dose',   label: 'Radiation' },
  { key: 'sleep_hours',      label: 'Sleep' },
  { key: 'hrv',              label: 'HRV / Stress' },
];

const DEMO_DAYS = [
  { day: 0,   label: 'Launch (Day 0)' },
  { day: 12,  label: 'EVA Day (Day 12)' },
  { day: 50,  label: 'Cruise (Day 50)' },
  { day: 172, label: 'EVA Intensive (Day 172)' },
  { day: 196, label: 'Reentry (Day 196)' },
];

export const DemoPanel: React.FC = () => {
  const [active, setActive]    = useState<string | null>(null);
  const [loading, setLoading]  = useState(false);
  const [feedback, setFeedback] = useState('');

  const post = async (url: string, label: string) => {
    setLoading(true);
    setFeedback('');
    try {
      const res = await fetch(`http://localhost:8000${url}`, { method: 'POST' });
      const data = await res.json();
      setFeedback(`✅ ${label}`);
      setTimeout(() => setFeedback(''), 3000);
    } catch {
      setFeedback('❌ Backend offline');
      setTimeout(() => setFeedback(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const injectAnomaly = (metric: string) => {
    setActive(metric);
    post(`/demo/inject/${metric}`, `Injecting anomaly: ${metric}`);
  };

  const clearAnomaly = () => {
    setActive(null);
    post('/demo/clear', 'Anomaly cleared');
  };

  const jumpToDay = (day: number) => {
    post(`/mission/set-day/${day}`, `Jumped to day ${day}`);
  };

  return (
    <div style={{
      background:   '#060e1a',
      border:       '1px solid #1e3a5f',
      borderRadius: 14,
      padding:      16,
    }}>
      <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
        🎮 Demo Controls
      </div>

      {/* Mission day jump */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: '#8baac4', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Jump to Mission Phase
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {DEMO_DAYS.map(({ day, label }) => (
            <button
              key={day}
              onClick={() => jumpToDay(day)}
              disabled={loading}
              style={{
                background:   '#0d1b2a',
                border:       '1px solid #1e3a5f',
                borderRadius: 6,
                color:        '#4fc3f7',
                fontSize:     11,
                padding:      '4px 10px',
                cursor:       'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Anomaly injection */}
      <div>
        <div style={{ color: '#8baac4', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Inject Anomaly
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {METRICS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => injectAnomaly(key)}
              disabled={loading}
              style={{
                background:   active === key ? '#1a0000' : '#0d1b2a',
                border:       `1px solid ${active === key ? '#ef4444' : '#1e3a5f'}`,
                borderRadius: 6,
                color:        active === key ? '#f87171' : '#8baac4',
                fontSize:     11,
                padding:      '4px 10px',
                cursor:       'pointer',
                fontWeight:   active === key ? 700 : 400,
              }}
            >
              {label}
            </button>
          ))}
          {active && (
            <button
              onClick={clearAnomaly}
              disabled={loading}
              style={{
                background:   '#0a2000',
                border:       '1px solid #22c55e',
                borderRadius: 6,
                color:        '#4ade80',
                fontSize:     11,
                padding:      '4px 10px',
                cursor:       'pointer',
                fontWeight:   700,
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#4ade80' }}>{feedback}</div>
      )}
    </div>
  );
};
