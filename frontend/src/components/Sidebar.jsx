import { NavLink, useNavigate } from 'react-router-dom';

function Sidebar({ 
  onLogout, 
  isOpen = false,
  onClose,
  favorites = [],
  allProjects = []
}) {
  const role = localStorage.getItem('role') || 'member';
  const userName = localStorage.getItem('userName') || 'User';
  const navigate = useNavigate();

  const favoriteProjects = allProjects.filter(p => favorites.includes(p.id));

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-user-profile">
          <div className="sidebar-user-avatar">{userName.charAt(0).toUpperCase()}</div>
          <div className="sidebar-user-details">
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-email">{userName.toLowerCase().replace(' ', '.')}@domain.com</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">Main Menu</div>

          <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </NavLink>

          <NavLink to="/projects" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Projects
          </NavLink>

          <NavLink to="/my-tasks" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Tasks
          </NavLink>

          {role === 'admin' && (
            <NavLink to="/members" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Members
            </NavLink>
          )}

          <div className="sidebar-section">Favorite Projects</div>
          <div className="sidebar-fav-container">
            {favoriteProjects.length > 0 ? (
              favoriteProjects.map(p => (
                <NavLink key={p.id} to={`/projects/${p.id}`} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <div className="sidebar-dot" />
                  {p.name}
                </NavLink>
              ))
            ) : (
              <div className="sidebar-empty-fav">No favorite projects</div>
            )}
          </div>

          <div className="sidebar-section">Settings</div>

          <button onClick={onLogout} className="sidebar-link">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
