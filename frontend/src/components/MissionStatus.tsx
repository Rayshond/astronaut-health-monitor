import React from 'react';
import { Snapshot } from '../types';

interface MissionStatusProps {
  snapshot: Snapshot | null;
  connected: boolean;
  reconnecting: boolean;
}

const PHASE_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  launch:        { label: 'Launch',         color: '#f97316', emoji: '🚀' },
  early_orbit:   { label: 'Early Orbit',    color: '#3b82f6', emoji: '🛸' },
  cruise:        { label: 'Orbital Cruise', color: '#22c55e', emoji: '🌍' },
  mid_mission:   { label: 'Mid Mission',    color: '#06b6d4', emoji: '🌌' },
  eva_intensive: { label: 'EVA Ops',        color: '#f59e0b', emoji: '🧑‍🚀' },
  recovery:      { label: 'Recovery',       color: '#8b5cf6', emoji: '😮‍💨' },
  reentry_prep:  { label: 'Reentry Prep',   color: '#f97316', emoji: '⚠️' },
  reentry:       { label: 'Reentry',        color: '#ef4444', emoji: '🔥' },
};

export const MissionStatus: React.FC<MissionStatusProps> = ({
  snapshot, connected, reconnecting,
}) => {
  const phase = snapshot ? (PHASE_LABELS[snapshot.phase] ?? { label: snapshot.phase, color: '#4fc3f7', emoji: '🛰️' }) : null;
  const progressPercent = snapshot ? (snapshot.mission_day / 200) * 100 : 0;

  return (
    <div style={{
      background:    '#060e1a',
      border:        '1px solid #1e3a5f',
      borderRadius:  14,
      padding:       '16px 20px',
      display:       'flex',
      alignItems:    'center',
      gap:           20,
      flexWrap:      'wrap',
    }}>
      {/* Logo / Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>🛰️</span>
        <div>
          <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>
            Astronaut Health Monitor
          </div>
          <div style={{ color: '#3d5a73', fontSize: 11 }}>ISS Mission Control · Real-time</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ flex: 1, minWidth: 1 }} />

      {/* Mission day + phase */}
      {snapshot && phase && (
        <>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#8baac4', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Mission Day</div>
            <div style={{ color: '#e2e8f0', fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {snapshot.mission_day}
              <span style={{ color: '#3d5a73', fontSize: 13 }}>/200</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#8baac4', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Phase</div>
            <div style={{ color: phase.color, fontSize: 14, fontWeight: 600 }}>
              {phase.emoji} {phase.label}
            </div>
          </div>

          {snapshot.is_eva_day && (
            <div style={{
              background: '#1a1100',
              border:     '1px solid #f59e0b',
              borderRadius: 8,
              padding:    '4px 12px',
              color:      '#fbbf24',
              fontSize:   12,
              fontWeight: 700,
              animation:  'pulse 1.5s ease-in-out infinite',
            }}>
              ⚠️ EVA DAY
            </div>
          )}

          {/* Mission progress bar */}
          <div style={{ minWidth: 120 }}>
            <div style={{ color: '#3d5a73', fontSize: 10, marginBottom: 4 }}>Mission Progress</div>
            <div style={{ height: 6, background: '#0d1b2a', borderRadius: 3 }}>
              <div style={{
                height: 6,
                width:  `${progressPercent}%`,
                background: 'linear-gradient(90deg, #1d4ed8, #4fc3f7)',
                borderRadius: 3,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        </>
      )}

      {/* Connection status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: connected ? '#22c55e' : reconnecting ? '#f59e0b' : '#ef4444',
          boxShadow: connected ? '0 0 6px #22c55e' : 'none',
        }} />
        <span style={{ fontSize: 11, color: '#5c7a96' }}>
          {connected ? 'Live' : reconnecting ? 'Reconnecting…' : 'Offline'}
        </span>
      </div>
    </div>
  );
};
