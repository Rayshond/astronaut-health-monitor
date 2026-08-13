import React from 'react';
import {
  LineChart, Line, ResponsiveContainer, ReferenceLine, YAxis,
} from 'recharts';
import { MetricHistory } from '../types';

interface SparkLineProps {
  data: MetricHistory;
  color: string;
  normalLow: number;
  normalHigh: number;
}

export const SparkLine: React.FC<SparkLineProps> = ({
  data, color, normalLow, normalHigh,
}) => {
  if (data.length < 2) return <div style={{ height: 48 }} />;

  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <YAxis domain={['auto', 'auto']} hide />
        <ReferenceLine y={normalLow}  stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
        <ReferenceLine y={normalHigh} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
