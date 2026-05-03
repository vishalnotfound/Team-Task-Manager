import { useEffect, useState } from 'react';
import { taskService, projectService } from '../services/api';

const PROJECT_COLORS = ['c1', 'c2', 'c3', 'c4', 'c5'];

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    taskService.getTasks().then(res => setTasks(res.data)).catch(console.error);
    projectService.getProjects().then(res => setProjects(res.data)).catch(console.error);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const getProjectColor = (pid) => PROJECT_COLORS[(pid - 1) % PROJECT_COLORS.length];
  const getProjectName = (pid) => { const p = projects.find(pr => pr.id === pid); return p ? p.name : `Project #${pid}`; };
  const formatDate = (d) => { if (!d) return '—'; return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
  const getStatus = (t) => (t.due_date && t.due_date < today && t.status !== 'done') ? 'overdue' : t.status;
  const statusLabel = (s) => ({ 'in-progress': 'In Progress', 'todo': 'To Do', 'done': 'Done', 'overdue': 'Overdue' }[s] || s);

  const handleStatusChange = async (taskId, newStatus) => {
    try { await taskService.updateTask(taskId, { status: newStatus }); taskService.getTasks().then(res => setTasks(res.data)); } catch (e) { console.error(e); }
  };

  const filtered = filter === 'all' ? tasks : filter === 'overdue'
    ? tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done')
    : tasks.filter(t => t.status === filter);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>My Workspace</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage and track your personal task assignments</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="stat-badge" style={{ padding: '0.6rem 1rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{tasks.length}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Total Tasks</span>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1rem' }}>Task Inventory</h2>
            <span style={{ background: 'var(--bg)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {filtered.length} found
            </span>
          </div>
          <div className="filter-tabs">
            {['all', 'todo', 'in-progress', 'done', 'overdue'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : statusLabel(f)}
              </button>
            ))}
          </div>
        </div>
        <div className="table-head task-cols">
          <span>Task Details</span><span>Project</span><span>Due Date</span><span>Current Status</span><span></span>
        </div>
        {filtered.map(task => (
          <div key={task.id} className="table-row task-cols">
            <div>
              <div className="task-title">{task.title}</div>
              <div className="task-desc">{task.description || 'No additional details provided'}</div>
            </div>
            <div>
              <span className={`project-badge ${getProjectColor(task.project_id)}`} style={{ padding: '0.3rem 0.75rem' }}>
                {getProjectName(task.project_id)}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {formatDate(task.due_date)}
            </div>
            <div>
              <select 
                className="status-select" 
                value={task.status} 
                onChange={e => handleStatusChange(task.id, e.target.value)}
                style={{ 
                  background: getStatus(task) === 'done' ? 'var(--green-bg)' : getStatus(task) === 'in-progress' ? 'var(--orange-bg)' : getStatus(task) === 'overdue' ? 'var(--red-bg)' : 'var(--blue-bg)',
                  color: getStatus(task) === 'done' ? 'var(--green)' : getStatus(task) === 'in-progress' ? 'var(--orange)' : getStatus(task) === 'overdue' ? 'var(--red)' : 'var(--blue)'
                }}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" style={{ padding: '0.5rem' }}>
                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ padding: '4rem 2rem' }}>
            <svg style={{ width: '48px', height: '48px', color: 'var(--text-dim)', marginBottom: '1rem', opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p>No tasks match the selected filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTasks;
