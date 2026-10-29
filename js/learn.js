/* learn.js – Öğren bölümü: dersler, bilgi kontrolleri, kartlar, mini test, ders takibi */
(function () {
  'use strict';
  const t = (k, v) => I18n.t(k, v);
  const esc = s => Quiz.esc(s);

  /* ---------- kayıt ---------- */
  function rec(id) {
    const s = Store.load();
    if (!s.lessons) s.lessons = {};
    if (!s.lessons[id]) s.lessons[id] = { opened: null, completed: null, checks: {}, quiz: null };
    return s.lessons[id];
  }
  function lessonStats() {
    const s = Store.load(); const L = s.lessons || {};
    let completed = 0, started = 0;
    for (const id of Object.keys(L)) { if (L[id].completed) completed++; else if (L[id].opened) started++; }
    return { completed, started, lastLesson: s.lastLesson || null };
  }
  function statusOf(id) {
    const s = Store.load(); const r = (s.lessons || {})[id];
    if (!r || !r.opened) return 'new';
    return r.completed ? 'done' : 'started';
  }

  const paras = txt => String(txt || '').split(/\n\n+/).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');

  /* ---------- liste ---------- */
  function viewList() {
    const st = lessonStats();
    const cont = st.lastLesson && statusOf(st.lastLesson) === 'started' ? st.lastLesson : null;
    return `
      <h1>${t('learn.title')}</h1>
      <p class="muted small">${t('learn.intro')}</p>
      ${cont ? `<div class="card"><h2>${t('learn.continue')}</h2><p>${esc(Data.topicName(cont))}</p><a class="btn" href="#/ogren/${cont}">${t('learn.continueBtn')}</a></div>` : ''}
      <div class="grid grid-2">
        ${Data.topics.map(tp => {
          const stt = statusOf(tp.id); const has = !!Data.lessonFor(tp.id);
          const badge = stt === 'done' ? `<span class="badge badge-ok">${t('learn.done')}</span>` : stt === 'started' ? `<span class="badge badge-warn">${t('learn.started')}</span>` : '';
          return `<div class="topic-card">
            <div class="name">${tp.order}. ${esc(Data.topicName(tp.id))} ${badge}</div>
            <div class="btn-row" style="margin-top:.3rem">
              ${has ? `<a class="btn btn-sm" href="#/ogren/${tp.id}">${t('learn.study')}</a>` : `<span class="small muted">${t('learn.soon')}</span>`}
              <a class="btn btn-sm btn-ghost" href="#/konu/${tp.id}">${t('learn.practise')}</a>
            </div>
          </div>`;
        }).join('')}
      </div>`;
  }

  /* ---------- ders sayfası ---------- */
  function viewLesson(container, id) {
    const L = Data.lessonFor(id);
    if (!L) { container.innerHTML = `<p><a href="#/ogren">← ${t('learn.title')}</a></p><div class="card"><p>${t('learn.soon')}</p><a class="btn" href="#/konu/${id}">${t('learn.practise')}</a></div>`; return; }
    const r = rec(id);
    if (!r.opened) r.opened = new Date().toISOString();
    const s = Store.load(); s.lastLesson = id; Store.save();

    const sections = L.sections.map((sec, i) => `
      <details class="lesson-sec" ${i === 0 ? 'open' : ''} data-sec="${i}">
        <summary>${esc(sec.title)}</summary>
        <div class="lesson-body">${paras(sec.body)}</div>
        ${sec.check ? renderCheck(id, i, sec.check) : ''}
      </details>`).join('');

    const examples = (L.workedExamples || []).map((w, i) => `
      <details class="lesson-sec">
        <summary>${esc(w.title)}</summary>
        <div class="lesson-body">${paras(w.problem)}
          <ol>${w.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
          <p><strong>${t('learn.answer')}:</strong> ${esc(w.answer)}</p></div>
      </details>`).join('');

    const cards = (L.keyTerms || []).map((k, i) => `
      <button type="button" class="flashcard" data-i="${i}" aria-pressed="false" aria-label="${esc(k.term)}">
        <span class="fc-front">${esc(k.term)}</span>
        <span class="fc-back" hidden>${esc(k.definition)}</span>
      </button>`).join('');

    const quizDone = r.quiz;
    container.innerHTML = `
      <p><a href="#/ogren">← ${t('learn.title')}</a></p>
      <div class="card">
        <h1>${esc(Data.topicName(id))}</h1>
        <p>${esc(L.intro)}</p>
        <div class="btn-row" style="margin-top:.4rem">
          <a class="btn btn-sm btn-secondary" href="#/konu/${id}">${t('learn.practise')}</a>
          <a class="btn btn-sm btn-ghost" href="#/notlar/${id}">${t('learn.summary')}</a>
        </div>
      </div>
      <div class="card"><h2>${t('learn.lessons')}</h2>${sections}</div>
      ${examples ? `<div class="card"><h2>${t('learn.examples')}</h2>${examples}</div>` : ''}
      <div class="card"><h2>${t('learn.terms')}</h2><p class="small muted">${t('learn.termsHelp')}</p><div class="flashcards">${cards}</div></div>
      <div class="card"><h2>${t('learn.mistakes')}</h2><ul>${(L.commonMistakes || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="card"><h2>${t('learn.tips')}</h2><ul>${(L.examTips || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="card"><h2>${t('learn.takeaways')}</h2><ul>${(L.takeaways || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="card" id="quizCard">
        <h2>${t('learn.quiz')}</h2>
        ${quizDone ? `<p class="small muted">${t('learn.quizLast', { score: quizDone.score, total: quizDone.total })}</p>` : ''}
        <div id="quizArea"><button class="btn" id="quizStart">${quizDone ? t('learn.quizAgain') : t('learn.quizStart')}</button></div>
      </div>
      <div class="card">
        ${r.completed ? `<p><span class="badge badge-ok">${t('learn.completedOn', { d: fmt(r.completed) })}</span></p>` : `<p class="small muted">${t('learn.completeHelp')}</p><button class="btn" id="completeBtn">${t('learn.complete')}</button>`}
        <div class="btn-row"><a class="btn btn-secondary" href="#/konu/${id}">${t('learn.practise')}</a></div>
      </div>`;

    container.querySelectorAll('.check-form').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); submitCheck(id, f); }));
    container.querySelectorAll('.flashcard').forEach(b => b.addEventListener('click', () => {
      const back = b.querySelector('.fc-back'), front = b.querySelector('.fc-front');
      const show = back.hidden; back.hidden = !show; front.hidden = show; b.setAttribute('aria-pressed', String(show)); b.classList.toggle('flipped', show);
    }));
    const qs = container.querySelector('#quizStart'); if (qs) qs.addEventListener('click', () => runQuiz(id, L.quiz, container.querySelector('#quizArea')));
    const cb = container.querySelector('#completeBtn'); if (cb) cb.addEventListener('click', () => { rec(id).completed = new Date().toISOString(); Store.save(); viewLesson(container, id); window.scrollTo({ top: document.body.scrollHeight }); });
    Store.save();
  }

  function fmt(iso) { try { return new Date(iso).toLocaleDateString(I18n.getLang() === 'en' ? 'en-GB' : 'tr-TR'); } catch (e) { return iso; } }

  /* ---------- bölüm içi bilgi kontrolü ---------- */
  function renderCheck(id, i, c) {
    const r = rec(id); const prev = r.checks[i];
    const name = `chk_${id}_${i}`;
    return `
      <form class="check-form" data-i="${i}">
        <div class="check-q"><strong>${t('learn.check')}:</strong> ${esc(c.question)}</div>
        ${c.options.map((o, k) => `<label class="option"><input type="radio" name="${name}" value="${k}" required><span class="letter">${String.fromCharCode(65 + k)})</span><span class="txt">${esc(o)}</span></label>`).join('')}
        <div class="btn-row" style="margin-top:.4rem"><button type="submit" class="btn btn-sm">${t('q.check')}</button>${prev === true ? `<span class="badge badge-ok">${t('learn.checkDone')}</span>` : ''}</div>
        <div class="check-fb"></div>
      </form>`;
  }
  function submitCheck(id, form) {
    const i = parseInt(form.dataset.i, 10);
    const L = Data.lessonFor(id); const c = L.sections[i].check;
    const sel = form.querySelector('input:checked'); if (!sel) return;
    const ok = parseInt(sel.value, 10) === c.correct;
    rec(id).checks[i] = ok; Store.save();
    form.querySelectorAll('.option').forEach((l, k) => { l.classList.toggle('correct', k === c.correct); l.classList.toggle('wrong', k === parseInt(sel.value, 10) && !ok); });
    form.querySelector('.check-fb').innerHTML = `<div class="feedback ${ok ? 'ok' : 'bad'}" style="margin-top:.5rem"><strong>${ok ? t('fb.correctTitle') : t('fb.wrongTitle')}</strong> ${esc(c.explanation)}</div>`;
  }

  /* ---------- mini test ---------- */
  function runQuiz(id, quiz, area) {
    let idx = 0, score = 0;
    const render = () => {
      const q = quiz[idx];
      area.innerHTML = `
        <form id="mq">
          <div class="progress-line">${t('q.counter', { n: idx + 1, total: quiz.length })} · ${t('q.correctSoFar')}: ${score}</div>
          <p class="question-text">${esc(q.question)}</p>
          ${q.options.map((o, k) => `<label class="option"><input type="radio" name="mq_${idx}" value="${k}" required><span class="letter">${String.fromCharCode(65 + k)})</span><span class="txt">${esc(o)}</span></label>`).join('')}
          <div class="btn-row"><button type="submit" class="btn">${t('q.check')}</button></div>
          <div id="mqfb"></div>
        </form>`;
      const f = area.querySelector('#mq');
      f.addEventListener('submit', e => {
        e.preventDefault();
        const sel = f.querySelector('input:checked'); if (!sel) return;
        const ok = parseInt(sel.value, 10) === q.correct; if (ok) score++;
        f.querySelector('button[type=submit]').disabled = true;
        f.querySelectorAll('.option').forEach((l, k) => { l.classList.add('locked'); l.classList.toggle('correct', k === q.correct); l.classList.toggle('wrong', k === parseInt(sel.value, 10) && !ok); l.querySelector('input').disabled = true; });
        f.querySelector('#mqfb').innerHTML = `<div class="feedback ${ok ? 'ok' : 'bad'}"><strong>${ok ? t('fb.correctTitle') : t('fb.wrongTitle')}</strong> ${esc(q.explanation)}</div><div class="btn-row"><button type="button" class="btn" id="mqNext">${idx + 1 < quiz.length ? t('q.next') : t('q.finish')}</button></div>`;
        f.querySelector('#mqNext').addEventListener('click', () => { idx++; if (idx < quiz.length) render(); else finish(); });
      });
    };
    const finish = () => {
      rec(id).quiz = { score, total: quiz.length, t: new Date().toISOString() }; Store.save();
      area.innerHTML = `<p><strong>${t('learn.quizResult', { score, total: quiz.length })}</strong></p><div class="btn-row"><button class="btn btn-secondary" id="quizStart">${t('learn.quizAgain')}</button><a class="btn" href="#/konu/${id}">${t('learn.practise')}</a></div>`;
      area.querySelector('#quizStart').addEventListener('click', () => runQuiz(id, quiz, area));
    };
    render();
  }

  window.Learn = { viewList, viewLesson, lessonStats, statusOf };
})();
