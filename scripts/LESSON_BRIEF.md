# Ders içeriği yazım kılavuzu (ajanlar için)

Amaç: VakıfBank 2026 BT Müfettiş/Kontrolör Yardımcılığı sınavının Bilgisayar Mühendisliği Alan Bilgisi bölümü için, konuyu az bilen birinin **sıfırdan öğrenip** sınav düzeyine çıkabileceği Türkçe dersler yazmak. Aday bilgisayar mühendisliği mezunudur ama konuyu unutmuş veya hiç derinleşmemiş olabilir. Dersler sitenin "Öğren" bölümünde gösterilecek; mevcut "Konu Notları" (kısa tekrar özeti) ayrı kalacak, dersi tekrar etme.

## Dosya ve şema

Her ajan kendisine verilen konular için `data/lessons/<GRUP>.json` dosyasına, **konu kısaltması → ders nesnesi** biçiminde bir JSON nesnesi yazar. Konu kısaltmaları: IBG, NET, VTYS, VYA, PRG, IS, WEB, ERY, DGY, SDLC, MIM, KRP, BLT, SIB, YIS, RISK, GT.

```json
{
  "NET": {
    "intro": "Bu konu neyi kapsar, sınavda neden önemli, günlük bankacılıkta nerede karşımıza çıkar? (1 paragraf, 4-6 cümle)",
    "sections": [
      {
        "title": "1. Ağ nedir, katmanlar neden var?",
        "body": "Paragraflar \\n\\n ile ayrılır. Önce basit tanım, sonra gündelik bir benzetme, sonra teknik ayrıntı. Her bölüm bir öncekinin üstüne kurulur. 150-300 kelime.",
        "check": {
          "question": "Kısa bilgi kontrolü sorusu (bölümde anlatılanı ölçer)",
          "options": ["…", "…", "…", "…"],
          "correct": 1,
          "explanation": "Doğru seçenek neden doğru, yanılgı neden yanlış (2-3 cümle)"
        }
      }
    ],
    "workedExamples": [
      { "title": "Örnek: /26 bloğunda host sayısı", "problem": "Problem metni", "steps": ["1. adım …", "2. adım …"], "answer": "Sonuç ve kısa yorum" }
    ],
    "keyTerms": [ { "term": "Alt ağ maskesi (subnet mask)", "definition": "1-2 cümle, sade" } ],
    "commonMistakes": [ "Yanılgı: … Doğrusu: …" ],
    "examTips": [ "Sınavda bu kavram genellikle şöyle sorulur: … Dikkat: …" ],
    "takeaways": [ "Tek cümlelik, akılda kalıcı özet madde" ],
    "quiz": [
      { "question": "Konu sonu mini test sorusu", "options": ["…", "…", "…", "…", "…"], "correct": 3, "explanation": "…" }
    ]
  }
}
```

Miktarlar (her konu için):
- `sections`: 5-7 bölüm, kolaydan zora sıralı; en az 4 bölümde `check` olsun (`check` olmayan bölümde alanı hiç yazma). `check.options` 4 seçenek, `correct` 0 tabanlı indeks.
- `workedExamples`: 2-3 adet; hesaplama/kod/SQL/senaryo içeren konularda adımları gerçekten yürüt. Kod gerekiyorsa `problem` içine düz metin olarak ekle.
- `keyTerms`: 10-16 terim (kart olarak gösterilecek; tanım 1-2 cümle, jargonsuz).
- `commonMistakes`: 4-6, `examTips`: 3-5, `takeaways`: 5-8.
- `quiz`: tam 5 soru, 5 seçenekli (A-E sırasıyla dizi), tek doğru, her birine açıklama. Doğru cevap indeksi dağılımı dengeli olsun.
- Toplam uzunluk konu başına yaklaşık 1500-2200 kelime.

Kurallar:
- Teknik olarak doğru ol. Sayı, port, formül, karmaşıklık, standart adı yazarken emin ol; emin değilsen yazma.
- Dil: açık, sade, doğru Türkçe; teknik terimin ilk geçişinde İngilizcesi parantez içinde. Türkçe karakterler doğru.
- Markdown ve HTML kullanma; düz metin, paragraf ayrımı için `\n\n`, liste gerekirse satır başında "• ".
- Bankacılık / BT denetimi bağlamı: ERY, DGY, RISK, YIS, SIB, IBG, BLT konularında örnekler bankadan olsun; BDDK "Bankaların Bilgi Sistemleri ve Elektronik Bankacılık Hizmetleri Hakkında Yönetmelik" (2020), COBIT 2019, ISO/IEC 27001, ITIL 4 kavramları kavram düzeyinde (madde numarası yok).
- Mevcut soru bankasındaki soruları kopyalama; mini test soruları yeni olsun.
- Kaynak uydurma; gerekiyorsa `takeaways` sonrasına değil, metin içinde "Kurose & Ross" gibi gerçek kitap adlarıyla atıf yap.

## Teslim
1. Dosyayı yaz: `data/lessons/<GRUP>.json` (UTF-8, geçerli JSON).
2. Çalıştır: `node scripts/validate-lessons.js data/lessons/<GRUP>.json` → 0 hata olana kadar düzelt.
3. Raporunda: dosya yolu, konu başına kelime sayısı, emin olmadığın noktalar.
