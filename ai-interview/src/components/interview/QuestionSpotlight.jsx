import styles from './QuestionSpotlight.module.css';

/**
 * Question Spotlight — the current question displayed center-stage.
 * Uses Fraunces display font for the "being judged" gravity.
 */
export default function QuestionSpotlight({ question, visible = true }) {
  return (
    <div className={`${styles.spotlight} ${visible ? styles.visible : styles.hidden}`}>
      <div className={styles.indicator}>Current Question</div>
      <p className={`${styles.question} display-text`}>{question}</p>
    </div>
  );
}
