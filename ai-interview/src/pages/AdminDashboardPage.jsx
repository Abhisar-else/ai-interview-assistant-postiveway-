import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfidenceNeedle from '../components/needle/ConfidenceNeedle';
import RadialRing from '../components/report/RadialRing';
import StrengthsList from '../components/report/StrengthsList';
import ImprovementsList from '../components/report/ImprovementsList';
import TopicBadges from '../components/report/TopicBadges';
import styles from './AdminDashboardPage.module.css';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [catActionError, setCatActionError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview | categories | users | interviews

  // Report viewer modal state
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  // New Category Modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newType, setNewType] = useState('Technical');
  const [newDifficulty, setNewDifficulty] = useState('Medium');

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [dashStats, userList, catList, interviewList] = await Promise.all([
          api.getAdminDashboard(),
          api.getAdminUsers(),
          api.getCategories(),
          api.getAdminInterviews(),
        ]);
        setStats(dashStats);
        setUsers(userList);
        setCategories(catList);
        setInterviews(interviewList);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleAddCategory = async (e) => {
  e.preventDefault();
  if (!newRole) return;
  try {
    const created = await api.createCategory({
      job_role: newRole,
      interview_type: newType,
      difficulty: newDifficulty,
    });
    setCategories([...categories, created]);
    setShowCategoryModal(false);
    setNewRole('');
    setCatActionError('');
  } catch (err) {
    setCatActionError('Failed to create category. Please try again.');
  }
};

  const handleToggleCategory = async (catId) => {
  const target = categories.find((c) => c.id === catId);
  if (!target) return;
  try {
    const updated = await api.updateCategory(catId, { active: !target.active });
    setCategories(categories.map((c) => (c.id === catId ? updated : c)));
    setCatActionError('');
  } catch (err) {
    setCatActionError('Failed to update category. Please try again.');
  }
};

 const handleDeleteCategory = async (catId) => {
  try {
    await api.deleteCategory(catId);
    setCategories(categories.filter((c) => c.id !== catId));
    setCatActionError('');
  } catch (err) {
    setCatActionError('Failed to delete category. Please try again.');
  }
};

const handleViewReport = async (sessionId) => {
  setReportLoading(true);
  setReportError('');
  setSelectedReport({ sessionId }); // opens modal immediately with a loading state
  try {
    const data = await api.getAdminInterviewReport(sessionId);
    setSelectedReport({ sessionId, ...data });
  } catch (err) {
    setReportError('Failed to load this report. It may not be generated yet.');
  } finally {
    setReportLoading(false);
  }
};

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <ConfidenceNeedle thinking={true} size="md" />
        <p className="data-text">Loading Administrative Controls...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      {/* Admin Header */}
      <div className={styles.header}>
        <div>
          <span className={`${styles.tag} data-text`}>SYSTEM ADMINISTRATION</span>
          <h1 className={`${styles.title} display-text`}>Admin Dashboard</h1>
          <p className={styles.sub}>
            Monitor system usage, candidate activity, interview category configurations, and aggregate performance.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Metrics Overview
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'categories' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Category Management ({categories.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Candidates ({users.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'interviews' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('interviews')}
          >
            Interviews ({interviews.length})
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className={styles.tabContent}>
          {/* Top Metric Cards */}
          <div className={styles.metricsGrid}>
            <Card padding="md">
              <span className={styles.metricLabel}>Total Candidates</span>
              <span className={`${styles.metricVal} display-text`}>{stats?.total_users}</span>
              <span className={styles.metricTrend}>Active Accounts</span>
            </Card>

            <Card padding="md">
              <span className={styles.metricLabel}>Total Rehearsals</span>
              <span className={`${styles.metricVal} display-text`}>{stats?.total_interviews}</span>
              <span className={styles.metricTrend}>Completed & In Progress</span>
            </Card>

            <Card padding="md">
              <span className={styles.metricLabel}>Average System Score</span>
              <div className={styles.avgScoreRow}>
                <span className={`${styles.metricVal} data-text`}>{stats?.avg_score}/100</span>
                <Badge variant="green">Healthy</Badge>
              </div>
            </Card>
          </div>

          {/* Popular Roles & Recent Activity */}
          <div className={styles.overviewGrid}>
            {/* Most Popular Roles */}
            <Card title="Most Selected Job Roles" subtitle="Candidate Choice Distribution" padding="md">
              <div className={styles.roleBarList}>
                {stats?.most_selected_roles.map((r, i) => (
                  <div key={i} className={styles.roleBarItem}>
                    <div className={styles.roleBarLabel}>
                      <span>{r.role}</span>
                      <span className="data-text">{r.count} sessions</span>
                    </div>
                    <div className={styles.roleTrack}>
                      <div
                        className={styles.roleFill}
                        style={{ width: `${(r.count / 200) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activity Table */}
            <Card title="Recent Interview Activity" subtitle="Live Stream" padding="md">
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Role</th>
                      <th>Score</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recent_activity.map((act, i) => (
                      <tr key={i}>
                        <td className={styles.userCell}>{act.user}</td>
                        <td>{act.role}</td>
                        <td>
                          <Badge variant={act.score >= 75 ? 'green' : 'amber'} mono>
                            {act.score}/100
                          </Badge>
                        </td>
                        <td className="data-text">{act.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className={styles.tabContent}>
          <Card
            title="Interview Category Management"
            subtitle="Configure job roles, evaluation modes, and difficulty presets"
            padding="lg"
          >
            <div className={styles.catActions}>
              <Button variant="accent" onClick={() => setShowCategoryModal(true)}>
                + Add New Category Preset
              </Button>
            </div>
            {catActionError && (
              <p className={styles.emptyText} style={{ color: 'var(--color-alert-coral)' }}>
                {catActionError}
              </p>
            )}

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Job Role</th>
                    <th>Type</th>
                    <th>Difficulty</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td className={styles.userCell}>{cat.job_role}</td>
                      <td>{cat.interview_type}</td>
                      <td>
                        <Badge variant="navy" mono>{cat.difficulty}</Badge>
                      </td>
                      <td>
                        <Badge variant={cat.active ? 'green' : 'coral'}>
                          {cat.active ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleCategory(cat.id)}
                        >
                          {cat.active ? 'Disable' : 'Enable'}
                        </Button>
<Button
    variant="ghost"
    size="sm"
    onClick={() => handleDeleteCategory(cat.id)}
  >
    Delete
  </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: USERS LIST */}
      {activeTab === 'users' && (
        <div className={styles.tabContent}>
          <Card title="Candidate Registry" subtitle="Manage registered user accounts" padding="lg">
            <div className={styles.userSearchRow}>
              <Input
                placeholder="Search candidates by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Email</th>
                    <th>Sessions Count</th>
                    <th>Average Score</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className={styles.userCell}>{u.name}</td>
                      <td className="data-text">{u.email}</td>
                      <td className="data-text">{u.interviews}</td>
                      <td>
                        <Badge variant="green" mono>{u.avg_score}/100</Badge>
                      </td>
                      <td className="data-text">{u.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: ALL INTERVIEWS */}
      {activeTab === 'interviews' && (
        <div className={styles.tabContent}>
          <Card title="All Interview Sessions" subtitle="Every session across every candidate" padding="lg">
            {interviews.length === 0 ? (
              <p className={styles.emptyText}>No interview sessions yet.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Role</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviews.map((iv) => (
                      <tr key={iv.id}>
                        <td className={styles.userCell}>{iv.user_name}</td>
                        <td>{iv.job_role}</td>
                        <td>{iv.type}</td>
                        <td>
                          <Badge variant={iv.status === 'completed' ? 'completed' : 'in_progress'}>
                            {iv.status === 'completed' ? 'Completed' : 'In Progress'}
                          </Badge>
                        </td>
                        <td>
                          {iv.score != null ? (
                            <Badge variant="green" mono>{Math.round(iv.score)}/100</Badge>
                          ) : (
                            <span className="data-text">—</span>
                          )}
                        </td>
                        <td className="data-text">{iv.date}</td>
                        <td>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={iv.status !== 'completed'}
                            onClick={() => handleViewReport(iv.id)}
                          >
                            View Report
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Add Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Add Interview Category Preset"
      >
        <form onSubmit={handleAddCategory} className={styles.modalForm}>
          <Input
            label="Job Role Title"
            placeholder="e.g. DevOps Engineer"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            required
          />

          <div className={styles.modalGroup}>
            <label className={styles.modalLabel}>Interview Type</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className={styles.modalSelect}
            >
              <option value="Technical">Technical</option>
              <option value="HR">HR / Behavioral</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div className={styles.modalGroup}>
            <label className={styles.modalLabel}>Difficulty</label>
            <select
              value={newDifficulty}
              onChange={(e) => setNewDifficulty(e.target.value)}
              className={styles.modalSelect}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => setShowCategoryModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent">
              Save Category Preset
            </Button>
          </div>
        </form>
      </Modal>

      {/* Report Viewer Modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Interview Performance Report"
      >
        {reportLoading ? (
          <div className={styles.reportLoading}>
            <ConfidenceNeedle thinking={true} size="sm" />
            <p className="data-text">Loading report...</p>
          </div>
        ) : reportError ? (
          <p className={styles.emptyText}>{reportError}</p>
        ) : selectedReport?.report ? (
          <div className={styles.reportModalBody}>
            <p className={styles.metaText}>
              {selectedReport.session?.job_role} • {selectedReport.session?.interview_type} • {selectedReport.session?.difficulty}
            </p>

            <div className={styles.reportNeedleRow}>
              <ConfidenceNeedle
                value={Number(selectedReport.report.overall_score || 0)}
                size="md"
                label="Overall Score"
              />
            </div>

            <div className={styles.reportRingsGrid}>
              <RadialRing value={Number(selectedReport.report.technical_score || 0)} label="Technical" />
              <RadialRing value={Number(selectedReport.report.communication_score || 0)} label="Communication" />
              <RadialRing value={Number(selectedReport.report.problem_solving_score || 0)} label="Problem Solving" />
              <RadialRing value={Number(selectedReport.report.confidence_score || 0)} label="Confidence" />
            </div>

            <StrengthsList items={selectedReport.report.strengths || []} />
            <ImprovementsList items={selectedReport.report.improvements || []} />
            <TopicBadges topics={selectedReport.report.recommended_topics || []} />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
