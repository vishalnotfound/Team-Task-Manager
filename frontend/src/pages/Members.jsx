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
      <div className="page-header">
        <p className="page-subtitle">Workspace</p>
        <h1>Members</h1>
      </div>

      {users.length > 0 ? (
        <div className="data-table">
          <div className="table-header" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 120px', gap: '1rem' }}>
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
          </div>
          {users.map(user => (
            <div key={user.id} className="table-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 120px', gap: '1rem' }}>
              <div style={{ fontWeight: 600 }}>{user.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.email}</div>
              <div>
                <span className={`badge ${user.role}`}>{user.role}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No members found.</div>
      )}
    </div>
  );
}

export default Members;
