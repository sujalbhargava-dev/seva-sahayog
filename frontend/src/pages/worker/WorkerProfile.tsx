import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, FileText, Settings, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import './WorkerHome.css';

export default function WorkerProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [workerDetails, setWorkerDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchWorker = async () => {
      try {
        const res = await apiClient.get(`/workers/${user.id}`);
        setWorkerDetails(res.data?.data);
      } catch (error) {
        console.error('Failed to fetch worker details', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorker();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
          <ArrowLeft size={24} color="var(--text-main)" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Profile & Documents</h1>
      </div>

      <main style={{ padding: '20px' }}>
        {/* Profile Card */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 600 }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'W'}
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>{user?.name || 'Worker Name'}</h2>
            <p className="text-muted" style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{user?.phone || '+91 98765 43210'}</p>
            {isLoading ? (
              <Loader2 className="animate-spin text-muted" size={16} />
            ) : workerDetails?.verification_status === 'APPROVED' ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#DCFCE7', color: '#16A34A', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                <Shield size={14} />
                Verified Background
              </div>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#FEF9C3', color: '#CA8A04', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                Pending Verification
              </div>
            )}
          </div>
        </div>

        {/* Menu Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <User size={20} color="var(--primary)" />
              <span style={{ fontSize: '15px', fontWeight: 500 }}>Personal Information</span>
            </div>
          </button>
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={20} color="var(--primary)" />
              <span style={{ fontSize: '15px', fontWeight: 500 }}>Documents & KYC</span>
            </div>
          </button>
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={20} color="var(--primary)" />
              <span style={{ fontSize: '15px', fontWeight: 500 }}>App Settings</span>
            </div>
          </button>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          style={{ width: '100%', padding: '16px', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
        >
          Log Out
        </button>
      </main>
    </div>
  );
}
