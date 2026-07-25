import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ConfidenceNeedle from '../components/needle/ConfidenceNeedle';
import ResumeUpload from '../components/resume/ResumeUpload';
import ScoreTrend from '../components/dashboard/ScoreTrend';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [resumeData, sessionsData] = await Promise.all([
          api.getResume().catch(() => null),
          api.getSessions().catch(() => []),
        ]);
        setResume(resumeData);
        setSessions(sessionsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleResumeUpload = async (file) => {
    const updated = await api.uploadResume(file);
    setResume(updated);
  };

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const scoredSessions = completedSessions.filter((s) => s.overall_score != null);
  // History is ordered most-recent-first, so the first scored session is the latest.
  const latestScore = scoredSessions.length > 0 ? Math.round(scoredSessions[0].overall_score) : null;
  const highestScore = scoredSessions.length > 0
    ? Math.round(Math.max(...scoredSessions.map((s) => s.overall_score)))
    : null;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <ConfidenceNeedle thinking={true} size="md" />
        <p className="data-text">Loading control panel...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Top Banner / Welcome Grid */}
      <div className={styles.topGrid}>
        {/* Welcome Card */}
        <Card className={styles.welcomeCard} padding="lg">
          <div className={styles.welcomeContent}>
            <span className={`${styles.welcomeTag} data-text`}>REHEARSAL ROOM ONLINE</span>
            <h1 className={`${styles.welcomeTitle} display-text`}>
              Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}
            </h1>
            <p className={styles.welcomeSub}>
              Your performance metrics are active. Rehearse technical & behavioral questions in a high-gravity environment.
            </p>
          </div>
        </Card>

        {/* Latest Overall Score Gauge */}
        <Card className={styles.needleCard} padding="md">
          <h3 className={styles.cardHeaderTitle}>Latest Overall Score</h3>
          <div className={styles.needleWrapper}>
            {latestScore !== null ?  (
              <ConfidenceNeedle value={latestScore} size="md" label="Last Session Performance" />
            ) : (
              <div className={styles.noScore}>
                <span className="data-text">NO SESSIONS YET</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Control Panel Middle Row */}
      <div className={styles.middleGrid}>
        {/* Resume Status */}
        <Card title="Resume Grounding" subtitle="PDF Analysis Status" padding="md">
          <ResumeUpload resume={resume} onUpload={handleResumeUpload} />
        </Card>

        {/* Session Stats */}
        <Card title="Session Activity" subtitle="Metrics Overview" padding="md">
          <div className={styles.statsContainer}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Completed Rehearsals</span>
              <span className={`${styles.statValue} display-text`}>{completedSessions.length}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Highest Score</span>
              <span className={`${styles.statValue} data-text`}>
                {highestScore !== null ? `${highestScore}/100` : 'N/A'}
              </span>
            </div>
          </div>
          <ScoreTrend sessions={sessions} />
        </Card>

        {/* Start Interview CTA */}
        <Card className={styles.ctaCard} padding="md">
          <div className={styles.ctaContent}>
            <div className={styles.ctaBadge}>READY TO REHEARSE</div>
            <h3 className={styles.ctaTitle}>Start AI Mock Interview</h3>
            <p className={styles.ctaDesc}>
              Select role, difficulty & type. Receive real-time adaptive questioning.
            </p>
            <Button
              variant="accent"
              size="lg"
              fullWidth
              onClick={() => navigate('/interview/setup')}
            >
              Launch Interview ▸
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Sessions Table */}
      <div className={styles.bottomSection}>
        <Card title="Recent Interview Sessions" subtitle="Full History & Performance Reports" padding="md">
          {sessions.length === 0 ? (
            <p className={styles.emptyText}>No interview sessions found. Click 'Launch Interview' above to begin!</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Type</th>
                    <th>Difficulty</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td className={styles.roleCell}>{session.job_role}</td>
                      <td>{session.interview_type}</td>
                      <td>
                        <Badge variant="navy" mono>
                          {session.difficulty}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={session.status === 'completed' ? 'completed' : 'in_progress'}>
                          {session.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                      </td>
                      <td className="data-text">{new Date(session.started_at).toLocaleDateString()}</td>
                      <td>
                        {session.status === 'completed' ? (
                          <Link to={`/interview/${session.id}/report`} className={styles.reportLink}>
                            View Report →
                          </Link>
                        ) : (
                          <Link to={`/interview/${session.id}`} className={styles.continueLink}>
                            Resume →
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
