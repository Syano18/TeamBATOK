import React from 'react';
import { COLORS, fmt } from '../../utils/formatters';

export default function CustomTooltip({ active, payload, label, suffix }) {
  if (!active || !payload || !payload.length) return null;
  if (label === 2012.5 || label === 2017.5 || label === 2022) return null;

  const male = payload.find(p => p.name === 'Male');
  const female = payload.find(p => p.name === 'Female');
  let sexRatio = null;
  if (male && female && Math.abs(female.value) > 0) {
    sexRatio = ((Math.abs(male.value) / Math.abs(female.value)) * 100).toFixed(1);
  }

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.96)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${COLORS.borderHover}`,
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 12.5,
      boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
      minWidth: 150,
      maxWidth: 280,
      zIndex: 1000
    }}>
      <div style={{
        color: COLORS.cyan,
        fontWeight: 700,
        marginBottom: 6,
        fontSize: 12.5,
        letterSpacing: 0.3,
        borderBottom: `1px solid ${COLORS.border}`,
        paddingBottom: 4
      }}>
        {typeof label === 'number' && !label.toString().includes('.') ? `Census Year ${label}` : label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{
          color: COLORS.cream,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 14,
          margin: '3px 0'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: p.color || p.fill || COLORS.creamDim }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color || p.fill, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{p.name}:</span>
          </span>
          <span style={{ fontWeight: 700, color: COLORS.cream, flexShrink: 0 }}>
            {fmt(Math.abs(p.value))}{suffix || ''}
          </span>
        </div>
      ))}
      {sexRatio && (
        <div style={{
          color: COLORS.creamDim,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 6,
          paddingTop: 5,
          borderTop: `1px solid ${COLORS.border}`,
          fontSize: 11.5
        }}>
          <span>Sex Ratio (M/100F):</span>
          <span style={{ fontWeight: 700, color: COLORS.cyan }}>{sexRatio}</span>
        </div>
      )}
    </div>
  );
}

export function CustomLegend({ payload }) {
  if (!payload) return null;
  const sortedPayload = [...payload].sort((a, b) => {
    if (a.value === 'Male' && b.value === 'Female') return -1;
    if (a.value === 'Female' && b.value === 'Male') return 1;
    return 0;
  });
  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', paddingTop: 8, gap: 18, flexWrap: 'wrap' }}>
      {sortedPayload.map((entry, index) => (
        <div key={`item-${index}`} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: COLORS.creamDim,
          fontSize: 12,
          fontWeight: 500
        }}>
          <div style={{ width: 8, height: 8, backgroundColor: entry.color || entry.fill, borderRadius: '50%' }} />
          {entry.value}
        </div>
      ))}
    </div>
  );
}
