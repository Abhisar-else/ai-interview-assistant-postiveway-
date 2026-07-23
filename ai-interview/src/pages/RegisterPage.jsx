import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import ConfidenceNeedle from '../components/needle/ConfidenceNeedle';
import styles from './Auth.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await register({ name, email, phone, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
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
            <h2 className={styles.formTitle}>Create Account</h2>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <Input
              label="Full Name"
              type="text"
              placeholder="Vinod Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Phone Number (Optional)"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
                Register & Start
              </Button>
            )}

            <div className={styles.footer}>
              Already registered?{' '}
              <Link to="/login" className={styles.link}>
                Sign In
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
