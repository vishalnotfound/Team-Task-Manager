import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService, taskService } from '../services/api';

const COLORS = ['blue', 'purple', 'green', 'orange', 'cyan'];

function Projects() {
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);
  const role = localStorage.getItem('role') || 'member';

  useEffect(() => {
    fetchProjects();
    taskService.getTasks().then(res => setAllTasks(res.data)).catch(console.error);
  }, []);

  const fetchProjects = async () => {
    try { const res = await projectService.getProjects(); setProjects(res.data); } catch (e) { console.error(e); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await projectService.createProject({ name, description });
      setName(''); setDescription(''); setShowForm(false);
      fetchProjects();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try { await projectService.deleteProject(id); fetchProjects(); } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Projects</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Manage and track all your projects</p>
        </div>
        {role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ New Project'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-panel">
          <h3>Create New Project</h3>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>Project Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Website Redesign" required />
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label>Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." />
              </div>
              <button type="submit" className="btn btn-primary">Create</button>
            </div>
          </form>
        </div>
      )}

      <div className="projects-grid">
        {projects.map((project, i) => {
          const color = COLORS[i % COLORS.length];
          const projectTasks = allTasks.filter(t => t.project_id === project.id);
          const done = projectTasks.filter(t => t.status === 'done').length;
          const progress = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0;
          return (
            <Link key={project.id} to={`/projects/${project.id}`} className="project-card">
              <div className="project-card-header">
                <div className="project-card-header-left">
                  <div className="project-card-icon" style={{ background: `var(--${color}-bg)`, color: `var(--${color})` }}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                  </div>
                  <h3>{project.name}</h3>
                </div>
                {role === 'admin' && (
                  <button onClick={(e) => { e.preventDefault(); handleDelete(e, project.id); }} className="project-delete-btn" title="Delete Project">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
              <p className="project-card-desc">{project.description || 'No description'}</p>
              
              <div className="project-card-stats-row">
                <div className="stat-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <span>{projectTasks.length} Task{projectTasks.length !== 1 && 's'}</span>
                </div>
                <div className="stat-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{done} Completed</span>
                </div>
              </div>

              <div className="project-card-progress-section">
                <div className="progress-header">
                  <span className="progress-label">Progress</span>
                  <span className="progress-percent" style={{ color: `var(--${color})` }}>{progress}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%`, background: `var(--${color})` }} /></div>
              </div>
            </Link>
          );
        })}
      </div>

      {projects.length === 0 && <div className="empty-state">No projects yet.</div>}
    </div>
  );
}

export default Projects;
