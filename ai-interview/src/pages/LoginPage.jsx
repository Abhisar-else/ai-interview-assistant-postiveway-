import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import ConfidenceNeedle from '../components/needle/ConfidenceNeedle';
import styles from './Auth.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.logoRow}>
            <span className={styles.logoNeedle}>▮</span>
            <h1 className={`${styles.brandTitle} display-text`}>InterviewSim</h1>
          </div>
          <p className={styles.brandSubtitle}>AI-Powered Rehearsal Room</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.formTitle}>Candidate Sign In</h2>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {submitting ? (
              <div className={styles.loadingNeedle}>
                <ConfidenceNeedle thinking={true} size="sm" showValue={false} />
              </div>
            ) : (
              <Button type="submit" variant="accent" size="lg" fullWidth>
                Sign In
              </Button>
            )}

            <div className={styles.footer}>
              Don't have an account?{' '}
              <Link to="/register" className={styles.link}>
                Register
              </Link>
            </div>
            <div className={styles.adminLinkRow}>
              <Link to="/admin/login" className={styles.adminLink}>
                Admin Portal →
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
