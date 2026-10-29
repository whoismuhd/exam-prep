# Soru yazım kılavuzu (ajanlar için)

Amaç: VakıfBank 2026 BT Müfettiş/Kontrolör Yardımcılığı yazılı sınavının **Bilgisayar Mühendisliği Alan Bilgisi** bölümü için özgün, teknik açıdan doğru, öğretici çoktan seçmeli sorular yazmak. Aday bilgisayar mühendisliği mezunu bir kişidir. Sorular bir bankanın BT denetim (IT audit) ve iç kontrol birimine girecek kişiye uygun olmalıdır.

## Dosya ve şema

Her ajan kendisine verilen konular için `data/bank/<GRUP>.json` dosyasına **bir JSON dizisi** yazar. Dizideki her öğe tam olarak şu alanları içerir:

```json
{
  "id": "NET-001",
  "topic": "NET",
  "subtopic": "IP adresleme ve subnetting",
  "difficulty": "orta",
  "question": "Bir bankanın şube ağında 192.168.10.0/26 bloğu kullanılmaktadır. Bu alt ağdaki kullanılabilir host adresi sayısı ve yayın (broadcast) adresi aşağıdakilerden hangisinde doğru verilmiştir?",
  "code": null,
  "codeLanguage": null,
  "options": [
    {"id": "A", "text": "64 host, 192.168.10.64"},
    {"id": "B", "text": "62 host, 192.168.10.63"},
    {"id": "C", "text": "30 host, 192.168.10.31"},
    {"id": "D", "text": "126 host, 192.168.10.127"},
    {"id": "E", "text": "62 host, 192.168.10.255"}
  ],
  "correctAnswer": "B",
  "explanation": "/26 önekinde ağ biti 26, host biti 32-26 = 6'dır. 2^6 = 64 adres vardır; ağ adresi (192.168.10.0) ve yayın adresi düşülünce 62 kullanılabilir host kalır. Blok 0-63 aralığını kapsadığından yayın adresi 192.168.10.63 olur.",
  "optionExplanations": {
    "A": "64, bloktaki toplam adres sayısıdır; ağ ve yayın adresleri çıkarılmamıştır. 192.168.10.64 ise bir sonraki alt ağın ağ adresidir.",
    "B": "Doğru. 2^6 - 2 = 62 host; blok 0-63, yayın adresi .63.",
    "C": "30 host ve .31 yayın adresi /27 (32 adres) için geçerlidir.",
    "D": "126 host ve .127 yayın adresi /25 (128 adres) için geçerlidir.",
    "E": "Host sayısı doğru ancak .255, /24 bloğunun yayın adresidir; /26 bloğu 63'te biter."
  },
  "keyConcept": "Host sayısı = 2^(32 - önek) - 2. Yayın adresi, bloğun son adresidir.",
  "examTip": "Önce blok büyüklüğünü (2^host biti) bulun, sonra ağ adresine blok-1 ekleyerek yayın adresini hesaplayın.",
  "references": ["Kurose & Ross, Computer Networking: A Top-Down Approach, Bölüm 4", "RFC 4632 (CIDR)"],
  "sourceType": "original_practice",
  "reviewStatus": "pending"
}
```

Kurallar:
- `id`: `KONU-001`, `KONU-002`, ... (üç haneli, konu kısaltmasıyla başlar).
- `topic`: yalnızca şu kısaltmalar: IBG, NET, VTYS, VYA, PRG, IS, WEB, ERY, DGY, SDLC, MIM, KRP, BLT, SIB, YIS, RISK, GT.
- `difficulty`: `temel` | `orta` | `ileri`. Her konu için 8 soru: 2 temel, 4 orta, 2 ileri.
- `code`: kod, SQL veya tablo gerekiyorsa buraya düz metin olarak yaz (satır sonları `\n`). Yoksa `null`. `codeLanguage`: "python", "java", "c", "sql", "text" vb.
- Tam 5 seçenek, A-E sırasıyla. Tek bir tartışmasız doğru cevap. Doğru cevabın harfi sorular arasında dengeli dağılsın (hep B olmasın).
- Çeldiriciler mantıklı ve ayırt edilebilir olsun; "hepsi" / "hiçbiri" kullanma.
- `optionExplanations`: beş seçeneğin her biri için neden doğru/yanlış olduğunu **o seçeneğe özgü** biçimde açıkla. "Yanlıştır çünkü doğru cevap B" gibi genel açıklama yasak. Yanlış seçenek tipik bir yanılgıya dayanıyorsa yanılgıyı adlandır.
- `explanation`: en az 2-3 cümle; hesaplama, kod çıktısı, SQL sonucu veya mantık adımlarını göster.
- `simpleExplanation` (zorunlu): Doğru cevabı, konuyu ilk kez duyan birine anlatır gibi 3-6 cümleyle, mümkünse günlük hayattan bir benzetmeyle açıkla. Jargon kullanma; kullanmak zorundaysan hemen yanında açıkla. Bu metin, aday soruyu doğru bilse bile "Basitçe anlat" düğmesiyle gösterilir.
- `references`: gerçek ve bilinen kaynak adları (ders kitabı + bölüm, RFC numarası, OWASP Top 10, NIST SP 800-xx, BDDK yönetmeliği, ISO/IEC 27001, COBIT 2019, ITIL 4, resmî dokümantasyon). URL uydurma; emin olmadığın URL'yi yazma.
- Dil: doğru ve akıcı Türkçe. Teknik terimin ilk geçişinde İngilizcesini parantez içinde ver. Türkçe karakterleri doğru kullan (ı, İ, ş, ğ, ü, ö, ç).
- Tanım ezberi soruları en fazla 2/8 olsun. Geri kalanı: kod çıktısı, SQL sonucu, hesaplama, senaryo analizi, karşılaştırma, "bu riske hangi kontrol" tipi sorular.
- Bankacılık senaryolarını özellikle ERY, DGY, RISK, YIS, SIB, IBG konularında kullan (ör. çekirdek bankacılık sistemi, şube, ATM, mobil bankacılık, yetkili kullanıcı, üretim ortamına geçiş, felaket kurtarma merkezi). BDDK "Bankaların Bilgi Sistemleri ve Elektronik Bankacılık Hizmetleri Hakkında Yönetmelik" (2020) kavramlarına (görevler ayrılığı, ayrıcalıklı erişim, iz kayıtları, BS süreklilik planı, değişiklik yönetimi, sızma testi) uygun ol; madde numarası ezberi isteme.
- SQL sorularında ANSI SQL varsay, farklıysa belirt. Kod sorularında dili ve gerekiyorsa sürümü belirt (ör. Python 3, Java 17).
- Her soruyu yazdıktan sonra kendin çöz ve cevabın gerçekten tek ve doğru olduğunu kontrol et. Emin değilsen soruyu değiştir.
- Gerçek sınav sorusu olduğunu asla ima etme.

## Teslim
1. Dosyayı yaz: `data/bank/<GRUP>.json` (UTF-8, geçerli JSON, kök öğe dizi).
2. Şunu çalıştır ve hata kalmayana kadar düzelt: `node scripts/validate-questions.js data/bank/<GRUP>.json`
3. Son raporunda: dosya yolu, soru sayısı, zorluk dağılımı, doğru cevap harfi dağılımı, emin olmadığın sorular (varsa) yaz.
