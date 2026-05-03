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
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [allProjects, setAllProjects] = useState([]);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getProjects();
        setAllProjects(res.data);
      } catch (e) { console.error(e); }
    };
    if (isAuthenticated) fetchProjects();
  }, [isAuthenticated]);

  const toggleFavorite = (projectId) => {
    const newFavorites = favorites.includes(projectId)
      ? favorites.filter(id => id !== projectId)
      : [...favorites, projectId];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      if (location.pathname !== '/login') navigate('/login');
    }
  }, [location.pathname, navigate]);

  // Close search results on route change
  useEffect(() => {
    setShowResults(false);
    setSearchQuery('');
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
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
  
  // Fetch notifications (due tasks)
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifications = async () => {
      try {
        const res = await taskService.getTasks();
        const today = new Date().toISOString().split('T')[0];
        const dueTasks = res.data.filter(t => 
          t.status !== 'done' && t.due_date && t.due_date <= today
        );
        setNotifications(dueTasks);
      } catch (e) { console.error('Error fetching notifications:', e); }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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
      <Sidebar 
        onLogout={handleLogout} 
        favorites={favorites}
        allProjects={allProjects}
      />
      <main className="main-content">
        <div className="top-bar">
          <div className="top-bar-left">
            <div className="search-box" ref={searchRef}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                placeholder="Search projects or tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery.trim()) setShowResults(true); }}
              />
              {showResults && hasResults && (
                <div className="search-dropdown">
                  {searchResults.projects.length > 0 && (
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="search-section-label">Projects</div>
                      {searchResults.projects.map(p => (
                        <div key={`p-${p.id}`} onClick={() => { navigate(`/projects/${p.id}`); setShowResults(false); setSearchQuery(''); }}
                          className="search-result-item">
                          <div className="search-result-icon" style={{ background: 'var(--blue-bg)' }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--blue)" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                          </div>
                          <div className="search-result-text">{p.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.tasks.length > 0 && (
                    <div>
                      <div className="search-section-label">Tasks</div>
                      {searchResults.tasks.map(t => (
                        <div key={`t-${t.id}`} onClick={() => { navigate(`/projects/${t.project_id}`); setShowResults(false); setSearchQuery(''); }}
                          className="search-result-item">
                          <div className="search-result-icon" style={{ background: 'var(--orange-bg)' }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--orange)" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          </div>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div className="search-result-text">{t.title}</div>
                            <div className="search-result-meta">
                              <span style={{ color: `var(--${t.status === 'done' ? 'green' : t.status === 'in-progress' ? 'blue' : 'orange'})`, fontWeight: 700, textTransform: 'capitalize' }}>{t.status.replace('-', ' ')}</span>
                              <span>•</span>
                              <span>{t.description || 'No description'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="top-bar-right">
            <div className="notif-wrapper" ref={notifRef}>
              <button className="notif-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && <div className="notif-badge">{notifications.length}</div>}
              </button>
              {showNotifications && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <h4>Notifications</h4>
                    {notifications.length > 0 && <span className="notif-count-badge">{notifications.length} Due</span>}
                  </div>
                  <div className="notif-list">
                    {notifications.length > 0 ? notifications.map(t => {
                      const isOverdue = t.due_date < new Date().toISOString().split('T')[0];
                      return (
                        <div key={t.id} className="notif-item" onClick={() => { navigate(`/projects/${t.project_id}`); setShowNotifications(false); }}>
                          <div className={`notif-item-icon ${isOverdue ? 'overdue' : 'due'}`}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="notif-item-content">
                            <div className="notif-item-title">{t.title}</div>
                            <div className="notif-item-desc">
                              {isOverdue ? 'Overdue' : 'Due today'} • {t.due_date}
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="notif-empty">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <div>No pending deadlines</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard favorites={favorites} toggleFavorite={toggleFavorite} />} />
            <Route path="/projects" element={<Projects favorites={favorites} toggleFavorite={toggleFavorite} />} />
            <Route path="/projects/:id" element={<ProjectDetails favorites={favorites} toggleFavorite={toggleFavorite} />} />
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
