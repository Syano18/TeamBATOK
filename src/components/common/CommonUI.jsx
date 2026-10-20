import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Rectangle } from 'recharts';
import { COLORS } from '../../utils/formatters';

export function StatCard({ label, value, sub, growth, accent, icon: Icon, delay = 0 }) {
  return (
    <div
      className="stat-card animate-enter"
      style={{
        '--card-accent': accent,
        animationDelay: `${delay}s`,
        background: COLORS.panel,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${accent}, transparent)`
      }} />

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span className="stat-card-label" style={{ color: COLORS.creamDim, fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {label}
          </span>
          {Icon && (
            <div className="stat-card-icon" style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `rgba(${accent === COLORS.cyan ? '6, 182, 212' : accent === COLORS.purple ? '139, 92, 246' : accent === COLORS.emerald ? '16, 185, 129' : '56, 189, 248'}, 0.12)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accent,
              flexShrink: 0
            }}>
              <Icon size={16} />
            </div>
          )}
        </div>
        <div className="stat-card-value" style={{
          color: COLORS.cream,
          fontSize: 26,
          fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: -0.4
        }}>
          {value}
        </div>
      </div>

      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {growth && (
          <span className="stat-card-growth" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            padding: '2px 7px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            background: growth.startsWith('+') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            color: growth.startsWith('+') ? COLORS.emerald : COLORS.rose
          }}>
            {growth}
          </span>
        )}
        {sub && <span className="stat-card-sub" style={{ color: COLORS.creamSub, fontSize: 11.5, fontWeight: 500 }}>{sub}</span>}
      </div>
    </div>
  );
}

export function SectionTitle({ children, note, badge, actions }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <h3 className="section-title-text" style={{
            color: COLORS.cream,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 17,
            fontWeight: 700,
            margin: 0,
            letterSpacing: -0.2
          }}>
            {children}
          </h3>
          {badge && (
            <span style={{
              fontSize: 10.5,
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: 6,
              background: COLORS.cyanSoft,
              color: COLORS.cyan,
              border: `1px solid rgba(6, 182, 212, 0.3)`
            }}>
              {badge}
            </span>
          )}
        </div>
        {actions && <div>{actions}</div>}
      </div>
      {note && <div style={{ color: COLORS.creamDim, fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>{note}</div>}
    </div>
  );
}

export function Panel({ children, style, delay = 0, glow = false }) {
  return (
    <div
      className="panel-card animate-enter"
      style={{
        background: COLORS.panel,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${glow ? 'rgba(6, 182, 212, 0.3)' : COLORS.border}`,
        borderRadius: 16,
        padding: '20px 22px',
        animationDelay: `${delay}s`,
        boxShadow: glow ? '0 8px 30px rgba(6, 182, 212, 0.12)' : '0 4px 20px rgba(0,0,0,0.2)',
        position: 'relative',
        ...style
      }}
    >
      {children}
    </div>
  );
}

export function Pill({ active, onClick, children, count, color }) {
  const activeBg = color ? `rgba(${color}, 0.2)` : COLORS.cyanSoft;
  const activeBorder = color ? color : COLORS.cyan;

  return (
    <button
      className={`pill-button ${active ? 'active' : ''}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        border: `1px solid ${active ? activeBorder : COLORS.border}`,
        background: active ? activeBg : 'rgba(255, 255, 255, 0.03)',
        color: active ? '#fff' : COLORS.creamDim,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        outline: 'none',
        whiteSpace: 'nowrap'
      }}
    >
      {children}
      {count !== undefined && (
        <span style={{
          fontSize: 10,
          padding: '1px 5px',
          borderRadius: 10,
          background: active ? (color || COLORS.cyan) : 'rgba(255, 255, 255, 0.1)',
          color: active ? '#fff' : COLORS.creamSub
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

export function ModernSelect({ value, options, onChange, icon: Icon, width = 220 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref]);

  const selectedOption = options.find(o => o.value === value) || options[0] || { label: '', value: '' };

  return (
    <div ref={ref} className="modern-select-wrapper" style={{ position: 'relative', width, zIndex: open ? 100 : 'auto' }}>
      <button
        onClick={() => setOpen(!open)}
        type="button"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(15, 23, 42, 0.8)',
          color: COLORS.cream,
          border: `1px solid ${open ? COLORS.cyan : COLORS.border}`,
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 12.5,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
          boxShadow: open ? '0 0 0 2px rgba(6, 182, 212, 0.2)' : 'none'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {Icon && <Icon size={14} style={{ color: COLORS.cyan, flexShrink: 0 }} />}
          {selectedOption.label}
        </span>
        <ChevronDown size={14} style={{ color: COLORS.creamDim, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }} />
      </button>

      {open && (
        <div className="animate-enter" style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          width: '100%',
          minWidth: 170,
          background: 'rgba(15, 23, 42, 0.98)',
          border: `1px solid ${COLORS.borderHover}`,
          borderRadius: 10,
          boxShadow: '0 16px 36px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08)',
          zIndex: 9999,
          padding: 6,
          maxHeight: 320,
          overflowY: 'auto'
        }}>
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="select-option-item"
              style={{
                padding: '8px 10px',
                fontSize: 12,
                color: value === opt.value ? COLORS.cyan : COLORS.cream,
                background: value === opt.value ? COLORS.cyanSoft : 'transparent',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.15s ease'
              }}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check size={13} style={{ color: COLORS.cyan }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const MaleBar = (props) => {
  let { x, y, width, height, fill } = props;
  if (width == null || width === 0) return null;
  if (width < 0) {
    x += width;
    width = Math.abs(width);
  }
  if (width < 5) {
    x -= (5 - width);
    width = 5;
  }
  return <Rectangle {...props} x={x} y={y} width={width} height={height} fill={fill} radius={[4, 0, 0, 4]} />;
};

export const FemaleBar = (props) => {
  let { x, y, width, height, fill } = props;
  if (width == null || width === 0) return null;
  if (width < 0) {
    x += width;
    width = Math.abs(width);
  }
  if (width < 5) {
    width = 5;
  }
  return <Rectangle {...props} x={x} y={y} width={width} height={height} fill={fill} radius={[0, 4, 4, 0]} />;
};

export const WrappedYAxisTick = ({ x, y, payload }) => {
  const text = payload.value || '';
  const parts = text.split(' (');
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill={COLORS.creamDim} fontSize={11}>
        {parts.length === 1 ? (
          <tspan x={-6} dy="0.32em">{parts[0]}</tspan>
        ) : (
          <>
            <tspan x={-6} dy="-0.2em">{parts[0]}</tspan>
            <tspan x={-6} dy="1.1em" fontSize={9.5} fill={COLORS.creamSub}>({parts[1]}</tspan>
          </>
        )}
      </text>
    </g>
  );
};
