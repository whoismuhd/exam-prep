/* app.js – yönlendirme ve görünümler */
(function () {
  'use strict';
  const t = (k, v) => I18n.t(k, v);
  const esc = s => Quiz.esc(s);
  const $app = () => document.getElementById('app');

  /* ---------- Üst çubuk, dil, tema ---------- */
  function applyTheme() {
    const th = Store.load().settings.theme || 'auto';
    if (th === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', th);
  }

  let currentNav = 'home';
  function setCurrentNav(key) {
    currentNav = key;
    document.querySelectorAll('.nav a').forEach(a => {
      if (a.dataset.nav === key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function renderChrome() {
    document.querySelector('.brand-title').textContent = t('app.brand');
    document.querySelector('.brand-sub').textContent = t('app.brandSub');
    document.querySelector('.skip-link').textContent = t('app.skip');
    document.getElementById('menuBtn').setAttribute('aria-label', t('app.menu'));
    const langBtn = document.getElementById('langBtn');
    langBtn.textContent = t('app.lang');
    langBtn.setAttribute('aria-label', t('app.langLabel'));
    langBtn.setAttribute('title', t('app.langLabel'));
    const navItems = [
      ['#/', 'home', 'nav.home'], ['#/konular', 'topics', 'nav.topics'], ['#/deneme', 'exam', 'nav.examShort'],
      ['#/yanlislar', 'review', 'nav.reviewShort'], ['#/ilerleme', 'progress', 'nav.progress'], ['#/notlar', 'notes', 'nav.notesShort'], ['#/plan', 'plan', 'nav.planShort']
    ];
    document.querySelector('.nav').innerHTML = navItems.map(n => `<a href="${n[0]}" data-nav="${n[1]}">${t(n[2])}</a>`).join('');
    const mobile = [['#/', 'nav.home'], ['#/konular', 'nav.topics'], ['#/deneme', 'nav.exam'], ['#/yanlislar', 'nav.review'], ['#/ilerleme', 'nav.progress'], ['#/notlar', 'nav.notes'], ['#/plan', 'nav.plan'], ['#/ayarlar', 'nav.settings']];
    document.getElementById('mobileNav').innerHTML = mobile.map(n => `<a href="${n[0]}">${t(n[1])}</a>`).join('');
    document.getElementById('storageWarning').textContent = t('app.storageWarn');
    document.getElementById('disclaimer').textContent = t('app.disclaimer');
    document.getElementById('settingsLink').textContent = t('app.settingsLink');
    document.getElementById('loveNote').innerHTML = t('app.loveNote').split('\n').map(esc).join('<br>');
    document.documentElement.lang = I18n.getLang();
    setCurrentNav(currentNav);
  }

  function toggleLang() {
    const s = Store.load();
    s.settings.language = I18n.getLang() === 'tr' ? 'en' : 'tr';
    Store.save();
    I18n.setLang(s.settings.language);
    renderChrome();
    route();
  }

  /* ---------- Yardımcılar ---------- */
  function daysToExam() {
    const now = new Date(); const exam = new Date(Data.exam.date + 'T09:30:00');
    const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d1 = new Date(exam.getFullYear(), exam.getMonth(), exam.getDate());
    return Math.round((d1 - d0) / 86400000);
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleString(I18n.getLang() === 'en' ? 'en-GB' : 'tr-TR', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return iso; }
  }
  const statusBadge = st => `<span class="badge ${st.badge}">${t('progress.status.' + st.status)}</span>`;
  const barClass = st => st.status === 'good' ? 'ok' : st.status === 'weak' ? 'bad' : st.status === 'mid' ? 'warn' : '';
  const pct = st => (st.accuracy === null ? '' : '%' + st.accuracy);

  /* ---------- Görünümler ---------- */
  function viewHome() {
    setCurrentNav('home');
    const s = Store.load();
    const st = Progress.overallStats();
    const days = daysToExam();
    const daysText = days > 0 ? t('home.daysLeft', { n: days }) : (days === 0 ? t('home.examToday') : t('home.examPassed'));
    const recs = Progress.recommendations();
    const topicStats = Progress.allTopicStats();
    $app().innerHTML = `
      ${s.corruptedNotice ? `<div class="banner banner-warn" role="alert">${t('app.corrupt')}</div>` : ''}
      <h1>${t('app.title')}</h1>
      <p class="muted">${t('app.subtitle')} · <strong>${daysText}</strong></p>

      <div class="grid grid-4">
        <div class="stat"><div class="label">${t('home.totalQ')}</div><div class="value">${st.totalQuestions}</div></div>
        <div class="stat"><div class="label">${t('home.done')}</div><div class="value">${st.attempted}</div></div>
        <div class="stat"><div class="label">${t('home.accuracy')}</div><div class="value">${st.attempts ? '%' + st.accuracy : '–'}</div></div>
        <div class="stat"><div class="label">${t('home.revision')}</div><div class="value">${st.revisionCount}</div></div>
      </div>

      <div class="actions">
        <a class="action-card" href="#/konular"><div class="t">${t('home.actTopics')}</div><div class="d">${t('home.actTopicsD')}</div></a>
        <a class="action-card" href="#/deneme"><div class="t">${t('home.actExam')}</div><div class="d">${t('home.actExamD')}</div></a>
        <a class="action-card" href="#/yanlislar"><div class="t">${t('home.actReview')}</div><div class="d">${t('home.actReviewD', { n: st.revisionCount })}</div></a>
        <a class="action-card" href="#/ilerleme"><div class="t">${t('home.actProgress')}</div><div class="d">${t('home.actProgressD')}</div></a>
      </div>

      ${!s.placementDone ? `<div class="card"><h2>${t('home.placementTitle')}</h2><p>${t('home.placementText')}</p><a class="btn" href="#/seviye">${t('home.placementBtn')}</a></div>` : ''}

      <div class="card">
        <h2>${t('home.recs')}</h2>
        ${recs.length ? `<ul class="tight-list">${recs.map(r => `<li>${esc(r.text)}${r.topicId ? ` <a href="#/konu/${r.topicId}">→</a>` : ''}</li>`).join('')}</ul>` : `<p class="muted tight">${t('home.noRecs')}</p>`}
      </div>

      <div class="card">
        <h2>${t('home.topicProgress')}</h2>
        ${topicStats.map(x => `
          <div class="row">
            <span class="l"><a href="#/konu/${x.topicId}">${esc(Data.topicName(x.topicId))}</a> <span class="small muted">${x.attempted}/${x.total}</span></span>
            <span class="r">${pct(x)} ${x.attempts >= 3 ? statusBadge(x) : ''}
              <span class="bar ${barClass(x)}" style="width:80px"><span style="width:${x.total ? Math.round(100 * x.attempted / x.total) : 0}%"></span></span></span>
          </div>`).join('')}
      </div>

      <details class="card facts">
        <summary>${t('home.examFacts')}</summary>
        <ul class="tight-list"><li>${t('home.fact1')}</li><li>${t('home.fact2')}</li><li>${t('home.fact3')}</li></ul>
      </details>`;
  }

  function viewTopics() {
    setCurrentNav('topics');
    const stats = Progress.allTopicStats();
    $app().innerHTML = `
      <h1>${t('topics.title')}</h1>
      <div class="grid grid-2">
        ${Data.topics.map(tp => {
          const x = stats.find(y => y.topicId === tp.id);
          return `
          <div class="topic-card">
            <div class="name">${tp.order}. ${esc(Data.topicName(tp.id))}</div>
            <div class="meta">
              <span>${t('topics.available', { n: x.total })}</span>
              <span>${t('topics.done', { n: x.attempted })}</span>
              ${x.accuracy === null ? '' : `<span>${pct(x)}</span>`}
              ${x.revision ? `<span>${t('topics.revision', { n: x.revision })}</span>` : ''}
              ${x.attempts >= 3 ? statusBadge(x) : ''}
            </div>
            <div class="btn-row" style="margin-top:.3rem">
              <a class="btn btn-sm" href="#/konu/${tp.id}">${t('topics.start')}</a>
              <a class="btn btn-sm btn-ghost" href="#/notlar/${tp.id}">${t('nav.notesShort')}</a>
            </div>
          </div>`;
        }).join('')}
      </div>`;
  }

  function viewTopic(id) {
    setCurrentNav('topics');
    const tp = Data.topicById[id];
    if (!tp) { location.hash = '#/konular'; return; }
    const x = Progress.topicStats(id);
    const avail = x.total;
    const choices = [5, 10, 15].filter(n => n <= avail);
    $app().innerHTML = `
      <p><a href="#/konular">← ${t('nav.topics')}</a></p>
      <div class="card">
        <h1>${esc(Data.topicName(id))}</h1>
        <p class="small muted">${t('topics.done', { n: x.attempted + '/' + x.total })}${x.accuracy === null ? '' : ' · ' + pct(x)}</p>
        ${avail === 0 ? `<p>${t('topic.noQuestions')}</p>` : `
        <h3>${t('topic.howMany')}</h3>
        <div class="choice-row">
          ${choices.map(n => `<button class="btn btn-secondary" data-n="${n}">${n}</button>`).join('')}
          <button class="btn btn-secondary" data-n="all">${t('topic.allN', { n: avail })}</button>
        </div>`}
        <p class="tight"><a href="#/notlar/${id}">${t('topic.notesLink')}</a></p>
      </div>
      <div id="session"></div>`;
    $app().querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => {
      const n = b.dataset.n === 'all' ? 'all' : parseInt(b.dataset.n, 10);
      const qs = Progress.pickForTopic(id, n);
      $app().innerHTML = `<p><a href="#/konu/${id}">← ${esc(Data.topicName(id))}</a></p><div id="session"></div>`;
      Quiz.startSession(document.getElementById('session'), { questions: qs, mode: 'practice', title: Data.topicName(id), topicId: id });
      window.scrollTo({ top: 0 });
    }));
  }

  function viewPlacement() {
    setCurrentNav('home');
    const qs = Progress.buildPlacement();
    $app().innerHTML = `<h1>${t('home.placementTitle')}</h1><div id="session"></div>`;
    Quiz.startSession(document.getElementById('session'), { questions: qs, mode: 'placement', title: t('home.placementTitle') });
  }

  function viewReview() {
    setCurrentNav('review');
    const queue = Progress.revisionQueue();
    const weakTopics = Progress.allTopicStats().filter(x => x.status === 'weak');
    $app().innerHTML = `
      <h1>${t('review.title')}</h1>
      <p class="muted small">${t('review.intro')}</p>
      ${queue.length === 0 ? `<div class="card"><p class="tight">${t('review.empty')}</p></div>` : `
      <div class="card">
        <div class="btn-row" style="margin-top:0">
          <button class="btn" id="reviewAll">${t('review.start')} (${queue.length})</button>
          ${queue.length > 10 ? `<button class="btn btn-secondary" id="review10">${t('review.startN', { n: 10 })}</button>` : ''}
        </div>
        ${weakTopics.length ? `<h3 style="margin-top:1rem">${t('review.repeatConcepts')}</h3><ul class="tight-list">${weakTopics.map(w => `<li><a href="#/notlar/${w.topicId}">${esc(Data.topicName(w.topicId))}</a> · %${w.accuracy}</li>`).join('')}</ul>` : ''}
      </div>
      <div class="card">
        ${queue.map(q => {
          const r = Progress.getRecord(q.id);
          return `<div class="row">
            <span class="l"><span class="badge badge-primary">${esc(Data.topicShort(q.topic))}</span> ${esc(q.question).slice(0, 140)}${q.question.length > 140 ? '…' : ''}</span>
            <span class="r"><span class="badge badge-bad">${t('review.wrongTimes', { n: r.wrong })}</span>${r.lastResult === 'bad' ? '' : `<span class="badge badge-ok">${t('review.streak', { n: r.streak })}</span>`}
              <button class="btn btn-sm btn-ghost" data-show="${q.id}">${t('review.readExplanation')}</button></span>
            <div id="exp_${q.id}" style="flex-basis:100%" hidden></div>
          </div>`;
        }).join('')}
      </div>`}
      <div id="session"></div>`;
    const start = n => {
      const qs = n ? queue.slice(0, n) : queue;
      $app().innerHTML = `<h1>${t('review.title')}</h1><div id="session"></div>`;
      Quiz.startSession(document.getElementById('session'), { questions: qs, mode: 'review', title: t('review.title') });
    };
    const a = document.getElementById('reviewAll'); if (a) a.addEventListener('click', () => start(0));
    const b = document.getElementById('review10'); if (b) b.addEventListener('click', () => start(10));
    $app().querySelectorAll('[data-show]').forEach(btn => btn.addEventListener('click', () => {
      const q = Data.questionById[btn.dataset.show]; const box = document.getElementById('exp_' + q.id);
      if (box.hidden) { box.innerHTML = Quiz.renderQuestion(q, { selected: Progress.getRecord(q.id).lastChoice, showResult: true }) + Quiz.renderFeedback(q, q.correctAnswer); Quiz.bindSimple(box); box.hidden = false; btn.textContent = t('review.hide'); }
      else { box.hidden = true; box.innerHTML = ''; btn.textContent = t('review.readExplanation'); }
    }));
  }

  function viewProgress() {
    setCurrentNav('progress');
    const st = Progress.overallStats();
    const topics = Progress.allTopicStats();
    const missed = topics.filter(x => x.attempts >= 3).sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
    const sessions = Progress.recentSessions(10);
    const exams = Progress.examHistory();
    $app().innerHTML = `
      <h1>${t('progress.title')}</h1>
      <div class="grid grid-4">
        <div class="stat"><div class="label">${t('home.accuracy')}</div><div class="value">${st.attempts ? '%' + st.accuracy : '–'}</div></div>
        <div class="stat"><div class="label">${t('progress.uniqueDone')}</div><div class="value">${st.attempted} / ${st.totalQuestions}</div></div>
        <div class="stat"><div class="label">${t('progress.totalAttempts')}</div><div class="value">${st.attempts}</div></div>
        <div class="stat"><div class="label">${t('home.revision')}</div><div class="value">${st.revisionCount}</div></div>
      </div>
      <div class="card">
        <h2>${t('progress.byTopic')}</h2>
        ${topics.map(x => `<div class="row"><span class="l"><a href="#/konu/${x.topicId}">${esc(Data.topicName(x.topicId))}</a> <span class="small muted">${x.correct}/${x.attempts}</span></span>
          <span class="r">${pct(x)} ${x.attempts >= 3 ? statusBadge(x) : ''} <span class="bar ${barClass(x)}" style="width:100px"><span style="width:${x.accuracy || 0}%"></span></span></span></div>`).join('')}
      </div>
      ${missed.length ? `<div class="card"><h2>${t('progress.mostMissed')}</h2><ul class="tight-list">${missed.map(x => `<li><a href="#/notlar/${x.topicId}">${esc(Data.topicName(x.topicId))}</a> · %${x.accuracy} · ${x.attempts} ${t('common.attempts')}</li>`).join('')}</ul></div>` : ''}
      <div class="card">
        <h2>${t('progress.examHistory')}</h2>
        ${exams.length === 0 ? `<p class="muted tight">${t('progress.noExams')}</p>` : exams.map((e, i) => `<div class="row"><span class="l">${fmtDate(e.t)} · ${t('exam.duration', { m: Math.round(e.durationSec / 60) })}</span><span class="r"><strong>${e.correct}/${e.total}</strong> (%${Math.round(100 * e.correct / e.total)}) <button class="btn btn-sm btn-ghost" data-exam="${i}">${t('exam.review')}</button></span></div>`).join('')}
      </div>
      <div class="card">
        <h2>${t('progress.recent')}</h2>
        ${sessions.length === 0 ? `<p class="muted tight">${t('progress.noSessions')}</p>` : sessions.map(sn => `<div class="row"><span class="l">${fmtDate(sn.t)} · ${t('progress.mode.' + sn.mode)}${sn.topic ? ' · ' + esc(Data.topicName(sn.topic)) : ''}</span><span class="r">${sn.correct}/${sn.total}</span></div>`).join('')}
      </div>`;
    $app().querySelectorAll('[data-exam]').forEach(b => b.addEventListener('click', () => {
      const e = exams[parseInt(b.dataset.exam, 10)];
      $app().innerHTML = `<p><a href="#/ilerleme">← ${t('progress.title')}</a></p><div id="past"></div>`;
      Exam.reviewPast(document.getElementById('past'), e, 0);
    }));
  }

  function viewNotes(id) {
    setCurrentNav('notes');
    if (!id) {
      $app().innerHTML = `<h1>${t('notes.title')}</h1>
        <div class="grid grid-2">${Data.topics.map(tp => `<a class="action-card" href="#/notlar/${tp.id}"><div class="t">${tp.order}. ${esc(Data.topicName(tp.id))}</div></a>`).join('')}</div>`;
      return;
    }
    const tp = Data.topicById[id]; if (!tp) { location.hash = '#/notlar'; return; }
    const n = Data.notes[id];
    const table = c => `<h4>${esc(c.title)}</h4><div class="table-wrap"><table>${(c.rows || []).map((r, i) => `<tr>${r.map(cell => i === 0 ? `<th>${esc(cell)}</th>` : `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</table></div>`;
    $app().innerHTML = `
      <p><a href="#/notlar">← ${t('notes.title')}</a></p>
      <div class="card">
        <h1>${esc(Data.topicName(id))}</h1>
        ${!n ? `<p>${t('notes.none')}</p>` : `
        <p>${esc(n.summary)}</p>
        <h3>${t('notes.concepts')}</h3><ul>${(n.concepts || []).map(c => `<li>${esc(c)}</li>`).join('')}</ul>
        ${(n.comparisons || []).length ? `<h3>${t('notes.comparisons')}</h3>${n.comparisons.map(table).join('')}` : ''}
        ${(n.formulas || []).length ? `<h3>${t('notes.formulas')}</h3><ul>${n.formulas.map(f => `<li><code>${esc(f)}</code></li>`).join('')}</ul>` : ''}
        ${(n.misconceptions || []).length ? `<h3>${t('notes.misconceptions')}</h3><ul>${n.misconceptions.map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : ''}
        ${n.example ? `<h3>${t('notes.example')}</h3><p style="white-space:pre-line">${esc(n.example)}</p>` : ''}
        ${(n.references || []).length ? `<h3>${t('notes.references')}</h3><ul class="small">${n.references.map(r => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}`}
        <div class="btn-row"><a class="btn" href="#/konu/${id}">${t('notes.practice')}</a></div>
      </div>`;
  }

  function viewPlan() {
    setCurrentNav('plan');
    const today = new Date().toISOString().slice(0, 10);
    $app().innerHTML = `<h1>${t('plan.title')}</h1><p class="muted small">${t('plan.intro')}</p>
      ${Data.plan.length === 0 ? `<p class="muted">${t('plan.none')}</p>` : `<div class="card">${Data.plan.map(d => `
        <div class="day ${d.date === today ? 'today' : (d.date < today ? 'past' : '')}">
          <div class="dh"><strong>${esc(d.date)} ${esc(d.day || '')}</strong> ${d.date === today ? `<span class="badge badge-primary">${t('plan.today')}</span>` : ''} ${d.mock ? `<span class="badge badge-warn">${t('plan.mock')}</span>` : ''} <span class="muted small">${t('plan.minutes', { n: d.minutes })}</span></div>
          <div>${esc(d.title)} · ${(d.topics || []).map(x => `<a href="#/konu/${x}">${esc(Data.topicShort(x))}</a>`).join(', ')}</div>
          <ul>${(d.tasks || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>`).join('')}</div>`}`;
  }

  function viewSettings(msg) {
    setCurrentNav('');
    const s = Store.load();
    const reviewed = Data.questions.filter(q => q.reviewStatus === 'reviewed').length;
    $app().innerHTML = `
      <h1>${t('settings.title')}</h1>
      ${msg ? `<div class="banner banner-warn" role="status">${esc(msg)}</div>` : ''}
      <div class="card">
        <label class="field">${t('settings.language')}
          <select id="langSel"><option value="tr" ${I18n.getLang() === 'tr' ? 'selected' : ''}>${t('settings.tr')}</option><option value="en" ${I18n.getLang() === 'en' ? 'selected' : ''}>${t('settings.en')}</option></select></label>
        <label class="field">${t('settings.theme')}
          <select id="themeSel">${['auto', 'light', 'dark'].map(v => `<option value="${v}" ${s.settings.theme === v ? 'selected' : ''}>${t('settings.theme' + v.charAt(0).toUpperCase() + v.slice(1))}</option>`).join('')}</select></label>
        <label class="field">${t('settings.timer')} <input type="number" id="timerInp" min="0" max="180" value="${s.settings.examTimerMinutes}"></label>
        <p class="small muted tight">${t('settings.bank')}: ${t('settings.bankInfo', { total: Data.questions.length, reviewed, pending: Data.questions.length - reviewed })}</p>
      </div>
      <div class="card">
        <div class="btn-row" style="margin-top:0"><button class="btn btn-secondary" id="exportBtn">${t('settings.export')}</button></div>
        <div id="exportBox" hidden>
          <p class="small muted">${t('settings.exportHelp')}</p>
          <textarea id="exportTxt" rows="6" readonly aria-label="${t('settings.export')}"></textarea>
          <div class="btn-row" style="margin-top:.5rem"><button class="btn btn-sm btn-secondary" id="copyBtn">${t('settings.copy')}</button> <span id="copyMsg" class="small muted"></span></div>
        </div>
        <h3 style="margin-top:1.2rem">${t('settings.import')}</h3>
        <p class="small muted">${t('settings.importHelp')}</p>
        <input type="file" id="importInp" accept="application/json,.json" aria-label="${t('settings.import')}">
        <textarea id="importTxt" rows="4" aria-label="${t('settings.import')}" placeholder="{ ... }"></textarea>
        <div class="btn-row" style="margin-top:.5rem"><button class="btn btn-sm btn-secondary" id="importBtn">${t('settings.importBtn')}</button></div>
        <hr>
        <button class="btn btn-danger" id="resetBtn">${t('settings.reset')}</button>
      </div>`;
    document.getElementById('langSel').addEventListener('change', e => { s.settings.language = e.target.value; Store.save(); I18n.setLang(e.target.value); renderChrome(); viewSettings(t('settings.saved')); });
    document.getElementById('themeSel').addEventListener('change', e => { s.settings.theme = e.target.value; Store.save(); applyTheme(); });
    document.getElementById('timerInp').addEventListener('change', e => { const v = Math.max(0, Math.min(180, parseInt(e.target.value, 10) || 0)); s.settings.examTimerMinutes = v; Store.save(); });
    document.getElementById('exportBtn').addEventListener('click', () => {
      const txt = Store.exportJSON();
      document.getElementById('exportBox').hidden = false;
      document.getElementById('exportTxt').value = txt;
      try {
        const blob = new Blob([txt], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = 'bm-sinav-ilerleme-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      } catch (e) { /* indirme engellenmişse metin kutusu yeterli */ }
    });
    document.getElementById('copyBtn').addEventListener('click', () => {
      const ta = document.getElementById('exportTxt'); const msg = document.getElementById('copyMsg');
      const fallback = () => { ta.focus(); ta.select(); try { document.execCommand('copy'); msg.textContent = t('settings.copied'); } catch (e) { /* kullanıcı elle kopyalar */ } };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(() => { msg.textContent = t('settings.copied'); }, fallback);
      else fallback();
    });
    const doImport = text => {
      const err = Store.importJSON(text);
      I18n.setLang(Store.load().settings.language || 'tr'); renderChrome(); applyTheme();
      viewSettings(err ? t('settings.importFail', { msg: err }) : t('settings.importOk'));
    };
    document.getElementById('importInp').addEventListener('change', e => {
      const f = e.target.files[0]; if (!f) return;
      const reader = new FileReader(); reader.onload = () => doImport(String(reader.result)); reader.readAsText(f);
    });
    document.getElementById('importBtn').addEventListener('click', () => { const v = document.getElementById('importTxt').value.trim(); if (v) doImport(v); });
    document.getElementById('resetBtn').addEventListener('click', async () => {
      if (await UI.confirm(t('settings.confirmReset'), { danger: true })) { Store.reset(); I18n.setLang('tr'); renderChrome(); applyTheme(); viewSettings(t('settings.resetDone')); }
    });
  }

  /* ---------- Yönlendirme ---------- */
  function route() {
    if (!Data.ready) return;
    if (Exam.isActive()) Exam.abandon();
    const hash = location.hash || '#/';
    const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const main = parts[0] || '';
    document.getElementById('mobileNav').hidden = true;
    document.getElementById('menuBtn').setAttribute('aria-expanded', 'false');
    switch (main) {
      case '': viewHome(); break;
      case 'konular': viewTopics(); break;
      case 'konu': viewTopic(parts[1]); break;
      case 'seviye': viewPlacement(); break;
      case 'deneme': setCurrentNav('exam'); $app().innerHTML = '<div id="exam"></div>'; Exam.startScreen(document.getElementById('exam')); break;
      case 'yanlislar': viewReview(); break;
      case 'ilerleme': viewProgress(); break;
      case 'notlar': viewNotes(parts[1]); break;
      case 'plan': viewPlan(); break;
      case 'ayarlar': viewSettings(); break;
      default: viewHome();
    }
    document.getElementById('main').focus({ preventScroll: true });
  }

  async function init() {
    const s = Store.load();
    I18n.setLang(s.settings.language || 'tr');
    applyTheme();
    if (!Store.isAvailable()) document.getElementById('storageWarning').hidden = false;
    document.getElementById('menuBtn').addEventListener('click', () => {
      const nav = document.getElementById('mobileNav'); nav.hidden = !nav.hidden;
      document.getElementById('menuBtn').setAttribute('aria-expanded', String(!nav.hidden));
    });
    document.getElementById('langBtn').addEventListener('click', toggleLang);
    renderChrome();
    try {
      await Data.load();
    } catch (e) {
      $app().innerHTML = `<div class="banner banner-warn" role="alert">${t('app.loadError', { msg: esc(e.message) })}</div>`;
      return;
    }
    window.addEventListener('hashchange', route);
    // Aynı adrese tekrar tıklanırsa görünümü yeniden çiz (ör. oturum bittikten sonra aynı menü öğesi)
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#/"]');
      if (a && a.getAttribute('href') === location.hash) { e.preventDefault(); route(); }
    });
    window.addEventListener('beforeunload', e => { if (Exam.isActive()) { e.preventDefault(); e.returnValue = ''; } });
    route();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
