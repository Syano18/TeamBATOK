import xlsx from 'xlsx';
import fs from 'fs';

const wb = xlsx.readFile('Database.xlsx');

const DATA = {
  municipalities: [
    "Balbalan",
    "City of Tabuk",
    "Lubuagan",
    "Pasil",
    "Pinukpuk",
    "Rizal",
    "Tanudan",
    "Tinglayan"
  ],
  age_groups: [
    "0 - 4", "5 - 9", "10 - 14", "15 - 19", "20 - 24", "25 - 29",
    "30 - 34", "35 - 39", "40 - 44", "45 - 49", "50 - 54", "55 - 59",
    "60 - 64", "65 - 69", "70 - 74", "75 - 79", "80 and over"
  ],
  province_trend: [],
  municipality_trend: [],
  age_pyramid: {},
  barangay_trend: {},
  barangay_2024: {}
};

function cleanMuniName(raw) {
  if (!raw) return '';
  let str = String(raw).trim();
  let upper = str.toUpperCase();
  if (upper === 'CITY OF TABUK(CAPITAL)' || upper === 'CITY OF TABUK (CAPITAL)' || upper === 'TABUK CITY' || upper === 'CITY OF TABUK' || upper === 'TABUK') return 'City of Tabuk';
  if (upper === 'RIZAL (LIWAN)') return 'Rizal';
  
  const found = DATA.municipalities.find(m => m.toUpperCase() === upper);
  if (found) return found;
  
  return str;
}

// 1. Extract 2020 barangays as canonical
const canonicalBrgys = {};
const j20 = xlsx.utils.sheet_to_json(wb.Sheets['2020'], { header: 1 });
let cMuni = null;
for(let i = 2; i < j20.length; i++) {
  const row = j20[i];
  if (!row || !row[0]) continue;
  let rawName = String(row[0]).trim();
  if (!rawName) continue;
  if (rawName.toUpperCase() === 'KALINGA') { cMuni = null; continue; }
  
  const mName = cleanMuniName(rawName);
  if (DATA.municipalities.includes(mName)) {
    cMuni = mName;
    if (!canonicalBrgys[cMuni]) canonicalBrgys[cMuni] = [];
  } else if (cMuni) {
    canonicalBrgys[cMuni].push(rawName);
  }
}

function resolveBarangayName(muni, rawBrgy) {
  const canonList = canonicalBrgys[muni] || [];
  // Exact match
  let exact = canonList.find(c => c.toUpperCase() === rawBrgy.toUpperCase());
  if (exact) return exact;
  
  // Fuzzy match: e.g. "Poblacion" matches "Poblacion (Salegseg)"
  let fuzzy = canonList.find(c => {
    const cUp = c.toUpperCase();
    const rUp = rawBrgy.toUpperCase();
    return cUp.startsWith(rUp + ' ') || cUp.startsWith(rUp + '(') || cUp === rUp;
  });
  if (fuzzy) return fuzzy;
  
  return rawBrgy;
}

const years = [2010, 2015, 2020, 2024];
years.forEach(y => {
  if (!DATA.age_pyramid[y]) DATA.age_pyramid[y] = { province: {}, municipalities: {} };
});

function parseSheet(year) {
  const ws = wb.Sheets[String(year)];
  if (!ws) return;
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });
  
  let currentMuni = null;
  
  const startIndex = year === 2020 ? 5 : 4;
  const loopStart = year === 2024 ? 1 : 2;
  
  for (let i = loopStart; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[0]) continue;
    
    let rawName = String(row[0]).trim();
    if (!rawName) continue;
    
    let muniName = cleanMuniName(rawName);
    
    const isKalinga = rawName.toUpperCase() === 'KALINGA';
    const isMuni = DATA.municipalities.includes(muniName);
    
    if (isKalinga) {
       currentMuni = null;
    } else if (isMuni) {
       currentMuni = muniName;
    }
    
    let numHH, hhPop, totalPop;
    if (year === 2024) {
      totalPop = row[2] || 0;
      hhPop = row[3] || 0;
      numHH = row[4] || 0;
    } else {
      numHH = row[1] || 0;
      hhPop = row[2] || 0;
      totalPop = row[3] || 0;
    }

    if (isKalinga) {
      let maleTotal = 0, femaleTotal = 0;
      if (year !== 2024) {
        for (let a = 0; a < DATA.age_groups.length; a++) {
          const base = startIndex + a * 3;
          maleTotal += (row[base + 1] || 0);
          femaleTotal += (row[base + 2] || 0);
          DATA.age_pyramid[year].province[DATA.age_groups[a]] = {
            male: row[base + 1] || 0,
            female: row[base + 2] || 0
          };
        }
      }
      DATA.province_trend.push({
        year,
        total_population: totalPop,
        hh_population: hhPop,
        num_households: numHH,
        male: year === 2024 ? null : maleTotal,
        female: year === 2024 ? null : femaleTotal
      });
    } else if (isMuni) {
      let maleTotal = 0, femaleTotal = 0;
      DATA.age_pyramid[year].municipalities[currentMuni] = {};
      if (year !== 2024) {
        for (let a = 0; a < DATA.age_groups.length; a++) {
          const base = startIndex + a * 3;
          maleTotal += (row[base + 1] || 0);
          femaleTotal += (row[base + 2] || 0);
          DATA.age_pyramid[year].municipalities[currentMuni][DATA.age_groups[a]] = {
            male: row[base + 1] || 0,
            female: row[base + 2] || 0
          };
        }
      }
      DATA.municipality_trend.push({
        year,
        municipality: currentMuni,
        total_population: totalPop,
        hh_population: hhPop,
        num_households: numHH,
        male: year === 2024 ? null : maleTotal,
        female: year === 2024 ? null : femaleTotal
      });
      
      if (year === 2024) {
         if (!DATA.barangay_2024[currentMuni]) DATA.barangay_2024[currentMuni] = [];
      } else {
         if (!DATA.barangay_trend[currentMuni]) DATA.barangay_trend[currentMuni] = {};
      }
    } else {
       if (currentMuni) {
         let resolvedName = resolveBarangayName(currentMuni, rawName);
         
         if (year === 2024) {
            if (!DATA.barangay_2024[currentMuni]) DATA.barangay_2024[currentMuni] = [];
            DATA.barangay_2024[currentMuni].push({
              name: resolvedName,
              total_population: totalPop,
              hh_population: hhPop,
              num_households: numHH
            });
         }
         
         if (!DATA.barangay_trend[currentMuni]) DATA.barangay_trend[currentMuni] = {};
         if (!DATA.barangay_trend[currentMuni][resolvedName]) DATA.barangay_trend[currentMuni][resolvedName] = [];
         
         if (!DATA.barangay_trend[currentMuni][resolvedName].find(d => d.year === year)) {
           DATA.barangay_trend[currentMuni][resolvedName].push({
             year,
             total_population: totalPop,
             hh_population: hhPop,
             num_households: numHH
           });
         }
       }
    }
  }
}

years.forEach(y => parseSheet(y));

fs.writeFileSync('src/data/kalingaData.js', `export const DATA = ${JSON.stringify(DATA, null, 2)};\n`);
console.log('Done generating kalingaData.js');
