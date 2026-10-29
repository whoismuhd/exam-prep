#!/usr/bin/env node
/**
 * claude.ai Artifact sürümü: tüm CSS ve JS'i tek bir HTML parçasına gömer.
 * (Artifact ortamı kendi doctype/head/body iskeletini ekler ve harici script/stil
 *  dosyalarına izin vermez; veri dosyaları fetch ile okunabilir.)
 * Çıktı: dist-artifact/index.html + data/*.json kopyaları
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'dist-artifact');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'data'), { recursive: true });

let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
const scripts = ['i18n', 'storage', 'data', 'progress', 'ui', 'quiz', 'exam', 'learn', 'app']
  .map(n => fs.readFileSync(path.join(ROOT, 'js', n + '.js'), 'utf8')).join('\n\n');

// Gövde içeriğini al
const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
let body = bodyMatch[1];
body = body.replace(/\s*<script src="js\/[^"]+"><\/script>/g, '');

const page = `<title>Bebis Vakif Bank Exam Prep</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
${css}
</style>
${body}
<script>
${scripts.replace(/<\/script>/g, '<\\/script>')}
</script>
`;
fs.writeFileSync(path.join(OUT, 'index.html'), page, 'utf8');
for (const f of ['topics.json', 'questions.json', 'notes.json', 'plan.json', 'notes_en.json', 'plan_en.json', 'lessons.json', 'lessons_en.json']) {
  const src = path.join(ROOT, 'data', f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUT, 'data', f));
}
console.log('dist-artifact hazır:', fs.readdirSync(OUT), fs.readdirSync(path.join(OUT, 'data')));
