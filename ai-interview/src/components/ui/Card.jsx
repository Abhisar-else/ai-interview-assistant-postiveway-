import styles from './Card.module.css';

export default function Card({
  children,
  title,
  subtitle,
  display = false,
  padding = 'md',
  className = '',
  onClick,
  ...props
}) {
  const classes = [
    styles.card,
    styles[`padding-${padding}`],
    onClick ? styles.clickable : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && (
            <h3 className={display ? `${styles.title} display-text` : styles.title}>
              {title}
            </h3>
          )}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
