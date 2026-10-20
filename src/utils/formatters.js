export const APP_VERSION = 'v1.0.0';

export const YEARS = [2010, 2015, 2020, 2024];

export const CENSUS_SOURCES = {
  2024: {
    year: 2024,
    name: '2024 POPCEN',
    fullName: '2024 Census of Population',
    date: 'July 1, 2024',
    url: 'https://psa.gov.ph/statistics/population-and-housing/node/1684083666',
    label: 'PSA 2024 Official Release'
  },
  2020: {
    year: 2020,
    name: '2020 CPH',
    fullName: '2020 Census of Population and Housing',
    date: 'May 1, 2020',
    url: 'https://psada.psa.gov.ph/catalog/231/get-microdata',
    label: 'PSADA 2020 CPH Catalog'
  },
  2015: {
    year: 2015,
    name: '2015 POPCEN',
    fullName: '2015 Census of Population',
    date: 'August 1, 2015',
    url: 'https://psada.psa.gov.ph/catalog/168/get-microdata',
    label: 'PSADA 2015 POPCEN Catalog'
  },
  2010: {
    year: 2010,
    name: '2010 CPH',
    fullName: '2010 Census of Population and Housing',
    date: 'May 1, 2010',
    url: 'https://psada.psa.gov.ph/catalog/13/get-microdata',
    label: 'PSADA 2010 CPH Catalog'
  }
};

export const COLORS = {
  bg: '#0b0f19',
  panel: 'rgba(17, 24, 39, 0.75)',
  panelAlt: 'rgba(26, 34, 52, 0.95)',
  panelSolid: '#111827',
  border: 'rgba(255, 255, 255, 0.08)',
  borderHover: 'rgba(255, 255, 255, 0.18)',
  cyan: '#06b6d4',
  cyanSoft: 'rgba(6, 182, 212, 0.15)',
  purple: '#8b5cf6',
  purpleSoft: 'rgba(139, 92, 246, 0.15)',
  pink: '#ec4899',
  pinkSoft: 'rgba(236, 72, 153, 0.15)',
  emerald: '#10b981',
  emeraldSoft: 'rgba(16, 185, 129, 0.15)',
  amber: '#f59e0b',
  sky: '#38bdf8',
  rose: '#f43f5e',
  indigo: '#6366f1',
  cream: '#f8fafc',
  creamDim: '#94a3b8',
  creamSub: '#64748b',
  male: '#38bdf8',
  female: '#f43f5e',
};

export const MUNI_COLORS = [
  '#06b6d4', // Balbalan - Cyan
  '#38bdf8', // City of Tabuk - Sky
  '#8b5cf6', // Lubuagan - Purple
  '#ec4899', // Pasil - Pink
  '#10b981', // Pinukpuk - Emerald
  '#f59e0b', // Rizal - Amber
  '#6366f1', // Tanudan - Indigo
  '#f43f5e', // Tinglayan - Rose
];

export function fmt(n) {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('en-US');
}

export function fmtCompact(n) {
  if (n === null || n === undefined) return '—';
  if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

export function pctChange(a, b) {
  if (!a || !b) return null;
  return (((b - a) / a) * 100).toFixed(1);
}

export function growthRate(a, b, t) {
  if (!a || !b || !t) return null;
  return ((Math.pow(b / a, 1 / t) - 1) * 100).toFixed(2);
}
