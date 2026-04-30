import { Link } from 'react-router-dom';

function Navbar({ onLogout }) {
  const role = localStorage.getItem('role') || 'member';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Team Task Manager</Link>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/projects">Projects</Link>
        <span className="badge">{role}</span>
        <button onClick={onLogout} className="danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
