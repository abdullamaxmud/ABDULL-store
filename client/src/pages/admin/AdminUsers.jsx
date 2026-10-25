import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import formatDate from '../../utils/formatDate';
import Badge from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../layouts/AdminLayout';
import Modal from '../../components/common/Modal';
import formatCurrency from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [togglingId, setTogglingId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
  });
  const [savingUser, setSavingUser] = useState(false);
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  // Create / delete
  const blankNewUser = { name: '', email: '', phone: '', password: '', role: 'customer' };
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState(blankNewUser);
  const [creatingUser, setCreatingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (newUser.password.length < 8) {
      showToast('Password must be at least 8 characters long.', 'warning');
      return;
    }
    try {
      setCreatingUser(true);
      const res = await adminService.createUser(newUser);
      if (res.success) {
        showToast(res.message, 'success');
        setShowCreate(false);
        setNewUser(blankNewUser);
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const res = await adminService.deleteUser(deletingUser._id);
      if (res.success) {
        showToast(res.message, 'info');
        setUsers(users.filter((u) => u._id !== deletingUser._id));
        setDeletingUser(null);
        setDeleteConfirmText('');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUnlock = async (u) => {
    try {
      const res = await adminService.unlockUser(u._id);
      if (res.success) {
        showToast(res.message, 'success');
        setUsers(users.map((x) => (x._id === u._id ? { ...x, isLocked: false, failedLogins: 0 } : x)));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      setTogglingId(user._id);
      const res = await adminService.toggleUserStatus(user._id);
      if (res.success) {
        showToast(res.message, 'success');
        setUsers(
          users.map((u) => (u._id === user._id ? { ...u, isActive: res.data.isActive } : u))
        );
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setShowPassword(false);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'customer',
      password: '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editFormData.password && editFormData.password.length < 8) {
      showToast('New password must be at least 8 characters long.', 'warning');
      return;
    }

    try {
      setSavingUser(true);
      const payload = {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        role: editFormData.role,
      };
      if (editFormData.password.trim()) {
        payload.password = editFormData.password.trim();
      }

      const res = await adminService.updateUser(editingUser._id, payload);
      if (res.success && res.data) {
        showToast(res.message || 'User credentials updated successfully!', 'success');
        setUsers(
          users.map((u) => (u._id === editingUser._id ? { ...u, ...res.data } : u))
        );
        setEditingUser(null);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingUser(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (roleFilter === 'all') return true;
    if (roleFilter === 'admin') return u.role === 'admin';
    if (roleFilter === 'customer') return u.role === 'customer';
    if (roleFilter === 'active') return u.isActive;
    if (roleFilter === 'inactive') return !u.isActive;
    return true;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const customerCount = users.filter((u) => u.role === 'customer').length;

  return (
    <AdminLayout title="User & Security Management">
      <div className="admin-card-glass" style={{ padding: '28px' }}>
        {/* Header & Metric summary */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)' }}>
                Account Directory
              </h2>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent)',
                }}
              >
                {users.length} Total Users
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Inspect profiles, modify usernames, reset passwords, or manage access permissions
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
              + Add User
            </button>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              👑 {adminCount} Admins
            </span>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              👤 {customerCount} Customers
            </span>
          </div>
        </div>

        {/* Filter and Search Controls Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Accounts' },
              { id: 'admin', label: 'Admins Only' },
              { id: 'customer', label: 'Customers' },
              { id: 'active', label: 'Active' },
              { id: 'inactive', label: 'Disabled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: roleFilter === tab.id ? 'var(--accent)' : 'var(--border-subtle)',
                  backgroundColor: roleFilter === tab.id ? 'var(--accent)' : 'transparent',
                  color: roleFilter === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: '36px',
                paddingTop: '8px',
                paddingBottom: '8px',
                fontSize: '0.84rem',
                borderRadius: 'var(--radius-full)',
              }}
            />
          </div>
        </div>

        {/* User Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Profile & Name</th>
                <th>Login Email</th>
                <th>Phone Number</th>
                <th>Permission Role</th>
                <th>Account Status</th>
                <th>Orders</th>
                <th>Registration</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px' }}>
                    <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading directory...</div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                          alt={u.name}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: u.role === 'admin' ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{u.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: #{u._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{u.email}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.phone || '—'}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: u.role === 'admin' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-subtle)',
                          color: u.role === 'admin' ? 'var(--accent)' : 'var(--text-secondary)',
                          border: u.role === 'admin' ? '1px solid rgba(37, 99, 235, 0.25)' : '1px solid var(--border-subtle)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {u.role === 'admin' ? '👑 ADMIN' : '👤 CUSTOMER'}
                      </span>
                    </td>
                    <td>
                      <Badge variant={u.isActive ? 'success' : 'danger'}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                      {u.isLocked && (
                        <div style={{ marginTop: 4 }}>
                          <Badge variant="warning">🔒 Locked</Badge>{' '}
                          <button type="button" className="btn btn-outline btn-xs" onClick={() => handleUnlock(u)}>Unlock</button>
                        </div>
                      )}
                      {!u.isLocked && u.failedLogins > 0 && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{u.failedLogins} failed sign-in(s)</div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 800 }}>{u.orderCount || 0} orders</div>
                      <div style={{ color: 'var(--text-muted)' }}>{formatCurrency(u.totalSpent || 0)} spent</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{formatDate(u.createdAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="btn btn-outline btn-xs"
                          style={{
                            padding: '5px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="Edit Credentials & Password"
                        >
                          <span>✏️</span> Edit
                        </button>

                        {!u.isMasterAdmin && u._id !== currentUser?._id && (
                          <button
                            disabled={togglingId === u._id}
                            onClick={() => handleToggleStatus(u)}
                            className={`btn ${u.isActive ? 'btn-danger' : 'btn-outline'} btn-xs`}
                            style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)' }}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}

                        {!u.isMasterAdmin && u._id !== currentUser?._id && (
                          <button
                            type="button"
                            onClick={() => { setDeletingUser(u); setDeleteConfirmText(''); }}
                            className="btn btn-outline btn-xs"
                            style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                            title="Delete account permanently"
                          >
                            Delete
                          </button>
                        )}
                        {u.isMasterAdmin && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Protected</span>}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No matching accounts found for "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setEditingUser(null)}
        >
          <div
            className="admin-card-glass"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '32px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                  Modify Account Credentials
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Target: <strong style={{ color: 'var(--accent)' }}>{editingUser.name}</strong> ({editingUser.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="btn-icon"
                style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="input-group">
                <label className="input-label">Username / Full Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Email Address (Login Username)</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+1 (555) 000-0000"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Account Role</label>
                <select
                  className="input-field"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Administrator (Super Admin)</option>
                </select>
              </div>

              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="input-label">
                    Reset Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.78rem',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    {showPassword ? 'Hide 🔒' : 'Show 👁️'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Leave empty to keep existing password (min 8 chars)"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '26px' }}>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="btn btn-primary"
                  style={{
                    flexGrow: 1,
                    padding: '12px',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  {savingUser ? 'Saving Credentials...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn btn-outline"
                  style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Create user */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add a new user">
        <form onSubmit={handleCreateUser}>
          <div className="input-group">
            <label className="input-label" htmlFor="nu-name">Full name *</label>
            <input id="nu-name" required maxLength={60} className="input-field" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="nu-email">Email *</label>
            <input id="nu-email" type="email" required className="input-field" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="nu-phone">Phone</label>
            <input id="nu-phone" maxLength={30} className="input-field" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="nu-pass">Password * (min 8 characters)</label>
            <input id="nu-pass" type="password" required minLength={8} autoComplete="new-password" className="input-field" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Share it with the person privately; they can change it in their profile.</span>
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="nu-role">Role</label>
            <select id="nu-role" className="input-field" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="customer">Customer</option>
              <option value="admin">Admin (full control of the store)</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={creatingUser}>{creatingUser ? 'Creating…' : 'Create account'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete user */}
      <Modal isOpen={!!deletingUser} onClose={() => setDeletingUser(null)} title="Delete account permanently?">
        {deletingUser && (
          <div>
            <p style={{ marginBottom: 10 }}>
              <strong>{deletingUser.name}</strong> ({deletingUser.email}) will be removed together with their bag and wishlist.
              Their {deletingUser.orderCount || 0} past order(s) are kept for your records.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 10 }}>
              To only block sign-in, use <strong>Deactivate</strong> instead — that can be undone.
            </p>
            <label className="input-label" htmlFor="del-confirm">Type DELETE to confirm</label>
            <input id="del-confirm" className="input-field" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} style={{ margin: '6px 0 16px' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setDeletingUser(null)}>Cancel</button>
              <button type="button" className="btn btn-danger" disabled={deleteConfirmText !== 'DELETE'} onClick={handleDeleteUser}>Delete account</button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminUsers;
