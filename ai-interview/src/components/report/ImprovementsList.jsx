import styles from './ImprovementsList.module.css';

export default function ImprovementsList({ items = [] }) {
  return (
    <div className={styles.container}>
      <h4 className={styles.heading}>
        <span className={styles.icon}>△</span>
        Areas for Improvement
      </h4>
      <ul className={styles.list}>
        {items.map((item, i) => (
          <li
            key={i}
            className={styles.item}
            style={{ animationDelay: `${(i * 0.1) + 0.3}s` }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
