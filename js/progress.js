/* progress.js – cevap kaydı, istatistik, tekrar kuyruğu, öneriler, deneme seçimi */
(function () {
  'use strict';

  function rec(id) {
    const s = Store.load();
    if (!s.questions[id]) {
      s.questions[id] = { attempts: 0, correct: 0, wrong: 0, streak: 0, lastResult: null, lastAt: null, lastChoice: null };
    }
    return s.questions[id];
  }

  /** Bir cevabı kaydeder. mode: 'practice' | 'review' | 'exam' */
  function recordAnswer(id, choice, isCorrect) {
    const r = rec(id);
    r.attempts += 1;
    if (isCorrect) { r.correct += 1; r.streak += 1; r.lastResult = 'ok'; }
    else { r.wrong += 1; r.streak = 0; r.lastResult = 'bad'; }
    r.lastAt = new Date().toISOString();
    r.lastChoice = choice || null;
    Store.save();
    return r;
  }

  function recordSession(mode, topic, total, correct) {
    const s = Store.load();
    s.sessions.push({ t: new Date().toISOString(), mode, topic: topic || null, total, correct });
    if (s.sessions.length > 100) s.sessions = s.sessions.slice(-100);
    Store.save();
  }

  function recordExam(result) {
    const s = Store.load();
    s.exams.push(result);
    if (s.exams.length > 30) s.exams = s.exams.slice(-30);
    Store.save();
  }

  function getRecord(id) {
    const s = Store.load();
    return s.questions[id] || null;
  }

  /** Tekrar kuyruğu: en az bir kez yanlış yapılmış ve son yanlıştan sonra 2 ardışık doğru gelmemiş sorular.
   *  Sıralama: yanlış sayısı (çok → az), son cevabı yanlış olanlar önce, en eski denenen önce. */
  function revisionQueue() {
    const s = Store.load();
    const out = [];
    for (const id of Object.keys(s.questions)) {
      const r = s.questions[id];
      if (!Data.questionById[id]) continue;
      if (r.wrong > 0 && r.streak < 2) out.push({ id, r });
    }
    out.sort((a, b) => {
      if (b.r.wrong !== a.r.wrong) return b.r.wrong - a.r.wrong;
      const la = a.r.lastResult === 'bad' ? 0 : 1, lb = b.r.lastResult === 'bad' ? 0 : 1;
      if (la !== lb) return la - lb;
      return (a.r.lastAt || '').localeCompare(b.r.lastAt || '');
    });
    return out.map(x => Data.questionById[x.id]);
  }

  function overallStats() {
    const s = Store.load();
    let attempted = 0, attempts = 0, correct = 0;
    const topicsStudied = new Set();
    for (const id of Object.keys(s.questions)) {
      const r = s.questions[id]; const q = Data.questionById[id];
      if (!q || r.attempts === 0) continue;
      attempted += 1; attempts += r.attempts; correct += r.correct;
      topicsStudied.add(q.topic);
    }
    return {
      totalQuestions: Data.questions.length,
      attempted, attempts, correct,
      accuracy: attempts ? Math.round(100 * correct / attempts) : 0,
      revisionCount: revisionQueue().length,
      topicsStudied: topicsStudied.size,
      exams: s.exams.length
    };
  }

  function topicStats(topicId) {
    const s = Store.load();
    let attempted = 0, attempts = 0, correct = 0, revision = 0;
    for (const q of Data.byTopic[topicId] || []) {
      const r = s.questions[q.id];
      if (!r || r.attempts === 0) continue;
      attempted += 1; attempts += r.attempts; correct += r.correct;
      if (r.wrong > 0 && r.streak < 2) revision += 1;
    }
    const total = (Data.byTopic[topicId] || []).length;
    const accuracy = attempts ? Math.round(100 * correct / attempts) : null;
    let status, statusLabel, badge;
    if (attempts < 3) { status = 'nodata'; statusLabel = 'Yeterli veri yok'; badge = ''; }
    else if (accuracy < 60) { status = 'weak'; statusLabel = 'Tekrar önerilir'; badge = 'badge-bad'; }
    else if (accuracy < 80) { status = 'mid'; statusLabel = 'Gelişiyor'; badge = 'badge-warn'; }
    else { status = 'good'; statusLabel = 'İyi durumda'; badge = 'badge-ok'; }
    return { topicId, total, attempted, attempts, correct, accuracy, revision, status, statusLabel, badge };
  }

  function allTopicStats() { return Data.topics.map(t => topicStats(t.id)); }

  /** Öneriler: ölçülen performanstan türetilir; tahmin değildir. */
  function recommendations() {
    const stats = allTopicStats();
    const weak = stats.filter(x => x.status === 'weak').sort((a, b) => a.accuracy - b.accuracy);
    const untouched = stats.filter(x => x.attempts === 0);
    const mid = stats.filter(x => x.status === 'mid').sort((a, b) => a.accuracy - b.accuracy);
    const out = [];
    for (const w of weak) out.push({ topicId: w.topicId, kind: 'weak', text: Data.topicName(w.topicId) + ' konusunda tekrar yapmanız önerilir (doğruluk %' + w.accuracy + ', ' + w.attempts + ' deneme).' });
    for (const m of mid.slice(0, 3)) out.push({ topicId: m.topicId, kind: 'mid', text: Data.topicName(m.topicId) + ' konusunda doğruluk %' + m.accuracy + '; birkaç soru daha çözerek pekiştirin.' });
    if (untouched.length) out.push({ topicId: untouched[0].topicId, kind: 'untouched', text: 'Henüz hiç soru çözmediğiniz ' + untouched.length + ' konu var: ' + untouched.map(u => Data.topicShort(u.topicId)).join(', ') + '.' });
    const rq = revisionQueue().length;
    if (rq > 0) out.push({ topicId: null, kind: 'revision', text: 'Tekrar kuyruğunda ' + rq + ' soru bekliyor. "Yanlışlarımı Tekrar Et" bölümünden başlayın.' });
    return out;
  }

  function recentSessions(n) {
    const s = Store.load();
    return s.sessions.slice(-n).reverse();
  }

  function examHistory() {
    const s = Store.load();
    return s.exams.slice().reverse();
  }

  /** Deterministik karıştırma yardımcıları */
  function shuffle(arr, rnd) {
    const a = arr.slice(); const r = rnd || Math.random;
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /** Konu için alıştırma seti: önce hiç görülmemiş, sonra en eski görülen; aynı grup içinde karışık. */
  function pickForTopic(topicId, n) {
    const s = Store.load();
    const pool = (Data.byTopic[topicId] || []).slice();
    const unseen = shuffle(pool.filter(q => !s.questions[q.id] || s.questions[q.id].attempts === 0));
    const seen = pool.filter(q => s.questions[q.id] && s.questions[q.id].attempts > 0)
      .sort((a, b) => (s.questions[a.id].lastAt || '').localeCompare(s.questions[b.id].lastAt || ''));
    const ordered = unseen.concat(seen);
    return (n === 'all' || n >= ordered.length) ? shuffle(ordered) : shuffle(ordered.slice(0, n));
  }

  /** 40 soruluk deneme: her konudan 2 (34) + mockExtraTopics'ten 1'er (6). Eksik kalan konular en büyük havuzlardan tamamlanır. */
  function buildMockExam(size) {
    size = size || 40;
    const s = Store.load();
    const chosen = []; const used = new Set();
    const rank = q => {
      const r = s.questions[q.id];
      return [r && r.attempts > 0 ? 1 : 0, r && r.lastAt ? r.lastAt : ''];
    };
    const sortedPool = topicId => shuffle(Data.byTopic[topicId] || []).sort((a, b) => {
      const ra = rank(a), rb = rank(b);
      if (ra[0] !== rb[0]) return ra[0] - rb[0];
      return ra[1].localeCompare(rb[1]);
    });
    const take = (topicId, k) => {
      let got = 0;
      for (const q of sortedPool(topicId)) {
        if (got >= k) break;
        if (used.has(q.id)) continue;
        used.add(q.id); chosen.push(q); got++;
      }
      return got;
    };
    for (const t of Data.topics) take(t.id, 2);
    for (const t of Data.mockExtraTopics) take(t, 1);
    // Tamamlama
    if (chosen.length < size) {
      const byAvail = Data.topics.map(t => t.id).sort((a, b) => (Data.byTopic[b].length) - (Data.byTopic[a].length));
      let guard = 0;
      while (chosen.length < size && guard < 200) {
        let added = 0;
        for (const tid of byAvail) { if (chosen.length >= size) break; added += take(tid, 1); }
        if (!added) break;
        guard++;
      }
    }
    return shuffle(chosen.slice(0, size));
  }

  /** Seviye belirleme: 17 konudan 1'er + yüksek öncelikli 3 konudan 1'er = 20 */
  function buildPlacement() {
    const chosen = []; const used = new Set();
    const pick = tid => {
      const pool = shuffle(Data.byTopic[tid] || []);
      for (const q of pool) { if (!used.has(q.id)) { used.add(q.id); chosen.push(q); return; } }
    };
    Data.topics.forEach(t => pick(t.id));
    ['NET', 'VTYS', 'VYA'].forEach(pick);
    return shuffle(chosen);
  }

  window.Progress = {
    recordAnswer, recordSession, recordExam, getRecord, revisionQueue,
    overallStats, topicStats, allTopicStats, recommendations, recentSessions, examHistory,
    pickForTopic, buildMockExam, buildPlacement, shuffle
  };
})();
