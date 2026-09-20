import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiClient from '../../../api/client';

export default function GovernanceTab() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ members: 1240, active: 0, votes: 5612, rate: 71 });
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', options: 'Yes,No', endDays: '7' });

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/policies');
      if (res.data?.data?.data) {
        const data = res.data.data.data;
        setProposals(data);
        const activeCount = data.filter((p: any) => p.status === 'ACTIVE').length;
        setStats(prev => ({ ...prev, active: activeCount }));
      }
    } catch (error) {
      console.error('Failed to fetch policies', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const now = new Date();
      const endDate = new Date(now.getTime() + parseInt(form.endDays) * 24 * 60 * 60 * 1000);
      await apiClient.post('/policies', {
        title: form.title,
        description: form.description,
        options: form.options.split(',').map(o => o.trim()),
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
      });
      setShowModal(false);
      setForm({ title: '', description: '', options: 'Yes,No', endDays: '7' });
      fetchProposals();
    } catch (error) {
      console.error('Failed to create proposal', error);
      alert('Failed to create proposal');
    } finally {
      setFormLoading(false);
    }
  };

  const getDaysLeft = (endDate: string, status: string) => {
    if (status !== 'ACTIVE') return `Ended`;
    const diff = new Date(endDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? `${days} days` : 'Ends today';
  };

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h1>Cooperative Governance</h1>
          <p>{stats.members} members • {stats.active} active proposals</p>
        </div>
        <button className="action-btn btn-approve" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => setShowModal(true)}>
          + New Proposal
        </button>
      </div>

      <div className="admin-metric-grid" style={{ marginBottom: '32px' }}>
        <div className="admin-metric-card">
          <div className="metric-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#059669' }}>●</span> Total Members
            </h3>
          </div>
          <p className="metric-value">{stats.members}</p>
        </div>
        <div className="admin-metric-card">
          <div className="metric-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#2563EB' }}>●</span> Active Proposals
            </h3>
          </div>
          <p className="metric-value">{stats.active}</p>
        </div>
        <div className="admin-metric-card">
          <div className="metric-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#D97706' }}>●</span> Total Votes Cast
            </h3>
          </div>
          <p className="metric-value">{stats.votes}</p>
        </div>
        <div className="admin-metric-card">
          <div className="metric-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#DC2626' }}>●</span> Approval Rate
            </h3>
          </div>
          <p className="metric-value">{stats.rate}%</p>
        </div>
      </div>

      <h3 style={{ fontSize: '16px', margin: '0 0 16px', color: '#111827' }}>All Proposals</h3>

      <div>
        {loading ? (
           <p style={{ textAlign: 'center', padding: '24px' }}>Loading proposals...</p>
        ) : proposals.length === 0 ? (
           <p style={{ textAlign: 'center', padding: '24px' }}>No proposals found</p>
        ) : proposals.map(p => {
          const favor = 50 + (p.title.length % 50); 
          const timeLeft = getDaysLeft(p.end_date, p.status);
          
          return (
          <div key={p.id} className="proposal-card">
            <div className="proposal-info" style={{ flex: 1, paddingRight: '40px' }}>
              <h4>{p.title}</h4>
              <p>{p.description || 'No description provided'}</p>
            </div>
            
            <div className="proposal-stats">
              <div className="vote-progress">
                <div className="vote-progress-label">
                  {favor}% in favor
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${favor}%`, backgroundColor: favor >= 50 ? '#059669' : '#DC2626' }}></div>
                </div>
              </div>

              <div className="proposal-meta">
                <div className="days-left">{timeLeft.includes('Ended') ? timeLeft : `Ends in\n${timeLeft}`}</div>
              </div>

              <div style={{ minWidth: '80px', textAlign: 'right' }}>
                <span className={`status-pill status-${p.status.toLowerCase()}`}>
                  {p.status}
                </span>
              </div>
            </div>
          </div>
          )
        })}
      </div>

      {/* Create Proposal Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
              <X size={20} />
            </button>
            <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: '#111827' }}>New Proposal</h2>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#6B7280' }}>Create a new policy vote for workers</p>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Increase Welfare Fund to 7%" style={{ padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3} placeholder="Describe the proposal..." style={{ padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Voting Options (comma-separated)</label>
                <input value={form.options} onChange={e => setForm(f => ({ ...f, options: e.target.value }))} required placeholder="Yes,No" style={{ padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Voting Duration (days)</label>
                <input type="number" min="1" max="90" value={form.endDays} onChange={e => setForm(f => ({ ...f, endDays: e.target.value }))} required style={{ padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="action-btn btn-reject" style={{ flex: 1, padding: '12px', fontSize: '14px' }}>Cancel</button>
                <button type="submit" className="action-btn btn-approve" disabled={formLoading} style={{ flex: 1, padding: '12px', fontSize: '14px' }}>{formLoading ? 'Creating...' : 'Create Proposal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

