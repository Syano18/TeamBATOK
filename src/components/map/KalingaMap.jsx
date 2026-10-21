import React, { useState, useMemo, useEffect } from 'react';
import { Map, ArrowRight, Sparkles, Info, ExternalLink } from 'lucide-react';
import { COLORS, fmt, growthRate } from '../../utils/formatters';
import { DATA } from '../../data/kalingaData';

// Official administrative boundary vector paths for Kalinga Province
// Sourced from official PSA/NAMRIA administrative cartography matching the provincial reference map
const MUNI_PATHS = {
  Pinukpuk: {
    d: "M 435.2 48.1 L 435.7 48.2 L 436.8 47.7 L 437.5 47.5 L 438.6 47.9 L 439.4 49.1 L 440.2 50 L 441.2 50.3 L 442 49.9 L 443.1 49.7 L 444.2 49.1 L 445.3 48.3 L 445.8 48.3 L 446.4 48.5 L 447.3 46.8 L 447.4 46.5 L 448.1 45.7 L 448.2 45.4 L 448.2 45.4 L 448.3 45.1 L 448.5 44.8 L 449.1 44.4 L 449.9 44.1 L 450.5 43.7 L 450.9 43.3 L 451.4 43.1 L 451.8 42.6 L 452.1 42.5 L 452.4 42.4 L 452.8 42.2 L 453.1 41.9 L 453.3 41.6 L 453.6 40.8 L 454.3 40 L 455.2 39.2 L 455.8 38.7 L 456.3 38.7 L 457.4 38.6 L 458.1 38.8 L 459 38.7 L 460 39 L 461.2 39.5 L 462.1 40.3 L 462.8 41 L 463.5 41.2 L 463.8 41.2 L 464 41.4 L 464.9 42.2 L 469.3 46.1 L 473.5 50.1 L 476.4 52.5 L 477.9 53.1 L 484.1 57.3 L 486.4 59.2 L 488.3 61.1 L 488.9 62.5 L 490.4 62.3 L 492.8 67.4 L 495.1 71.4 L 497.6 74.9 L 498.2 75.8 L 499.7 76.7 L 500.2 77 L 503.3 78.7 L 504.9 79.7 L 505.3 80 L 506 80.3 L 509.3 83 L 513.3 85.9 L 520.9 90.5 L 521.1 90.6 L 525.3 96.2 L 536.9 108.4 L 547.3 119 L 527.5 122.1 L 504.5 125.6 L 471.1 131 L 464.8 132.1 L 441.4 135.6 L 435.8 136.5 L 433.1 137.1 L 421.7 149.8 L 407.2 166.5 L 402.1 172.4 L 398.2 173.7 L 395.7 174.5 L 381.3 178.8 L 364.2 183.9 L 355.2 186.8 L 352.7 190.1 L 340.6 205.5 L 326.9 209.5 L 313.4 213.4 L 289.9 228.9 L 279.9 235.5 L 297.9 211.7 L 304.5 202.9 L 307.6 179.6 L 308.2 173.7 L 310.2 156.4 L 311 149.7 L 307.8 144.6 L 304.6 139.8 L 288.2 113.6 L 267.5 80.6 L 288 42.5 L 326 49.5 L 346.7 53.7 L 360.5 58.9 L 374.6 63.7 L 382.8 66.5 L 393.6 66.7 L 395.5 61.6 L 397.6 56.1 L 401.1 47.8 L 424.6 32.7 L 425.5 31.9 L 425.8 30.9 L 426.8 30.3 L 428.5 29.8 L 429.9 29.4 L 431.4 28.7 L 432.1 28 L 432.6 27.2 L 434 27.2 L 435.3 27.2 L 434.7 29.3 L 433.6 33.4 L 431.8 39.9 L 431.4 41.5 L 431.3 42.6 L 431.8 43.4 L 432.5 44.1 L 432.8 45.9 L 433.2 46.4 L 435.2 48.1 Z",
    labelPos: { x: 410, y: 105 },
    logo: 'Pinukpuk'
  },
  Balbalan: {
    d: "M 297.9 211.7 L 279.9 235.5 L 235.1 243 L 230.1 243.9 L 214.3 241.5 L 204.6 239.8 L 200 238.8 L 195.2 237.8 L 190.8 235.7 L 172.1 226.9 L 149.8 230.2 L 89.2 239.7 L 88.8 189.1 L 132.3 157.6 L 145.6 152.8 L 170.4 136.6 L 176.2 132.4 L 183.6 109.1 L 166.8 77 L 161.6 45.9 L 185.9 31.9 L 237 56.1 L 242.7 60.6 L 267.5 80.6 L 288.2 113.6 L 304.6 139.8 L 307.8 144.6 L 311 149.7 L 310.2 156.4 L 308.2 173.7 L 307.6 179.6 L 304.5 202.9 L 297.9 211.7 Z",
    labelPos: { x: 215, y: 155 },
    logo: 'Balbalan'
  },
  Pasil: {
    d: "M 214.3 241.5 L 230.1 243.9 L 235.1 243 L 279.9 235.5 L 268.4 253.9 L 263.6 261.4 L 260.7 266.5 L 258.1 269.8 L 247.4 284.5 L 231.8 283.1 L 226.8 282.6 L 223.2 282.4 L 213.8 281.7 L 202.6 280.7 L 201.8 280.8 L 201.1 281.6 L 200.6 283.4 L 201.1 284.9 L 200.5 286.3 L 199.4 286.9 L 199.6 288.3 L 199.1 289.3 L 198.6 289.6 L 198 289.8 L 197.6 291.7 L 197.2 292.5 L 196.5 292.6 L 195.6 292.3 L 194.8 291.9 L 193.4 292.1 L 192.4 292.9 L 190.7 293.1 L 189.4 294.3 L 188.4 295.1 L 187.2 295.5 L 186.1 295.5 L 184.3 296.4 L 182.2 298.6 L 182 300.1 L 182.1 300.8 L 182.2 301.7 L 170.5 317.4 L 62.5 309.5 L 66.6 300.5 L 70.1 294.6 L 73.6 288.4 L 76.8 281.5 L 79.7 273.9 L 82.9 265.3 L 86 256.5 L 88.6 248.4 L 89.1 245.2 L 89.2 239.7 L 149.8 230.2 L 172.1 226.9 L 190.8 235.7 L 195.2 237.8 L 200 238.8 L 204.6 239.8 L 214.3 241.5 Z",
    labelPos: { x: 175, y: 268 },
    logo: 'Pasil'
  },
  'City of Tabuk': {
    d: "M 561.1 266.4 L 551.4 287.9 L 541.1 310.5 L 534.7 326.5 L 518.5 362.2 L 448.9 352.1 L 437.7 350.2 L 410.1 341.6 L 392.8 347.5 L 393.8 345.8 L 392.7 344 L 394.5 341.9 L 393.9 339.8 L 393.5 337.1 L 393.8 334.9 L 393.3 332.3 L 393.5 330.9 L 392.6 329.3 L 392.5 326.5 L 391.7 324 L 390.2 323 L 387.9 322.6 L 386.3 322 L 384.1 321 L 382.5 320 L 381.5 319.2 L 380.6 317.6 L 375.8 319 L 374.1 318.7 L 372.2 318 L 371 317.2 L 370.1 315.8 L 369.3 314.4 L 368.7 312.4 L 368 310.7 L 367.9 309.3 L 368.4 307.7 L 369.4 306.7 L 369.6 305.3 L 368.1 303.2 L 367.4 301 L 366.7 299.5 L 366.2 297 L 363.6 294.7 L 361.8 293 L 358.3 291.2 L 354.8 290.6 L 352.4 292.1 L 351 292.8 L 350.1 293.5 L 349.6 293.9 L 349.2 294.3 L 348.7 294.5 L 348.2 294.6 L 347.7 294.8 L 346.9 295.1 L 345.9 295 L 345.7 295.1 L 344.8 294.9 L 344.3 294.6 L 335.8 294.8 L 332.1 293.2 L 328.8 292.2 L 325.8 291.2 L 323.8 288.3 L 321.2 287.9 L 317.1 287.1 L 313.2 286.5 L 309.8 285.7 L 306.3 285.5 L 303.4 285.4 L 299.4 285.5 L 296 286 L 293.4 286.2 L 290.4 286.9 L 287.8 287.5 L 286.3 288.1 L 283 289.1 L 280.5 289.9 L 270.3 277.5 L 260.7 266.5 L 263.6 261.4 L 268.4 253.9 L 279.9 235.5 L 289.9 228.9 L 313.4 213.4 L 326.9 209.5 L 340.6 205.5 L 352.7 190.1 L 355.2 186.8 L 364.2 183.9 L 381.3 178.8 L 395.7 174.5 L 398.2 173.7 L 402.1 172.4 L 407.2 166.5 L 421.7 149.8 L 433.1 137.1 L 435.8 136.5 L 441.4 135.6 L 464.8 132.1 L 471.1 131 L 477.3 138.7 L 481.4 144.2 L 491.9 158 L 508.2 178.5 L 518.2 191.6 L 523.7 198.1 L 535 211.8 L 543.5 222.5 L 568.4 253.3 L 565.8 258.6 L 561.1 266.4 Z",
    labelPos: { x: 415, y: 245 },
    logo: 'Tabuk'
  },
  Rizal: {
    d: "M 604.2 237.8 L 561.1 266.4 L 565.8 258.6 L 568.4 253.3 L 543.5 222.5 L 535 211.8 L 523.7 198.1 L 518.2 191.6 L 508.2 178.5 L 491.9 158 L 481.4 144.2 L 477.3 138.7 L 471.1 131 L 504.5 125.6 L 527.5 122.1 L 547.3 119 L 552.8 124.7 L 558.1 129.6 L 570.7 142.8 L 579.4 153 L 583.4 157.4 L 590.1 165.1 L 601.3 175.3 L 610.2 186.1 L 612.4 189.9 L 613.1 201.9 L 613.4 211.5 L 610.5 220.3 L 616 227.1 L 604.2 237.8 Z",
    labelPos: { x: 545, y: 185 },
    logo: 'Rizal'
  },
  Lubuagan: {
    d: "M 270.3 277.5 L 280.5 289.9 L 278.2 290.7 L 275 292.3 L 271.6 294.9 L 269.6 296.8 L 268 298.8 L 265.9 301.7 L 263.2 305.4 L 261.9 307.6 L 261.1 308.7 L 259.7 311.4 L 257.8 315.2 L 252.1 328.5 L 246.5 341.9 L 225.4 332.1 L 217.8 328.6 L 211.3 329.8 L 207.3 330.6 L 204.4 331.6 L 201.3 333 L 196.8 335.3 L 194.9 336.4 L 191.3 338.3 L 189 339.8 L 181.2 344.6 L 176 348.9 L 172.8 351.6 L 169.1 354.4 L 164.1 358.6 L 158.8 362.7 L 151.5 367.4 L 149.7 368.3 L 136 378.6 L 133.7 380.5 L 121.4 386.4 L 112.6 389.4 L 103.3 391.8 L 91.5 394.2 L 81.1 396.6 L 24 388 L 30.8 377.2 L 33.4 367 L 36.4 357.4 L 39.8 348.8 L 44.1 339.2 L 49.5 330.1 L 54.6 320.6 L 58.4 314.7 L 62.5 309.5 L 170.5 317.4 L 182.2 301.7 L 182.1 300.8 L 182 300.1 L 182.2 298.6 L 184.3 296.4 L 186.1 295.5 L 187.2 295.5 L 188.4 295.1 L 189.4 294.3 L 190.7 293.1 L 192.4 292.9 L 193.4 292.1 L 194.8 291.9 L 195.6 292.3 L 196.5 292.6 L 197.2 292.5 L 197.6 291.7 L 198 289.8 L 198.6 289.6 L 199.1 289.3 L 199.6 288.3 L 199.4 286.9 L 200.5 286.3 L 201.1 284.9 L 200.6 283.4 L 201.1 281.6 L 201.8 280.8 L 202.6 280.7 L 213.8 281.7 L 223.2 282.4 L 226.8 282.6 L 231.8 283.1 L 247.4 284.5 L 258.1 269.8 L 260.7 266.5 L 270.3 277.5 Z",
    labelPos: { x: 135, y: 345 },
    logo: 'Lubuagan'
  },
  Tanudan: {
    d: "M 332.1 293.2 L 335.8 294.8 L 344.3 294.6 L 344.8 294.9 L 345.7 295.1 L 345.9 295 L 346.9 295.1 L 347.7 294.8 L 348.2 294.6 L 348.7 294.5 L 349.2 294.3 L 349.6 293.9 L 350.1 293.5 L 351 292.8 L 352.4 292.1 L 354.8 290.6 L 358.3 291.2 L 361.8 293 L 363.6 294.7 L 366.2 297 L 366.7 299.5 L 367.4 301 L 368.1 303.2 L 369.6 305.3 L 369.4 306.7 L 368.4 307.7 L 367.9 309.3 L 368 310.7 L 368.7 312.4 L 369.3 314.4 L 370.1 315.8 L 371 317.2 L 372.2 318 L 374.1 318.7 L 375.8 319 L 380.6 317.6 L 381.5 319.2 L 382.5 320 L 384.1 321 L 386.3 322 L 387.9 322.6 L 390.2 323 L 391.7 324 L 392.5 326.5 L 392.6 329.3 L 393.5 330.9 L 393.3 332.3 L 393.8 334.9 L 393.5 337.1 L 393.9 339.8 L 394.5 341.9 L 392.7 344 L 393.8 345.8 L 392.8 347.5 L 378.8 351.5 L 356.1 360.5 L 350.4 367.7 L 342.8 382.7 L 313.5 416.2 L 312 418.6 L 303.4 424.2 L 284.8 438.1 L 268.5 443 L 262.5 444.7 L 252.4 446.2 L 239.3 447.9 L 230.5 449.2 L 216.7 452.8 L 224.4 411.1 L 226.8 401.9 L 230.9 388.8 L 231.8 387.3 L 234.7 377.6 L 237.6 369.5 L 238.7 366.8 L 242 358.1 L 243.1 353.7 L 245.1 346.1 L 246.5 341.9 L 252.1 328.5 L 257.8 315.2 L 259.7 311.4 L 261.1 308.7 L 261.9 307.6 L 263.2 305.4 L 265.9 301.7 L 268 298.8 L 269.6 296.8 L 271.6 294.9 L 275 292.3 L 278.2 290.7 L 280.5 289.9 L 283 289.1 L 286.3 288.1 L 287.8 287.5 L 290.4 286.9 L 293.4 286.2 L 296 286 L 299.4 285.5 L 303.4 285.4 L 306.3 285.5 L 309.8 285.7 L 313.2 286.5 L 317.1 287.1 L 321.2 287.9 L 323.8 288.3 L 325.8 291.2 L 328.8 292.2 L 332.1 293.2 Z",
    labelPos: { x: 315, y: 355 },
    logo: 'Tanudan'
  },
  Tinglayan: {
    d: "M 230.9 388.8 L 226.8 401.9 L 224.4 411.1 L 216.7 452.8 L 198 447.3 L 157.7 432.3 L 156.4 429 L 154.3 424.3 L 154.3 418.7 L 151.7 415.3 L 149.5 412.6 L 145.1 407.4 L 140.3 402.2 L 134.3 399.3 L 131.3 399.1 L 125.6 399.8 L 116.8 402.1 L 81.1 396.6 L 91.5 394.2 L 103.3 391.8 L 112.6 389.4 L 121.4 386.4 L 133.7 380.5 L 136 378.6 L 149.7 368.3 L 151.5 367.4 L 158.8 362.7 L 164.1 358.6 L 169.1 354.4 L 172.8 351.6 L 176 348.9 L 181.2 344.6 L 189 339.8 L 191.3 338.3 L 194.9 336.4 L 196.8 335.3 L 201.3 333 L 204.4 331.6 L 207.3 330.6 L 211.3 329.8 L 217.8 328.6 L 225.4 332.1 L 246.5 341.9 L 245.1 346.1 L 243.1 353.7 L 242 358.1 L 238.7 366.8 L 237.6 369.5 L 234.7 377.6 L 231.8 387.3 L 230.9 388.8 Z",
    labelPos: { x: 185, y: 405 },
    logo: 'Tinglayan'
  }
};

const METRIC_CONFIG = {
  total_population: {
    label: '2024 Total Population',
    format: v => fmt(v),
    colorScale: ['#0e7490', '#06b6d4', '#38bdf8', '#818cf8', '#ec4899'],
    desc: 'Total population according to 2024 POPCEN'
  },
  growth_rate: {
    label: 'Annual Growth Rate (2020–2024)',
    format: v => `${v > 0 ? '+' : ''}${v}% / yr`,
    colorScale: ['#0f766e', '#10b981', '#34d399', '#8b5cf6', '#d946ef'],
    desc: 'Annualized demographic growth rate between 2020 CPH and 2024 POPCEN'
  },
  avg_hh_size: {
    label: 'Avg. Household Size (2024)',
    format: v => `${v} persons`,
    colorScale: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'],
    desc: 'Household population divided by number of households'
  },
  num_households: {
    label: 'Number of Households (2024)',
    format: v => fmt(v),
    colorScale: ['#1e1b4b', '#4338ca', '#6366f1', '#06b6d4', '#10b981'],
    desc: 'Total registered private households in 2024'
  }
};

export default function KalingaMap({ onSelectMuni, selectedMuni }) {
  const [metric, setMetric] = useState('total_population');
  const [hoveredMuni, setHoveredMuni] = useState(null);
  const [clickedMuni, setClickedMuni] = useState(selectedMuni || null);

  useEffect(() => {
    if (selectedMuni) {
      setClickedMuni(selectedMuni);
    }
  }, [selectedMuni]);

  // Compute LGU stats for 2024
  const muniStats = useMemo(() => {
    const y24 = DATA.municipality_trend.filter(d => d.year === 2024);
    const y20 = DATA.municipality_trend.filter(d => d.year === 2020);
    const prov24 = DATA.province_trend.find(d => d.year === 2024)?.total_population || 1;

    const stats = {};
    y24.forEach(rec => {
      const rec20 = y20.find(d => d.municipality === rec.municipality);
      const annGrowth = rec20 ? +growthRate(rec20.total_population, rec.total_population, 4) : 0;
      const hhSize = rec.num_households ? +((rec.hh_population || rec.total_population) / rec.num_households).toFixed(2) : 0;
      const share = +((rec.total_population / prov24) * 100).toFixed(1);

      stats[rec.municipality] = {
        name: rec.municipality,
        total_population: rec.total_population,
        hh_population: rec.hh_population,
        num_households: rec.num_households,
        growth_rate: annGrowth,
        avg_hh_size: hhSize,
        share
      };
    });
    return stats;
  }, []);

  // Compute min/max for the active metric
  const { minVal, maxVal } = useMemo(() => {
    const values = Object.values(muniStats).map(s => s[metric] || 0);
    return {
      minVal: Math.min(...values),
      maxVal: Math.max(...values)
    };
  }, [muniStats, metric]);

  // Color generator
  const getColor = (value) => {
    const range = maxVal - minVal || 1;
    const norm = Math.max(0, Math.min(1, (value - minVal) / range));
    const colors = METRIC_CONFIG[metric].colorScale;
    const idx = Math.min(colors.length - 1, Math.floor(norm * colors.length));
    return colors[idx];
  };

  // Only display data on the right side when a municipality has been clicked
  const selectedData = clickedMuni ? muniStats[clickedMuni] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Metric Selector Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11.5, color: COLORS.creamDim, fontWeight: 600 }}>Choropleth Layer:</span>
          {Object.entries(METRIC_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setMetric(key)}
              style={{
                padding: '4px 9px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${metric === key ? COLORS.cyan : COLORS.border}`,
                background: metric === key ? COLORS.cyanSoft : 'rgba(255,255,255,0.03)',
                color: metric === key ? '#fff' : COLORS.creamDim,
                transition: 'all 0.15s ease'
              }}
            >
              {cfg.label.split(' (')[0]}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: COLORS.creamSub, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={11} style={{ color: COLORS.cyan }} />
          <span>Interactive Demographic Map</span>
        </div>
      </div>

      {/* Map Layout: SVG on Left/Center, Live Info Card on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        alignItems: 'center',
        flex: 1
      }}>
        {/* SVG Map Container */}
        <div style={{
          position: 'relative',
          background: 'radial-gradient(circle at center, rgba(14, 165, 233, 0.05), transparent 70%), rgba(11, 15, 25, 0.7)',
          borderRadius: 14,
          border: `1px solid ${COLORS.border}`,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg
            viewBox="10 15 620 455"
            style={{ width: '100%', maxHeight: 350, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}
          >
            <defs>
              <filter id="glow-lgu" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={COLORS.cyan} floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Render Municipality Polygons */}
            {Object.entries(MUNI_PATHS).map(([name, item]) => {
              const data = muniStats[name] || {};
              const val = data[metric] || 0;
              const fill = getColor(val);
              const isHovered = hoveredMuni === name;
              const isSelected = clickedMuni === name;

              return (
                <g key={name}>
                  <path
                    d={item.d}
                    fill={fill}
                    fillOpacity={isSelected ? 1 : isHovered ? 0.9 : (clickedMuni ? 0.65 : 0.75)}
                    stroke={isSelected ? '#ffffff' : isHovered ? COLORS.cyan : 'rgba(255, 255, 255, 0.35)'}
                    strokeWidth={isSelected ? 2.8 : isHovered ? 2 : 1.2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    filter={isSelected || isHovered ? 'url(#glow-lgu)' : 'none'}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    onMouseEnter={() => setHoveredMuni(name)}
                    onMouseLeave={() => setHoveredMuni(null)}
                    onClick={() => {
                      setClickedMuni(name);
                      if (onSelectMuni) onSelectMuni(name, false);
                    }}
                  />
                  {/* Dynamic Label on map */}
                  <g pointerEvents="none" transform={`translate(${item.labelPos.x}, ${item.labelPos.y})`}>
                    <text
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={name === 'City of Tabuk' ? 12 : 10.5}
                      fontWeight={700}
                      letterSpacing={0.3}
                      style={{ textShadow: '0 1px 4px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.8)' }}
                    >
                      {name === 'City of Tabuk' ? 'Tabuk City' : name}
                    </text>
                    <text
                      y={13}
                      textAnchor="middle"
                      fill={COLORS.creamDim}
                      fontSize={8.5}
                      fontWeight={600}
                      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}
                    >
                      {METRIC_CONFIG[metric].format(val)}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Choropleth Gradient Legend */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: 340,
            marginTop: 8,
            fontSize: 10,
            color: COLORS.creamDim
          }}>
            <span>Min: {METRIC_CONFIG[metric].format(minVal)}</span>
            <div style={{
              flex: 1,
              height: 6,
              margin: '0 8px',
              borderRadius: 3,
              background: `linear-gradient(90deg, ${METRIC_CONFIG[metric].colorScale.join(', ')})`
            }} />
            <span>Max: {METRIC_CONFIG[metric].format(maxVal)}</span>
          </div>
        </div>

        {/* Dynamic Detail Card for clicked LGU */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 260
        }}>
          {selectedData ? (
            <div className="animate-enter">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={`/${selectedData.name === 'City of Tabuk' ? 'Tabuk' : selectedData.name}.png`}
                    alt={selectedData.name}
                    style={{ width: 44, height: 44, objectFit: 'contain' }}
                  />
                  <div>
                    <div style={{ fontSize: 11, color: COLORS.cyan, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      {selectedData.name === 'City of Tabuk' ? 'Component City' : 'Municipality'}
                    </div>
                    <h4 style={{ margin: 0, color: COLORS.cream, fontSize: 19, fontFamily: "'Space Grotesk', sans-serif" }}>
                      {selectedData.name}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setClickedMuni(null)}
                  title="Clear Selection"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.creamDim,
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: 11,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = COLORS.cyan;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = COLORS.creamDim;
                    e.currentTarget.style.borderColor = COLORS.border;
                  }}
                >
                  Clear
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 8 }}>
                  <div style={{ fontSize: 10.5, color: COLORS.creamDim }}>2024 Population</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.cream }}>
                    {fmt(selectedData.total_population)}
                  </div>
                  <div style={{ fontSize: 10.5, color: COLORS.cyan }}>
                    {selectedData.share}% of Kalinga
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 8 }}>
                  <div style={{ fontSize: 10.5, color: COLORS.creamDim }}>Annual Growth (20-24)</div>
                  <div style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: selectedData.growth_rate >= 0 ? COLORS.emerald : COLORS.rose
                  }}>
                    {selectedData.growth_rate > 0 ? `+${selectedData.growth_rate}%` : `${selectedData.growth_rate}%`}
                  </div>
                  <div style={{ fontSize: 10.5, color: COLORS.creamDim }}>per annum</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 8 }}>
                  <div style={{ fontSize: 10.5, color: COLORS.creamDim }}>Total Households</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.purple }}>
                    {fmt(selectedData.num_households)}
                  </div>
                  <div style={{ fontSize: 10.5, color: COLORS.creamDim }}>households</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 8 }}>
                  <div style={{ fontSize: 10.5, color: COLORS.creamDim }}>Avg Household Size</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.pink }}>
                    {selectedData.avg_hh_size}
                  </div>
                  <div style={{ fontSize: 10.5, color: COLORS.creamDim }}>persons / HH</div>
                </div>
              </div>

              {onSelectMuni && (
                <button
                  type="button"
                  className="map-explore-btn"
                  onClick={() => onSelectMuni(selectedData.name, true)}
                >
                  <span>Explore {selectedData.name} in Barangays</span>
                  <ArrowRight size={14} className="explore-btn-arrow" />
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 240,
              color: COLORS.creamDim,
              textAlign: 'center',
              padding: '24px 16px'
            }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: COLORS.cyanSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                color: COLORS.cyan,
                border: '1px solid rgba(6, 182, 212, 0.3)'
              }}>
                <Map size={26} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.cream, marginBottom: 6 }}>
                Click a Municipality
              </div>
              <div style={{ fontSize: 12, maxWidth: 240, lineHeight: 1.5, color: COLORS.creamSub }}>
                Click any municipality or city on the map to display its demographic statistics and census data.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Attribution & Boundary Disclaimer */}
      <div style={{
        marginTop: 14,
        padding: '10px 14px',
        borderRadius: 10,
        background: 'rgba(15, 23, 42, 0.45)',
        border: `1px solid ${COLORS.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        fontSize: 11,
        color: COLORS.creamSub,
        lineHeight: 1.5
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: COLORS.creamDim, fontWeight: 600 }}>
            <Info size={13} style={{ color: COLORS.cyan, flexShrink: 0 }} />
            <span>Map Source & Boundary Disclaimer</span>
          </div>
          <a
            href="https://bcl.wikipedia.org/wiki/Ladawan:Kalinga_Labelled_Map.png"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Kalinga Labelled Reference Map on Wikipedia"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: COLORS.cyan,
              fontSize: 11,
              textDecoration: 'none',
              transition: 'opacity 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
              e.currentTarget.style.opacity = '0.85';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
              e.currentTarget.style.opacity = '1';
            }}
          >
            <span>Source: Wikipedia (Kalinga Reference Map)</span>
            <ExternalLink size={11} style={{ flexShrink: 0 }} />
          </a>
        </div>
        <div style={{ color: COLORS.creamSub, fontSize: 10.5 }}>
          <strong>Disclaimer:</strong> This map visualization is provided solely for demographic representation and statistical illustration within this dashboard. It does not constitute an official cadastral, legal, or geodetic survey and will not replace, alter, or define any existing city or municipal administrative boundaries in the respective Local Government Units (LGUs).
        </div>
      </div>
    </div>
  );
}

