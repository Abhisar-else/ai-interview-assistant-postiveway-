import styles from './ChatBubble.module.css';

export default function ChatBubble({ role, content, index = 0 }) {
  const isAI = role === 'ai';

  return (
    <div
      className={`${styles.bubble} ${isAI ? styles.ai : styles.user}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className={styles.label}>{isAI ? 'Interviewer' : 'You'}</div>
      <div className={styles.content}>{content}</div>
    </div>
  );
}
