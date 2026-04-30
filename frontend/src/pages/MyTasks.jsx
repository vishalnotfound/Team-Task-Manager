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
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>My Tasks</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>All tasks assigned to you</p>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>{filtered.length} tasks</h2>
          <div className="filter-tabs">
            {['all', 'todo', 'in-progress', 'done', 'overdue'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : statusLabel(f)}
              </button>
            ))}
          </div>
        </div>
        <div className="table-head task-cols">
          <span>Task</span><span>Project</span><span>Due Date</span><span>Status</span><span></span>
        </div>
        {filtered.map(task => (
          <div key={task.id} className="table-row task-cols">
            <div>
              <div className="task-title">{task.title}</div>
              <div className="task-desc">{task.description || ''}</div>
            </div>
            <div><span className={`project-badge ${getProjectColor(task.project_id)}`}>{getProjectName(task.project_id)}</span></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(task.due_date)}</div>
            <div>
              <select className="status-select" value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}
                style={{ background: getStatus(task) === 'done' ? 'var(--green-bg)' : getStatus(task) === 'in-progress' ? 'var(--orange-bg)' : getStatus(task) === 'overdue' ? 'var(--red-bg)' : 'var(--blue-bg)',
                  color: getStatus(task) === 'done' ? 'var(--green)' : getStatus(task) === 'in-progress' ? 'var(--orange)' : getStatus(task) === 'overdue' ? 'var(--red)' : 'var(--blue)', fontWeight: 600 }}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div><button className="dot-menu-btn">⋮</button></div>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state">No tasks match this filter.</div>}
      </div>
    </div>
  );
}

export default MyTasks;
