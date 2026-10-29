# Bilgisayar Mühendisliği Sınav Hazırlık – VakıfBank 2026

VakıfBank 2026 Müfettiş Yardımcısı / BT Müfettiş Yardımcısı / Kontrolör Yardımcısı / BT Kontrolör Yardımcısı yazılı sınavının (15 Kasım 2026) **Bilgisayar Mühendisliği Alan Bilgisi** bölümü (40 soru, 17 konu) için resmî olmayan, bağımsız bir hazırlık uygulaması.

Arayüz Türkçedir; sağ üstteki düğmeyle İngilizceye geçilebilir. Soru içerikleri ve konu notları sınav dili olan Türkçedir.

> Bu site VakıfBank veya İstanbul Üniversitesi ile bağlantılı değildir. Sorular, resmî ilandaki 17 konuya göre yazılmış **özgün hazırlık sorularıdır**; gerçek veya geçmiş sınav sorusu değildir.

## Neler var

- **Konu Çalış:** 17 konu, 5/10/15/tümü soru seçimi, her cevapta anında ve seçeneğe özgü açıklama (neden doğru, neden yanlış, diğer seçenekler, temel kavram, sınav ipucu, kaynak) ve doğru bilinse bile açılabilen "Basitçe anlat" kutusu.
- **Yanlışlarımı Tekrar Et:** Yanlış cevaplanan sorular kuyruğa girer; son yanlıştan sonra iki ardışık doğru gelene kadar kuyrukta kalır. Çok yanlış yapılanlar önce gelir.
- **40 Soruluk Deneme:** Her konudan 2 + ağırlıklı 6 konudan 1 ek soru, karışık sıra, isteğe bağlı süre (varsayılan 60 dk; 210 dk / 140 sorudan türetilmiş çalışma hedefi, resmî süre değildir), işaretleme, gönderim onayı, sonuçta konu ve zorluk bazında dökümle tüm çözümler.
- **İlerlemem:** Konu bazında doğruluk, deneme geçmişi (geçmiş denemeler yeniden incelenebilir), son oturumlar, en çok yanlış yapılan konular.
- **Öneriler:** Ölçülen performanstan türetilir (≥3 deneme ve <%60 doğruluk → "tekrar önerilir"). Sınav sonucunu öngörmez.
- **Seviye belirleme testi:** İlk ziyarette 20 soruluk test (17 konudan 1'er + 3 yüksek öncelikli konudan 1'er).
- **Konu Notları** ve **17 günlük çalışma planı** (29 Ekim – 14 Kasım).
- **İlerleme kaydı:** Tarayıcı `localStorage`; dışa/içe aktarma (JSON, doğrulamalı) ve sıfırlama. Cihazlar arasında eşitlenmez.
- Sunucu, çerez, analitik, harici kütüphane veya kişisel veri yok.

## Sınav gerçekleri (resmî ilan, 2026)

- 140 soru / 210 dk: Genel Yetenek 60, İngilizce 40, Alan Bilgisi 40.
- Yanlış cevap puan düşürmez. **Boş bırakmayın.**
- Barajlar: İngilizce ≥ %50, Genel Yetenek ≥ %70, toplam ≥ 70 doğru. Alan Bilgisi için ayrı baraj yok; sıralama toplam doğru sayısıyla yapılır, bilgisayar mühendisliği grubundan ilk 25 kişi mülakata çağrılır.
- Bu uygulama yalnızca Alan Bilgisi bölümünü kapsar.

## Yerelde çalıştırma

Veriler `fetch` ile yüklendiği için siteyi bir HTTP sunucusu üzerinden açın (`file://` ile tarayıcılar JSON yüklemeyi engeller):

```bash
cd vakifbank-exam-prep
python3 -m http.server 8080
# http://localhost:8080
```

## Dosya yapısı

```
index.html                 tek sayfa uygulama kabuğu
css/style.css              stiller (açık/koyu tema, mobil öncelikli)
js/i18n.js                 TR/EN arayüz metinleri
js/storage.js              localStorage, dışa/içe aktarma, doğrulama
js/data.js                 veri yükleyici
js/progress.js             kayıt, istatistik, tekrar kuyruğu, deneme/seviye testi seçimi
js/ui.js                   sayfa içi onay kutusu
js/quiz.js                 soru görünümü ve anında geri bildirim
js/exam.js                 deneme sınavı
js/app.js                  yönlendirme ve görünümler
data/topics.json           17 konu, sınav bilgileri
data/bank/*.json           soru bankası kaynak dosyaları (konu gruplarına göre)
data/questions.json        build-bank.js ile üretilen birleşik banka (uygulama bunu okur)
data/notes.json            konu notları
data/plan.json             çalışma planı
scripts/validate-questions.js  banka doğrulama
scripts/build-bank.js          bank/*.json → questions.json
scripts/check-i18n.js          çeviri kapsama denetimi
scripts/e2e-test.py            Playwright ile uçtan uca test
scripts/build-artifact.js      tek dosyalık (gömülü CSS/JS) sürüm üretir
```

## Soru biçimi

Her soru `data/bank/` altındaki bir dosyada şu alanlarla yer alır:

```json
{
  "id": "NET-001", "topic": "NET", "subtopic": "Subnetting", "difficulty": "orta",
  "question": "…", "code": null, "codeLanguage": null,
  "options": [{"id":"A","text":"…"}, … {"id":"E","text":"…"}],
  "correctAnswer": "B",
  "explanation": "…", "optionExplanations": {"A":"…","B":"…","C":"…","D":"…","E":"…"},
  "keyConcept": "…", "examTip": "…", "simpleExplanation": "…", "references": ["…"],
  "sourceType": "original_practice", "reviewStatus": "reviewed"
}
```

- `id` benzersiz ve kararlıdır (`KONU-NNN`); mevcut id'leri değiştirmeyin, ilerleme kayıtları id'ye bağlıdır.
- `difficulty`: `temel` | `orta` | `ileri`.
- `simpleExplanation`: jargonsuz, benzetmeli kısa anlatım; "Basitçe anlat" düğmesiyle gösterilir.
- `reviewStatus`: yalnızca bağımsız teknik incelemeden geçen sorular `reviewed` olur.

## Soru ekleme / güncelleme

1. İlgili `data/bank/*.json` dosyasına soruyu ekleyin (veya yeni dosya açın).
2. `node scripts/validate-questions.js data/bank/*.json`
3. `node scripts/build-bank.js`
4. `node scripts/validate-questions.js` (birleşik dosya)
5. Değişiklikleri GitHub'a gönderin; Pages otomatik güncellenir.

Doğrulama betiği biçimi, benzersizliği, 5 seçeneği, tek doğru cevabı, tüm açıklamaları ve konu sayımlarını denetler; teknik doğruluğu kanıtlayamaz. Bu yüzden her soru ayrıca bir inceleyici tarafından yeniden çözülmelidir.

## GitHub Pages'e yayınlama

1. GitHub'da yeni, boş bir depo oluşturun (ör. `vakifbank-computer-engineering-prep`).
2. Bu klasörün içeriğini deponun köküne yükleyin (`index.html` kökte olmalı; `.nojekyll` dosyası dahil).
3. Depo → **Settings → Pages → Build and deployment → Source: Deploy from a branch**, Branch: `main`, klasör `/ (root)`, **Save**.
4. Birkaç dakika sonra site `https://<kullanıcı-adı>.github.io/<depo-adı>/` adresinde yayında olur.

Tüm yollar görelidir; alt dizinde çalışır. Sunucu, derleme adımı veya gizli anahtar gerekmez.

## Testler

```bash
node scripts/validate-questions.js
node scripts/check-i18n.js
python3 scripts/e2e-test.py      # Playwright + yerel sunucu; tüm kullanıcı akışlarını çalıştırır
```

## Bilinen sınırlamalar

- Soru bankası aşamalı büyüyor; her konu için hedef 15 soru (toplam 255). Güncel sayılar Ayarlar sayfasında görünür.
- Otomatik doğrulama teknik doğruluğu kanıtlamaz; `reviewed` etiketi bağımsız bir inceleyicinin soruyu yeniden çözdüğünü gösterir, hatasızlık garantisi değildir. Hatalı bulduğunuz soruyu `id` ile bildirin.
- Statik site olduğundan soru verisi ziyaretçilere açıktır; uygulama öğrenme amaçlıdır, güvenli sınav uygulaması değildir.
- İlerleme yalnızca tarayıcıda saklanır; tarayıcı verisi temizlenirse kaybolur (düzenli dışa aktarın).
- Yalnızca Alan Bilgisi bölümünü kapsar; Genel Yetenek ve İngilizce testleri kapsam dışıdır.
- VakıfBank geçmiş sınav soruları kamuya açık olmadığından konu ağırlıkları ve soru tarzı uzman değerlendirmesine dayanır.
