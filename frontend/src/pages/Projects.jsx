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
                <div className="project-card-icon" style={{ background: `var(--${color}-bg)`, color: `var(--${color})` }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                </div>
                <h3>{project.name}</h3>
              </div>
              <p className="project-card-desc">{project.description || 'No description'}</p>
              <div className="project-card-footer">
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                  <span>{progress}%</span>
                </div>
                <span>{projectTasks.length} tasks</span>
                {role === 'admin' && (
                  <button onClick={(e) => handleDelete(e, project.id)} className="btn-ghost" style={{ marginLeft: '0.5rem', color: 'var(--red)', fontSize: '0.65rem' }}>Delete</button>
                )}
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
