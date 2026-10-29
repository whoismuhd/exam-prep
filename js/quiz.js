/* quiz.js – soru görünümü, anında geri bildirim, alıştırma oturumu */
(function () {
  'use strict';
  const t = (k, v) => I18n.t(k, v);

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function optionText(q, id) {
    const o = q.options.find(x => x.id === id);
    return o ? o.text : '';
  }

  /** Seçenekler (radio). showResult=true ise kilitli ve işaretli görünüm. */
  function renderOptions(q, opts) {
    q = Data.localized(q);
    opts = opts || {};
    const selected = opts.selected || null;
    const showResult = !!opts.showResult;
    const name = 'q_' + q.id;
    const options = q.options.map(o => {
      let cls = 'option';
      let mark = '';
      if (showResult) {
        cls += ' locked';
        if (o.id === q.correctAnswer) { cls += ' correct'; mark = '✔ ' + t('q.correctAnswerMark'); }
        if (selected && o.id === selected && selected !== q.correctAnswer) { cls += ' wrong'; mark = '✘ ' + t('q.yourAnswerMark'); }
        if (selected && o.id === selected && selected === q.correctAnswer) { mark = '✔ ' + t('q.yourAnswerCorrectMark'); }
      } else if (selected === o.id) cls += ' selected';
      return `
        <label class="${cls}">
          <input type="radio" name="${name}" value="${o.id}" ${selected === o.id ? 'checked' : ''} ${showResult ? 'disabled' : ''}>
          <span class="letter">${o.id})</span>
          <span class="txt">${esc(o.text)}</span>
          ${mark ? `<span class="mark">${mark}</span>` : ''}
        </label>`;
    }).join('');
    return `
      <fieldset class="options" aria-labelledby="qtext_${q.id}">
        <legend>${t('q.options')}</legend>
        ${options}
      </fieldset>`;
  }

  /** Soru kartı: başlık, metin, kod ve seçenekler */
  function renderQuestion(q, opts) {
    q = Data.localized(q);
    opts = opts || {};
    const head = `
      <div class="question-head">
        <span>${esc(opts.counter || '')}</span>
        <span><span class="badge badge-primary">${esc(Data.topicShort(q.topic))}</span>
              <span class="badge">${esc(q.subtopic)}</span>
              <span class="badge">${esc(Data.difficultyLabel(q.difficulty))}</span></span>
      </div>`;
    const code = q.code ? `<pre aria-label="${t('q.codeLabel')}"><code>${esc(q.code)}</code></pre>` : '';
    return `
      ${head}
      <p class="question-text" id="qtext_${q.id}">${esc(q.question)}</p>
      ${code}
      ${renderOptions(q, opts)}`;
  }

  /** Basit anlatım bloğu (düğmeyle açılır). Alan yoksa temel kavram + ipucu gösterilir. */
  function renderSimple(q) {
    q = Data.localized(q);
    const text = q.simpleExplanation || (q.keyConcept + (q.examTip ? '\n\n' + q.examTip : ''));
    return `
      <div class="section simple-wrap">
        <button type="button" class="btn btn-sm btn-secondary simple-btn" aria-expanded="false" aria-controls="simple_${esc(q.id)}">${t('fb.simple')}</button>
        <div class="simple-box" id="simple_${esc(q.id)}" hidden><h4>${t('fb.simpleTitle')}</h4><p style="white-space:pre-line">${esc(text)}</p></div>
      </div>`;
  }

  /** Basit anlatım düğmelerini bağla (container içinde) */
  function bindSimple(container) {
    container.querySelectorAll('.simple-btn').forEach(btn => btn.addEventListener('click', () => {
      const box = document.getElementById(btn.getAttribute('aria-controls'));
      const open = box.hidden; box.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? t('fb.simpleHide') : t('fb.simple');
      if (open) box.focus && box.setAttribute('tabindex', '-1');
    }));
  }

  /** Ayrıntılı geri bildirim bloğu */
  function renderFeedback(q, choice) {
    q = Data.localized(q);
    const correct = choice === q.correctAnswer;
    const others = q.options.filter(o => o.id !== q.correctAnswer && o.id !== choice);
    const refs = (q.references || []).length
      ? `<div class="section small muted"><strong>${t('fb.sources')}:</strong> ${q.references.map(esc).join(' · ')}</div>` : '';
    if (correct) {
      return `
        <div class="feedback ok" role="status">
          <div class="hearts" aria-hidden="true">${'<span>❤️</span>'.repeat(7)}</div>
          <h3>${t('fb.correctTitle')} ❤️</h3>
          <p>${esc(q.explanation)}</p>
          <div class="section concept"><strong>${t('fb.keyConcept')}:</strong> ${esc(q.keyConcept)}</div>
          ${q.examTip ? `<div class="section"><strong>${t('fb.examTip')}:</strong> ${esc(q.examTip)}</div>` : ''}
          ${renderSimple(q)}
          ${refs}
        </div>`;
    }
    const blank = !choice;
    return `
      <div class="feedback bad" role="status">
        <h3>${blank ? t('fb.blankTitle') : t('fb.wrongTitle')}</h3>
        ${blank ? '' : `<p><strong>${t('fb.yourAnswer')}:</strong> ${esc(choice)}) ${esc(optionText(q, choice))}</p>`}
        <p><strong>${t('fb.correctAnswer')}:</strong> ${esc(q.correctAnswer)}) ${esc(optionText(q, q.correctAnswer))}</p>
        ${blank ? '' : `<div class="section"><h4>${t('fb.whyWrong')}</h4><p>${esc(q.optionExplanations[choice])}</p></div>`}
        <div class="section"><h4>${t('fb.whyRight')}</h4><p>${esc(q.explanation)}</p></div>
        <div class="section"><h4>${t('fb.otherOptions')}</h4>
          <ul>${others.map(o => `<li><strong>${o.id})</strong> ${esc(q.optionExplanations[o.id])}</li>`).join('')}</ul>
        </div>
        <div class="section concept"><strong>${t('fb.keyConceptLong')}:</strong> ${esc(q.keyConcept)}</div>
        ${q.examTip ? `<div class="section"><strong>${t('fb.examTip')}:</strong> ${esc(q.examTip)}</div>` : ''}
        ${renderSimple(q)}
        <div class="section"><strong>${t('fb.recommendation')}:</strong> ${t('fb.recommendationText', { topic: `<a href="#/ogren/${esc(q.topic)}">${esc(Data.topicName(q.topic))}</a>`, subtopic: esc(q.subtopic) })} <a class="btn btn-sm btn-ghost" href="#/ogren/${esc(q.topic)}">${t('fb.lessonLink')}</a></div>
        ${refs}
      </div>`;
  }

  /**
   * Alıştırma oturumu. opts: {questions, mode:'practice'|'review'|'placement', title, topicId, onFinish(summary)}
   */
  function startSession(container, opts) {
    const qs = opts.questions.slice();
    let idx = opts.resume ? opts.resume.idx : 0;
    let correct = opts.resume ? opts.resume.results.filter(r => r.ok).length : 0;
    const results = opts.resume ? opts.resume.results.slice() : []; // {id, choice, ok}
    let answered = false;
    const persist = () => {
      const st = Store.load();
      st.activeSession = { mode: opts.mode, title: opts.title || '', topicId: opts.topicId || null, hash: location.hash || '#/',
        questionIds: qs.map(q => q.id), idx, results };
      Store.save();
    };
    const clearPersist = () => { const st = Store.load(); st.activeSession = null; Store.save(); };

    function render() {
      const q = qs[idx];
      answered = false;
      container.innerHTML = `
        <div class="card">
          <div class="progress-line">${esc(opts.title || '')} · ${t('q.counter', { n: idx + 1, total: qs.length })} · ${t('q.correctSoFar')}: ${correct}</div>
          <form id="qform">
            ${renderQuestion(q, { counter: t('q.questionN', { n: idx + 1 }) })}
            <div class="btn-row">
              <button type="submit" class="btn" id="checkBtn" disabled>${t('q.check')}</button>
              <button type="button" class="btn btn-ghost" id="quitBtn">${t('q.endSession')}</button>
            </div>
          </form>
          <div id="feedbackArea"></div>
        </div>`;
      const form = container.querySelector('#qform');
      const checkBtn = container.querySelector('#checkBtn');
      form.addEventListener('change', e => {
        if (e.target.name === 'q_' + q.id) {
          checkBtn.disabled = false;
          form.querySelectorAll('.option').forEach(l => l.classList.toggle('selected', l.querySelector('input').checked));
        }
      });
      form.addEventListener('submit', e => {
        e.preventDefault();
        if (answered) return;
        const sel = form.querySelector('input[name="q_' + q.id + '"]:checked');
        if (!sel) return;
        answered = true;
        checkBtn.disabled = true;
        const choice = sel.value;
        const ok = choice === q.correctAnswer;
        if (ok) correct++;
        results.push({ id: q.id, choice, ok });
        Progress.recordAnswer(q.id, choice, ok);
        persist();
        form.querySelector('fieldset').outerHTML = renderOptions(q, { selected: choice, showResult: true });
        const fb = container.querySelector('#feedbackArea');
        fb.innerHTML = renderFeedback(q, choice) +
          `<div class="btn-row"><button type="button" class="btn" id="nextBtn">${idx + 1 < qs.length ? t('q.next') : t('q.finish')}</button></div>`;
        bindSimple(fb);
        const nextBtn = fb.querySelector('#nextBtn');
        nextBtn.focus();
        nextBtn.addEventListener('click', () => { idx++; if (idx < qs.length) { persist(); render(); window.scrollTo({ top: 0 }); } else finish(); });
      });
      container.querySelector('#quitBtn').addEventListener('click', async () => {
        if (results.length === 0 || await UI.confirm(t('q.confirmEnd'))) finish();
      });
      const first = container.querySelector('.question-text');
      if (first) { first.setAttribute('tabindex', '-1'); first.focus(); }
    }

    function finish() {
      clearPersist();
      const total = results.length;
      if (total > 0) Progress.recordSession(opts.mode, opts.topicId || null, total, correct);
      if (opts.mode === 'placement') { const s = Store.load(); s.placementDone = true; Store.save(); }
      const wrong = results.filter(r => !r.ok);
      const byTopic = {};
      results.forEach(r => { const tp = Data.questionById[r.id].topic; byTopic[tp] = byTopic[tp] || { c: 0, n: 0 }; byTopic[tp].n++; if (r.ok) byTopic[tp].c++; });
      container.innerHTML = `
        <div class="card">
          <h2>${t('q.sessionDone')}</h2>
          <p>${t('q.summary', { total, correct, wrong: total - correct, pct: total ? Math.round(100 * correct / total) : 0 })}</p>
          ${Object.keys(byTopic).length > 1 ? `<h3>${t('common.byTopic')}</h3>${Object.keys(byTopic).map(tp => `<div class="row"><span class="l">${esc(Data.topicName(tp))}</span><span class="r">${byTopic[tp].c}/${byTopic[tp].n}</span></div>`).join('')}` : ''}
          ${wrong.length ? `<h3>${t('q.wrongList')}</h3><p class="small muted">${t('q.addedToQueue')}</p>${wrong.map(w => `<div class="row"><span class="l">${esc(Data.localized(Data.questionById[w.id]).question).slice(0, 110)}…</span><span class="r"><span class="badge">${esc(Data.topicShort(Data.questionById[w.id].topic))}</span></span></div>`).join('')}` : `<p><span class="badge badge-ok">${t('q.allCorrect')}</span></p>`}
          <div class="btn-row">
            ${opts.topicId ? `<a class="btn" href="#/konu/${esc(opts.topicId)}">${t('q.continueTopic')}</a>` : ''}
            <a class="btn btn-secondary" href="#/yanlislar">${t('nav.review')}</a>
            <a class="btn btn-ghost" href="#/">${t('nav.home')}</a>
          </div>
        </div>`;
      if (typeof opts.onFinish === 'function') opts.onFinish({ total, correct, results });
      window.scrollTo({ top: 0 });
    }

    if (qs.length === 0) {
      container.innerHTML = `<div class="card"><p>${t('q.noQuestions')}</p><a class="btn" href="#/konular">${t('nav.topics')}</a></div>`;
      return;
    }
    if (idx >= qs.length) { finish(); return; }
    persist();
    render();
  }

  /** Kayıtlı oturum varsa ve bu adrese aitse sürdür; true döner. */
  function resumeIfAny(container, hash) {
    const st = Store.load();
    const a = st.activeSession;
    if (!a || a.hash !== hash) return false;
    const qs = (a.questionIds || []).map(id => Data.questionById[id]).filter(Boolean);
    if (qs.length === 0) { st.activeSession = null; Store.save(); return false; }
    startSession(container, { questions: qs, mode: a.mode, title: a.title, topicId: a.topicId, resume: { idx: a.idx, results: a.results || [] } });
    return true;
  }

  window.Quiz = { esc, renderQuestion, renderOptions, renderFeedback, startSession, resumeIfAny, optionText, bindSimple };
})();
