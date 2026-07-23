import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ConfidenceNeedle from '../components/needle/ConfidenceNeedle';
import RadialRing from '../components/report/RadialRing';
import StrengthsList from '../components/report/StrengthsList';
import ImprovementsList from '../components/report/ImprovementsList';
import TopicBadges from '../components/report/TopicBadges';
import styles from './ReportPage.module.css';

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReportData() {
      try {
        const [repData, sessData] = await Promise.all([
          api.getReport(id),
          api.getSession(id),
        ]);
        setReport(repData);
        setSession(sessData);
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReportData();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <ConfidenceNeedle thinking={true} size="lg" />
        <p className="data-text">Compiling Performance Evaluation...</p>
      </div>
    );
  }

  return (
    <div className={styles.reportPage}>
      {/* Top Banner */}
      <div className={styles.topHeader}>
        <div>
          <span className={`${styles.tag} data-text`}>REHEARSAL PERFORMANCE EVALUATION</span>
          <h1 className={`${styles.title} display-text`}>Interview Assessment Report</h1>
          <p className={styles.metaText}>
            {session?.job_role} • {session?.interview_type} • {session?.difficulty} • Generated {new Date(report?.generated_at).toLocaleDateString()}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="ghost" onClick={() => navigate('/')}>
            ← Dashboard
          </Button>
          <Button variant="accent" onClick={() => navigate('/interview/setup')}>
            New Interview Session ▸
          </Button>
        </div>
      </div>

      {/* Main Score Overview: Confidence Needle (Overall) */}
      <Card className={styles.overallCard} padding="lg">
        <div className={styles.overallContent}>
          <div className={styles.overallLeft}>
            <span className={`${styles.overallTag} data-text`}>COMPOSITE PERFORMANCE INDEX</span>
            <h2 className={`${styles.overallHeading} display-text`}>Overall Rehearsal Score</h2>
            <p className={styles.overallDesc}>
              Calculated across technical correctness, response structure, communication clarity, and problem-solving depth over the full transcript.
            </p>
          </div>
          <div className={styles.needleBox}>
            <ConfidenceNeedle
              value={Number(report?.overall_score || 0)}
              size="lg"
              label="Overall Readiness Score"
            />
          </div>
        </div>
      </Card>

      {/* Four Radial Rings Grid */}
      <section className={styles.ringsSection}>
        <h3 className={styles.sectionHeading}>Core Measurement Dimensions</h3>
        <div className={styles.ringsGrid}>
          <Card padding="md">
            <RadialRing
              value={Number(report?.technical_score || 0)}
              label="Technical Accuracy"
            />
          </Card>
          <Card padding="md">
            <RadialRing
              value={Number(report?.communication_score || 0)}
              label="Communication Clarity"
            />
          </Card>
          <Card padding="md">
            <RadialRing
              value={Number(report?.problem_solving_score || 0)}
              label="Problem Solving Depth"
            />
          </Card>
          <Card padding="md">
            <RadialRing
              value={Number(report?.confidence_score || 0)}
              label="Delivery & Confidence"
            />
          </Card>
        </div>
      </section>

      {/* Strengths & Improvements Side-by-Side */}
      <div className={styles.feedbackGrid}>
        <Card padding="lg">
          <StrengthsList items={report?.strengths || []} />
        </Card>

        <Card padding="lg">
          <ImprovementsList items={report?.improvements || []} />
        </Card>
      </div>

      {/* Recommended Topics */}
      <Card padding="lg">
        <TopicBadges topics={report?.recommended_topics || []} />
      </Card>
    </div>
  );
}
