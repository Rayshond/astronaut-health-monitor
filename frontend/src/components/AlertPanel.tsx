import React, { useState } from 'react';
import { Alert, Severity } from '../types';

interface AlertPanelProps {
  alerts: Alert[];
}

const SEVERITY_STYLE: Record<Severity | 'normal', { bg: string; border: string; badge: string; badgeBg: string }> = {
  critical: { bg: '#1a0000', border: '#ef4444', badge: 'CRITICAL', badgeBg: '#ef4444' },
  warning:  { bg: '#1a1100', border: '#f59e0b', badge: 'WARNING',  badgeBg: '#d97706' },
  normal:   { bg: '#0a1628', border: '#1e3a5f', badge: 'OK',       badgeBg: '#1d4ed8' },
};

const AlertItem: React.FC<{ alert: Alert }> = ({ alert }) => {
  const [expanded, setExpanded] = useState(false);
  const style = SEVERITY_STYLE[alert.severity];

  return (
    <div style={{
      background:   style.bg,
      border:       `1px solid ${style.border}`,
      borderRadius: 10,
      overflow:     'hidden',
      marginBottom: 10,
    }}>
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width:          '100%',
          background:     'transparent',
          border:         'none',
          cursor:         'pointer',
          padding:        '12px 14px',
          display:        'flex',
          alignItems:     'center',
          gap:            10,
          textAlign:      'left',
        }}
      >
        {/* Severity badge */}
        <span style={{
          background:   style.badgeBg,
          color:        '#fff',
          fontSize:     10,
          fontWeight:   700,
          padding:      '2px 7px',
          borderRadius: 4,
          letterSpacing: '0.07em',
          flexShrink:   0,
        }}>
          {style.badge}
        </span>

        <span style={{ flex: 1, color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>
          {alert.title}
        </span>

        <span style={{ color: '#5c7a96', fontSize: 14 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Current value pill */}
      <div style={{ padding: '0 14px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#8baac4' }}>
          Current: <strong style={{ color: '#e2e8f0' }}>{alert.value} {alert.unit}</strong>
        </span>
        <span style={{ fontSize: 11, color: '#3d5a73' }}>
          {new Date(alert.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Expanded: description + actions + protocol */}
      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${style.border}22` }}>
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
  const criticals = alerts.filter(a => a.severity === 'critical');
  const warnings  = alerts.filter(a => a.severity === 'warning');

  return (
    <div style={{
      background:   '#060e1a',
      border:       '1px solid #1e3a5f',
      borderRadius: 14,
      padding:      16,
      height:       '100%',
      overflowY:    'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 16 }}>🚨</span>
        <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15 }}>Active Alerts</span>
        {criticals.length > 0 && (
          <span style={{
            background: '#ef4444', color: '#fff',
            borderRadius: 10, fontSize: 11, fontWeight: 700,
            padding: '1px 8px',
          }}>
            {criticals.length} CRITICAL
          </span>
        )}
        {warnings.length > 0 && (
          <span style={{
            background: '#d97706', color: '#fff',
            borderRadius: 10, fontSize: 11, fontWeight: 700,
            padding: '1px 8px',
          }}>
            {warnings.length} WARNING
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        '40px 0',
          color:          '#2d4a63',
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 14, color: '#3d6080' }}>All systems nominal</div>
        </div>
      ) : (
        <>
          {criticals.map(a => <AlertItem key={a.id + a.timestamp} alert={a} />)}
          {warnings.map(a  => <AlertItem key={a.id + a.timestamp} alert={a} />)}
        </>
      )}
    </div>
  );
};
