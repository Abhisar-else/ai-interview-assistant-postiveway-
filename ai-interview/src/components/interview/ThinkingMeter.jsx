import ConfidenceNeedle from '../needle/ConfidenceNeedle';
import styles from './ThinkingMeter.module.css';

/**
 * Vertical thinking meter — thin bar on the right edge of the interview screen.
 * Pulses amber while the AI is generating the next question.
 */
export default function ThinkingMeter({ active = false }) {
  return (
    <div className={`${styles.meter} ${active ? styles.active : styles.idle}`}>
      <div className={styles.needle}>
        {active && <ConfidenceNeedle thinking={true} size="sm" showValue={false} />}
      </div>
      <div className={styles.bar}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={styles.segment}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
