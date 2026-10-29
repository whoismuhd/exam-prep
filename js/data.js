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
    const [topicsFile, questionsFile, notes, plan] = await Promise.all([
      fetchJSON('data/topics.json'),
      fetchJSON('data/questions.json'),
      fetchJSON('data/notes.json').catch(() => ({})),
      fetchJSON('data/plan.json').catch(() => [])
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
    Data.ready = true;
    return Data;
  };

  const en = () => window.I18n && I18n.getLang() === 'en';
  Data.topicName = id => { const tp = Data.topicById[id]; if (!tp) return id; return en() && tp.name_en ? tp.name_en : tp.name; };
  Data.topicShort = id => { const tp = Data.topicById[id]; if (!tp) return id; return en() && tp.short_en ? tp.short_en : tp.short; };
  Data.difficultyLabel = d => (en()
    ? { temel: 'Basic', orta: 'Intermediate', ileri: 'Advanced' }
    : { temel: 'Temel', orta: 'Orta', ileri: 'İleri' })[d] || d;
  Data.priorityLabel = p => (en()
    ? { 'yüksek': 'High priority', 'orta': 'Medium priority', 'tamamlayıcı': 'Supporting' }
    : { 'yüksek': 'Yüksek öncelik', 'orta': 'Orta öncelik', 'tamamlayıcı': 'Tamamlayıcı' })[p] || p;

  window.Data = Data;
})();
