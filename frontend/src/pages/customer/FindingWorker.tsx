import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Circle, MapPin } from 'lucide-react';

export default function FindingWorker() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(0);

  // Simulate progress
  useEffect(() => {
    const timer1 = setTimeout(() => setStatus(1), 1500);
    const timer2 = setTimeout(() => setStatus(2), 3000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="app-container" style={{ paddingBottom: '32px' }}>
      <style>
        {`
          .radar-container {
            position: relative;
            width: 200px;
            height: 200px;
            margin: 40px auto;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .radar-circle {
            position: absolute;
            border-radius: 50%;
            background-color: var(--primary);
            opacity: 0;
            animation: radar-pulse 2s infinite cubic-bezier(0.36, 0.11, 0.89, 0.32);
          }

          .radar-circle:nth-child(1) {
            width: 60px;
            height: 60px;
            animation-delay: 0s;
          }
          .radar-circle:nth-child(2) {
            width: 120px;
            height: 120px;
            animation-delay: 0.6s;
          }
          .radar-circle:nth-child(3) {
            width: 180px;
            height: 180px;
            animation-delay: 1.2s;
          }
          
          .radar-center {
            position: absolute;
            width: 48px;
            height: 48px;
            background-color: var(--primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            color: white;
            box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
          }

          @keyframes radar-pulse {
            0% {
              transform: scale(0.5);
              opacity: 0.8;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
        `}
      </style>

      <div className="app-header" style={{ border: 'none', justifyContent: 'center', position: 'relative' }}>
        <button className="back-btn" style={{ position: 'absolute', left: '20px' }} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Finding a Worker</h2>
      </div>

      <main style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="radar-container">
          <div className="radar-circle"></div>
          <div className="radar-circle"></div>
          <div className="radar-circle"></div>
          <div className="radar-center">
            <MapPin size={24} color="white" />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>Searching for Electricians</h2>
          <p className="text-muted" style={{ fontSize: '14px', margin: 0 }}>Gwalior, MP • within 5 km radius</p>
        </div>

        <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {status >= 0 ? <CheckCircle2 size={20} color="var(--primary)" /> : <Circle size={20} className="text-muted" />}
            <span style={{ fontSize: '15px', fontWeight: status >= 0 ? 600 : 400, color: status >= 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>Location detected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {status >= 1 ? <CheckCircle2 size={20} color="var(--primary)" /> : <Circle size={20} className="text-muted" />}
            <span style={{ fontSize: '15px', fontWeight: status >= 1 ? 600 : 400, color: status >= 1 ? 'var(--text-main)' : 'var(--text-muted)' }}>Category matched</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {status >= 2 ? <CheckCircle2 size={20} color="var(--primary)" /> : <Circle size={20} className="text-muted" />}
            <span style={{ fontSize: '15px', fontWeight: status >= 2 ? 600 : 400, color: status >= 2 ? 'var(--text-main)' : 'var(--text-muted)' }}>Finding available workers...</span>
          </div>
        </div>

        <button 
          className="btn-secondary" 
          style={{ marginTop: 'auto', marginBottom: '20px', width: '200px', alignSelf: 'center', position: 'absolute', bottom: '20px' }}
          onClick={() => navigate(-1)}
        >
          Cancel Search
        </button>
      </main>
    </div>
  );
}
