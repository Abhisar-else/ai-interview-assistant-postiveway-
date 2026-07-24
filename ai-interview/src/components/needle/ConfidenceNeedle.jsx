import { useEffect, useRef, useState } from 'react';
import styles from './ConfidenceNeedle.module.css';

/**
 * Confidence Needle — VU-meter style gauge.
 * Two modes:
 *   1. Score mode (value={78})  — needle settles to position with spring animation
 *   2. Thinking mode (thinking) — needle oscillates, amber glow pulses
 */
export default function ConfidenceNeedle({
  value = 0,
  thinking = false,
  size = 'md',
  label = '',
  showValue = true,
}) {
  const [mounted, setMounted] = useState(false);
  const arcRef = useRef(null);

  useEffect(() => {
    // Trigger mount animation
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Dimensions based on size
  const dimensions = {
    sm: { width: 80, height: 52, strokeWidth: 4, needleLength: 28, fontSize: 14 },
    md: { width: 160, height: 100, strokeWidth: 6, needleLength: 56, fontSize: 28 },
    lg: { width: 240, height: 150, strokeWidth: 8, needleLength: 84, fontSize: 40 },
  };

  const dim = dimensions[size] || dimensions.md;
  const cx = dim.width / 2;
  const cy = dim.height - 8;
  const radius = dim.needleLength + 4;

  // Arc path (180° sweep, left to right)
  const arcStartX = cx - radius;
  const arcEndX = cx + radius;
  const arcY = cy;

  const arcPath = `M ${arcStartX} ${arcY} A ${radius} ${radius} 0 0 1 ${arcEndX} ${arcY}`;

  // Score arc fill — percentage of the semicircle
  const circumference = Math.PI * radius;
  const fillLength = thinking ? 0 : (value / 100) * circumference;

  // Needle rotation: -90° (left) to 90° (right), mapped from 0-100
  const needleAngle = thinking ? 0 : -90 + (value / 100) * 180;

  // Color gradient based on value
  const getScoreColor = (v) => {
    if (v < 40) return 'var(--color-alert-coral)';
    if (v < 70) return 'var(--color-ember-amber)';
    return 'var(--color-signal-green)';
  };

  const scoreColor = getScoreColor(value);

  return (
    <div className={`${styles.container} ${styles[size]}`}>
      <svg
        width={dim.width}
        height={dim.height}
        viewBox={`0 0 ${dim.width} ${dim.height}`}
        className={styles.svg}
      >
        {/* Background arc track */}
        <path
          d={arcPath}
          fill="none"
          stroke="var(--color-fog-darker)"
          strokeWidth={dim.strokeWidth}
          strokeLinecap="round"
        />

        {/* Score fill arc */}
        {!thinking && (
          <path
            ref={arcRef}
            d={arcPath}
            fill="none"
            stroke={scoreColor}
            strokeWidth={dim.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={mounted ? circumference - fillLength : circumference}
            style={{
              transition: `stroke-dashoffset 1.5s ${thinking ? 'ease' : 'cubic-bezier(0.34, 1.56, 0.64, 1)'}`,
            }}
          />
        )}

        {/* Thinking glow arc */}
        {thinking && (
          <path
            d={arcPath}
            fill="none"
            stroke="var(--color-ember-amber)"
            strokeWidth={dim.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.6}
            className={styles.thinkingArc}
          />
        )}

        {/* Tick marks at 0, 25, 50, 75, 100 */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = (-90 + (tick / 100) * 180) * (Math.PI / 180);
          const innerR = radius - dim.strokeWidth - 3;
          const outerR = radius + dim.strokeWidth + 1;
          return (
            <line
              key={tick}
              x1={cx + innerR * Math.cos(angle)}
              y1={cy + innerR * Math.sin(angle)}
              x2={cx + outerR * Math.cos(angle)}
              y2={cy + outerR * Math.sin(angle)}
              stroke="var(--color-ink-navy-30)"
              strokeWidth={tick === 50 ? 2 : 1}
              strokeLinecap="round"
            />
          );
        })}

        {/* Needle */}
        <g
          className={thinking ? styles.needleThinking : styles.needle}
          style={!thinking ? {
            transform: `rotate(${mounted ? needleAngle : -90}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          } : {
            transformOrigin: `${cx}px ${cy}px`,
          }}
        >
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - dim.needleLength}
            stroke={thinking ? 'var(--color-ember-amber)' : 'var(--color-ink-navy)'}
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* Needle base dot */}
          <circle
            cx={cx}
            cy={cy}
            r={3}
            fill={thinking ? 'var(--color-ember-amber)' : 'var(--color-ink-navy)'}
          />
        </g>
      </svg>

      {/* Score value display */}
      {showValue && !thinking && (
        <div className={styles.valueContainer}>
          <span className={`${styles.value} display-text`} style={{ color: scoreColor }}>
            {value}
          </span>
          <span className={`${styles.suffix} data-text`}>/100</span>
        </div>
      )}

      {/* Thinking label */}
      {thinking && (
        <div className={`${styles.thinkingLabel} data-text`}>
          Analyzing...
        </div>
      )}

      {/* Label */}
      {label && <div className={styles.label}>{label}</div>}
    </div>
  );
}
