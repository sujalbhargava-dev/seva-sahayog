import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import './Registration.css';

export default function WorkerRegistration() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await apiClient.post('/auth/register', {
        ...formData,
        address,
        pincode,
        gender,
        role: 'WORKER'
      });
      
      if (res.data?.data) {
        const { user, accessToken, refreshToken } = res.data.data;
        login(user, accessToken, refreshToken);
        navigate('/worker/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ paddingBottom: '32px' }}>
      <div className="app-header" style={{ padding: '16px 0', border: 'none' }}>
        <button className="back-btn" onClick={() => navigate('/landing')}>
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="auth-content">
        <h1 className="auth-title">Worker Registration</h1>
        <p className="auth-subtitle">Showcase your skills and start getting work</p>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="section-title">PERSONAL DETAILS</div>
          
          <div className="upload-box mb-4">
            <span className="text-primary font-semibold">+ Tap to upload</span>
            <span className="text-muted text-xs">JPG or PNG, max 5MB</span>
          </div>

          <div className="input-group">
            <label>Full Name</label>
            <input type="text" placeholder="e.g. Ramesh Kumar" required 
                   value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" required 
                   value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Create a password" required 
                   value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <div className="input-group">
            <label>Mobile Number</label>
            <input type="tel" placeholder="9876543210" required pattern="^[6-9]\d{9}$"
                   value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="input-group">
            <label>Address</label>
            <input type="text" placeholder="House no., street, area" required 
                   value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Gender</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Male', 'Female', 'Other'].map(g => (
                <button 
                  key={g}
                  type="button"
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    border: `1px solid ${gender === g ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    background: gender === g ? 'var(--primary-light)' : 'transparent',
                    color: gender === g ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                  onClick={() => setGender(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Pincode</label>
            <input type="text" placeholder="474011" required 
                   value={pincode} onChange={e => setPincode(e.target.value)} />
          </div>

          {/* PROFESSIONAL DETAILS */}
          <div className="section-title mt-6">PROFESSIONAL DETAILS</div>

          <div className="input-group">
            <label>Craft / Trade</label>
            <input type="text" placeholder="e.g. Electrician, Plumber, Carpenter" required />
          </div>

          <div className="input-group">
            <label>Experience</label>
            <input type="text" placeholder="Years of experience" required />
          </div>

          <div className="input-group">
            <label>Skills</label>
            <input type="text" placeholder="e.g. Wiring, Fitting, Repair" required />
          </div>

          <div className="input-group">
            <label>Category</label>
            <select required>
              <option value="" disabled selected>Select a service category</option>
              <option value="electrician">Electrician</option>
              <option value="plumber">Plumber</option>
              <option value="carpenter">Carpenter</option>
            </select>
          </div>

          <div className="input-group">
            <label>Work Sample Video</label>
            <div className="upload-box">
              <span className="text-primary font-semibold">+ Tap to upload</span>
              <span className="text-muted text-xs">Show your best work, max 60s</span>
            </div>
          </div>

          <div className="input-group">
            <label>Certificate (optional)</label>
            <div className="upload-box">
              <span className="text-primary font-semibold">+ Tap to upload</span>
              <span className="text-muted text-xs">Trade certificate or license</span>
            </div>
          </div>

          {/* VERIFICATION */}
          <div className="section-title mt-6">VERIFICATION</div>

          <div className="input-group">
            <label>Aadhaar Card Number</label>
            <input type="text" placeholder="XXXX XXXX XXXX" required />
          </div>

          {error && (
            <div style={{ color: 'var(--error)', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary mt-6" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
