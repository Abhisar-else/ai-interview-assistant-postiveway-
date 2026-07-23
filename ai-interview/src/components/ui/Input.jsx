import { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(function Input({
  label,
  error,
  type = 'text',
  id,
  className = '',
  ...props
}, ref) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`${styles.group} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          ref={ref}
          id={inputId}
          className={`${styles.input} ${styles.textarea} ${error ? styles.error : ''}`}
          {...props}
        />
      ) : (
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`${styles.input} ${error ? styles.error : ''}`}
          {...props}
        />
      )}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
});

export default Input;
