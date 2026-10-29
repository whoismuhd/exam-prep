/* exam.js – 40 soruluk deneme sınavı: gecikmeli değerlendirme, zamanlayıcı, sonuç ve inceleme */
(function () {
  'use strict';
  const t = (k, v) => I18n.t(k, v);
  const esc = s => Quiz.esc(s);

  let active = null; // {questions, answers:{}, flags:Set, idx, startedAt, timerMinutes, deadline, intervalId}

  function startScreen(container) {
    const s = Store.load();
    const total = Data.questions.length;
    const notEnough = total < 40;
    const current = s.settings.examTimerMinutes;
    container.innerHTML = `
      <div class="card">
        <h1>${t('exam.title')}</h1>
        <p>${t('exam.intro')}</p>
        ${notEnough ? `<p class="badge badge-warn">${t('exam.notEnough', { n: total })}</p>` : ''}
        <label class="field">${t('exam.timer')}
          <select id="timerSel">
            <option value="0" ${current === 0 ? 'selected' : ''}>${t('exam.noTimer')}</option>
            ${[30, 45, 60, 75, 90].map(m => `<option value="${m}" ${current === m ? 'selected' : ''}>${t('exam.minutes', { n: m })}</option>`).join('')}
          </select>
        </label>
        <div class="btn-row">
          <button class="btn" id="startExam" ${notEnough ? 'disabled' : ''}>${t('exam.start')}</button>
          <a class="btn btn-ghost" href="#/">${t('nav.home')}</a>
        </div>
      </div>`;
    const btn = container.querySelector('#startExam');
    if (btn) btn.addEventListener('click', () => {
      const m = parseInt(container.querySelector('#timerSel').value, 10) || 0;
      s.settings.examTimerMinutes = m; Store.save();
      begin(container, m);
    });
  }

  function begin(container, timerMinutes) {
    const qs = Progress.buildMockExam(40);
    active = {
      questions: qs, answers: {}, flags: new Set(), idx: 0,
      startedAt: Date.now(), timerMinutes,
      deadline: timerMinutes ? Date.now() + timerMinutes * 60000 : null, intervalId: null, container
    };
    if (active.deadline) {
      active.intervalId = setInterval(() => {
        const el = document.getElementById('examTimer');
        const left = active.deadline - Date.now();
        if (el) { el.textContent = fmt(left); el.classList.toggle('low', left < 5 * 60000); }
        if (left <= 0) { clearInterval(active.intervalId); submit(true); UI.notice(t('exam.timeUp')); }
      }, 1000);
    }
    renderQuestion();
  }

  function fmt(ms) {
    if (ms < 0) ms = 0;
    const s = Math.floor(ms / 1000); const m = Math.floor(s / 60);
    return String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function navGrid(resultMode, results) {
    return `<div class="qnav" role="navigation" aria-label="${t('exam.review')}">${active.questions.map((q, i) => {
      let cls = '';
      if (resultMode) {
        const r = results[q.id];
        cls = r === 'ok' ? 'res-ok' : (r === 'bad' ? 'res-bad' : 'res-blank');
      } else {
        if (active.answers[q.id]) cls += ' answered';
        if (active.flags.has(q.id)) cls += ' flagged';
      }
      if (i === active.idx) cls += ' current';
      return `<button type="button" class="${cls}" data-i="${i}" aria-label="${t('exam.question', { n: i + 1 })}" ${i === active.idx ? 'aria-current="true"' : ''}>${i + 1}</button>`;
    }).join('')}</div>`;
  }

  function renderQuestion() {
    const c = active.container;
    const q = active.questions[active.idx];
    const answered = Object.keys(active.answers).length;
    c.innerHTML = `
      <div class="card">
        <div class="exam-top">
          <strong>${t('exam.title')}</strong>
          <span>${t('exam.answered', { a: answered, total: active.questions.length })}</span>
          ${active.deadline ? `<span class="timer" id="examTimer" aria-live="off">${fmt(active.deadline - Date.now())}</span>` : ''}
        </div>
        ${navGrid(false)}
        <hr>
        <form id="examForm">
          ${Quiz.renderQuestion(q, { counter: t('exam.question', { n: active.idx + 1 }), selected: active.answers[q.id] || null })}
        </form>
        <div class="btn-row">
          <button type="button" class="btn btn-secondary" id="prevBtn" ${active.idx === 0 ? 'disabled' : ''}>${t('exam.prev')}</button>
          <button type="button" class="btn btn-secondary" id="nextBtn" ${active.idx === active.questions.length - 1 ? 'disabled' : ''}>${t('exam.next')}</button>
          <button type="button" class="btn btn-ghost" id="flagBtn">${active.flags.has(q.id) ? t('exam.unflag') : t('exam.flag')}</button>
          <button type="button" class="btn" id="submitBtn">${t('exam.submit')}</button>
          <button type="button" class="btn btn-ghost" id="leaveBtn">${t('exam.leave')}</button>
        </div>
      </div>`;
    c.querySelector('#examForm').addEventListener('change', e => {
      if (e.target.name === 'q_' + q.id) {
        active.answers[q.id] = e.target.value;
        c.querySelectorAll('.option').forEach(l => l.classList.toggle('selected', l.querySelector('input').checked));
        c.querySelector('.exam-top span').textContent = t('exam.answered', { a: Object.keys(active.answers).length, total: active.questions.length });
        const b = c.querySelector('.qnav button[data-i="' + active.idx + '"]'); if (b) b.classList.add('answered');
      }
    });
    c.querySelectorAll('.qnav button').forEach(b => b.addEventListener('click', () => { active.idx = parseInt(b.dataset.i, 10); renderQuestion(); }));
    c.querySelector('#prevBtn').addEventListener('click', () => { active.idx--; renderQuestion(); window.scrollTo({ top: 0 }); });
    c.querySelector('#nextBtn').addEventListener('click', () => { active.idx++; renderQuestion(); window.scrollTo({ top: 0 }); });
    c.querySelector('#flagBtn').addEventListener('click', () => { if (active.flags.has(q.id)) active.flags.delete(q.id); else active.flags.add(q.id); renderQuestion(); });
    c.querySelector('#submitBtn').addEventListener('click', async () => {
      const blank = active.questions.length - Object.keys(active.answers).length;
      const msg = blank > 0 ? t('exam.confirmSubmit', { blank }) : t('exam.confirmSubmitFull');
      if (await UI.confirm(msg)) submit(false);
    });
    c.querySelector('#leaveBtn').addEventListener('click', async () => {
      if (await UI.confirm(t('exam.confirmLeave'), { danger: true })) { abandon(); location.hash = '#/'; }
    });
  }

  function abandon() {
    if (active && active.intervalId) clearInterval(active.intervalId);
    active = null;
  }

  function submit(auto) {
    if (!active) return;
    if (active.intervalId) clearInterval(active.intervalId);
    const results = {}; let correct = 0, wrong = 0, blank = 0;
    const byTopic = {}, byDifficulty = { temel: { c: 0, n: 0 }, orta: { c: 0, n: 0 }, ileri: { c: 0, n: 0 } };
    for (const q of active.questions) {
      const a = active.answers[q.id] || null;
      let r;
      if (!a) { r = 'blank'; blank++; } else if (a === q.correctAnswer) { r = 'ok'; correct++; } else { r = 'bad'; wrong++; }
      results[q.id] = r;
      byTopic[q.topic] = byTopic[q.topic] || { c: 0, n: 0 }; byTopic[q.topic].n++; if (r === 'ok') byTopic[q.topic].c++;
      if (byDifficulty[q.difficulty]) { byDifficulty[q.difficulty].n++; if (r === 'ok') byDifficulty[q.difficulty].c++; }
      // Boş bırakılan sorular da ilerleme kaydına "yanlış" olarak girer: tekrar kuyruğuna alınır.
      Progress.recordAnswer(q.id, a, r === 'ok');
    }
    const durationSec = Math.round((Date.now() - active.startedAt) / 1000);
    const record = {
      t: new Date().toISOString(), total: active.questions.length, correct, wrong, blank,
      byTopic, byDifficulty, questionIds: active.questions.map(q => q.id), answers: active.answers,
      durationSec, timerMinutes: active.timerMinutes, autoSubmitted: !!auto
    };
    Progress.recordExam(record);
    Progress.recordSession('exam', null, record.total, correct);
    const snapshot = active; active = null;
    renderResult(snapshot.container, snapshot, record, results);
  }

  function renderResult(container, snap, record, results, reviewIdx) {
    const pct = Math.round(100 * record.correct / record.total);
    const topicRows = Object.keys(record.byTopic).sort((a, b) => Data.topicById[a].order - Data.topicById[b].order)
      .map(tp => { const x = record.byTopic[tp]; const p = Math.round(100 * x.c / x.n); return `<div class="row"><span class="l">${esc(Data.topicName(tp))}</span><span class="r"><span>${x.c}/${x.n}</span><span class="bar ${p >= 80 ? 'ok' : (p < 50 ? 'bad' : 'warn')}" style="width:90px"><span style="width:${p}%"></span></span></span></div>`; }).join('');
    const diffRows = ['temel', 'orta', 'ileri'].map(d => { const x = record.byDifficulty[d]; return x && x.n ? `<div class="row"><span class="l">${Data.difficultyLabel(d)}</span><span class="r">${x.c}/${x.n}</span></div>` : ''; }).join('');
    const reviewHtml = typeof reviewIdx === 'number' ? renderReview(snap, record, reviewIdx) : '';
    container.innerHTML = `
      <div class="card">
        <h1>${t('exam.resultTitle')}</h1>
        <div class="grid grid-4">
          <div class="stat"><div class="label">${t('exam.score')}</div><div class="value">${record.correct} / ${record.total}</div><div class="sub">%${pct}</div></div>
          <div class="stat"><div class="label">${t('exam.correctN')}</div><div class="value">${record.correct}</div></div>
          <div class="stat"><div class="label">${t('exam.wrongN')}</div><div class="value">${record.wrong}</div></div>
          <div class="stat"><div class="label">${t('exam.blankN')}</div><div class="value">${record.blank}</div><div class="sub">${t('exam.duration', { m: Math.round(record.durationSec / 60) })}</div></div>
        </div>
        <h3 style="margin-top:1rem">${t('common.byTopic')}</h3>${topicRows}
        <h3 style="margin-top:1rem">${t('exam.byDifficulty')}</h3>${diffRows}
        <h3 style="margin-top:1rem">${t('exam.reviewAll')}</h3>
        <p class="small muted tight">${t('exam.resultLegend')}</p>
        ${navGridFor(snap, results, reviewIdx)}
        <div class="btn-row">
          <a class="btn btn-secondary" href="#/deneme">${t('exam.newExam')}</a>
          <a class="btn btn-ghost" href="#/yanlislar">${t('nav.review')}</a>
          <a class="btn btn-ghost" href="#/">${t('nav.home')}</a>
        </div>
      </div>
      ${reviewHtml}`;
    container.querySelectorAll('.qnav button').forEach(b => b.addEventListener('click', () => {
      renderResult(container, snap, record, results, parseInt(b.dataset.i, 10));
      const r = container.querySelector('#reviewCard'); if (r) r.scrollIntoView({ behavior: 'smooth' });
    }));
    Quiz.bindSimple(container);
    const prev = container.querySelector('#revPrev'), next = container.querySelector('#revNext');
    if (prev) prev.addEventListener('click', () => renderResult(container, snap, record, results, reviewIdx - 1));
    if (next) next.addEventListener('click', () => renderResult(container, snap, record, results, reviewIdx + 1));
  }

  function navGridFor(snap, results, idx) {
    return `<div class="qnav">${snap.questions.map((q, i) => {
      const r = results[q.id];
      const cls = (r === 'ok' ? 'res-ok' : (r === 'bad' ? 'res-bad' : 'res-blank')) + (i === idx ? ' current' : '');
      return `<button type="button" class="${cls}" data-i="${i}" aria-label="${t('exam.question', { n: i + 1 })}">${i + 1}</button>`;
    }).join('')}</div>`;
  }

  function renderReview(snap, record, idx) {
    const q = snap.questions[idx];
    const choice = record.answers[q.id] || null;
    return `
      <div class="card" id="reviewCard">
        <h2>${t('exam.review')} · ${t('exam.question', { n: idx + 1 })}</h2>
        ${Quiz.renderQuestion(q, { counter: t('exam.question', { n: idx + 1 }), selected: choice, showResult: true })}
        ${Quiz.renderFeedback(q, choice)}
        <div class="btn-row">
          <button type="button" class="btn btn-secondary" id="revPrev" ${idx === 0 ? 'disabled' : ''}>${t('exam.prev')}</button>
          <button type="button" class="btn btn-secondary" id="revNext" ${idx === snap.questions.length - 1 ? 'disabled' : ''}>${t('exam.next')}</button>
        </div>
      </div>`;
  }

  /** Geçmiş bir denemeyi (kayıttan) incelemek için */
  function reviewPast(container, record, idx) {
    const questions = record.questionIds.map(id => Data.questionById[id]).filter(Boolean);
    const results = {};
    questions.forEach(q => { const a = record.answers[q.id]; results[q.id] = !a ? 'blank' : (a === q.correctAnswer ? 'ok' : 'bad'); });
    renderResult(container, { questions }, record, results, typeof idx === 'number' ? idx : undefined);
  }

  window.Exam = { startScreen, abandon, isActive: () => !!active, reviewPast };
})();
