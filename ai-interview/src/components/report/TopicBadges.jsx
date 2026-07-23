import styles from './TopicBadges.module.css';

export default function TopicBadges({ topics = [] }) {
  return (
    <div className={styles.container}>
      <h4 className={styles.heading}>
        <span className={styles.icon}>📚</span>
        Recommended Topics
      </h4>
      <div className={styles.badges}>
        {topics.map((topic, i) => (
          <span
            key={i}
            className={`${styles.badge} data-text`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}
