import { Search } from 'lucide-react';

export default function DashboardTab({ stats }: { stats: any }) {
  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h1>Dashboard</h1>
          <p>Summary of platform metrics</p>
        </div>
        <div className="admin-search-bar">
          <Search size={16} color="#9CA3AF" />
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="admin-metric-grid">
        <div className="admin-metric-card">
          <div className="metric-header">
            <h3>Active Workers</h3>
            <span className="trend-up">↑ 12%</span>
          </div>
          <p className="metric-value">{stats?.workers?.verified || stats?.users?.workers || 0}</p>
        </div>
        <div className="admin-metric-card">
          <div className="metric-header">
            <h3>Total Bookings</h3>
            <span className="trend-up">↑ 4%</span>
          </div>
          <p className="metric-value">{stats?.bookings?.total || 0}</p>
        </div>
        <div className="admin-metric-card">
          <div className="metric-header">
            <h3>Total Customers</h3>
            <span className="trend-down">↓ 2%</span>
          </div>
          <p className="metric-value">{stats?.users?.customers || 0}</p>
        </div>
        <div className="admin-metric-card">
          <div className="metric-header">
            <h3>Platform Fees</h3>
            <span className="trend-up">↑ 18%</span>
          </div>
          <p className="metric-value">₹{(stats?.revenue?.totalPlatformFees || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Mock Bar Chart */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
          <h3 style={{ fontSize: '14px', margin: '0 0 20px' }}>Jobs Completed - Last 7 Days</h3>
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
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Mock Revenue Category */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
          <h3 style={{ fontSize: '14px', margin: '0 0 20px' }}>Revenue by Category</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span>Electrician</span><span>35%</span>
            </div>
            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '35%', backgroundColor: '#D97706' }}></div></div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span>Plumber</span><span>28%</span>
            </div>
            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '28%', backgroundColor: '#2563EB' }}></div></div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span>Carpenter</span><span>20%</span>
            </div>
            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '20%', backgroundColor: '#DC2626' }}></div></div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span>Cleaning</span><span>17%</span>
            </div>
            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '17%', backgroundColor: '#059669' }}></div></div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
        <h3 style={{ fontSize: '14px', margin: '0 0 16px' }}>Recent Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }}></div>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>New worker registered</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Deepak Singh applied as Electrician</p>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>2 mins ago</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }}></div>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>Booking completed</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>AC installation finished by Worker #102</p>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>15 mins ago</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626' }}></div>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>Dispute raised</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Customer reported no-show for booking #4029</p>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
