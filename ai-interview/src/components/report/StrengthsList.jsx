import styles from './StrengthsList.module.css';

export default function StrengthsList({ items = [] }) {
  return (
    <div className={styles.container}>
      <h4 className={styles.heading}>
        <span className={styles.icon}>✓</span>
        Strengths
      </h4>
      <ul className={styles.list}>
        {items.map((item, i) => (
          <li
            key={i}
            className={styles.item}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
