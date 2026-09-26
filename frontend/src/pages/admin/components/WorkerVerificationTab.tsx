import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '../../../api/client';
import { useTranslation } from "react-i18next";

export default function WorkerVerificationTab() {
    const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('pending');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/admin/skill-verification?status=${activeTab}`);
      if (res.data?.data) {
        setApplications(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch verification applications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await apiClient.patch(`/admin/skill-verification/${id}`, {
        verificationStatus: status,
      });
      fetchApplications(); // Refresh list
    } catch (error) {
      console.error(`Failed to ${status} application`, error);
      alert(`Failed to ${status} application`);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h1>{t('newlyAdded.workerVerification')}</h1>
          <p>{t('newlyAdded.reviewNewWorkerApplications')}</p>
        </div>
        <div className="admin-search-bar">
          <Search size={16} color="#9CA3AF" />
          <input type="text" placeholder={t('newlyAdded.searchApplications')} />
        </div>
      </div>

      <div className="admin-tabs">
        {['pending', 'approved', 'rejected'].map(t => (
          <button 
            key={t}
            className={`admin-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
            style={{ textTransform: 'capitalize' }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px' }}>{t('newlyAdded.loading')}</td></tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px' }}>{t('newlyAdded.no')}{activeTab} {t('newlyAdded.applicationsFound')}</td></tr>
            ) : applications.map(app => (
              <tr key={app.id}>
                <td style={{ width: '40%' }}>
                  <div className="user-info-cell">
                    <div className="user-initial-avatar" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                      {app.worker?.name ? app.worker.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="user-info-text">
                      <strong>{app.worker?.name || 'Unknown User'}</strong>
                      <span>{app.service_category || 'General'} • {app.worker?.phone || 'No phone'}</span>
                    </div>
                  </div>
                </td>
                <td style={{ width: '20%' }}>
                  <div className="user-info-text">
                    <strong>{t('newlyAdded.submitted')}</strong>
                    <span>{new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                </td>
                <td style={{ width: '40%', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <span style={{ color: app.id_proof_url ? '#059669' : '#DC2626' }}>
                        {app.id_proof_url ? '✓ ID Proof' : '✗ No ID'}
                      </span>
                    </span>
                    <span style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', marginLeft: '12px' }}>
                      <span style={{ color: app.certificate_url ? '#059669' : '#9CA3AF' }}>
                        {app.certificate_url ? '✓ Certificate' : 'No Cert'}
                      </span>
                    </span>
                    
                    {activeTab === 'pending' && (
                      <>
                        <button className="action-btn btn-reject" style={{ marginLeft: '16px' }} onClick={() => handleVerification(app.id, 'rejected')}>{t('newlyAdded.reject')}</button>
                        <button className="action-btn btn-approve" onClick={() => handleVerification(app.id, 'approved')}>{t('newlyAdded.approve')}</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
