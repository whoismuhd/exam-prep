#!/usr/bin/env node
/**
 * Ders içeriği doğrulama.
 * Kullanım: node scripts/validate-lessons.js [data/lessons/*.json | data/lessons.json]
 * STRICT_EN=1 ile data/lessons_en.json yapısının data/lessons.json ile birebir eşleştiği de denetlenir.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const TOPIC_IDS = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'topics.json'), 'utf8')).topics.map(t => t.id));
const files = process.argv.slice(2).length ? process.argv.slice(2) : [path.join(ROOT, 'data', 'lessons.json')];
const errors = [], warnings = [];
const words = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const nonEmpty = (v, where, what) => { if (!v || !String(v).trim()) errors.push(`${where}: ${what} boş`); };

let all = {};
for (const f of files) {
  let data;
  try { data = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { errors.push(`${f}: JSON okunamadı: ${e.message}`); continue; }
  for (const tid of Object.keys(data)) {
    const where = `${path.basename(f)}:${tid}`;
    if (!TOPIC_IDS.has(tid)) { errors.push(`${where}: geçersiz konu kısaltması`); continue; }
    if (all[tid]) errors.push(`${where}: konu tekrar tanımlanmış`);
    all[tid] = data[tid];
    const L = data[tid];
    let total = 0;
    nonEmpty(L.intro, where, 'intro'); total += words(L.intro);
    if (!Array.isArray(L.sections) || L.sections.length < 4) errors.push(`${where}: sections en az 4 olmalı`);
    else {
      let checks = 0;
      L.sections.forEach((sec, i) => {
        nonEmpty(sec.title, where, `sections[${i}].title`); nonEmpty(sec.body, where, `sections[${i}].body`);
        total += words(sec.body);
        if (/<[a-z][^>]*>|\*\*|^#/m.test(String(sec.body))) warnings.push(`${where}: sections[${i}].body içinde markdown/HTML olabilir`);
        if (sec.check) {
          checks++;
          const c = sec.check;
          nonEmpty(c.question, where, `sections[${i}].check.question`); nonEmpty(c.explanation, where, `sections[${i}].check.explanation`);
          if (!Array.isArray(c.options) || c.options.length !== 4) errors.push(`${where}: sections[${i}].check.options 4 olmalı`);
          if (!Number.isInteger(c.correct) || c.correct < 0 || c.correct > 3) errors.push(`${where}: sections[${i}].check.correct 0-3 olmalı`);
        }
      });
      if (checks < 3) errors.push(`${where}: en az 3 bölümde check olmalı (${checks})`);
    }
    if (!Array.isArray(L.workedExamples) || L.workedExamples.length < 2) errors.push(`${where}: workedExamples en az 2 olmalı`);
    else L.workedExamples.forEach((w, i) => { nonEmpty(w.title, where, `workedExamples[${i}].title`); nonEmpty(w.problem, where, `workedExamples[${i}].problem`); nonEmpty(w.answer, where, `workedExamples[${i}].answer`); if (!Array.isArray(w.steps) || w.steps.length < 2) errors.push(`${where}: workedExamples[${i}].steps en az 2 olmalı`); total += words(w.problem) + words((w.steps || []).join(' ')); });
    if (!Array.isArray(L.keyTerms) || L.keyTerms.length < 8) errors.push(`${where}: keyTerms en az 8 olmalı`);
    else L.keyTerms.forEach((k, i) => { nonEmpty(k.term, where, `keyTerms[${i}].term`); nonEmpty(k.definition, where, `keyTerms[${i}].definition`); });
    for (const [k, min] of [['commonMistakes', 3], ['examTips', 3], ['takeaways', 4]]) {
      if (!Array.isArray(L[k]) || L[k].length < min) errors.push(`${where}: ${k} en az ${min} olmalı`);
      else L[k].forEach((x, i) => nonEmpty(x, where, `${k}[${i}]`));
    }
    if (!Array.isArray(L.quiz) || L.quiz.length !== 5) errors.push(`${where}: quiz tam 5 soru olmalı`);
    else L.quiz.forEach((q, i) => {
      nonEmpty(q.question, where, `quiz[${i}].question`); nonEmpty(q.explanation, where, `quiz[${i}].explanation`);
      if (!Array.isArray(q.options) || q.options.length !== 5) errors.push(`${where}: quiz[${i}].options 5 olmalı`);
      if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct > 4) errors.push(`${where}: quiz[${i}].correct 0-4 olmalı`);
    });
    if (total < 900) warnings.push(`${where}: içerik kısa (${total} kelime)`);
    console.log(`${tid.padEnd(5)} ~${total} kelime, ${(L.sections || []).length} bölüm, ${(L.keyTerms || []).length} terim`);
  }
}

if (process.env.STRICT_EN) {
  const enPath = path.join(ROOT, 'data', 'lessons_en.json');
  let en = null;
  try { en = JSON.parse(fs.readFileSync(enPath, 'utf8')); } catch (e) { errors.push('lessons_en.json okunamadı: ' + e.message); }
  if (en) {
    const shape = (v) => Array.isArray(v) ? '[' + v.map(shape).join(',') + ']' : (v && typeof v === 'object' ? '{' + Object.keys(v).sort().map(k => k + ':' + (typeof v[k] === 'number' ? v[k] : shape(v[k]))).join(',') + '}' : 's');
    for (const tid of Object.keys(all)) {
      if (!en[tid]) { errors.push(`lessons_en: ${tid} eksik`); continue; }
      if (shape(all[tid]) !== shape(en[tid])) errors.push(`lessons_en: ${tid} yapısı Türkçe ile eşleşmiyor (dizi uzunlukları / correct indeksleri)`);
    }
  }
}

if (warnings.length) { console.log(`\n--- Uyarılar (${warnings.length}) ---`); warnings.forEach(w => console.log('  ! ' + w)); }
if (errors.length) { console.log(`\n--- HATALAR (${errors.length}) ---`); errors.forEach(e => console.log('  x ' + e)); process.exit(1); }
console.log(`\nDoğrulama başarılı: ${Object.keys(all).length} konu, hata yok.`);
