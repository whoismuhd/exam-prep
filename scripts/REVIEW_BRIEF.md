# Bağımsız teknik inceleme kılavuzu (inceleyici ajanlar için)

Sen soruları yazan kişi değilsin. Görevin, `data/bank/<GRUP>.json` dosyasındaki her soruyu **sıfırdan, bağımsız olarak çözmek** ve yalnızca gerçekten doğrulayabildiklerini `reviewed` olarak işaretlemektir.

Her soru için sırayla:
1. Önce yalnızca `question`, `code` ve `options` alanlarını oku. `correctAnswer` ve açıklamalara bakmadan soruyu kendin çöz ve cevabını not et. Hesaplama, kod çıktısı, SQL sonucu veya subnet gerektiren sorularda adımları gerçekten yürüt (gerekirse `node -e` veya `python3 -c` ile kodu çalıştır; SQL için mantığı elle izle).
2. Sonra `correctAnswer` ile karşılaştır.
   - Uyuşuyorsa: beş seçeneğin de `optionExplanations` metnini oku; her açıklamanın o seçeneğe özgü ve doğru olduğunu, `explanation` ve `keyConcept` içinde teknik hata olmadığını kontrol et.
   - Uyuşmuyorsa veya birden fazla savunulabilir doğru cevap görüyorsan: soruyu düzelt (soru metnini netleştir, çeldiriciyi değiştir veya cevabı düzelt) ve tüm açıklamaları tutarlı hale getir. Düzeltemiyorsan soruyu `reviewStatus: "pending"` bırak ve `"reviewNote"` alanına nedenini yaz.
3. Türkçe dil ve yazım hatalarını düzelt (ı/i, ş, ğ, ü, ö, ç; "de/da" ayrı yazımı; terim tutarlılığı). Teknik terimin İngilizcesi ilk geçişte parantez içinde olmalı.
4. Çeldiricilerden biri "açıkça saçma" ise onu makul bir yanılgıyla değiştir.
5. `references` alanındaki kaynaklar gerçek ve ilgili olmalı; uydurma URL varsa sil.
6. Her soruya `"simpleExplanation"` alanı ekle (varsa iyileştir): doğru cevabı, konuyu ilk kez duyan birine anlatır gibi 3-6 cümleyle, mümkünse günlük hayattan bir benzetmeyle, jargonsuz açıkla. Bu metin aday soruyu doğru bilse bile "Basitçe anlat" düğmesiyle gösterilir; bu yüzden `explanation` metnini kopyalama, gerçekten daha basit yaz.
7. Kontrolü geçen soruda `"reviewStatus": "reviewed"` yap.

Kurallar:
- `id` alanlarını asla değiştirme.
- Soru sayısını azaltma; silmek yerine düzelt.
- Doğru cevap harflerinin dağılımı aşırı dengesizse (ör. 24 sorunun 12'si C) birkaç sorunun seçenek sırasını değiştir; `correctAnswer` ve `optionExplanations` anahtarlarını buna göre güncelle.
- Bittiğinde çalıştır: `node scripts/validate-questions.js data/bank/<GRUP>.json` (hata sıfır olmalı).

Son raporunda şunları yaz: incelenen soru sayısı, `reviewed` sayısı, düzelttiğin sorular (id + bir cümle: ne yanlıştı), `pending` bıraktıkların ve nedeni.
