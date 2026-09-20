import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Users, CalendarDays, BookOpen, LogOut, Settings, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import './Admin.css';

import DashboardTab from './components/DashboardTab';
import WorkerVerificationTab from './components/WorkerVerificationTab';
import UsersTab from './components/UsersTab';
import BookingsTab from './components/BookingsTab';
import GovernanceTab from './components/GovernanceTab';

export default function AdminHome() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/admin/stats');
        if (res.data?.data) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab stats={stats} />;
      case 'verification':
        return <WorkerVerificationTab />;
      case 'users':
        return <UsersTab />;
      case 'bookings':
        return <BookingsTab />;
      case 'governance':
        return <GovernanceTab />;
      default:
        return (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <h2>Under Construction</h2>
            <p className="text-muted">This module is currently being built.</p>
          </div>
        );
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div style={{ width: '24px', height: '24px', backgroundColor: '#059669', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '14px' }}>W</span>
          </div>
          <h2>WorkLink Admin</h2>
        </div>
        
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={`admin-nav-item ${activeTab === 'verification' ? 'active' : ''}`} onClick={() => setActiveTab('verification')}>
            <ShieldCheck size={18} /> Worker Verification
          </button>
          <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={18} /> Users
          </button>
          <button className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            <CalendarDays size={18} /> Bookings
          </button>
          <button className={`admin-nav-item ${activeTab === 'governance' ? 'active' : ''}`} onClick={() => setActiveTab('governance')}>
            <BookOpen size={18} /> Governance
          </button>
          <button className={`admin-nav-item ${activeTab === 'payouts' ? 'active' : ''}`} onClick={() => setActiveTab('payouts')}>
            <Wallet size={18} /> Payouts
          </button>
          <button className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={18} /> Settings
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-profile" style={{ marginBottom: '16px' }}>
            <div className="admin-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'A')}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                {user?.name || 'Admin User'}
              </span>
              <span style={{ fontSize: '11px', color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                {user?.email || 'Super Admin'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0 }}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {renderContent()}
      </main>
    </div>
  );
}
