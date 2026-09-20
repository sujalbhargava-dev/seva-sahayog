import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import apiClient from '../../api/client';

export default function Review() {
  const navigate = useNavigate();
  const { id } = useParams(); // bookingId
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      await apiClient.post('/reviews', {
        bookingId: id,
        rating,
        comment
      });
      navigate('/customer/home');
    } catch (error) {
      console.error('Failed to submit review', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '32px' }}>
      <main style={{ padding: '0 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center' }}>
        
        {/* Success Icon */}
        <div style={{ margin: '0 auto 24px', position: 'relative', width: '80px', height: '80px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Check size={40} strokeWidth={3} />
          </div>
          {/* Decorative dots could go here */}
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 12px' }}>Job Completed!</h1>
        <p className="text-muted" style={{ fontSize: '15px', marginBottom: '32px' }}>Rate your experience to help the community</p>

        {/* Worker Card */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px', background: 'var(--bg-app)', marginBottom: '32px', textAlign: 'left' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, marginRight: '16px' }}>
            R
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>Ramesh Kumar</h4>
            <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>Electrician</p>
          </div>
        </div>

        {/* Rating Stars */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Rate the Worker</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button 
                key={star}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => setRating(star)}
              >
                <Star 
                  size={32} 
                  fill={star <= rating ? '#F59E0B' : 'transparent'} 
                  color={star <= rating ? '#F59E0B' : 'var(--border)'} 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Area */}
        <div className="input-group" style={{ textAlign: 'left', marginBottom: '32px' }}>
          <label>Feedback (optional)</label>
          <textarea 
            placeholder="Share more about your experience..." 
            rows={4} 
            style={{ resize: 'none' }}
          ></textarea>
        </div>

        <div style={{ flexGrow: 1 }}></div>

        <div style={{ marginBottom: '32px' }}>
          <textarea 
            placeholder="Write a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', minHeight: '100px', fontSize: '15px', color: 'var(--text-main)', boxSizing: 'border-box', resize: 'none' }}
          />
        </div>

        <button 
          className="btn-primary" 
          style={{ width: '100%', marginBottom: '16px' }}
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </main>
    </div>
  );
}
