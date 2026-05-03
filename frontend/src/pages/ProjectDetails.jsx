import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { taskService, projectService, authService } from '../services/api';

function ProjectDetails({ favorites = [], toggleFavorite }) {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [memberId, setMemberId] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);

  const role = localStorage.getItem('role') || 'member';
  const isFav = favorites.includes(parseInt(id));

  useEffect(() => {
    fetchTasks();
    fetchProject();
    fetchMembers();
    if (role === 'admin') fetchUsers();
  }, [id]);

  const fetchTasks = async () => {
    try { const res = await taskService.getTasks(id); setTasks(res.data); } catch (e) { console.error(e); }
  };

  const fetchProject = async () => {
    try {
      const res = await projectService.getProjects();
      const proj = res.data.find(p => p.id === parseInt(id));
      if (proj) setProject(proj);
    } catch (e) { console.error(e); }
  };

  const fetchMembers = async () => {
    try { const res = await projectService.getMembers(id); setMembers(res.data); } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try { const res = await authService.getUsers(); setAllUsers(res.data); } catch (e) { console.error(e); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await taskService.createTask({ title, description, project_id: parseInt(id), assigned_to: assignedTo ? parseInt(assignedTo) : null, due_date: dueDate || null });
      setTitle(''); setDescription(''); setAssignedTo(''); setDueDate('');
      setShowTaskForm(false);
      fetchTasks();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to create task'); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try { await taskService.updateTask(taskId, { status: newStatus }); fetchTasks(); } catch (e) { console.error(e); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try { await taskService.deleteTask(taskId); fetchTasks(); } catch (e) { console.error(e); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await projectService.addMember(id, parseInt(memberId));
      setMemberId('');
      fetchMembers();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to add member'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try { await projectService.removeMember(id, userId); fetchMembers(); } catch (e) { console.error(e); }
  };

  const today = new Date().toISOString().split('T')[0];
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const formatDate = (d) => { if (!d) return '—'; return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
  const getStatus = (t) => (t.due_date && t.due_date < today && t.status !== 'done') ? 'overdue' : t.status;
  const statusLabel = (s) => ({ 'in-progress': 'In Progress', 'todo': 'To Do', 'done': 'Done', 'overdue': 'Overdue' }[s] || s);

  // Filter out users already in the project for the "Add Member" dropdown
  const memberUserIds = members.map(m => m.user?.id);
  const availableUsers = allUsers.filter(u => !memberUserIds.includes(u.id));

  return (
    <div>
      {/* Breadcrumb + Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
          <Link to="/projects" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Projects</Link>
          <span style={{ margin: '0 0.4rem' }}>/</span>
          <span style={{ color: 'var(--text)' }}>{project?.name || `Project #${id}`}</span>
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{project?.name || 'Project Details'}</h1>
            <button 
              onClick={() => toggleFavorite(parseInt(id))}
              className={`fav-btn-large ${isFav ? 'active' : ''}`}
              title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <svg fill={isFav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </button>
          </div>
          {tasks.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '220px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Progress:</span>
              <div className="progress-bar" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>{progress}%</span>
            </div>
          )}
        </div>
        {project?.description && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{project.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <div className="stat-info"><div className="stat-value">{tasks.length}</div><div className="stat-label">Total Tasks</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="stat-info"><div className="stat-value">{tasks.filter(t => t.status === 'in-progress').length}</div><div className="stat-label">In Progress</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="stat-info"><div className="stat-value">{doneTasks}</div><div className="stat-label">Completed</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div className="stat-info"><div className="stat-value">{members.length}</div><div className="stat-label">Members</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>Tasks ({tasks.length})</button>
        <button className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Members ({members.length})</button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* ── Tasks Tab ── */}
      {activeTab === 'tasks' && (
        <>
          {role === 'admin' && (
            <div style={{ marginBottom: '1rem' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowTaskForm(!showTaskForm)}>
                {showTaskForm ? '✕ Cancel' : '+ New Task'}
              </button>
            </div>
          )}

          {showTaskForm && (
            <div className="form-panel">
              <h3>Create Task</h3>
              <form onSubmit={handleCreateTask}>
                <div className="form-row" style={{ marginBottom: '0.75rem' }}>
                  <div className="form-group"><label>Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" required /></div>
                  <div className="form-group" style={{ flex: 2 }}><label>Description</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Assign To</label>
                    <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                      <option value="">Unassigned</option>
                      {allUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Due Date</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
                  <button type="submit" className="btn btn-primary">Create</button>
                </div>
              </form>
            </div>
          )}

          <div className="panel">
            <div className="table-head task-cols">
              <span>Task</span><span>Assignee</span><span>Due Date</span><span>Status</span><span></span>
            </div>
            {tasks.length > 0 ? tasks.map(task => (
              <div key={task.id} className="table-row task-cols">
                <div>
                  <div className="task-title">{task.title}</div>
                  <div className="task-desc">{task.description || ''}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {task.assignee ? task.assignee.name : task.assigned_to ? `User #${task.assigned_to}` : 'Unassigned'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(task.due_date)}</div>
                <div>
                  <select className="status-select" value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}
                    style={{
                      background: getStatus(task) === 'done' ? 'var(--green-bg)' : getStatus(task) === 'in-progress' ? 'var(--orange-bg)' : getStatus(task) === 'overdue' ? 'var(--red-bg)' : 'var(--blue-bg)',
                      color: getStatus(task) === 'done' ? 'var(--green)' : getStatus(task) === 'in-progress' ? 'var(--orange)' : getStatus(task) === 'overdue' ? 'var(--red)' : 'var(--blue)',
                      fontWeight: 600,
                    }}>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  {role === 'admin' && (
                    <button onClick={() => handleDeleteTask(task.id)} className="btn-ghost" style={{ color: 'var(--text-dim)' }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )) : <div className="empty-state">No tasks in this project.</div>}
          </div>
        </>
      )}

      {/* ── Members Tab ── */}
      {activeTab === 'members' && (
        <>
          {role === 'admin' && availableUsers.length > 0 && (
            <div className="form-panel">
              <h3>Add Member</h3>
              <form onSubmit={handleAddMember}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Select User</label>
                    <select value={memberId} onChange={e => setMemberId(e.target.value)} required>
                      <option value="">Choose a user...</option>
                      {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email}) - {u.role}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary">+ Add Member</button>
                </div>
              </form>
            </div>
          )}

          <div className="panel">
            <div className="table-head member-table-cols">
              <span>Member</span><span>Email</span><span>Role</span><span></span>
            </div>
            {members.length > 0 ? members.map(m => (
              <div key={m.id} className="table-row member-table-cols">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="member-avatar">
                    {m.user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span className="task-title" style={{ marginBottom: 0 }}>{m.user?.name || 'Unknown'}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.user?.email || ''}</div>
                <div>
                  <span className={`badge ${m.user?.role === 'admin' ? 'todo' : 'done'}`}>
                    {m.user?.role || 'member'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {role === 'admin' && m.user?.id !== project?.owner_id && (
                    <button 
                      onClick={() => handleRemoveMember(m.user?.id)} 
                      className="btn-ghost" 
                      style={{ color: 'var(--red)', fontSize: '0.75rem', fontWeight: 600, padding: '0.4rem 0.8rem' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )) : <div className="empty-state">No members in this project.</div>}
          </div>
        </>
      )}
    </div>
  );
}

export default ProjectDetails;
