#!/usr/bin/env python3
"""Uçtan uca test: yerel HTTP sunucusu + Playwright (headless Chromium).
Kullanım: python3 scripts/e2e-test.py
Kontrol edilen akışlar: ana sayfa, konu seçimi, alıştırma (doğru + yanlış cevap, geri bildirim),
yanlış kuyruğu, tekrar oturumu, 40 soruluk deneme (gezinme, gönderim, sonuç, inceleme),
yeniden yükleme sonrası kalıcılık, dışa/içe aktarma, sıfırlama, dil değişimi, mobil görünüm,
bozuk kayıt verisi, konsol hatası yokluğu.
"""
import json, os, subprocess, sys, time, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8765
BASE = f"http://127.0.0.1:{PORT}/"

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def serve():
    handler = functools.partial(Quiet, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), handler) as httpd:
        httpd.serve_forever()

threading.Thread(target=serve, daemon=True).start()
time.sleep(0.5)

bank = json.load(open(os.path.join(ROOT, "data", "questions.json"), encoding="utf-8"))["questions"]
by_id = {q["id"]: q for q in bank}
failures = []
def check(cond, msg):
    print(("  ok   " if cond else "  FAIL ") + msg)
    if not cond: failures.append(msg)

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": 1200, "height": 900}, locale="tr-TR")
    page = ctx.new_page()
    console_errors = []
    page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: console_errors.append(str(e)))

    print("1. Ana sayfa")
    page.goto(BASE + "#/"); page.wait_for_selector(".stat")
    check("Bebis" in page.title(), "başlık")
    check(page.locator(".action-card").count() == 5, "5 ana eylem")
    check(str(len(bank)) in page.locator(".stat").first.inner_text(), "toplam soru sayısı gerçek bankayla uyuşuyor")
    check(page.locator("#loveNote").inner_text().strip() != "", "footer notu görünüyor")

    print("2. Konu seçimi ve alıştırma")
    page.click("a[href='#/konular']"); page.wait_for_selector(".topic-card")
    check(page.locator(".topic-card").count() == 17, "17 konu kartı")
    page.click(".topic-card:nth-child(2) a.btn"); page.wait_for_selector("[data-n]")
    page.click("[data-n='5']"); page.wait_for_selector("#qform")
    qid = page.locator("input[type=radio]").first.get_attribute("name").replace("q_", "")
    q = by_id[qid]
    check(page.locator("#checkBtn").is_disabled(), "seçim yapılmadan kontrol düğmesi kapalı")
    # Doğru cevap
    page.check(f"input[name='q_{qid}'][value='{q['correctAnswer']}']")
    page.click("#checkBtn"); page.wait_for_selector(".feedback.ok")
    check("Doğru" in page.locator(".feedback.ok h3").inner_text(), "doğru cevap geri bildirimi")
    check(page.locator("#checkBtn").is_disabled(), "çift gönderim engellendi")
    page.click("#nextBtn"); page.wait_for_selector("#qform")
    # Yanlış cevap
    qid2 = page.locator("input[type=radio]").first.get_attribute("name").replace("q_", "")
    q2 = by_id[qid2]
    wrong = next(o["id"] for o in q2["options"] if o["id"] != q2["correctAnswer"])
    page.check(f"input[name='q_{qid2}'][value='{wrong}']")
    page.click("#checkBtn"); page.wait_for_selector(".feedback.bad")
    fb = page.locator(".feedback.bad").inner_text()
    check("Yanlış" in fb, "yanlış cevap başlığı")
    check(q2["optionExplanations"][wrong][:30] in fb, "seçilen seçeneğe özgü açıklama gösterildi")
    check(q2["explanation"][:30] in fb, "doğru cevabın açıklaması gösterildi")
    check(page.locator(".option.wrong").count() == 1 and page.locator(".option.correct").count() == 1, "yanlış ve doğru seçenekler metinle işaretlendi")
    check("cevabın" in page.locator(".option.wrong .mark").inner_text(), "renk dışında metin işareti var")
    page.click("#quitBtn"); page.click("#modalOk")
    page.wait_for_selector("text=Oturum Tamamlandı")
    saved = page.evaluate("JSON.parse(localStorage.getItem('bmSinavHazirlik.v1'))")
    check(saved["questions"][qid2]["wrong"] == 1, "yanlış cevap kaydedildi")
    check(saved["questions"][qid]["correct"] == 1, "doğru cevap kaydedildi")

    print("3. Yanlış kuyruğu ve tekrar")
    page.goto(BASE + "#/yanlislar"); page.wait_for_selector("#reviewAll")
    check("(1)" in page.locator("#reviewAll").inner_text(), "kuyrukta 1 soru")
    page.click("[data-show]"); page.wait_for_selector(".feedback")
    check(page.locator(".feedback").count() == 1, "kuyrukta açıklama açılıyor")
    page.click("#reviewAll"); page.wait_for_selector("#qform")
    check(page.locator("input[type=radio]").first.get_attribute("name") == f"q_{qid2}", "tekrar oturumu yanlış soruyu getirdi")
    page.check(f"input[name='q_{qid2}'][value='{q2['correctAnswer']}']"); page.click("#checkBtn"); page.wait_for_selector(".feedback.ok")
    page.click("#nextBtn"); page.wait_for_selector("text=Oturum Tamamlandı")
    saved = page.evaluate("JSON.parse(localStorage.getItem('bmSinavHazirlik.v1'))")
    check(saved["questions"][qid2]["streak"] == 1 and saved["questions"][qid2]["attempts"] == 2, "deneme sayısı ve seri takibi")
    page.click("a[href='#/yanlislar']"); page.wait_for_selector("#reviewAll")
    check("(1)" in page.locator("#reviewAll").inner_text(), "tek doğrudan sonra soru kuyrukta kalıyor (2 ardışık doğru kuralı)")

    print("4. Deneme sınavı")
    page.goto(BASE + "#/deneme"); page.wait_for_selector("#startExam")
    page.select_option("#timerSel", "60"); page.click("#startExam"); page.wait_for_selector(".qnav")
    check(page.locator(".qnav button").count() == 40, "40 soru")
    check(page.locator("#examTimer").inner_text().startswith("59") or page.locator("#examTimer").inner_text().startswith("60"), "zamanlayıcı çalışıyor")
    ids = page.evaluate("Array.from(document.querySelectorAll('.qnav button')).map(b=>b.textContent)")
    check(len(set(ids)) == 40, "numaralar benzersiz")
    # Soruların topic dağılımı: her konu en az 2? bankaya bağlı; en az 17 konu temsil
    page.click("input[type=radio][value='A']"); page.click("#nextBtn"); page.wait_for_selector("#examForm")
    page.click(".qnav button[data-i='0']"); page.wait_for_selector("#examForm")
    check(page.locator("input[type=radio][value='A']").is_checked(), "cevap gezinmede korunuyor")
    check(page.locator(".feedback").count() == 0, "deneme sırasında açıklama gizli")
    page.click("#flagBtn"); check("flagged" in page.locator(".qnav button[data-i='0']").get_attribute("class"), "işaretleme")
    # Tüm sorulara cevap ver: doğru cevapların yarısı
    answered_ids = []
    for i in range(40):
        page.click(f".qnav button[data-i='{i}']"); page.wait_for_selector("#examForm")
        qname = page.locator("input[type=radio]").first.get_attribute("name"); qq = by_id[qname.replace("q_", "")]
        answered_ids.append(qq["id"])
        if i % 2 == 0:
            page.check(f"input[name='{qname}'][value='{qq['correctAnswer']}']")
        elif i % 4 == 1:
            w = next(o["id"] for o in qq["options"] if o["id"] != qq["correctAnswer"]); page.check(f"input[name='{qname}'][value='{w}']")
    check(len(set(answered_ids)) == 40, "deneme içinde tekrar eden soru yok")
    topics_in_exam = {by_id[i]["topic"] for i in answered_ids}
    check(len(topics_in_exam) == 17, f"17 konunun tamamı temsil ediliyor ({len(topics_in_exam)})")
    page.click("#submitBtn"); page.click("#modalOk"); page.wait_for_selector("h1:has-text('Sonuç')")
    res = page.locator(".stat").all_inner_texts()
    check(any("20 / 40" in r for r in res), "puan 20/40 doğru hesaplandı")
    check(any("10" in r for r in res), "boş sayısı 10")
    page.click(".qnav button[data-i='1']"); page.wait_for_selector("#reviewCard")
    check(page.locator("#reviewCard .feedback").count() == 1, "sonuç incelemesinde çözüm gösteriliyor")
    saved = page.evaluate("JSON.parse(localStorage.getItem('bmSinavHazirlik.v1'))")
    check(len(saved["exams"]) == 1 and saved["exams"][0]["correct"] == 20 and saved["exams"][0]["blank"] == 10, "deneme kaydedildi")

    print("5. Kalıcılık, ilerleme sayfası, dışa/içe aktarma")
    page.goto(BASE + "#/"); page.reload(); page.wait_for_selector(".stat")
    page.goto(BASE + "#/ilerleme"); page.wait_for_selector("[data-exam]")
    check(page.locator("[data-exam]").count() == 1, "deneme geçmişi yeniden yüklemeden sonra duruyor")
    page.click("[data-exam]"); page.wait_for_selector("#reviewCard")
    check(page.locator("#reviewCard").count() == 1, "geçmiş deneme incelenebiliyor")
    exported = page.evaluate("Store.exportJSON()")
    obj = json.loads(exported); check(obj["version"] == 1 and len(obj["exams"]) == 1, "dışa aktarma geçerli")
    err = page.evaluate("Store.importJSON('{bozuk')"); check(err is not None, "bozuk JSON reddedildi")
    err = page.evaluate("Store.importJSON(JSON.stringify({a:1}))"); check(err is not None, "yanlış biçim reddedildi")
    err = page.evaluate("Store.importJSON(arguments[0])" if False else "(s)=>Store.importJSON(s)", exported); check(err is None, "geçerli içe aktarma")

    print("6. Bozuk kayıt verisi")
    page.evaluate("localStorage.setItem('bmSinavHazirlik.v1','{{{bozuk')"); page.reload(); page.wait_for_selector(".stat")
    check(page.locator(".banner-warn").count() >= 1, "bozuk veri uyarısı ve sıfırlama")
    check(page.evaluate("Progress.overallStats().attempts") == 0, "bozuk veri sonrası temiz durum")

    print("7. Dil değişimi")
    page.click("#langBtn"); page.wait_for_selector("text=Study by Topic")
    check(page.locator("html").get_attribute("lang") == "en", "html lang=en")
    check("Bebis" in page.title(), "başlık (EN)")
    check("Made with love" in page.locator("#loveNote").inner_text(), "footer notu İngilizce")
    page.goto(BASE + "#/konular"); page.wait_for_selector(".topic-card")
    check("Networking" in page.locator(".topic-card").nth(1).inner_text(), "konu adları İngilizce")
    page.click("#langBtn"); page.wait_for_selector("text=Konu Çalış")
    check(page.evaluate("JSON.parse(localStorage.getItem('bmSinavHazirlik.v1')).settings.language") == "tr", "dil tercihi kaydedildi")

    print("8. Ayarlar: sıfırlama")
    page.goto(BASE + "#/ayarlar"); page.wait_for_selector("#resetBtn")
    page.click("#resetBtn"); page.click("#modalOk"); page.wait_for_selector("text=sıfırlandı")
    check(page.evaluate("localStorage.getItem('bmSinavHazirlik.v1')") in (None, "null") or page.evaluate("Progress.overallStats().attempts") == 0, "sıfırlama")

    print("9. Mobil görünüm (375px)")
    mob = browser.new_context(viewport={"width": 375, "height": 740}, locale="tr-TR", device_scale_factor=2, is_mobile=True)
    mp = mob.new_page(); mp.goto(BASE + "#/"); mp.wait_for_selector(".stat")
    check(mp.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"), "yatay taşma yok (ana sayfa)")
    mp.click("#menuBtn"); check(not mp.locator("#mobileNav").evaluate("e=>e.hidden"), "mobil menü açılıyor")
    mp.goto(BASE + "#/deneme"); mp.wait_for_selector("#startExam"); mp.click("#startExam"); mp.wait_for_selector(".qnav")
    check(mp.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"), "yatay taşma yok (deneme)")
    mp.screenshot(path=os.path.join(ROOT, "..", "mobile-exam.png"), full_page=False)
    mob.close()

    print("10. Konu notları ve plan")
    page.goto(BASE + "#/notlar/NET"); page.wait_for_selector("h1")
    check(page.locator("h3").count() >= 2, "NET notları yükleniyor")
    page.goto(BASE + "#/plan"); page.wait_for_selector(".day")
    check(page.locator(".day").count() == 17, "17 günlük plan")

    print("10b. Karışık çalışma ve özel sayı")
    page.goto(BASE + "#/karisik"); page.wait_for_selector("#customForm")
    page.fill("#customN", "7"); page.click("#customForm button[type=submit]"); page.wait_for_selector("#qform")
    check("/ 7" in page.locator(".progress-line").inner_text(), "özel sayı 7 soruluk oturum")
    page.goto(BASE + "#/konu/NET"); page.wait_for_selector("#customForm")
    page.fill("#customN", "99"); page.click("#customForm button[type=submit]"); page.wait_for_selector("#qform")
    check("/ 8" in page.locator(".progress-line").inner_text(), "konu sayfasında özel sayı mevcut soruya sınırlanıyor")

    print("11. Konsol hataları")
    check(len(console_errors) == 0, "konsol hatası yok" + ("" if not console_errors else ": " + "; ".join(console_errors[:3])))

    # Masaüstü ekran görüntüleri
    page.goto(BASE + "#/"); page.wait_for_selector(".stat"); page.screenshot(path=os.path.join(ROOT, "..", "home.png"), full_page=False)
    browser.close()

print()
if failures:
    print(f"{len(failures)} TEST BAŞARISIZ:"); [print(" - " + f) for f in failures]; sys.exit(1)
print("Tüm uçtan uca testler geçti.")
