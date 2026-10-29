/* i18n.js – arayüz dili: Türkçe (varsayılan) ve İngilizce.
   Soru içerikleri ve notlar sınav dili olan Türkçedir; burada yalnızca arayüz metinleri çevrilir. */
(function () {
  'use strict';
  const DICT = {
    tr: {
      'app.title': 'Bilgisayar Mühendisliği Sınav Hazırlık',
      'app.subtitle': 'VakıfBank 2026 · Alan Bilgisi · 40 soru',
      'app.brand': 'BM Sınav Hazırlık',
      'app.brandSub': 'VakıfBank 2026 · Alan Bilgisi',
      'app.lang': 'EN', 'app.langLabel': 'Switch to English',
      'app.loading': 'Yükleniyor…',
      'app.loadError': 'Veriler yüklenemedi. Siteyi bir web sunucusu üzerinden açın. Hata: {msg}',
      'app.storageWarn': 'Tarayıcı depolaması kapalı: ilerleme kaydedilmeyecek.',
      'app.corrupt': 'Kayıtlı ilerleme okunamadı ve sıfırlandı.',
      'app.disclaimer': 'Resmî olmayan hazırlık sitesi. Sorular özgündür, geçmiş sınav sorusu değildir. İlerleme bu tarayıcıda saklanır.',
      'app.settingsLink': 'Ayarlar', 'app.menu': 'Menü', 'app.skip': 'İçeriğe geç',
      'app.loveNote': 'Güzel kızım için, sevgiyle yapıldı. ❤️\nHazırlığında ve sınavlarında her şeyin en iyisini diliyorum. Sana inanıyorum ve seninle gurur duyuyorum. ❤️',

      'nav.home': 'Ana Sayfa', 'nav.topics': 'Konu Çalış', 'nav.exam': 'Deneme Sınavı', 'nav.review': 'Yanlışlarımı Tekrar Et',
      'nav.progress': 'İlerlemem', 'nav.notes': 'Konu Notları', 'nav.plan': 'Çalışma Planı', 'nav.settings': 'Ayarlar',
      'nav.mix': 'Karışık', 'nav.examShort': 'Deneme', 'nav.reviewShort': 'Yanlışlarım', 'nav.notesShort': 'Notlar', 'nav.planShort': 'Plan',

      'common.byTopic': 'Konu bazında', 'common.yes': 'Evet', 'common.no': 'Hayır', 'common.ok': 'Tamam',
      'common.accuracy': 'Doğruluk', 'common.attempts': 'deneme',

      'home.examFacts': 'Sınav hakkında',
      'home.fact1': '140 soru, 210 dakika: Genel Yetenek 60 + İngilizce 40 + Alan Bilgisi 40. Yanlış puan düşürmez; boş bırakma.',
      'home.fact2': 'Barajlar: İngilizce %50, Genel Yetenek %70, toplam 70 doğru. Sıralama toplam doğruya göre; bilgisayar mühendisliği grubundan ilk 25 kişi mülakata çağrılır.',
      'home.fact3': 'Bu site yalnızca Alan Bilgisi bölümünü kapsar.',
      'home.totalQ': 'Soru', 'home.done': 'Çözülen', 'home.accuracy': 'Doğruluk', 'home.revision': 'Tekrar bekleyen',
      'home.topicsStudied': 'Çalışılan konu', 'home.exams': 'Deneme',
      'home.actTopics': 'Konu Çalış', 'home.actTopicsD': '17 konu, anında geri bildirim',
      'home.actExam': 'Deneme Sınavı', 'home.actExamD': '40 soru, cevaplar sonunda',
      'home.actReview': 'Yanlışlarımı Tekrar Et', 'home.actReviewD': '{n} soru bekliyor',
      'home.actProgress': 'İlerlemem', 'home.actProgressD': 'Konu bazında sonuçlar',
      'home.placementTitle': 'Seviye belirleme testi',
      'home.placementText': '20 soru, her konudan en az bir tane. Güçlü ve zayıf konularını gösterir.',
      'home.placementBtn': 'Başla',
      'home.topicProgress': 'Konular',
      'home.recs': 'Öneriler',
      'home.noRecs': 'Birkaç soru çözünce öneriler burada görünür.',
      'home.daysLeft': 'Sınava {n} gün', 'home.examToday': 'Sınav bugün. Başarılar!', 'home.examPassed': 'Sınav tarihi geçti.',

      'topics.title': 'Konu Çalış',
      'topics.available': '{n} soru', 'topics.done': '{n} çözüldü', 'topics.revision': '{n} tekrar', 'topics.start': 'Çalış',
      'topic.howMany': 'Kaç soru?', 'topic.allN': 'Tümü ({n})', 'topic.custom': 'Özel sayı', 'topic.customStart': 'Başla',
      'mix.title': 'Karışık Çalışma', 'mix.desc': 'Tüm konulardan rastgele sorular', 'mix.max': 'En fazla {n}', 'topic.noQuestions': 'Bu konuda henüz soru yok.', 'topic.notesLink': 'Konu notları',

      'q.options': 'Seçenekler', 'q.codeLabel': 'Kod veya tablo', 'q.counter': 'Soru {n} / {total}', 'q.questionN': 'Soru {n}',
      'q.correctSoFar': 'Doğru', 'q.check': 'Cevabı Kontrol Et', 'q.endSession': 'Bitir', 'q.next': 'Sonraki Soru →',
      'q.finish': 'Tamamla', 'q.confirmEnd': 'Oturumu şimdi bitirmek istiyor musun? Cevapların kaydedildi.',
      'q.sessionDone': 'Oturum tamamlandı', 'q.summary': '{total} soru · {correct} doğru · {wrong} yanlış · %{pct}',
      'q.wrongList': 'Yanlışlar', 'q.addedToQueue': 'Tekrar kuyruğuna eklendi.', 'q.allCorrect': 'Hepsi doğru.',
      'q.continueTopic': 'Aynı konuda devam', 'q.noQuestions': 'Soru bulunamadı.',
      'q.correctAnswerMark': 'Doğru cevap', 'q.yourAnswerMark': 'Senin cevabın', 'q.yourAnswerCorrectMark': 'Senin cevabın (doğru)',

      'fb.correctTitle': 'Doğru!', 'fb.wrongTitle': 'Yanlış', 'fb.blankTitle': 'Boş bırakıldı',
      'fb.yourAnswer': 'Senin cevabın', 'fb.correctAnswer': 'Doğru cevap', 'fb.whyWrong': 'Seçtiğin seçenek neden yanlış?',
      'fb.whyRight': 'Doğru seçenek neden doğru?', 'fb.otherOptions': 'Diğer seçenekler', 'fb.keyConcept': 'Temel kavram',
      'fb.keyConceptLong': 'Temel kavram', 'fb.examTip': 'Sınav ipucu', 'fb.recommendation': 'Öneri',
      'fb.recommendationText': '{topic} notlarında "{subtopic}" başlığını tekrar et.',
      'fb.sources': 'Kaynak', 'fb.simple': 'Basitçe anlat', 'fb.simpleHide': 'Basit anlatımı gizle', 'fb.simpleTitle': 'Basit anlatım',

      'review.title': 'Yanlışlarımı Tekrar Et',
      'review.intro': 'Bir soru, iki kez üst üste doğru cevaplanınca kuyruktan çıkar.',
      'review.empty': 'Kuyruk boş.',
      'review.count': '{n} soru', 'review.start': 'Tekrara Başla', 'review.startN': 'İlk {n} soru',
      'review.wrongTimes': '{n} yanlış', 'review.streak': '{n} üst üste doğru', 'review.lastWrong': 'son cevap yanlış',
      'review.readExplanation': 'Açıklama', 'review.hide': 'Gizle', 'review.repeatConcepts': 'Zayıf konular',

      'exam.title': '40 Soruluk Deneme',
      'exam.intro': 'Cevaplar sınav bitince gösterilir. Boş bırakma.',
      'exam.timer': 'Süre', 'exam.noTimer': 'Süresiz', 'exam.minutes': '{n} dk', 'exam.start': 'Başla',
      'exam.notEnough': 'Deneme için en az 40 soru gerekir (mevcut: {n}).',
      'exam.question': 'Soru {n}', 'exam.answered': '{a} / {total} cevaplandı', 'exam.prev': '← Önceki', 'exam.next': 'Sonraki →',
      'exam.flag': 'İşaretle', 'exam.unflag': 'İşareti kaldır', 'exam.submit': 'Sınavı Bitir',
      'exam.confirmSubmit': '{blank} soru boş. Sınavı bitirmek istiyor musun?',
      'exam.confirmSubmitFull': 'Sınavı bitirmek istiyor musun?',
      'exam.timeUp': 'Süre doldu, sınav gönderildi.',
      'exam.leave': 'Çık', 'exam.confirmLeave': 'Çıkarsan bu deneme kaydedilmez. Çıkmak istiyor musun?',
      'exam.resultTitle': 'Sonuç', 'exam.score': 'Puan', 'exam.correctN': 'Doğru', 'exam.wrongN': 'Yanlış', 'exam.blankN': 'Boş',
      'exam.byDifficulty': 'Zorluk bazında', 'exam.reviewAll': 'Sorular', 'exam.review': 'İnceleme',
      'exam.newExam': 'Yeni Deneme', 'exam.duration': '{m} dk',
      'exam.resultLegend': 'Yeşil doğru · Kırmızı yanlış · Sarı boş',

      'progress.title': 'İlerlemem', 'progress.uniqueDone': 'Çözülen soru', 'progress.totalAttempts': 'Toplam deneme',
      'progress.byTopic': 'Konu bazında', 'progress.recent': 'Son oturumlar', 'progress.examHistory': 'Denemeler',
      'progress.noSessions': 'Henüz oturum yok.', 'progress.noExams': 'Henüz deneme yok.', 'progress.mostMissed': 'En çok yanlış',
      'progress.mode.practice': 'Konu', 'progress.mode.review': 'Tekrar', 'progress.mode.placement': 'Seviye testi', 'progress.mode.exam': 'Deneme',
      'progress.status.nodata': 'Veri yok', 'progress.status.weak': 'Tekrar et', 'progress.status.mid': 'Gelişiyor', 'progress.status.good': 'İyi',

      'notes.title': 'Konu Notları',
      'notes.summary': 'Özet', 'notes.concepts': 'Kavramlar', 'notes.comparisons': 'Karşılaştırma', 'notes.formulas': 'Formüller',
      'notes.misconceptions': 'Sık yanılgılar', 'notes.example': 'Örnek', 'notes.references': 'Kaynaklar', 'notes.practice': 'Soru çöz',
      'notes.none': 'Not yok.',

      'plan.title': 'Çalışma Planı',
      'plan.intro': '29 Ekim – 14 Kasım, günde yaklaşık 2,5 saat. Genel Yetenek ve İngilizce için ayrıca zaman ayır.',
      'plan.today': 'Bugün', 'plan.mock': 'Deneme', 'plan.minutes': '{n} dk', 'plan.none': 'Plan yok.',

      'settings.title': 'Ayarlar',
      'settings.language': 'Dil', 'settings.tr': 'Türkçe', 'settings.en': 'English',
      'settings.theme': 'Görünüm', 'settings.themeAuto': 'Sistem', 'settings.themeLight': 'Açık', 'settings.themeDark': 'Koyu',
      'settings.timer': 'Deneme süresi (dk)',
      'settings.export': 'İlerlemeyi Dışa Aktar', 'settings.exportHelp': 'Aşağıdaki metni kopyalayıp bir dosyaya kaydet.', 'settings.copy': 'Kopyala', 'settings.copied': 'Kopyalandı.',
      'settings.import': 'İlerlemeyi İçe Aktar', 'settings.importHelp': 'Dışa aktardığın JSON dosyasını seç veya metni yapıştır.', 'settings.importBtn': 'İçe Aktar',
      'settings.importOk': 'İçe aktarıldı.', 'settings.importFail': 'İçe aktarılamadı: {msg}',
      'settings.reset': 'Tüm İlerlemeyi Sıfırla', 'settings.confirmReset': 'Tüm ilerleme silinecek. Devam edilsin mi?',
      'settings.resetDone': 'Sıfırlandı.',
      'settings.bank': 'Soru bankası', 'settings.bankInfo': '{total} soru · {reviewed} incelendi · {pending} bekliyor',
      'settings.saved': 'Kaydedildi.'
    },
    en: {
      'app.title': 'Computer Engineering Exam Prep',
      'app.subtitle': 'VakıfBank 2026 · Subject Knowledge · 40 questions',
      'app.brand': 'CE Exam Prep',
      'app.brandSub': 'VakıfBank 2026 · Subject Knowledge',
      'app.lang': 'TR', 'app.langLabel': 'Türkçeye geç',
      'app.loading': 'Loading…',
      'app.loadError': 'Data could not be loaded. Open the site through a web server. Error: {msg}',
      'app.storageWarn': 'Browser storage is off: progress will not be saved.',
      'app.corrupt': 'Saved progress could not be read and was reset.',
      'app.disclaimer': 'Unofficial study site. Questions are original, not past exam questions. Progress is stored in this browser.',
      'app.settingsLink': 'Settings', 'app.menu': 'Menu', 'app.skip': 'Skip to content',
      'app.loveNote': 'Made with love, just for my beautiful girl. ❤️\nWishing you all the best with your preparation and exams. I believe in you, and I\'m so proud of you. ❤️',

      'nav.home': 'Home', 'nav.topics': 'Study by Topic', 'nav.exam': 'Mock Exam', 'nav.review': 'Review My Mistakes',
      'nav.progress': 'My Progress', 'nav.notes': 'Topic Notes', 'nav.plan': 'Study Plan', 'nav.settings': 'Settings',
      'nav.mix': 'Mixed', 'nav.examShort': 'Mock', 'nav.reviewShort': 'Mistakes', 'nav.notesShort': 'Notes', 'nav.planShort': 'Plan',

      'common.byTopic': 'By topic', 'common.yes': 'Yes', 'common.no': 'No', 'common.ok': 'OK',
      'common.accuracy': 'Accuracy', 'common.attempts': 'attempts',

      'home.examFacts': 'About the exam',
      'home.fact1': '140 questions, 210 minutes: General Aptitude 60 + English 40 + Subject Knowledge 40. No negative marking; never leave a blank.',
      'home.fact2': 'Thresholds: English 50%, General Aptitude 70%, 70 correct in total. Ranking is by total correct; the top 25 in the computer engineering group go to interview.',
      'home.fact3': 'This site covers only the Subject Knowledge section.',
      'home.totalQ': 'Questions', 'home.done': 'Answered', 'home.accuracy': 'Accuracy', 'home.revision': 'To review',
      'home.topicsStudied': 'Topics studied', 'home.exams': 'Mocks',
      'home.actTopics': 'Study by Topic', 'home.actTopicsD': '17 topics, instant feedback',
      'home.actExam': 'Mock Exam', 'home.actExamD': '40 questions, answers at the end',
      'home.actReview': 'Review My Mistakes', 'home.actReviewD': '{n} questions waiting',
      'home.actProgress': 'My Progress', 'home.actProgressD': 'Results by topic',
      'home.placementTitle': 'Placement test',
      'home.placementText': '20 questions, at least one per topic. Shows your strong and weak topics.',
      'home.placementBtn': 'Start',
      'home.topicProgress': 'Topics',
      'home.recs': 'Recommendations',
      'home.noRecs': 'Recommendations appear after you answer a few questions.',
      'home.daysLeft': '{n} days to the exam', 'home.examToday': 'The exam is today. Good luck!', 'home.examPassed': 'The exam date has passed.',

      'topics.title': 'Study by Topic',
      'topics.available': '{n} questions', 'topics.done': '{n} answered', 'topics.revision': '{n} to review', 'topics.start': 'Study',
      'topic.howMany': 'How many questions?', 'topic.allN': 'All ({n})', 'topic.custom': 'Custom number', 'topic.customStart': 'Start',
      'mix.title': 'Mixed Practice', 'mix.desc': 'Random questions from all topics', 'mix.max': 'Up to {n}', 'topic.noQuestions': 'No questions in this topic yet.', 'topic.notesLink': 'Topic notes',

      'q.options': 'Options', 'q.codeLabel': 'Code or table', 'q.counter': 'Question {n} / {total}', 'q.questionN': 'Question {n}',
      'q.correctSoFar': 'Correct', 'q.check': 'Check Answer', 'q.endSession': 'End', 'q.next': 'Next Question →',
      'q.finish': 'Finish', 'q.confirmEnd': 'End the session now? Your answers are saved.',
      'q.sessionDone': 'Session complete', 'q.summary': '{total} questions · {correct} correct · {wrong} wrong · {pct}%',
      'q.wrongList': 'Mistakes', 'q.addedToQueue': 'Added to your review queue.', 'q.allCorrect': 'All correct.',
      'q.continueTopic': 'Continue in this topic', 'q.noQuestions': 'No questions found.',
      'q.correctAnswerMark': 'Correct answer', 'q.yourAnswerMark': 'Your answer', 'q.yourAnswerCorrectMark': 'Your answer (correct)',

      'fb.correctTitle': 'Correct!', 'fb.wrongTitle': 'Incorrect', 'fb.blankTitle': 'Left blank',
      'fb.yourAnswer': 'Your answer', 'fb.correctAnswer': 'Correct answer', 'fb.whyWrong': 'Why your choice is wrong',
      'fb.whyRight': 'Why the correct option is right', 'fb.otherOptions': 'Other options', 'fb.keyConcept': 'Key concept',
      'fb.keyConceptLong': 'Key concept', 'fb.examTip': 'Exam tip', 'fb.recommendation': 'Tip',
      'fb.recommendationText': 'Revise "{subtopic}" in the {topic} notes.',
      'fb.sources': 'Sources', 'fb.simple': 'Explain simply', 'fb.simpleHide': 'Hide simple explanation', 'fb.simpleTitle': 'In simple terms',

      'review.title': 'Review My Mistakes',
      'review.intro': 'A question leaves the queue after two correct answers in a row.',
      'review.empty': 'The queue is empty.',
      'review.count': '{n} questions', 'review.start': 'Start Review', 'review.startN': 'First {n}',
      'review.wrongTimes': '{n} wrong', 'review.streak': '{n} correct in a row', 'review.lastWrong': 'last answer wrong',
      'review.readExplanation': 'Explanation', 'review.hide': 'Hide', 'review.repeatConcepts': 'Weak topics',

      'exam.title': '40-Question Mock',
      'exam.intro': 'Answers are shown after you finish. Do not leave blanks.',
      'exam.timer': 'Timer', 'exam.noTimer': 'No timer', 'exam.minutes': '{n} min', 'exam.start': 'Start',
      'exam.notEnough': 'A mock needs at least 40 questions (available: {n}).',
      'exam.question': 'Question {n}', 'exam.answered': '{a} / {total} answered', 'exam.prev': '← Previous', 'exam.next': 'Next →',
      'exam.flag': 'Flag', 'exam.unflag': 'Remove flag', 'exam.submit': 'Finish Exam',
      'exam.confirmSubmit': '{blank} questions are blank. Finish the exam?',
      'exam.confirmSubmitFull': 'Finish the exam?',
      'exam.timeUp': 'Time is up, the exam was submitted.',
      'exam.leave': 'Leave', 'exam.confirmLeave': 'This mock will not be saved. Leave?',
      'exam.resultTitle': 'Result', 'exam.score': 'Score', 'exam.correctN': 'Correct', 'exam.wrongN': 'Wrong', 'exam.blankN': 'Blank',
      'exam.byDifficulty': 'By difficulty', 'exam.reviewAll': 'Questions', 'exam.review': 'Review',
      'exam.newExam': 'New Mock', 'exam.duration': '{m} min',
      'exam.resultLegend': 'Green correct · Red wrong · Yellow blank',

      'progress.title': 'My Progress', 'progress.uniqueDone': 'Questions answered', 'progress.totalAttempts': 'Total attempts',
      'progress.byTopic': 'By topic', 'progress.recent': 'Recent sessions', 'progress.examHistory': 'Mocks',
      'progress.noSessions': 'No sessions yet.', 'progress.noExams': 'No mocks yet.', 'progress.mostMissed': 'Most missed',
      'progress.mode.practice': 'Topic', 'progress.mode.review': 'Review', 'progress.mode.placement': 'Placement', 'progress.mode.exam': 'Mock',
      'progress.status.nodata': 'No data', 'progress.status.weak': 'Review', 'progress.status.mid': 'Improving', 'progress.status.good': 'Good',

      'notes.title': 'Topic Notes',
      'notes.summary': 'Summary', 'notes.concepts': 'Concepts', 'notes.comparisons': 'Comparison', 'notes.formulas': 'Formulas',
      'notes.misconceptions': 'Common mistakes', 'notes.example': 'Example', 'notes.references': 'References', 'notes.practice': 'Practise',
      'notes.none': 'No notes.',

      'plan.title': 'Study Plan',
      'plan.intro': '29 October – 14 November, about 2.5 hours a day. Set aside separate time for General Aptitude and English.',
      'plan.today': 'Today', 'plan.mock': 'Mock', 'plan.minutes': '{n} min', 'plan.none': 'No plan.',

      'settings.title': 'Settings',
      'settings.language': 'Language', 'settings.tr': 'Türkçe', 'settings.en': 'English',
      'settings.theme': 'Appearance', 'settings.themeAuto': 'System', 'settings.themeLight': 'Light', 'settings.themeDark': 'Dark',
      'settings.timer': 'Mock timer (min)',
      'settings.export': 'Export Progress', 'settings.exportHelp': 'Copy the text below and save it to a file.', 'settings.copy': 'Copy', 'settings.copied': 'Copied.',
      'settings.import': 'Import Progress', 'settings.importHelp': 'Choose your exported JSON file or paste its text.', 'settings.importBtn': 'Import',
      'settings.importOk': 'Imported.', 'settings.importFail': 'Import failed: {msg}',
      'settings.reset': 'Reset All Progress', 'settings.confirmReset': 'All progress will be deleted. Continue?',
      'settings.resetDone': 'Reset.',
      'settings.bank': 'Question bank', 'settings.bankInfo': '{total} questions · {reviewed} reviewed · {pending} pending',
      'settings.saved': 'Saved.'
    }
  };

  let lang = 'tr';

  function t(key, vars) {
    const table = DICT[lang] || DICT.tr;
    let s = table[key];
    if (s === undefined) s = DICT.tr[key];
    if (s === undefined) { console.warn('Çeviri eksik:', key); return key; }
    if (vars) for (const k of Object.keys(vars)) s = s.split('{' + k + '}').join(String(vars[k]));
    return s;
  }

  function setLang(l) {
    lang = (l === 'en') ? 'en' : 'tr';
    document.documentElement.lang = lang;
    document.title = t('app.title');
  }

  window.I18n = { t, setLang, getLang: () => lang, DICT };
})();
