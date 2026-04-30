import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import MyTasks from './pages/MyTasks';
import Members from './pages/Members';
import Sidebar from './components/Sidebar';
import { taskService, projectService } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ tasks: [], projects: [] });
  const [showResults, setShowResults] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      if (location.pathname !== '/login') navigate('/login');
    }
  }, [location.pathname, navigate]);

  // Close search results on route change or click outside
  useEffect(() => {
    setShowResults(false);
    setSearchQuery('');
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || !isAuthenticated) {
      setSearchResults({ tasks: [], projects: [] });
      setShowResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const q = searchQuery.toLowerCase();
        const [tasksRes, projRes] = await Promise.all([
          taskService.getTasks(),
          projectService.getProjects(),
        ]);
        const tasks = tasksRes.data.filter(t =>
          t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
        ).slice(0, 5);
        const projects = projRes.data.filter(p =>
          p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
        ).slice(0, 5);
        setSearchResults({ tasks, projects });
        setShowResults(true);
      } catch (e) { console.error(e); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isAuthenticated]);

  const handleLogin = (token, role, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userName', name || 'User');
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  const userName = localStorage.getItem('userName') || 'User';
  const role = localStorage.getItem('role') || 'member';
  const hasResults = searchResults.tasks.length > 0 || searchResults.projects.length > 0;

  return (
    <div className="app-layout">
      <Sidebar onLogout={handleLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="main-content">
        <div className="top-bar">
          <div className="top-bar-left">
            <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="search-box" ref={searchRef} style={{ position: 'relative' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                placeholder="Search tasks, projects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery.trim()) setShowResults(true); }}
              />
              {showResults && hasResults && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.35rem',
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 200, overflow: 'hidden', maxHeight: '400px', overflowY: 'auto',
                }}>
                  {searchResults.projects.length > 0 && (
                    <>
                      <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>Projects</div>
                      {searchResults.projects.map(p => (
                        <div key={`p-${p.id}`} onClick={() => { navigate(`/projects/${p.id}`); setShowResults(false); setSearchQuery(''); }}
                          style={{ padding: '0.6rem 0.75rem', cursor: 'pointer', borderBottom: '1px solid rgba(51,65,85,0.3)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                          <div>
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                            {p.description && <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{p.description}</div>}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {searchResults.tasks.length > 0 && (
                    <>
                      <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>Tasks</div>
                      {searchResults.tasks.map(t => (
                        <div key={`t-${t.id}`} onClick={() => { navigate(`/projects/${t.project_id}`); setShowResults(false); setSearchQuery(''); }}
                          style={{ padding: '0.6rem 0.75rem', cursor: 'pointer', borderBottom: '1px solid rgba(51,65,85,0.3)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--orange)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          <div>
                            <div style={{ fontWeight: 600 }}>{t.title}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                              <span className={`badge ${t.status}`} style={{ marginRight: '0.3rem' }}>{t.status}</span>
                              {t.description || ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="top-bar-right">
            <div className="top-bar-user">
              <div className="top-bar-avatar">{userName.charAt(0).toUpperCase()}</div>
              <div className="top-bar-user-info">
                <div className="top-bar-user-name">{userName}</div>
                <div className="top-bar-user-role">{role}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="/members" element={<Members />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
