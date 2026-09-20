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

          .cancel-search-btn {
            position: absolute;
            bottom: 32px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 14px 32px;
            background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
            color: #DC2626;
            border: 1.5px solid #FECACA;
            border-radius: 50px;
            font-family: var(--font-sans);
            font-size: 15px;
            font-weight: 600;
            letter-spacing: 0.01em;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 8px rgba(220, 38, 38, 0.12), 0 1px 3px rgba(220, 38, 38, 0.08);
            white-space: nowrap;
          }

          .cancel-search-btn:hover {
            background: linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%);
            border-color: #FCA5A5;
            box-shadow: 0 4px 14px rgba(220, 38, 38, 0.2), 0 2px 6px rgba(220, 38, 38, 0.12);
            transform: translateX(-50%) translateY(-1px);
          }

          .cancel-search-btn:active {
            transform: translateX(-50%) scale(0.97);
            box-shadow: 0 1px 4px rgba(220, 38, 38, 0.15);
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
          className="cancel-search-btn" 
          onClick={() => navigate(-1)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Cancel Search
        </button>
      </main>
    </div>
  );
}
