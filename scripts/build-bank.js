#!/usr/bin/env node
/**
 * data/bank/*.json dosyalarını birleştirip data/questions.json üretir.
 * Kullanım: node scripts/build-bank.js
 * Sıralama: konu sırası (topics.json) sonra id.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const bankDir = path.join(ROOT, 'data', 'bank');
const topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'topics.json'), 'utf8')).topics;
const order = {}; topics.forEach(t => { order[t.id] = t.order; });

const files = fs.readdirSync(bankDir).filter(f => f.endsWith('.json')).sort();
let all = [];
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(bankDir, f), 'utf8'));
  const list = Array.isArray(data) ? data : data.questions;
  if (!Array.isArray(list)) throw new Error(f + ': dizi bekleniyordu');
  all = all.concat(list);
  console.log(`${f}: ${list.length} soru`);
}
all.sort((a, b) => (order[a.topic] || 99) - (order[b.topic] || 99) || a.id.localeCompare(b.id));
const out = { generatedAt: new Date().toISOString(), count: all.length, questions: all };
fs.writeFileSync(path.join(ROOT, 'data', 'questions.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`data/questions.json yazıldı: ${all.length} soru`);
