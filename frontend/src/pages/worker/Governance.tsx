import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

type Proposal = {
  id: string;
  title: string;
  description: string;
  percentInFavor: number;
  daysLeft: number;
};

const mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'Increase Welfare Fund to 7%',
    description: 'Raise the per-gig welfare contribution from 5% to 7% to expand accident coverage.',
    percentInFavor: 68,
    daysLeft: 3
  },
  {
    id: '2',
    title: 'Add Sunday Surge Pricing',
    description: 'Apply a 15% surge on Sundays and public holidays for all workers.',
    percentInFavor: 41,
    daysLeft: 5
  }
];

export default function Governance() {
  const navigate = useNavigate();
  // Store which vote option was selected per proposal
  const [votes, setVotes] = useState<Record<string, 'yes' | 'no' | 'abstain'>>({ '1': 'yes' });

  const handleVote = (id: string, choice: 'yes' | 'no' | 'abstain') => {
    setVotes(prev => ({ ...prev, [id]: choice }));
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
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', margin: '0 0 4px' }}>3</h2>
            <p className="text-muted" style={{ fontSize: '12px', margin: 0 }}>Active Proposals</p>
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', margin: '0 0 4px' }}>18</h2>
            <p className="text-muted" style={{ fontSize: '12px', margin: 0 }}>Votes Cast</p>
          </div>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>Active Proposals</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {mockProposals.map(proposal => {
            const currentVote = votes[proposal.id];
            
            return (
              <div key={proposal.id} style={{ 
                backgroundColor: 'var(--bg-card)', 
                padding: '20px', 
                borderRadius: '16px', 
                border: '1px solid var(--border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)' 
              }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>{proposal.title}</h4>
                <p className="text-muted" style={{ fontSize: '13px', margin: '0 0 16px', lineHeight: 1.4 }}>{proposal.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>{proposal.percentInFavor}% in favor</span>
                  <span className="text-muted" style={{ fontSize: '12px' }}>Ends in {proposal.daysLeft} days</span>
                </div>
                
                {/* Progress Bar */}
                <div style={{ width: '100%', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
                  <div style={{ width: `${proposal.percentInFavor}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>
                </div>

                {/* Vote Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleVote(proposal.id, 'yes')}
                    style={{ 
                      flex: 1, padding: '10px 0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                      backgroundColor: currentVote === 'yes' ? 'var(--primary)' : 'white',
                      color: currentVote === 'yes' ? 'white' : 'var(--text-main)',
                      border: `1px solid ${currentVote === 'yes' ? 'var(--primary)' : 'var(--border)'}`
                    }}
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => handleVote(proposal.id, 'no')}
                    style={{ 
                      flex: 1, padding: '10px 0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                      backgroundColor: currentVote === 'no' ? '#DC2626' : 'white',
                      color: currentVote === 'no' ? 'white' : 'var(--text-main)',
                      border: `1px solid ${currentVote === 'no' ? '#DC2626' : 'var(--border)'}`
                    }}
                  >
                    No
                  </button>
                  <button 
                    onClick={() => handleVote(proposal.id, 'abstain')}
                    style={{ 
                      flex: 1, padding: '10px 0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                      backgroundColor: currentVote === 'abstain' ? '#6B7280' : 'white',
                      color: currentVote === 'abstain' ? 'white' : 'var(--text-main)',
                      border: `1px solid ${currentVote === 'abstain' ? '#6B7280' : 'var(--border)'}`
                    }}
                  >
                    Abstain
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
