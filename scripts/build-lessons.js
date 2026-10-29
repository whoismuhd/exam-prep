#!/usr/bin/env node
/** data/lessons/*.json → data/lessons.json (konu sırasına göre) */
const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const dir = path.join(ROOT, 'data', 'lessons');
const topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'topics.json'), 'utf8')).topics;
const merged = {};
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json')).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const k of Object.keys(d)) { if (merged[k]) throw new Error(k + ' birden fazla dosyada'); merged[k] = d[k]; }
  console.log(f + ': ' + Object.keys(d).join(', '));
}
const out = {}; topics.forEach(t => { if (merged[t.id]) out[t.id] = merged[t.id]; });
fs.writeFileSync(path.join(ROOT, 'data', 'lessons.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('data/lessons.json: ' + Object.keys(out).length + ' konu');
