import { useEffect, useState } from 'react';
import { authService } from '../services/api';

function Members() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    authService.getUsers()
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Members</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>All workspace members</p>
      </div>

      <div className="panel">
        <div className="table-head member-table-cols">
          <span>Member</span><span>Email</span><span>Role</span>
        </div>
        {users.length > 0 ? users.map(user => (
          <div key={user.id} className="table-row member-table-cols">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="member-avatar">
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <span className="task-title" style={{ marginBottom: 0 }}>{user.name}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
            <div>
              <span className={`badge ${user.role === 'admin' ? 'todo' : 'done'}`}>
                {user.role}
              </span>
            </div>
          </div>
        )) : (
          <div className="empty-state">No members found.</div>
        )}
      </div>
    </div>
  );
}

export default Members;
