import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, taskService, projectService } from '../services/api';

const PROJECT_COLORS = ['c1', 'c2', 'c3', 'c4', 'c5'];
const PROJECT_ICONS = [
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
];

function Dashboard() {
  const [data, setData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const userName = localStorage.getItem('userName') || 'User';
  const role = localStorage.getItem('role') || 'member';

  useEffect(() => {
    dashboardService.getDashboard().then(res => setData(res.data)).catch(console.error);
    taskService.getTasks().then(res => setTasks(res.data)).catch(console.error);
    projectService.getProjects().then(res => setProjects(res.data)).catch(console.error);
  }, []);

  if (!data) return <div className="empty-state">Loading dashboard...</div>;

  const totalTasks = data.total_tasks || data.my_tasks || 0;
  const inProgress = data.tasks_by_status?.['in-progress'] || 0;
  const completed = data.tasks_by_status?.done || 0;
  const overdue = data.overdue_tasks || 0;

  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done');

  const filteredTasks = filter === 'all' ? tasks :
    tasks.filter(t => {
      if (filter === 'overdue') return t.due_date && t.due_date < today && t.status !== 'done';
      return t.status === filter;
    });

  const displayTasks = filteredTasks.slice(0, 6);

  const getProjectColor = (projectId) => PROJECT_COLORS[(projectId - 1) % PROJECT_COLORS.length];
  const getProjectName = (projectId) => {
    const p = projects.find(pr => pr.id === projectId);
    return p ? p.name : `Project #${projectId}`;
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatus = (task) => {
    if (task.due_date && task.due_date < today && task.status !== 'done') return 'overdue';
    return task.status;
  };

  const statusLabel = (s) => {
    if (s === 'in-progress') return 'In Progress';
    if (s === 'todo') return 'To Do';
    if (s === 'done') return 'Done';
    if (s === 'overdue') return 'Overdue';
    return s;
  };

  return (
    <div>
      <div className="welcome-section">
        <h1>Welcome back, {userName.split(' ')[0]}</h1>
        <p>Here's what's happening with your tasks today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalTasks}</div>
            <div className="stat-label">Total Tasks</div>
            <div className="stat-sub">All assigned tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{inProgress}</div>
            <div className="stat-label">In Progress</div>
            <div className="stat-sub">Tasks in progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{completed}</div>
            <div className="stat-label">Completed</div>
            <div className="stat-sub">Tasks completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{overdue}</div>
            <div className="stat-label">Overdue</div>
            <div className="stat-sub">Tasks past due</div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div>
          <div className="panel">
            <div className="panel-header">
              <h2>My Tasks</h2>
              <div className="filter-tabs">
                {['all', 'todo', 'in-progress', 'done'].map(f => (
                  <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                    {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f === 'todo' ? 'To Do' : 'Done'}
                  </button>
                ))}
              </div>
            </div>
            <div className="table-head task-cols">
              <span>Task</span><span>Project</span><span>Due Date</span><span>Status</span><span></span>
            </div>
            {displayTasks.length > 0 ? displayTasks.map(task => (
              <div key={task.id} className="table-row task-cols">
                <div>
                  <div className="task-title">{task.title}</div>
                  <div className="task-desc">{task.description || ''}</div>
                </div>
                <div>
                  <span className={`project-badge ${getProjectColor(task.project_id)}`}>
                    {getProjectName(task.project_id)}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(task.due_date)}</div>
                <div><span className={`badge ${getStatus(task)}`}>{statusLabel(getStatus(task))}</span></div>
                <div><button className="dot-menu-btn">⋮</button></div>
              </div>
            )) : (
              <div className="empty-state">No tasks match this filter.</div>
            )}
            {tasks.length > 6 && (
              <Link to="/my-tasks" className="view-all-link">View all tasks →</Link>
            )}
          </div>
        </div>

        <div>
          <div className="side-panel">
            <div className="side-panel-header">
              <h3>Overdue Tasks</h3>
              <Link to="/my-tasks">View all</Link>
            </div>
            {overdueTasks.length > 0 ? overdueTasks.slice(0, 4).map(task => (
              <div key={task.id} className="overdue-item">
                <div className="overdue-dot" />
                <div className="overdue-info">
                  <div className="name">{task.title}</div>
                  <div className="project">{getProjectName(task.project_id)}</div>
                </div>
                <div className="overdue-date">{formatDate(task.due_date)}</div>
              </div>
            )) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', padding: '0.5rem 0' }}>No overdue tasks!</div>
            )}
          </div>

          <div className="side-panel">
            <div className="side-panel-header">
              <h3>My Projects</h3>
              <Link to="/projects">View all</Link>
            </div>
            {projects.slice(0, 4).map((project, i) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="my-project-item">
                <div className="my-project-icon" style={{ background: `var(--${['blue', 'purple', 'green', 'orange'][i % 4]}-bg)`, color: `var(--${['blue', 'purple', 'green', 'orange'][i % 4]})` }}>
                  {PROJECT_ICONS[i % PROJECT_ICONS.length]}
                </div>
                <div className="my-project-info">
                  <div className="name">{project.name}</div>
                  <div className="count">{tasks.filter(t => t.project_id === project.id).length} tasks</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
