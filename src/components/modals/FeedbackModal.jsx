import React, { useState } from 'react';
import { MessageSquare, X, AlertCircle } from 'lucide-react';
import { COLORS } from '../../utils/formatters';

export default function FeedbackModal({ isOpen, onClose, onSuccess }) {
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', contact: '', body: '', q1: 0, q2: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reviewForm.q1 === 0 || reviewForm.q2 === 0) {
      alert('Please rate both questions before submitting your review.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error (${res.status}). Please try again later.`);
      }
      onSuccess();
      setReviewForm({ name: '', email: '', contact: '', body: '', q1: 0, q2: 0 });
      handleClose();
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      padding: 16
    }}>
      <div className="animate-enter" style={{
        background: COLORS.panelAlt,
        border: `1px solid ${COLORS.borderHover}`,
        borderRadius: 16,
        padding: 24,
        maxWidth: 460,
        width: '100%',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button
          onClick={handleClose}
          title="Close"
          style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: COLORS.creamDim, cursor: 'pointer', padding: 4 }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', color: COLORS.emerald, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MessageSquare size={19} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: COLORS.cream, fontSize: 18, fontFamily: "'Space Grotesk', sans-serif" }}>
              Leave User Feedback
            </h2>
            <div style={{ color: COLORS.creamDim, fontSize: 11.5 }}>Help us enhance the Kalinga Census Dashboard</div>
          </div>
        </div>

        {submitError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 8,
            padding: '10px 12px',
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: '#fca5a5'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, color: '#f87171' }} />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
          <div>
            <label style={{ display: 'block', color: COLORS.creamDim, fontSize: 11.5, marginBottom: 4 }}>Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Katimban Jimmog"
              value={reviewForm.name}
              onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                color: COLORS.cream,
                fontSize: 12.5,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', color: COLORS.creamDim, fontSize: 11.5, marginBottom: 4 }}>Email (Optional)</label>
              <input
                type="email"
                placeholder="name@gmail.com"
                value={reviewForm.email}
                onChange={(e) => setReviewForm(prev => ({ ...prev, email: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  color: COLORS.cream,
                  fontSize: 12.5,
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: COLORS.creamDim, fontSize: 11.5, marginBottom: 4 }}>Contact No. (Optional)</label>
              <input
                type="text"
                placeholder="09170000000"
                value={reviewForm.contact}
                onChange={(e) => setReviewForm(prev => ({ ...prev, contact: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  color: COLORS.cream,
                  fontSize: 12.5,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: COLORS.creamDim, fontSize: 11.5, marginBottom: 4 }}>
              1. How clear and informative is the demographic data presented? (1 to 5)
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  type="button"
                  key={rating}
                  onClick={() => setReviewForm(prev => ({ ...prev, q1: rating }))}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: 8,
                    border: `1px solid ${reviewForm.q1 === rating ? COLORS.cyan : COLORS.border}`,
                    background: reviewForm.q1 === rating ? COLORS.cyanSoft : 'rgba(255,255,255,0.03)',
                    color: reviewForm.q1 === rating ? COLORS.cyan : COLORS.creamDim,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 13
                  }}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: COLORS.creamDim, fontSize: 11.5, marginBottom: 4 }}>
              2. How smooth and user-friendly is the dashboard navigation? (1 to 5)
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  type="button"
                  key={rating}
                  onClick={() => setReviewForm(prev => ({ ...prev, q2: rating }))}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: 8,
                    border: `1px solid ${reviewForm.q2 === rating ? COLORS.emerald : COLORS.border}`,
                    background: reviewForm.q2 === rating ? COLORS.emeraldSoft : 'rgba(255,255,255,0.03)',
                    color: reviewForm.q2 === rating ? COLORS.emerald : COLORS.creamDim,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 13
                  }}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: COLORS.creamDim, fontSize: 11.5, marginBottom: 4 }}>
              Suggestions or Observations (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Tell us what you loved or what features we could add..."
              value={reviewForm.body}
              onChange={(e) => setReviewForm(prev => ({ ...prev, body: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                color: COLORS.cream,
                fontSize: 12.5,
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'transparent',
                border: `1px solid ${COLORS.border}`,
                color: COLORS.creamDim,
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#fff',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: 12.5,
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
