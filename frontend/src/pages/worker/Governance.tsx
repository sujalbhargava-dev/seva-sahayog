import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, FileText, Vote, CheckCircle } from 'lucide-react';
import apiClient from '../../api/client';
import './WorkerShared.css';

export default function Governance() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState<Record<string,string>>({});

  const fetchPolicies = async () => {
    try {
      const res = await apiClient.get('/policies');
      if (res.data?.data) {
        const detailed = await Promise.all(
          res.data.data.map(async (p: any) => {
            try { return (await apiClient.get(`/policies/${p.id}`)).data?.data; }
            catch { return null; }
          })
        );
        const valid = detailed.filter(Boolean);
        setPolicies(valid);
        const ev: Record<string,string> = {};
        valid.forEach((p: any) => { if (p.userVoted && p.userVote) ev[p.policy.id] = p.userVote; });
        setVotes(ev);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPolicies(); }, []);

  const handleVote = async (id: string, choice: string) => {
    if (votes[id]) return;
    setVotes(prev => ({ ...prev, [id]: choice }));
    try {
      await apiClient.post(`/policies/${id}/vote`, { selectedOption: choice });
      fetchPolicies();
    } catch {
      setVotes(prev => { const n = {...prev}; delete n[id]; return n; });
      alert('Failed to cast vote.');
    }
  };

  const active = policies.filter(p => p.policy.status === 'ACTIVE').length;

  return (
    <div className="ws-page">
      <div className="ws-header">
        <div className="ws-header-row">
          <button className="ws-back-btn" onClick={() => navigate(-1 as any)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 className="ws-header-title">{t('governance.title')}</h1>
        </div>
        <p className="ws-header-sub">{t('governance.subtitle')}</p>
      </div>

      <div className="ws-body">
        {/* Stats */}
        <div className="ws-stats-row ws-stats-row-3" style={{marginBottom:'14px'}}>
          <div className="ws-stat-pill">
            <div style={{display:'flex', justifyContent:'center', marginBottom:'6px'}}><Users size={15} color="#6366f1"/></div>
            <h4>1,240</h4><p>{t('governance.members')}</p>
          </div>
          <div className="ws-stat-pill">
            <div style={{display:'flex', justifyContent:'center', marginBottom:'6px'}}><FileText size={15} color="#10b981"/></div>
            <h4>{loading?'—':active}</h4><p>{t('governance.activeProposals')}</p>
          </div>
          <div className="ws-stat-pill">
            <div style={{display:'flex', justifyContent:'center', marginBottom:'6px'}}><Vote size={15} color="#f59e0b"/></div>
            <h4>{Object.keys(votes).length}</h4><p>{t('governance.yourVotes')}</p>
          </div>
        </div>

        <p className="ws-label">{t('governance.activeProposals')}</p>

        {loading ? (
          <div className="ws-empty"><p>{t('governance.loading')}</p></div>
        ) : policies.length === 0 ? (
          <div className="ws-empty">
            <div className="ws-empty-icon" style={{background:'#f0fdf4'}}><Vote size={32} color="#10b981"/></div>
            <h3>{t('governance.noProposals')}</h3>
            <p>{t('governance.noProposalsDesc')}</p>
          </div>
        ) : (
          policies.map(item => {
            const { policy, results, userVoted, userVote } = item;
            const currentVote = votes[policy.id] || userVote;
            const yesResult = results.find((r: any) => r.option.toLowerCase()==='yes' || r.option==='In Favor');
            const pct = yesResult ? yesResult.percentage : (results[0]?.percentage || 0);
            const daysLeft = Math.max(0, Math.ceil((new Date(policy.end_date).getTime() - Date.now())/(1000*3600*24)));
            const isClosed = policy.status !== 'ACTIVE' || daysLeft === 0;

            return (
              <div key={policy.id} className="ws-vote-card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px'}}>
                  <h4 className="ws-vote-title" style={{flex:1, marginRight:'8px'}}>{policy.title}</h4>
                  <span style={{padding:'3px 9px', borderRadius:'20px', fontSize:'11px', fontWeight:700, background: isClosed?'#fee2e2':'#d1fae5', color: isClosed?'#991b1b':'#065f46', flexShrink:0}}>
                    {isClosed ? t('governance.closed') : t('governance.daysLeft', {days: daysLeft})}
                  </span>
                </div>
                <p className="ws-vote-desc">{policy.description}</p>

                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
                  <span style={{fontSize:'12px', fontWeight:600, color:'#10b981'}}>{pct}{t('governance.inFavor')}</span>
                </div>
                <div className="ws-progress-bg" style={{marginBottom:'14px'}}>
                  <div className="ws-progress-fill" style={{width:`${pct}%`}}/>
                </div>

                <div className="ws-vote-opts">
                  {policy.options.map((opt: string) => {
                    const lo = opt.toLowerCase();
                    const sel = currentVote === opt;
                    const cls = sel ? (lo==='yes'||lo==='in favor' ? 'selected-yes' : lo==='no' ? 'selected-no' : 'selected-other') : '';
                    return (
                      <button key={opt} className={`ws-vote-btn ${cls}`}
                        onClick={() => handleVote(policy.id, opt)}
                        disabled={userVoted || !!votes[policy.id] || isClosed}
                        style={{opacity: (isClosed||userVoted) && !sel ? 0.45 : 1}}>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {userVoted && (
                  <div className="ws-voted-tag">
                    <CheckCircle size={13} style={{display:'inline', marginRight:'4px', verticalAlign:'middle'}}/>
                    {t('governance.voteRecorded')}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
