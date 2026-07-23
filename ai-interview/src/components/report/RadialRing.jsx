import { useEffect, useState } from 'react';
import styles from './RadialRing.module.css';

/**
 * Radial Ring — SVG donut that fills from 0 to target score.
 * Color: green (≥70), amber (50-69), coral (<50)
 */
export default function RadialRing({ value = 0, label = '', size = 120 }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  const getColor = (v) => {
    if (v >= 70) return 'var(--color-signal-green)';
    if (v >= 50) return 'var(--color-ember-amber)';
    return 'var(--color-alert-coral)';
  };

  const color = getColor(value);

  return (
    <div className={styles.container}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-fog-dark)"
          strokeWidth={strokeWidth}
        />
        {/* Score fill ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? offset : circumference}
          className={styles.fillRing}
          transform={`rotate(-90 ${center} ${center})`}
        />
        {/* Score text centered */}
        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          dominantBaseline="central"
          className={styles.scoreText}
          fill={color}
        >
          {value}
        </text>
        <text
          x={center}
          y={center + 16}
          textAnchor="middle"
          dominantBaseline="central"
          className={styles.suffixText}
          fill="var(--color-ink-navy-30)"
        >
          /100
        </text>
      </svg>
      {label && <div className={styles.label}>{label}</div>}
    </div>
  );
}
