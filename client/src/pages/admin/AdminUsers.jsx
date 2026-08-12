import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form,    setForm]    = useState({ name:'', email:'', password:'' });
  const [msgModal, setMsgModal] = useState(null); // { userId, name, current }
  const [msgText,  setMsgText]  = useState('');
  const [error,   setError]   = useState('');

  async function load() {
    setLoading(true);
    try {
      const d = await apiFetch('/api/admin/users');
      setUsers(d.users);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function addUser(e) {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/api/admin/users', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name:'', email:'', password:'' });
      setShowAdd(false);
      load();
    } catch (err) { setError(err.message); }
  }

  async function deleteUser(id) {
    if (!confirm('Delete this user and all their check-ins?')) return;
    await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    load();
  }

  function openMsg(user) {
    setMsgModal({ userId: user._id, name: user.name });
    setMsgText(user.adminMessage || '');
  }

  async function sendMsg() {
    await apiFetch(`/api/admin/users/${msgModal.userId}/message`, {
      method: 'PATCH',
      body: JSON.stringify({ message: msgText }),
    });
    setMsgModal(null);
    load();
  }

  function streakLabel(user) {
    const days = user.streak || 0;
    return `${days} day${days !== 1 ? 's' : ''} 🔥`;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Users</h1>
        <button className="btn-primary" onClick={() => setShowAdd(s => !s)}>
          {showAdd ? 'Cancel' : '+ Add user'}
        </button>
      </div>

      {showAdd && (
        <form className="add-user-form" onSubmit={addUser}>
          <h3>New user</h3>
          {error && <p className="form-error">{error}</p>}
          <input placeholder="Name"     value={form.name}     onChange={e => setForm(f=>({...f,name:e.target.value}))}     required />
          <input placeholder="Email"    value={form.email}    onChange={e => setForm(f=>({...f,email:e.target.value}))}    type="email" required />
          <input placeholder="Password" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} type="password" required />
          <button type="submit" className="btn-primary">Create</button>
        </form>
      )}

      {loading ? <p className="muted">Loading…</p> : (
        <div className="user-list">
          {users.length === 0 && <p className="muted">No users yet.</p>}
          {users.map(u => (
            <div className="user-card" key={u._id}>
              <div className="user-info">
                <strong>{u.name}</strong>
                <span className="muted">{u.email}</span>
                <span className="streak-badge">{streakLabel(u)}</span>
                {u.adminMessage && (
                  <span className="msg-preview">💌 {u.adminMessage}</span>
                )}
              </div>
              <div className="user-actions">
                <button className="btn-ghost" onClick={() => navigate(`history/${u._id}`)}>History</button>
                <button className="btn-ghost" onClick={() => openMsg(u)}>Send note</button>
                <button className="btn-danger" onClick={() => deleteUser(u._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {msgModal && (
        <div className="modal-overlay" onClick={() => setMsgModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Send a note to {msgModal.name}</h3>
            <p className="muted" style={{marginBottom:'0.75rem'}}>They'll see this when they open the app.</p>
            <textarea
              rows={4}
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              placeholder="Write something sweet…"
            />
            <div className="modal-actions">
              <button className="btn-ghost"  onClick={() => setMsgModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={sendMsg}>Send 💌</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
