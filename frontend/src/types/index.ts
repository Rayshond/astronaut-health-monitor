// ─── Metric & Alert types matching the backend payload ───────────────────────

export interface MetricValue {
  value: number;
  unit: string;
}

export interface Metrics {
  heart_rate: MetricValue;
  spo2: MetricValue;
  respiratory_rate: MetricValue;
  systolic_bp: MetricValue;
  diastolic_bp: MetricValue;
  body_temp: MetricValue;
  cabin_co2: MetricValue;
  cabin_o2: MetricValue;
  radiation_dose: MetricValue;
  sleep_hours: MetricValue;
  hrv: MetricValue;
}

export type Severity = 'critical' | 'warning' | 'normal';

export interface Alert {
  id: string;
  metric: string;
  severity: Severity;
  title: string;
  description: string;
  actions: string[];
  protocol: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface Snapshot {
  timestamp: string;
  mission_day: number;
  phase: string;
  is_eva_day: boolean;
  metrics: Metrics;
  alerts: Alert[];
}

// For sparkline history
export type MetricHistory = { t: number; v: number }[];

export type MetricKey = keyof Metrics;

export interface MetricConfig {
  label: string;
  icon: string;
  normalRange: [number, number];
  warningRange: [number, number];
  criticalRange: [number, number];
  decimals: number;
  category: 'vitals' | 'cabin' | 'performance';
}

export const METRIC_CONFIGS: Record<MetricKey, MetricConfig> = {
  heart_rate: {
    label: 'Heart Rate',
    icon: '❤️',
    normalRange: [60, 100],
    warningRange: [55, 110],
    criticalRange: [45, 130],
    decimals: 0,
    category: 'vitals',
  },
  spo2: {
    label: 'Blood Oxygen',
    icon: '🫁',
    normalRange: [95, 100],
    warningRange: [94, 100],
    criticalRange: [90, 100],
    decimals: 1,
    category: 'vitals',
  },
  respiratory_rate: {
    label: 'Respiratory Rate',
    icon: '💨',
    normalRange: [12, 20],
    warningRange: [10, 22],
    criticalRange: [8, 28],
    decimals: 0,
    category: 'vitals',
  },
  systolic_bp: {
    label: 'Systolic BP',
    icon: '🩸',
    normalRange: [90, 120],
    warningRange: [90, 135],
    criticalRange: [80, 155],
    decimals: 0,
    category: 'vitals',
  },
  diastolic_bp: {
    label: 'Diastolic BP',
    icon: '🩸',
    normalRange: [60, 80],
    warningRange: [55, 88],
    criticalRange: [50, 95],
    decimals: 0,
    category: 'vitals',
  },
  body_temp: {
    label: 'Body Temp',
    icon: '🌡️',
    normalRange: [97, 99],
    warningRange: [97, 99.5],
    criticalRange: [96, 101],
    decimals: 1,
    category: 'vitals',
  },
  cabin_co2: {
    label: 'Cabin CO₂',
    icon: '💨',
    normalRange: [0, 0.5],
    warningRange: [0, 0.7],
    criticalRange: [0, 1.0],
    decimals: 2,
    category: 'cabin',
  },
  cabin_o2: {
    label: 'Cabin O₂',
    icon: '🌬️',
    normalRange: [19.5, 23.5],
    warningRange: [19.5, 23.5],
    criticalRange: [18.5, 24.5],
    decimals: 1,
    category: 'cabin',
  },
  radiation_dose: {
    label: 'Radiation',
    icon: '☢️',
    normalRange: [0, 0.5],
    warningRange: [0, 1.0],
    criticalRange: [0, 2.0],
    decimals: 2,
    category: 'cabin',
  },
  sleep_hours: {
    label: 'Sleep',
    icon: '😴',
    normalRange: [7, 8],
    warningRange: [6, 10],
    criticalRange: [5, 12],
    decimals: 1,
    category: 'performance',
  },
  hrv: {
    label: 'Stress (HRV)',
    icon: '🧠',
    normalRange: [40, 100],
    warningRange: [30, 100],
    criticalRange: [20, 100],
    decimals: 0,
    category: 'performance',
  },
};
