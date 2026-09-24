import { Search, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '../../../api/client';

export default function UsersTab() {
  const [activeTab, setActiveTab] = useState('All Users');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let role = '';
      if (activeTab.includes('Customers')) role = 'customer';
      if (activeTab.includes('Workers')) role = 'worker';
      
      const queryParams = new URLSearchParams();
      if (role) queryParams.append('role', role);
      if (search) queryParams.append('search', search);

      const res = await apiClient.get(`/admin/users?${queryParams.toString()}`);
      if (res.data?.data) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h1>Users</h1>
          <p>Manage users across the platform</p>
        </div>
        <form onSubmit={handleSearch} className="admin-search-bar">
          <Search size={16} color="#9CA3AF" />
          <input 
            type="text" 
            placeholder="Search by name, email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="admin-tabs">
        {['All Users', 'Customers', 'Workers'].map(t => (
          <button 
            key={t}
            className={`admin-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Location</th>
              <th>Joined</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>No users found</td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="user-info-cell">
                    <div className="user-initial-avatar" style={{ backgroundColor: u.role === 'worker' ? '#FEF08A' : '#E0F2FE', color: u.role === 'worker' ? '#854D0E' : '#0369A1' }}>
                      {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="user-info-text">
                      <strong>{u.name}</strong>
                      <span>{u.email}</span>
                    </div>
                  </div>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                <td>{u.address || '—'}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`status-pill ${u.is_active ? 'status-active' : 'status-suspended'}`}>
                    {u.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td>
                  <span style={{ color: '#059669', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Edit <ChevronDown size={14} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
