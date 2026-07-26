import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import useVoice from '../hooks/useVoice';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import QuestionSpotlight from '../components/interview/QuestionSpotlight';
import ThinkingMeter from '../components/interview/ThinkingMeter';
import ChatBubble from '../components/interview/ChatBubble';
import ConfidenceNeedle from '../components/needle/ConfidenceNeedle';
import styles from './InterviewPage.module.css';

export default function InterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [answerText, setAnswerText] = useState('');
  const [thinking, setThinking] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const { supported, isListening, speak, startListening, stopListening, cancelSpeech } = useVoice();
  const historyEndRef = useRef(null);

  // Load session data
  useEffect(() => {
    async function loadSession() {
      try {
        const data = await api.getSession(id);
        setSession(data);
        setTranscript(data.transcript || []);
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [id]);

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll history & Auto-speak AI questions
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // If voice is enabled and the last message is from AI, speak it
    if (voiceEnabled && transcript.length > 0) {
      const lastMessage = transcript[transcript.length - 1];
      if (lastMessage.role === 'ai') {
        speak(lastMessage.content);
      }
    }
  }, [transcript, voiceEnabled, speak]);

  const toggleVoice = () => {
    if (!voiceEnabled) {
      setVoiceEnabled(true);
    } else {
      setVoiceEnabled(false);
      cancelSpeech();
      if (isListening) stopListening();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => setAnswerText(text));
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current spotlight question (last AI turn)
  const currentQuestionTurn = [...transcript].reverse().find((t) => t.role === 'ai');
  const currentQuestion = currentQuestionTurn ? currentQuestionTurn.content : 'Preparing opening question...';

  const handleSendAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim() || thinking) return;

    const userAns = answerText.trim();
    setAnswerText('');

    // Append user answer to UI immediately
    const updatedTranscript = [...transcript, { role: 'user', content: userAns }];
    setTranscript(updatedTranscript);
    setThinking(true);

    try {
      // Call AI endpoint for follow-up question
      const response = await api.submitAnswer(id, userAns);
      setTranscript([...updatedTranscript, { role: 'ai', content: response.question }]);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setThinking(false);
    }
  };

  const handleCompleteInterview = async () => {
    setShowEndModal(false);
    setCompleting(true);
    try {
      await api.completeInterview(id);
      navigate(`/interview/${id}/report`);
    } catch (err) {
      console.error('Failed to complete interview:', err);
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <ConfidenceNeedle thinking={true} size="lg" />
        <p className="data-text">Entering Rehearsal Room...</p>
      </div>
    );
  }

  if (completing) {
    return (
      <div className={styles.completingContainer}>
        <ConfidenceNeedle thinking={true} size="lg" label="Generating Performance Report" />
        <p className="data-text">Analyzing full transcript, technical depth & communication metrics...</p>
      </div>
    );
  }

  return (
    <div className={styles.rehearsalRoom}>
      {/* Top Header Controls */}
      <header className={styles.topHeader}>
        <div className={styles.sessionMeta}>
          <Badge variant="amber" mono>LIVE REHEARSAL</Badge>
          <span className={styles.metaRole}>{session?.job_role}</span>
          <span className={styles.metaDivider}>•</span>
          <span className={styles.metaType}>{session?.interview_type}</span>
          <span className={styles.metaDivider}>•</span>
          <Badge variant="navy" mono>{session?.difficulty}</Badge>
        </div>

        <div className={styles.headerRight}>
          {supported && (
            <label className={styles.voiceToggle}>
              <input type="checkbox" checked={voiceEnabled} onChange={toggleVoice} />
              <span className={styles.voiceLabel}>Voice Mode</span>
            </label>
          )}
          <div className={`${styles.timer} data-text`}>
            ⏱ {formatTimer(elapsedSeconds)}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowEndModal(true)}>
            End & Evaluate
          </Button>
        </div>
      </header>

      {/* Main Rehearsal Workspace (Spotlight + Thinking Meter) */}
      <div className={styles.workspace}>
        {/* Spotlight Center */}
        <div className={styles.spotlightArea}>
          <QuestionSpotlight question={currentQuestion} visible={!thinking} />

          {/* User Answer Form */}
          <form onSubmit={handleSendAnswer} className={styles.answerForm}>
            <div className={styles.inputWrapper}>
              <textarea
                className={styles.answerTextarea}
                placeholder="Type your structured response here... (Press Enter or click Send)"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAnswer(e);
                  }
                }}
                disabled={thinking}
                rows={3}
              />
              <div className={styles.formActions}>
                {voiceEnabled && (
                  <button
                    type="button"
                    className={`${styles.micButton} ${isListening ? styles.micActive : ''}`}
                    onClick={handleMicClick}
                    title={isListening ? 'Stop recording' : 'Start dictating'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  </button>
                )}
                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  disabled={!answerText.trim() || thinking}
                  className={styles.sendButton}
                >
                  Send Answer ▸
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Vertical Pulse Thinking Meter at Edge */}
        <div className={styles.thinkingEdge}>
          <ThinkingMeter active={thinking} />
        </div>
      </div>

      {/* Conversation History Drawer / Timeline */}
      <div className={styles.historyDrawer}>
        <div className={styles.drawerHeader}>
          <span className="data-text">TRANSCRIPT LOG</span>
          <span className={styles.historyCount}>{transcript.length} turns recorded</span>
        </div>
        <div className={styles.bubbleStack}>
          {transcript.map((item, idx) => (
            <ChatBubble key={idx} role={item.role} content={item.content} index={idx} />
          ))}
          <div ref={historyEndRef} />
        </div>
      </div>

      {/* End Interview Confirmation Modal */}
      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="Conclude Interview Session?"
      >
        <p className={styles.modalText}>
          You have completed <strong>{transcript.filter((t) => t.role === 'user').length} answers</strong>. Concluding now will analyze your transcript and generate your radial performance report.
        </p>
        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={() => setShowEndModal(false)}>
            Continue Rehearsing
          </Button>
          <Button variant="accent" onClick={handleCompleteInterview}>
            End & Generate Report ▸
          </Button>
        </div>
      </Modal>
    </div>
  );
}
