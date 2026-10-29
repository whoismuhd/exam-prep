#!/usr/bin/env node
/**
 * Soru bankası doğrulama betiği.
 * Kullanım:  node scripts/validate-questions.js            -> data/questions.json dosyasını doğrular
 *            node scripts/validate-questions.js data/bank/*.json -> verilen dosyaları doğrular
 * Çıkış kodu 0 = hata yok, 1 = hata var.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const topicsFile = path.join(ROOT, 'data', 'topics.json');
const topics = JSON.parse(fs.readFileSync(topicsFile, 'utf8')).topics;
const TOPIC_IDS = new Set(topics.map(t => t.id));
const DIFFICULTIES = new Set(['temel', 'orta', 'ileri']);
const OPTION_IDS = ['A', 'B', 'C', 'D', 'E'];
const REQUIRED = ['id', 'topic', 'subtopic', 'difficulty', 'question', 'options', 'correctAnswer',
  'explanation', 'optionExplanations', 'keyConcept', 'examTip', 'references', 'sourceType', 'reviewStatus'];

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [path.join(ROOT, 'data', 'questions.json')];

const errors = [];
const warnings = [];
const all = [];
const seenIds = new Map();
const seenText = new Map();

function norm(s) { return String(s).toLowerCase().replace(/\s+/g, ' ').trim(); }

for (const f of files) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch (e) {
    errors.push(`${f}: JSON okunamadı: ${e.message}`);
    continue;
  }
  const list = Array.isArray(data) ? data : data.questions;
  if (!Array.isArray(list)) { errors.push(`${f}: "questions" dizisi bulunamadı`); continue; }

  list.forEach((q, i) => {
    const where = `${path.basename(f)}#${i} (${q && q.id ? q.id : 'id yok'})`;
    if (!q || typeof q !== 'object') { errors.push(`${where}: nesne değil`); return; }
    for (const k of REQUIRED) {
      if (!(k in q)) errors.push(`${where}: eksik alan "${k}"`);
      else if (k !== 'references' && (q[k] === null || q[k] === '' || (typeof q[k] === 'string' && !q[k].trim())))
        errors.push(`${where}: boş alan "${k}"`);
    }
    if (q.id) {
      if (!/^[A-Z]+-\d{3}$/.test(q.id)) errors.push(`${where}: id biçimi KONU-001 olmalı`);
      if (seenIds.has(q.id)) errors.push(`${where}: id tekrarı (ilk: ${seenIds.get(q.id)})`);
      seenIds.set(q.id, where);
      if (q.topic && !q.id.startsWith(q.topic + '-')) errors.push(`${where}: id öneki topic ile uyuşmuyor`);
    }
    if (!TOPIC_IDS.has(q.topic)) errors.push(`${where}: geçersiz topic "${q.topic}"`);
    if (!DIFFICULTIES.has(q.difficulty)) errors.push(`${where}: geçersiz difficulty "${q.difficulty}" (temel|orta|ileri)`);
    if (!Array.isArray(q.options) || q.options.length !== 5) errors.push(`${where}: tam 5 seçenek olmalı`);
    else {
      const ids = q.options.map(o => o && o.id);
      if (ids.join('') !== 'ABCDE') errors.push(`${where}: seçenek id'leri sırayla A,B,C,D,E olmalı`);
      q.options.forEach(o => { if (!o || !o.text || !String(o.text).trim()) errors.push(`${where}: boş seçenek metni`); });
      const texts = q.options.map(o => norm(o.text));
      if (new Set(texts).size !== texts.length) errors.push(`${where}: aynı metinli seçenekler var`);
    }
    if (!OPTION_IDS.includes(q.correctAnswer)) errors.push(`${where}: correctAnswer A-E arasında olmalı`);
    if (q.optionExplanations && typeof q.optionExplanations === 'object') {
      for (const o of OPTION_IDS) {
        if (!q.optionExplanations[o] || !String(q.optionExplanations[o]).trim())
          errors.push(`${where}: optionExplanations.${o} eksik`);
      }
    } else errors.push(`${where}: optionExplanations nesne olmalı`);
    if (typeof q.explanation === 'string' && q.explanation.trim().length < 80)
      warnings.push(`${where}: explanation kısa (<80 karakter)`);
    if (!Array.isArray(q.references)) errors.push(`${where}: references dizi olmalı`);
    if (!q.simpleExplanation || String(q.simpleExplanation).trim().length < 60) (process.env.STRICT ? errors : warnings).push(`${where}: simpleExplanation eksik veya kısa`);
    if (q.sourceType !== 'original_practice') errors.push(`${where}: sourceType "original_practice" olmalı`);
    if (!['pending', 'reviewed'].includes(q.reviewStatus)) errors.push(`${where}: reviewStatus pending|reviewed olmalı`);
    if (q.code !== undefined && q.code !== null && typeof q.code !== 'string') errors.push(`${where}: code string veya null olmalı`);
    if (q.code && !q.codeLanguage) warnings.push(`${where}: code var ama codeLanguage yok`);
    if (q.question) {
      const t = norm(q.question);
      if (seenText.has(t)) errors.push(`${where}: soru metni tekrarı (${seenText.get(t)})`);
      seenText.set(t, where);
      if (/[?]{2,}|\.\.\.$/.test(q.question)) warnings.push(`${where}: soru metni şüpheli noktalama`);
    }
    all.push(q);
  });
}

// Konu bazında sayım
const counts = {};
const diff = { temel: 0, orta: 0, ileri: 0 };
const review = { pending: 0, reviewed: 0 };
for (const q of all) {
  counts[q.topic] = (counts[q.topic] || 0) + 1;
  if (diff[q.difficulty] !== undefined) diff[q.difficulty]++;
  if (review[q.reviewStatus] !== undefined) review[q.reviewStatus]++;
}

console.log('--- Konu bazında soru sayısı ---');
for (const t of topics) {
  const n = counts[t.id] || 0;
  console.log(`${t.id.padEnd(5)} ${String(n).padStart(3)}  ${t.name}${n < 5 ? '   <-- 5\'ten az' : ''}`);
}
console.log(`Toplam: ${all.length}  | zorluk: temel ${diff.temel}, orta ${diff.orta}, ileri ${diff.ileri}  | reviewed ${review.reviewed}, pending ${review.pending}`);

if (warnings.length) {
  console.log(`\n--- Uyarılar (${warnings.length}) ---`);
  warnings.forEach(w => console.log('  ! ' + w));
}
if (errors.length) {
  console.log(`\n--- HATALAR (${errors.length}) ---`);
  errors.forEach(e => console.log('  x ' + e));
  process.exit(1);
}
console.log('\nDoğrulama başarılı: hata yok.');
