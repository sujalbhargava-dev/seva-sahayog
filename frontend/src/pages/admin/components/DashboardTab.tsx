import { Search } from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function DashboardTab({ stats }: { stats: any }) {
    const { t } = useTranslation();
  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h1>{t('newlyAdded.dashboard')}</h1>
          <p>{t('newlyAdded.summaryOfPlatformMetrics')}</p>
        </div>
        <div className="admin-search-bar">
          <Search size={16} color="#9CA3AF" />
          <input type="text" placeholder={t('newlyAdded.search')} />
        </div>
      </div>

      <div className="admin-metric-grid">
        <div className="admin-metric-card">
          <div className="metric-header">
            <h3>{t('newlyAdded.activeWorkers')}</h3>
            <span className="trend-up">↑ 12%</span>
          </div>
          <p className="metric-value">{stats?.workers?.verified || stats?.users?.workers || 0}</p>
        </div>
        <div className="admin-metric-card">
          <div className="metric-header">
            <h3>{t('newlyAdded.totalBookings')}</h3>
            <span className="trend-up">↑ 4%</span>
          </div>
          <p className="metric-value">{stats?.bookings?.total || 0}</p>
        </div>
        <div className="admin-metric-card">
          <div className="metric-header">
            <h3>{t('newlyAdded.totalCustomers')}</h3>
            <span className="trend-down">↓ 2%</span>
          </div>
          <p className="metric-value">{stats?.users?.customers || 0}</p>
        </div>
        <div className="admin-metric-card">
          <div className="metric-header">
            <h3>{t('newlyAdded.platformFees')}</h3>
            <span className="trend-up">↑ 18%</span>
          </div>
          <p className="metric-value">₹{(stats?.revenue?.totalPlatformFees || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Mock Bar Chart */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
          <h3 style={{ fontSize: '14px', margin: '0 0 20px' }}>{t('newlyAdded.jobsCompletedLast')}</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', paddingBottom: '10px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ width: '24px', height: '40%', backgroundColor: '#059669', borderRadius: '4px 4px 0 0' }}></div>
            <div style={{ width: '24px', height: '60%', backgroundColor: '#059669', borderRadius: '4px 4px 0 0' }}></div>
            <div style={{ width: '24px', height: '50%', backgroundColor: '#059669', borderRadius: '4px 4px 0 0' }}></div>
            <div style={{ width: '24px', height: '80%', backgroundColor: '#059669', borderRadius: '4px 4px 0 0' }}></div>
            <div style={{ width: '24px', height: '70%', backgroundColor: '#059669', borderRadius: '4px 4px 0 0' }}></div>
            <div style={{ width: '24px', height: '90%', backgroundColor: '#059669', borderRadius: '4px 4px 0 0' }}></div>
            <div style={{ width: '24px', height: '100%', backgroundColor: '#059669', borderRadius: '4px 4px 0 0' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#6B7280' }}>
            <span>{t('newlyAdded.mon')}</span><span>{t('newlyAdded.tue')}</span><span>{t('newlyAdded.wed')}</span><span>{t('newlyAdded.thu')}</span><span>{t('newlyAdded.fri')}</span><span>{t('newlyAdded.sat')}</span><span>{t('newlyAdded.sun')}</span>
          </div>
        </div>

        {/* Mock Revenue Category */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
          <h3 style={{ fontSize: '14px', margin: '0 0 20px' }}>{t('newlyAdded.revenueByCategory')}</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span>{t('newlyAdded.electrician')}</span><span>35%</span>
            </div>
            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '35%', backgroundColor: '#D97706' }}></div></div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span>{t('newlyAdded.plumber')}</span><span>28%</span>
            </div>
            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '28%', backgroundColor: '#2563EB' }}></div></div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span>{t('newlyAdded.carpenter')}</span><span>20%</span>
            </div>
            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '20%', backgroundColor: '#DC2626' }}></div></div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span>{t('newlyAdded.cleaning')}</span><span>17%</span>
            </div>
            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '17%', backgroundColor: '#059669' }}></div></div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
        <h3 style={{ fontSize: '14px', margin: '0 0 16px' }}>{t('newlyAdded.recentActivity')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }}></div>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>{t('newlyAdded.newWorkerRegistered')}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>{t('newlyAdded.deepakSinghAppliedAs')}</p>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>{t('newlyAdded.2MinsAgo')}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }}></div>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>{t('newlyAdded.bookingCompleted')}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>{t('newlyAdded.aCInstallationFinishedBy')}</p>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>{t('newlyAdded.15MinsAgo')}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626' }}></div>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>{t('newlyAdded.disputeRaised')}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>{t('newlyAdded.customerReportedNoshowFor')}</p>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>{t('newlyAdded.1HourAgo')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
