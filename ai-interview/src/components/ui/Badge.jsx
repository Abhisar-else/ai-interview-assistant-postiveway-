import styles from './Badge.module.css';

export default function Badge({ children, variant = 'default', mono = false, className = '' }) {
  const classes = [
    styles.badge,
    styles[variant],
    mono ? 'data-text' : '',
    className,
  ].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
}
