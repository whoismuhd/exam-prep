#!/usr/bin/env node
/**
 * Çeviri kapsama denetimi:
 *  - js/*.js içinde kullanılan her t('anahtar') hem tr hem en sözlüğünde var mı?
 *  - tr ve en sözlükleri aynı anahtar kümesine sahip mi?
 *  - Her çevirideki {değişken} yer tutucuları iki dilde aynı mı?
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');

const src = fs.readFileSync(path.join(ROOT, 'js', 'i18n.js'), 'utf8');
const sandbox = { window: {}, document: { documentElement: {} }, console };
vm.runInNewContext(src, sandbox);
const DICT = sandbox.window.I18n.DICT;

const used = new Set();
for (const f of fs.readdirSync(path.join(ROOT, 'js'))) {
  const code = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
  const re = /\bt\(\s*'([^']+)'/g; let m;
  while ((m = re.exec(code))) { if (!m[1].endsWith('.')) used.add(m[1]); }
  // dinamik anahtarlar
  const dyn = /\bt\(\s*'([^']+)'\s*\+/g;
  while ((m = dyn.exec(code))) used.add('__dynamic__:' + m[1]);
}

let errors = 0;
const trKeys = new Set(Object.keys(DICT.tr)), enKeys = new Set(Object.keys(DICT.en));
for (const k of trKeys) if (!enKeys.has(k)) { console.log('EN eksik: ' + k); errors++; }
for (const k of enKeys) if (!trKeys.has(k)) { console.log('TR eksik: ' + k); errors++; }
for (const k of used) {
  if (k.startsWith('__dynamic__:')) {
    const prefix = k.slice('__dynamic__:'.length);
    if (![...trKeys].some(x => x.startsWith(prefix))) { console.log('Dinamik önek karşılıksız: ' + prefix); errors++; }
    continue;
  }
  if (!trKeys.has(k)) { console.log('Kullanılan anahtar TR sözlüğünde yok: ' + k); errors++; }
  if (!enKeys.has(k)) { console.log('Kullanılan anahtar EN sözlüğünde yok: ' + k); errors++; }
}
for (const k of trKeys) {
  if (!enKeys.has(k)) continue;
  const vars = s => (String(s).match(/\{[a-zA-Z]+\}/g) || []).sort().join(',');
  if (vars(DICT.tr[k]) !== vars(DICT.en[k])) { console.log('Yer tutucu uyuşmazlığı: ' + k); errors++; }
}
console.log(`Anahtar: TR ${trKeys.size}, EN ${enKeys.size}, kodda kullanılan ${used.size}.`);
if (errors) { console.log(`HATA: ${errors}`); process.exit(1); }
console.log('Çeviri kapsaması tam.');
