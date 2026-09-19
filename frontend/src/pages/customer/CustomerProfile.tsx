import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, MessageSquare, User, MapPin, Phone, History, ChevronRight, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import './CustomerHome.css';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (field: 'phone' | 'address') => {
    setLoading(true);
    try {
      const payload = field === 'phone' ? { phone } : { address, pincode };
      const res = await apiClient.patch('/users/profile', payload);
      if (res.data?.data) {
        updateUser(res.data.data);
      }
      if (field === 'phone') setIsEditingPhone(false);
      if (field === 'address') setIsEditingAddress(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container with-bottom-nav" style={{ backgroundColor: '#f8fafc' }}>
      <main style={{ padding: '24px 20px', minHeight: '80vh' }}>
        
        {/* Profile Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '32px', marginBottom: '16px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>{user?.name || 'Customer'}</h2>
          <p className="text-muted mt-1">{user?.email}</p>
        </div>

        {/* Profile Options */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginBottom: '16px' }}>
          
          {/* Phone Number Section */}
          <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '8px' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 500 }}>Phone Number</h4>
                  {!isEditingPhone && <p style={{ margin: 0, fontSize: '14px', color: '#64748b', marginTop: '2px' }}>{user?.phone || 'Add phone number'}</p>}
                </div>
              </div>
              {!isEditingPhone ? (
                <button onClick={() => setIsEditingPhone(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 500, fontSize: '14px' }}>Edit</button>
              ) : (
                <button onClick={() => setIsEditingPhone(false)} style={{ background: 'none', border: 'none', color: '#94a3b8' }}><X size={20} /></button>
              )}
            </div>
            
            {isEditingPhone && (
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                  placeholder="Enter phone number"
                />
                <button onClick={() => handleUpdate('phone')} disabled={loading} style={{ padding: '10px 16px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500 }}>
                  <Save size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Address Section */}
          <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '8px' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 500 }}>Saved Address</h4>
                  {!isEditingAddress && <p style={{ margin: 0, fontSize: '14px', color: '#64748b', marginTop: '2px' }}>{user?.address ? `${user.address}${user.pincode ? `, ${user.pincode}` : ''}` : 'Add address'}</p>}
                </div>
              </div>
              {!isEditingAddress ? (
                <button onClick={() => setIsEditingAddress(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 500, fontSize: '14px' }}>Edit</button>
              ) : (
                <button onClick={() => setIsEditingAddress(false)} style={{ background: 'none', border: 'none', color: '#94a3b8' }}><X size={20} /></button>
              )}
            </div>
            
            {isEditingAddress && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  type="text" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                  placeholder="House No, Area, Street"
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={pincode} 
                    onChange={e => setPincode(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                    placeholder="Pincode"
                  />
                  <button onClick={() => handleUpdate('address')} disabled={loading} style={{ padding: '10px 16px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500 }}>
                    <Save size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* History Section */}
          <div 
            onClick={() => navigate('/customer/bookings')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#ede9fe', color: '#7c3aed', borderRadius: '8px' }}>
                <History size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 500 }}>Booking History</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b', marginTop: '2px' }}>View past and ongoing jobs</p>
              </div>
            </div>
            <ChevronRight size={20} color="#94a3b8" />
          </div>
        </div>

        {/* Log Out Button */}
        <button 
          onClick={handleLogout}
          style={{ width: '100%', padding: '14px', backgroundColor: 'white', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '12px', fontWeight: 600, fontSize: '15px', marginTop: '8px' }}
        >
          Log Out
        </button>
      </main>

      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/customer/home')}>
          <Home size={24} />
          <span>Home</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/customer/bookings')}>
          <Calendar size={24} />
          <span>Bookings</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/customer/messages')}>
          <MessageSquare size={24} />
          <span>Messages</span>
        </button>
        <button className="nav-item active" onClick={() => navigate('/customer/profile')}>
          <User size={24} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}
