import React, { useState } from 'react';
import { Info, X, ExternalLink, Award } from 'lucide-react';
import { COLORS, CENSUS_SOURCES } from '../../utils/formatters';

export default function DisclaimerModal({ onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hide_psa_disclaimer', 'true');
    }
    onClose();
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
        maxWidth: 480,
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

        {/* Top Team Badge */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, paddingRight: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2))',
            border: '1px solid rgba(6, 182, 212, 0.45)',
            boxShadow: '0 2px 10px rgba(6, 182, 212, 0.15)'
          }}>
            <Award size={15} style={{ color: COLORS.cyan }} />
            <span style={{ fontSize: 13.5, fontWeight: 800, color: COLORS.cyan, letterSpacing: 0.6 }}>
              Team<strong style={{ color: '#fff' }}>BATOK</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.cyanSoft, color: COLORS.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Info size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: COLORS.cream, fontSize: 18, fontFamily: "'Space Grotesk', sans-serif" }}>
              Philippine Statistics Authority
            </h2>
          </div>
        </div>

        <p style={{ color: COLORS.creamDim, fontSize: 13, lineHeight: 1.5, margin: '10px 0 8px' }}>
          Demographic counts and household indicators presented in this portal represent official census rounds for the <strong>Province of Kalinga</strong>:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '10px 0 14px' }}>
          {Object.values(CENSUS_SOURCES).map(src => (
            <a
              key={src.year}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: 8,
                background: src.year === 2024 ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${src.year === 2024 ? 'rgba(6, 182, 212, 0.3)' : COLORS.border}`,
                color: COLORS.cream,
                textDecoration: 'none',
                fontSize: 12,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = COLORS.cyan;
                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.14)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = src.year === 2024 ? 'rgba(6, 182, 212, 0.3)' : COLORS.border;
                e.currentTarget.style.background = src.year === 2024 ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.03)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, color: src.year === 2024 ? COLORS.cyan : COLORS.cream }}>
                  {src.name}
                </span>
                <span style={{ color: COLORS.creamDim, fontSize: 11.5 }}>
                  ({src.date})
                </span>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: COLORS.cyan, fontSize: 11, fontWeight: 600 }}>
                Data Link <ExternalLink size={11} />
              </span>
            </a>
          ))}
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 11,
          color: COLORS.creamDim,
          marginBottom: 16
        }}>
          Mandated under <strong>Republic Act No. 10625</strong> (Philippine Statistical Act of 2013).
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: COLORS.creamDim, fontSize: 12, userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: COLORS.cyan, cursor: 'pointer' }}
            />
            Do not show again
          </label>

          <button
            onClick={handleClose}
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
              color: '#fff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)'
            }}
          >
            I Understand & Enter
          </button>
        </div>
      </div>
    </div>
  );
}
