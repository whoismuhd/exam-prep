# English translation brief (for translator agents)

Goal: give every question in a `data/bank/<GROUP>.json` file a faithful, natural, technically precise English version, so the site's EN mode shows English content. The Turkish text stays the source of truth and must not be modified.

## What to add

For each question object add one field `"en"` (place it directly after `"simpleExplanation"`), an object with exactly these keys:

```json
"en": {
  "subtopic": "IP addressing and subnetting",
  "question": "A branch network uses the block 192.168.10.0/26. ...",
  "options": {"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."},
  "explanation": "...",
  "optionExplanations": {"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."},
  "keyConcept": "...",
  "examTip": "...",
  "simpleExplanation": "..."
}
```

Rules:
- Translate meaning, not word by word. Natural English a UK/US computer engineering graduate would read comfortably. Keep sentences roughly as long as the Turkish ones.
- Keep every number, identifier, IP address, hex value, variable name, SQL keyword, standard name, port number and formula identical to the Turkish version. Do not "fix" or change the technical content; if you believe the Turkish is wrong, say so in your report and still translate it faithfully.
- The `code` field is NOT translated (it stays shared). If `code` contains Turkish comments or Turkish table/column names that the question text refers to, keep referring to them exactly as they appear in `code` (e.g. the table name `Hesap` stays `Hesap`).
- Options must keep their letter and order. The correct answer letter does not change.
- Turkish regulatory terms: translate with the Turkish term in parentheses the first time, e.g. "the BDDK Regulation on Banks' Information Systems and Electronic Banking Services (Bankaların Bilgi Sistemleri ve Elektronik Bankacılık Hizmetleri Hakkında Yönetmelik)", "segregation of duties (görevler ayrılığı)", "KVKK (Turkish Personal Data Protection Law)". Keep "BDDK", "KVKK", "TCMB", "BKM" as acronyms.
- Keep the Turkish parenthetical English terms sensible: where the Turkish text says "güvenlik duvarı (firewall)" the English is just "firewall".
- The `simpleExplanation` must stay simple: same analogy, plain words, no added jargon.
- No markdown, no HTML. Plain text with `\n` where the Turkish has `\n`.
- Do not touch any other field. Do not reorder questions. Do not change ids.

## How to work

Write the translations with a script that loads the JSON, sets `q.en` for each question, and writes the file back with 2-space indentation and `ensure_ascii=False` (Python) or `JSON.stringify(data, null, 2)` (Node), so the Turkish text is preserved byte for byte apart from the inserted field.

Then run: `cd /home/claude/vakifbank-exam-prep && STRICT_EN=1 node scripts/validate-questions.js data/bank/<GROUP>.json` and fix until there are 0 errors.

Report: file, number of questions translated, and any Turkish sentences you found technically doubtful (id + one line).
