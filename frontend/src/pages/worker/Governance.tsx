import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import apiClient from '../../api/client';

export default function Governance() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState<Record<string, string>>({}); // policy_id -> selected_option

  const fetchPolicies = async () => {
    try {
      const res = await apiClient.get('/policies');
      if (res.data?.data?.data) {
        // The API returns paginated policies, so we need to fetch individual policy details
        // to get the results/vote percentages and check if user has voted.
        const policyItems = res.data.data.data;
        
        // Fetch detailed results for each policy
        const detailedPolicies = await Promise.all(
          policyItems.map(async (p: any) => {
            try {
              const detailRes = await apiClient.get(`/policies/${p.id}`);
              return detailRes.data?.data;
            } catch (err) {
              return null;
            }
          })
        );
        
        const validPolicies = detailedPolicies.filter(p => p !== null);
        setPolicies(validPolicies);
        
        // Store existing user votes
        const existingVotes: Record<string, string> = {};
        validPolicies.forEach((p: any) => {
          if (p.userVoted && p.userVote) {
            existingVotes[p.policy.id] = p.userVote;
          }
        });
        setVotes(existingVotes);
      }
    } catch (error) {
      console.error('Failed to fetch policies', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleVote = async (id: string, choice: string) => {
    if (votes[id]) return; // Already voted

    try {
      // Optimistic update
      setVotes(prev => ({ ...prev, [id]: choice }));
      
      await apiClient.post(`/policies/${id}/vote`, {
        selectedOption: choice
      });
      
      // Refresh to get updated percentages
      fetchPolicies();
    } catch (error) {
      console.error('Failed to cast vote', error);
      // Revert on failure
      setVotes(prev => {
        const newVotes = { ...prev };
        delete newVotes[id];
        return newVotes;
      });
      alert('Failed to cast vote. Voting might be closed or you already voted.');
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '32px' }}>
      <div className="app-header" style={{ border: 'none', justifyContent: 'center', position: 'relative' }}>
        <button className="back-btn" style={{ position: 'absolute', left: '20px' }} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Cooperative Governance</h2>
      </div>

      <main style={{ padding: '0 20px' }}>
        <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>Your voice shapes our cooperative</p>
        
        {/* Stats Grid */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', textAlign: 'center' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', margin: '0 0 4px' }}>1,240</h2>
            <p className="text-muted" style={{ fontSize: '12px', margin: 0 }}>Members</p>
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', margin: '0 0 4px' }}>
              {loading ? '-' : policies.filter(p => p.policy.status === 'ACTIVE').length}
            </h2>
            <p className="text-muted" style={{ fontSize: '12px', margin: 0 }}>Active Proposals</p>
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', margin: '0 0 4px' }}>
              {loading ? '-' : Object.keys(votes).length}
            </h2>
            <p className="text-muted" style={{ fontSize: '12px', margin: 0 }}>Votes Cast</p>
          </div>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>Active Proposals</h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading proposals...</div>
        ) : policies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            No active proposals at the moment.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {policies.map(item => {
              const { policy, results, userVoted, userVote } = item;
              const currentVote = votes[policy.id] || userVote;
              
              // Find Yes and No percentages for progress bar visualization
              const yesResult = results.find((r: any) => r.option.toLowerCase() === 'yes' || r.option === 'In Favor');
              const percentInFavor = yesResult ? yesResult.percentage : (results[0]?.percentage || 0);

              const endDate = new Date(policy.end_date);
              const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
              const isClosed = policy.status !== 'ACTIVE' || daysLeft === 0;

              return (
                <div key={policy.id} style={{ 
                  backgroundColor: 'var(--bg-card)', 
                  padding: '20px', 
                  borderRadius: '16px', 
                  border: '1px solid var(--border)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)' 
                }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>{policy.title}</h4>
                  <p className="text-muted" style={{ fontSize: '13px', margin: '0 0 16px', lineHeight: 1.4 }}>{policy.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>{percentInFavor}% in favor</span>
                    <span className={isClosed ? "text-error" : "text-muted"} style={{ fontSize: '12px', color: isClosed ? '#DC2626' : undefined }}>
                      {isClosed ? 'Closed' : `Ends in ${daysLeft} days`}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentInFavor}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>
                  </div>

                  {/* Vote Options */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {policy.options.map((option: string) => {
                      const isSelected = currentVote === option;
                      
                      // Assign color based on common options
                      let activeBg = 'var(--primary)';
                      
                      if (option.toLowerCase() === 'no') {
                        activeBg = '#DC2626';
                      } else if (option.toLowerCase() === 'abstain') {
                        activeBg = '#6B7280';
                      }

                      return (
                        <button 
                          key={option}
                          onClick={() => handleVote(policy.id, option)}
                          disabled={userVoted || !!votes[policy.id] || isClosed}
                          style={{ 
                            flex: 1, 
                            minWidth: '30%',
                            padding: '10px 0', 
                            borderRadius: '8px', 
                            fontSize: '13px', 
                            fontWeight: 600, 
                            cursor: (userVoted || isClosed) ? 'not-allowed' : 'pointer',
                            backgroundColor: isSelected ? activeBg : 'white',
                            color: isSelected ? 'white' : 'var(--text-main)',
                            border: `1px solid ${isSelected ? activeBg : 'var(--border)'}`,
                            opacity: (isClosed || userVoted) && !isSelected ? 0.5 : 1
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  
                  {userVoted && (
                    <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--primary)', fontWeight: 500 }}>
                      ✓ Your vote has been recorded
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
