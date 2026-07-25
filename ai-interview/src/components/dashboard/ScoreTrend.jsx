import styles from './ScoreTrend.module.css';

export default function ScoreTrend({ sessions }) {
  // Get last 5 completed sessions with overall_score, reversed for chronological order
  const scores = sessions
    .filter(s => s.status === 'completed' && s.overall_score != null)
    .slice(0, 5)
    .reverse()
    .map(s => Math.round(s.overall_score));

  if (scores.length < 2) return null;

  return (
    <div className={styles.trendContainer}>
      <span className={styles.trendLabel}>Score Trend (Last 5)</span>
      <div className={styles.bars}>
        {scores.map((score, i) => (
          <div key={i} className={styles.barWrapper}>
            <div
              className={styles.bar}
              style={{ height: `${score}%` }}
              title={`${score}%`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
