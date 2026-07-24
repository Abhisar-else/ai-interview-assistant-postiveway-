import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import ConfidenceNeedle from '../components/needle/ConfidenceNeedle';
import styles from './Auth.module.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter admin credentials');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Admin authorization failed');
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
          <p className={styles.brandSubtitle}>Admin Administration Portal</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.formTitle}>Admin Portal Access</h2>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@interviewsim.ai"
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
              <Button type="submit" variant="primary" size="lg" fullWidth>
                Authenticate Admin
              </Button>
            )}

            <div className={styles.footer}>
              Candidate login?{' '}
              <Link to="/login" className={styles.link}>
                Candidate Portal
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
