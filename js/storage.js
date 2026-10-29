/* storage.js – localStorage sarmalayıcı, dışa/içe aktarma, doğrulama */
(function () {
  'use strict';
  const KEY = 'bmSinavHazirlik.v1';
  const VERSION = 1;

  function emptyState() {
    return {
      version: VERSION,
      createdAt: new Date().toISOString(),
      questions: {},   // id -> {attempts, correct, wrong, streak, lastResult, lastAt, lastChoice}
      sessions: [],    // {t, mode, topic, total, correct}
      exams: [],       // {t, total, correct, wrong, blank, byTopic, byDifficulty, questionIds, answers, durationSec, timerMinutes}
      settings: { examTimerMinutes: 60, theme: 'auto' },
      placementDone: false
    };
  }

  let available = true;
  try {
    const t = '__t' + Date.now();
    window.localStorage.setItem(t, '1');
    window.localStorage.removeItem(t);
  } catch (e) {
    available = false;
  }

  let state = null;

  function isValidState(obj) {
    return obj && typeof obj === 'object' &&
      typeof obj.questions === 'object' && obj.questions !== null &&
      Array.isArray(obj.sessions) && Array.isArray(obj.exams) &&
      typeof obj.settings === 'object' && obj.settings !== null;
  }

  function load() {
    if (state) return state;
    if (!available) { state = emptyState(); return state; }
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) { state = emptyState(); return state; }
      const parsed = JSON.parse(raw);
      if (!isValidState(parsed)) throw new Error('bozuk veri');
      state = Object.assign(emptyState(), parsed);
      state.settings = Object.assign(emptyState().settings, parsed.settings || {});
      return state;
    } catch (e) {
      console.warn('Kayıtlı ilerleme okunamadı, sıfırlanıyor:', e);
      state = emptyState();
      state.corruptedNotice = true;
      return state;
    }
  }

  function save() {
    if (!available) return false;
    try {
      const copy = Object.assign({}, state);
      delete copy.corruptedNotice;
      window.localStorage.setItem(KEY, JSON.stringify(copy));
      return true;
    } catch (e) {
      console.warn('Kaydedilemedi:', e);
      return false;
    }
  }

  function reset() {
    state = emptyState();
    if (available) { try { window.localStorage.removeItem(KEY); } catch (e) { /* yok say */ } }
    return state;
  }

  function exportJSON() {
    const copy = Object.assign({}, load());
    delete copy.corruptedNotice;
    copy.exportedAt = new Date().toISOString();
    return JSON.stringify(copy, null, 2);
  }

  /** İçe aktarma: dosya metnini doğrular, geçerliyse mevcut durumu değiştirir. Hata metni döner, başarıda null. */
  function importJSON(text) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { return 'Dosya geçerli bir JSON değil.'; }
    if (!isValidState(obj)) return 'Dosya bu uygulamanın ilerleme biçimine uymuyor.';
    if (obj.version !== VERSION) return 'Dosya sürümü (' + obj.version + ') bu uygulamayla uyumlu değil.';
    // Soru kayıtlarını temizle: yalnızca beklenen alanları ve sayısal değerleri al
    const q = {};
    for (const id of Object.keys(obj.questions)) {
      const r = obj.questions[id];
      if (!r || typeof r !== 'object') continue;
      q[id] = {
        attempts: Number(r.attempts) || 0,
        correct: Number(r.correct) || 0,
        wrong: Number(r.wrong) || 0,
        streak: Number(r.streak) || 0,
        lastResult: r.lastResult === 'ok' ? 'ok' : (r.lastResult === 'bad' ? 'bad' : null),
        lastAt: typeof r.lastAt === 'string' ? r.lastAt : null,
        lastChoice: typeof r.lastChoice === 'string' ? r.lastChoice : null
      };
    }
    state = Object.assign(emptyState(), {
      createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
      questions: q,
      sessions: obj.sessions.filter(s => s && typeof s === 'object').slice(-100),
      exams: obj.exams.filter(s => s && typeof s === 'object').slice(-30),
      settings: Object.assign(emptyState().settings, obj.settings || {}),
      placementDone: !!obj.placementDone
    });
    save();
    return null;
  }

  window.Store = { load, save, reset, exportJSON, importJSON, isAvailable: () => available, KEY };
})();
