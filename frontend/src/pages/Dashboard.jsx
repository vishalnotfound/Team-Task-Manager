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

function Dashboard({ favorites = [], toggleFavorite }) {
  const [data, setData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const userName = localStorage.getItem('userName') || 'User';
  const role = localStorage.getItem('role') || 'member';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, taskRes, projRes] = await Promise.all([
          dashboardService.getDashboard(),
          taskService.getTasks(),
          projectService.getProjects()
        ]);
        setData(dashRes.data);
        setTasks(taskRes.data);
        setProjects(projRes.data);
      } catch (e) { console.error(e); }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Sync every 10 seconds
    return () => clearInterval(interval);
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
      <div className="welcome-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Welcome back, {userName.split(' ')[0]} 👋</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Here's an overview of your team's progress today.</p>
        </div>
        <Link to="/projects" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
          Projects
        </Link>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalTasks}</div>
            <div className="stat-label">Total Tasks</div>
            <div className="stat-sub">Assigned to you</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{inProgress}</div>
            <div className="stat-label">Active Now</div>
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
            <div className="stat-sub">Achieved results</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{overdue}</div>
            <div className="stat-label">Overdue</div>
            <div className="stat-sub">Requires attention</div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="panel">
            <div className="panel-header">
              <h2>Active Tasks</h2>
              <div className="filter-tabs">
                {['all', 'todo', 'in-progress', 'done'].map(f => (
                  <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                    {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f === 'todo' ? 'To Do' : 'Done'}
                  </button>
                ))}
              </div>
            </div>
            <div className="table-head task-cols">
              <span>Task Detail</span><span>Project</span><span>Due Date</span><span>Status</span><span></span>
            </div>
            {displayTasks.length > 0 ? displayTasks.map(task => (
              <div key={task.id} className="table-row task-cols">
                <div>
                  <div className="task-title">{task.title}</div>
                  <div className="task-desc">{task.description || 'No description provided'}</div>
                </div>
                <div>
                  <span className={`project-badge ${getProjectColor(task.project_id)}`} style={{ padding: '0.3rem 0.75rem' }}>
                    {getProjectName(task.project_id)}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{formatDate(task.due_date)}</div>
                <div>
                  <span className={`badge ${getStatus(task)}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>
                    {statusLabel(getStatus(task))}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-ghost" style={{ padding: '0.5rem' }}>
                    <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                  </button>
                </div>
              </div>
            )) : (
              <div className="empty-state">No tasks found for this filter.</div>
            )}
            {tasks.length > 6 && (
              <Link to="/my-tasks" className="view-all-link" style={{ padding: '1.25rem', borderTop: '1px solid var(--border)' }}>
                View all tasks
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="side-panel" style={{ borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
            <div className="side-panel-header" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem' }}>Alerts</h3>
              <Link to="/my-tasks" style={{ fontSize: '0.75rem', fontWeight: 700 }}>See all</Link>
            </div>
            {overdueTasks.length > 0 ? overdueTasks.slice(0, 4).map(task => (
              <div key={task.id} className="overdue-item" style={{ padding: '0.75rem 0' }}>
                <div className="overdue-dot" style={{ width: '10px', height: '10px' }} />
                <div className="overdue-info">
                  <div className="name" style={{ fontSize: '0.85rem' }}>{task.title}</div>
                  <div className="project" style={{ fontSize: '0.7rem' }}>{getProjectName(task.project_id)}</div>
                </div>
                <div className="overdue-date" style={{ fontSize: '0.75rem' }}>{formatDate(task.due_date)}</div>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: '1rem 0', fontSize: '0.8rem' }}>All caught up!</div>
            )}
          </div>

          <div className="side-panel" style={{ borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
            <div className="side-panel-header" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem' }}>My Projects</h3>
              <Link to="/projects" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Manage</Link>
            </div>
            {projects.slice(0, 4).map((project, i) => (
              <div key={project.id} style={{ position: 'relative' }}>
                <Link to={`/projects/${project.id}`} className="my-project-item" style={{ padding: '0.75rem 0', gap: '1rem' }}>
                  <div className="my-project-icon" style={{ 
                    width: '42px', height: '42px',
                    background: `var(--${['blue', 'purple', 'green', 'orange'][i % 4]}-bg)`, 
                    color: `var(--${['blue', 'purple', 'green', 'orange'][i % 4]})`,
                    borderRadius: '12px'
                  }}>
                    {PROJECT_ICONS[i % PROJECT_ICONS.length]}
                  </div>
                  <div className="my-project-info">
                    <div className="name" style={{ fontSize: '0.85rem' }}>{project.name}</div>
                    <div className="count" style={{ fontSize: '0.7rem' }}>{tasks.filter(t => t.project_id === project.id).length} tasks</div>
                  </div>
                </Link>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(project.id); }}
                  className={`fav-btn ${favorites.includes(project.id) ? 'active' : ''}`}
                  style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
                >
                  <svg fill={favorites.includes(project.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
