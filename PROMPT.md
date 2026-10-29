# BUILD SPEC: VakıfBank 2026 Bilgisayar Mühendisliği Alan Bilgisi Hazırlık Sitesi

This is the single, corrected specification that replaces the three earlier prompts (study-guide prompt, question-bank prompt, website prompt). It fixes their contradictions, adds the exam-scoring facts they ignored, and reorders the work around the real deadline.

## 0. Hard facts (from the official announcement PDF, 2026)

| Item | Value | Source |
|---|---|---|
| Written exam date | Sunday 15 Nov 2026, 09:30 | PDF p.2 |
| Application window | 16 Oct to 03 Nov 2026, only via vakifbank.istanbul.edu.tr | PDF p.2 |
| Exam centres | Ankara, İstanbul (Anadolu), İstanbul (Avrupa) | PDF p.2 |
| Computer Engineering group paper | Genel Yetenek 60 + İngilizce 40 + Alan Bilgisi 40 = 140 questions, 210 minutes | PDF p.3, p.5 |
| Alan Bilgisi syllabus | 17 topics (listed in section 2) | PDF p.3 |
| Scoring | Only correct answers count; wrong answers do not penalise | PDF p.4 |
| Baraj 1 | İngilizce below 50% = fail | PDF p.4 |
| Baraj 2 | Genel Yetenek below 70% = fail | PDF p.4 |
| Baraj 3 | Fewer than 70 correct out of 140 = fail | PDF p.4 |
| Ranking | Candidates who pass all barajs are ranked by total correct; top 25 from the Computer Engineering group go to interview (ties included) | PDF p.4, p.6 |
| Calculators | Not allowed | PDF p.5 |
| Objections to questions | Until 17 Nov 2026 17:00 | PDF p.5 |

Consequences the site must teach:
1. Never leave a question blank. There is no penalty.
2. Alan Bilgisi has no separate threshold, but every correct answer raises the ranking score. The 40 technical questions are 28.5% of the paper.
3. Genel Yetenek at 70% is the strictest gate. Technical study must not crowd it out. The site covers only Alan Bilgisi, and says so.
4. There is no official separate time for the 40 technical questions. 210/140 × 40 = 60 minutes is a derived pacing target, labelled as such.

## 1. What the earlier prompts got wrong

- Three overlapping prompts with different difficulty splits (30/45/25 vs 25/50/25). Resolved: 25/50/25.
- They treated the exam as a generic CS test. Four of the 17 topics (Erişim Yönetimi, Değişiklik Yönetimi, BT Risk ve Kontrolleri, Yedekleme ve İş Sürekliliği) are IT-audit topics for a bank inspector role. Questions in those topics use banking scenarios and the vocabulary of the BDDK regulation "Bankaların Bilgi Sistemleri ve Elektronik Bankacılık Hizmetleri Hakkında Yönetmelik" (Resmî Gazete 15.03.2020, no. 31069), COBIT, ISO/IEC 27001 and ITIL. They do not require memorising article numbers.
- They did not define the mock-exam allocation or when a wrong question leaves revision. Both are now deterministic (section 4).
- They assumed 255 questions before the site is usable. Reversed: the site ships today with a reviewed starter bank and grows daily.
- No research honesty clause about what was actually found. Section 6 records it.

## 2. Syllabus and topic IDs

| # | ID | Topic (Turkish, as in PDF) |
|---|---|---|
| 1 | IBG | İnternet ve Bilgi Güvenliği |
| 2 | NET | Network |
| 3 | VTYS | Veri Tabanı Yönetim Sistemleri |
| 4 | VYA | Veri Yapıları ve Algoritmalar |
| 5 | PRG | Yapısal Programlama ve Nesne Tabanlı Programlama |
| 6 | IS | İşletim Sistemleri |
| 7 | WEB | Web Teknolojileri ve Uygulamaları |
| 8 | ERY | Erişim Yönetimi |
| 9 | DGY | Değişiklik Yönetimi |
| 10 | SDLC | Yazılım Mühendisliği ve SDLC |
| 11 | MIM | Bilgisayar Mimarisi |
| 12 | KRP | Kriptografi Temelleri |
| 13 | BLT | Bulut Bilişim Temelleri |
| 14 | SIB | Temel Siber Güvenlik |
| 15 | YIS | Yedekleme ve İş Sürekliliği Temelleri |
| 16 | RISK | BT Risk ve Kontrolleri |
| 17 | GT | Güncel Teknolojiler |

Study priority (expert judgement, not based on past-paper statistics, because none are public):
- High: NET, VTYS, VYA, PRG, IS, SIB, ERY, RISK
- Medium: IBG, WEB, SDLC, KRP, YIS, DGY
- Supporting: MIM, BLT, GT

## 3. Question standard

Every question: Turkish; exactly five options A to E; exactly one defensible answer; difficulty in {temel, orta, ileri}; subtopic; `explanation` (why correct, with worked steps for code/SQL/subnetting/complexity); `optionExplanations` for all five; `keyConcept`; `examTip`; `references` (named sources only, no invented URLs); `sourceType: "original_practice"`; `reviewStatus` in {pending, reviewed}. Code goes in a separate `code` field with `codeLanguage`. SQL questions state the assumed dialect (ANSI SQL unless noted). Code questions state the language and version where behaviour differs.

Question types to mix: concept, comparison, code output, SQL evaluation, algorithm complexity, subnet calculation, security scenario, audit/control scenario, "which control addresses this risk".

Never present questions as real past VakıfBank questions. Label them "özgün hazırlık sorusu".

## 4. Deterministic algorithms

Revision queue: a question enters when answered wrong in practice or in a mock. It leaves only after two consecutive correct answers after the last wrong one. Order: wrongCount desc, then lastResult wrong first, then oldest lastAttempt first.

Mock exam (40 questions): 2 from each of the 17 topics (34), plus 6 extra drawn one each from NET, VTYS, VYA, PRG, SIB, RISK. If a topic has fewer available questions, the shortfall is filled from the largest remaining pools. Prefer questions never seen, then least-recently seen. Target difficulty 10/20/10, achieved opportunistically. Order shuffled. Answers hidden until submit.

Recommendation: a topic is "tekrar önerilir" when attempts ≥ 3 and accuracy < 60%, "yeterli veri yok" when attempts < 3, otherwise "iyi durumda" (≥ 80%) or "gelişiyor".

Placement test: on first visit, the dashboard offers a 20-question test (one per topic plus 3 from the high-priority group) to seed the recommendations.

## 5. Delivery stages

1. Today: working site, all features, ≥ 8 reviewed questions per topic (≥ 136), notes for all 17 topics, 17-day plan, validation script, README, zip for GitHub Pages, live hosted copy.
2. Daily until 10 Nov: add reviewed questions in batches (target 15 per topic, 255 total), re-run validator, redeploy.
3. 11 to 14 Nov: no new topics; mocks, revision queue, notes.

## 6. Research record (29 Oct 2026)

- Official 2026 announcement: in hand (PDF). Authoritative.
- Previous announcements (2019, 2024, 2025) confirm the exam has existed for years with changing baraj rules (e.g. 2019 had English 70 / Genel Yetenek 65 thresholds). Syllabus wording has changed, so 2026 PDF takes precedence.
- No official past papers, answer keys or sample Alan Bilgisi questions were found online. Only news articles and application guides. Candidate recollections on forums were not used because they cannot be verified.
- Therefore the bank is 100% original practice questions written against the 17 published topics and standard references (Tanenbaum, Silberschatz, Cormen, Elmasri/Navathe, Stallings, Kurose/Ross, OWASP, NIST SP 800-series, BDDK 2020 regulation, COBIT 2019, ISO/IEC 27001:2022, ITIL 4).

## 7. Definition of done (today)

Site runs; Turkish UI; 17 topics; validator passes; every question independently re-solved by a second reviewer agent; practice feedback immediate and option-specific; wrong answers queued; dashboard from real data; mock works with delayed marking and per-topic results; progress persists; export/import/reset; mobile layout; GitHub Pages ready; README; disclaimer; limitations listed honestly.
