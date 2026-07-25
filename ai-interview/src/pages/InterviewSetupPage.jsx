import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ConfidenceNeedle from '../components/needle/ConfidenceNeedle';
import styles from './InterviewSetupPage.module.css';

const ROLES = [
  { id: 'Software Engineer', label: 'Software Engineer', desc: 'Core DSA, system architecture, OOP & problem solving' },
  { id: 'Frontend Developer', label: 'Frontend Developer', desc: 'React, browser rendering, JS fundamentals & UI architecture' },
  { id: 'Backend Developer', label: 'Backend Developer', desc: 'APIs, database design, caching, concurrency & microservices' },
  { id: 'Data Scientist', label: 'Data Scientist', desc: 'Statistics, ML algorithms, data modeling & Python' },
  { id: 'AI/ML Engineer', label: 'AI/ML Engineer', desc: 'Deep learning, model deployment, NLP & LLM architectures' },
  { id: 'Full Stack Developer', label: 'Full Stack Developer', desc: 'End-to-end web engineering, frontend + backend integration' },
];

const TYPES = [
  { id: 'Technical', label: 'Technical Round', desc: 'Deep dive into coding concepts, algorithms & architecture' },
  { id: 'Coding', label: 'Coding Round', desc: 'Hands-on problem solving, data structures & algorithm implementation' },
  { id: 'HR', label: 'HR / Behavioral', desc: 'Culture fit, motivation, conflict resolution & teamwork' },
  { id: 'Mixed', label: 'Mixed Round', desc: 'Balanced assessment of both technical competence and soft skills' },
];

const DIFFICULTIES = [
  { id: 'Easy', label: 'Easy', desc: 'Fundamental concepts & standard questions' },
  { id: 'Medium', label: 'Medium', desc: 'Realistic industry standard depth & follow-ups' },
  { id: 'Hard', label: 'Hard', desc: 'Challenging edge-cases, system design & intense probing' },
];

export default function InterviewSetupPage() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [targetCompany, setTargetCompany] = useState('');
  const [selectedType, setSelectedType] = useState('Technical');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function checkResume() {
      try {
        const resData = await api.getResume();
        setResume(resData);
      } catch (err) {
        setResume(null);
      } finally {
        setLoading(false);
      }
    }
    checkResume();
  }, []);

  const handleStart = async () => {
    setStarting(true);
    try {
      const session = await api.startInterview({
        job_role: selectedRole,
        target_company: targetCompany.trim() || null,
        interview_type: selectedType,
        difficulty: selectedDifficulty,
      });
      navigate(`/interview/${session.id}`);
    } catch (err) {
      console.error('Failed to start interview:', err);
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <ConfidenceNeedle thinking={true} size="md" />
        <p className="data-text">Initializing rehearsal parameters...</p>
      </div>
    );
  }

  return (
    <div className={styles.setupContainer}>
      <div className={styles.header}>
        <span className={`${styles.subtitleTag} data-text`}>REHEARSAL CONFIGURATION</span>
        <h1 className={`${styles.title} display-text`}>Configure Mock Interview</h1>
        <p className={styles.description}>
          Select your target role, evaluation type, and difficulty level. The AI interviewer will tailor questions using your uploaded resume.
        </p>
      </div>

      {!resume?.parsed_json && (
        <div className={styles.resumeNotice}>
          <span className={styles.noticeIcon}>!</span>
          <div>
            <strong>No Parsed Resume Detected:</strong> For the best adaptive experience grounded in your projects and skills, please upload a PDF resume on your dashboard first.
          </div>
        </div>
      )}

      {/* 1. Job Role Selection */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>1. Target Role & Company</h3>

        <div className={styles.companyRow}>
          <label className="data-text">TARGET COMPANY (OPTIONAL):</label>
          <input
            type="text"
            className={styles.companyInput}
            placeholder="e.g. Google, Amazon, OpenAI..."
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
          />
        </div>

        <div className={styles.grid}>
          {ROLES.map((role) => (
            <div
              key={role.id}
              className={`${styles.selectCard} ${selectedRole === role.id ? styles.selectedCard : ''}`}
              onClick={() => setSelectedRole(role.id)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{role.label}</span>
                {selectedRole === role.id && <span className={styles.radioDot} />}
              </div>
              <p className={styles.cardDesc}>{role.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Interview Type Selection */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>2. Select Interview Type</h3>
        <div className={styles.gridThree}>
          {TYPES.map((t) => (
            <div
              key={t.id}
              className={`${styles.selectCard} ${selectedType === t.id ? styles.selectedCard : ''}`}
              onClick={() => setSelectedType(t.id)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{t.label}</span>
                {selectedType === t.id && <span className={styles.radioDot} />}
              </div>
              <p className={styles.cardDesc}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Difficulty Selection */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>3. Select Difficulty Level</h3>
        <div className={styles.gridThree}>
          {DIFFICULTIES.map((d) => (
            <div
              key={d.id}
              className={`${styles.selectCard} ${selectedDifficulty === d.id ? styles.selectedCard : ''}`}
              onClick={() => setSelectedDifficulty(d.id)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{d.label}</span>
                {selectedDifficulty === d.id && <span className={styles.radioDot} />}
              </div>
              <p className={styles.cardDesc}>{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Config Summary & Launch */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryInfo}>
          <span className="data-text">READY:</span>
          <Badge variant="navy" mono>{selectedRole}</Badge>
          <Badge variant="navy" mono>{selectedType}</Badge>
          <Badge variant="amber" mono>{selectedDifficulty}</Badge>
        </div>

        {starting ? (
          <div className={styles.startingNeedle}>
            <ConfidenceNeedle thinking={true} size="sm" showValue={false} />
          </div>
        ) : (
          <Button variant="accent" size="lg" onClick={handleStart}>
            Begin Interview Session ▸
          </Button>
        )}
      </div>
    </div>
  );
}
