/* data.js – soru bankası, konular, notlar ve planı yükler */
(function () {
  'use strict';
  const Data = {
    topics: [], topicById: {}, exam: null, mockExtraTopics: [],
    questions: [], questionById: {}, byTopic: {},
    notes: {}, plan: [],
    ready: false
  };

  async function fetchJSON(path) {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error(path + ' yüklenemedi (' + res.status + ')');
    return res.json();
  }

  Data.load = async function () {
    const [topicsFile, questionsFile, notes, plan, notesEn, planEn, lessons, lessonsEn] = await Promise.all([
      fetchJSON('data/topics.json'),
      fetchJSON('data/questions.json'),
      fetchJSON('data/notes.json').catch(() => ({})),
      fetchJSON('data/plan.json').catch(() => []),
      fetchJSON('data/notes_en.json').catch(() => ({})),
      fetchJSON('data/plan_en.json').catch(() => []),
      fetchJSON('data/lessons.json').catch(() => ({})),
      fetchJSON('data/lessons_en.json').catch(() => ({}))
    ]);
    Data.topics = topicsFile.topics.slice().sort((a, b) => a.order - b.order);
    Data.exam = topicsFile.exam;
    Data.mockExtraTopics = topicsFile.mockExtraTopics || [];
    Data.topics.forEach(t => { Data.topicById[t.id] = t; Data.byTopic[t.id] = []; });

    const list = Array.isArray(questionsFile) ? questionsFile : questionsFile.questions;
    Data.questions = list.filter(q => q && Data.topicById[q.topic]);
    Data.questions.forEach(q => {
      Data.questionById[q.id] = q;
      Data.byTopic[q.topic].push(q);
    });
    Data.notes = notes || {};
    Data.plan = Array.isArray(plan) ? plan : [];
    Data.notesEn = notesEn || {};
    Data.planEn = Array.isArray(planEn) ? planEn : [];
    Data.lessons = lessons || {};
    Data.lessonsEn = lessonsEn || {};
    Data.ready = true;
    return Data;
  };

  const en = () => window.I18n && I18n.getLang() === 'en';
  Data.topicName = id => { const tp = Data.topicById[id]; if (!tp) return id; return en() && tp.name_en ? tp.name_en : tp.name; };
  Data.topicShort = id => { const tp = Data.topicById[id]; if (!tp) return id; return en() && tp.short_en ? tp.short_en : tp.short; };
  Data.difficultyLabel = d => (en()
    ? { temel: 'Basic', orta: 'Intermediate', ileri: 'Advanced' }
    : { temel: 'Temel', orta: 'Orta', ileri: 'İleri' })[d] || d;
  /** Soru nesnesinin geçerli dildeki görünümü (en çevirisi varsa ve dil İngilizce ise birleştirilmiş kopya). */
  Data.localized = q => {
    if (!en() || !q.en) return q;
    const e = q.en;
    return Object.assign({}, q, {
      subtopic: e.subtopic || q.subtopic,
      question: e.question || q.question,
      options: q.options.map(o => ({ id: o.id, text: (e.options && e.options[o.id]) || o.text })),
      explanation: e.explanation || q.explanation,
      optionExplanations: Object.assign({}, q.optionExplanations, e.optionExplanations || {}),
      keyConcept: e.keyConcept || q.keyConcept,
      examTip: e.examTip || q.examTip,
      simpleExplanation: e.simpleExplanation || q.simpleExplanation
    });
  };
  Data.notesFor = id => (en() && Data.notesEn[id]) ? Data.notesEn[id] : Data.notes[id];
  Data.lessonFor = id => (en() && Data.lessonsEn[id]) ? Data.lessonsEn[id] : Data.lessons[id];
  Data.planList = () => (en() && Data.planEn.length) ? Data.planEn : Data.plan;
  Data.priorityLabel = p => (en()
    ? { 'yüksek': 'High priority', 'orta': 'Medium priority', 'tamamlayıcı': 'Supporting' }
    : { 'yüksek': 'Yüksek öncelik', 'orta': 'Orta öncelik', 'tamamlayıcı': 'Tamamlayıcı' })[p] || p;

  window.Data = Data;
})();
