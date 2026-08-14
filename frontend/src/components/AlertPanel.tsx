import React, { useState } from 'react';
import { Alert } from '../types';

interface AlertPanelProps {
  alerts: Alert[];
}

const AlertItem: React.FC<{ alert: Alert }> = ({ alert }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background:   '#1a0000',
      border:       '1px solid #ef4444',
      borderRadius: 10,
      overflow:     'hidden',
      marginBottom: 10,
    }}>
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width:      '100%',
          background: 'transparent',
          border:     'none',
          cursor:     'pointer',
          padding:    '12px 14px',
          display:    'flex',
          alignItems: 'center',
          gap:        10,
          textAlign:  'left',
        }}
      >
        {/* Pulsing dot */}
        <div style={{
          width:        8,
          height:       8,
          borderRadius: '50%',
          background:   '#ef4444',
          boxShadow:    '0 0 8px #ef4444',
          animation:    'pulse 1.2s ease-in-out infinite',
          flexShrink:   0,
        }} />

        {/* DANGER badge */}
        <span style={{
          background:    '#ef4444',
          color:         '#fff',
          fontSize:      10,
          fontWeight:    700,
          padding:       '2px 7px',
          borderRadius:  4,
          letterSpacing: '0.07em',
          flexShrink:    0,
        }}>
          DANGER
        </span>

        <span style={{ flex: 1, color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>
          {alert.title}
        </span>

        <span style={{ color: '#5c7a96', fontSize: 14 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Current value */}
      <div style={{ padding: '0 14px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#8baac4' }}>
          Current: <strong style={{ color: '#f87171' }}>{alert.value} {alert.unit}</strong>
        </span>
        <span style={{ fontSize: 11, color: '#3d5a73' }}>
          {new Date(alert.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid #ef444422' }}>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: '10px 0 12px' }}>
            {alert.description}
          </p>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#5c7a96', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              Immediate Actions
            </div>
            <ol style={{ margin: 0, padding: '0 0 0 18px' }}>
              {alert.actions.map((action, i) => (
                <li key={i} style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 5, lineHeight: 1.5 }}>
                  {action}
                </li>
              ))}
            </ol>
          </div>

          <div style={{
            marginTop:    10,
            padding:      '6px 10px',
            background:   '#0a1628',
            borderRadius: 6,
            fontSize:     11,
            color:        '#5c7a96',
          }}>
            📋 Protocol: <span style={{ color: '#4fc3f7' }}>{alert.protocol}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts }) => {
  // Only show critical alerts in this panel
  const dangers = alerts.filter(a => a.severity === 'critical');

  return (
    <div style={{
      background:   '#060e1a',
      border:       `1px solid ${dangers.length > 0 ? '#ef4444' : '#1e3a5f'}`,
      borderRadius: 14,
      padding:      16,
      height:       '100%',
      overflowY:    'auto',
      transition:   'border-color 1.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 16 }}>{dangers.length > 0 ? '🚨' : '🛡️'}</span>
        <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15 }}>
          {dangers.length > 0 ? 'Critical Alerts' : 'System Status'}
        </span>
        {dangers.length > 0 && (
          <span style={{
            background:   '#ef4444',
            color:        '#fff',
            borderRadius: 10,
            fontSize:     11,
            fontWeight:   700,
            padding:      '1px 8px',
            animation:    'pulse 1.2s ease-in-out infinite',
          }}>
            {dangers.length} DANGER
          </span>
        )}
      </div>

      {dangers.length === 0 ? (
        <div style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        '40px 0',
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 14, color: '#3d6080' }}>All systems nominal</div>
          <div style={{ fontSize: 11, color: '#2d4a63', marginTop: 6 }}>
            Alerts fire only at critical danger levels
          </div>
        </div>
      ) : (
        dangers.map(a => <AlertItem key={a.id + a.timestamp} alert={a} />)
      )}
    </div>
  );
};
