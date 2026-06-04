# AllerScan v4 🔍
Barkod tarayıcı + 14 AB alerjeni + Gemini AI analizi

---

## 📁 Klasör yapısı

```
allerscan-v4/
├── server/
│   └── index.js       ← Backend (API key burada, güvende)
├── public/
│   ├── index.html     ← Web sitesi
│   └── manifest.json  ← PWA (telefona uygulama gibi ekle)
├── .env.example       ← API key şablonu
├── .gitignore
└── package.json
```

---

## 🚀 Render.com'a Deploy — Adım Adım

### 1. GitHub hesabı aç (yoksa)
→ https://github.com → Sign up (ücretsiz)

### 2. Yeni repo oluştur
→ GitHub'da "New repository" → İsim: `allerscan` → Create

### 3. Dosyaları yükle
→ "uploading an existing file" linkine tıkla
→ allerscan-v4 klasörünün içindeki TÜM dosyaları sürükle bırak
→ "Commit changes" butonuna bas

### 4. Render.com'a bağlan
→ https://render.com → Google ile giriş yap (ücretsiz)
→ "New +" → "Web Service"
→ "Connect a repository" → GitHub reposunu seç
→ Ayarlar:
  - **Name:** allerscan
  - **Runtime:** Node
  - **Build Command:** `npm install`
  - **Start Command:** `npm start`

### 5. API key ekle
Render'da sol menü → "Environment" → "Add Environment Variable":
- Key: `GEMINI_KEY`
- Value: `AIzaSy...senin_anahtarin...`

### 6. Deploy!
→ "Create Web Service" butonuna bas
→ 2-3 dakika bekle
→ Sana link verir: `https://allerscan.onrender.com`

---

## 📱 Annenin telefonuna uygulama olarak ekle

**iPhone (Safari):**
1. Linki Safari'de aç
2. Alttaki paylaş butonu (kare + ok)
3. "Ana Ekrana Ekle" → Ekle

**Android (Chrome):**
1. Linki Chrome'da aç
2. ⋮ menüsü → "Ana ekrana ekle"

Artık uygulama gibi açılır, tam ekran! 🎉

---

## 🏠 Yerel test (bilgisayarında)

```bash
# .env dosyası oluştur
cp .env.example .env
# .env içine API key yaz

npm install
npm start
# → http://localhost:3000
```

---

## ❓ Sık sorulan sorular

**Barkod okutunca "Ürün bulunamadı" diyorsa?**
Open Food Facts'te o ürün yok demektir. Alt kısımdaki kutuya barkod numarasını yazarak da deneyebilirsin.

**Render ücretsiz mi?**
Evet, ücretsiz planda ayda 750 saat çalışma hakkı var. Küçük bir site için fazlasıyla yeterli.

**Render'da site uykuya dalıyor mu?**
Ücretsiz planda 15 dakika kullanılmazsa uyuyor, ilk açılışta 30 saniye bekleyebilir. Ücretli plan ($7/ay) ile sürekli açık kalır.

---

*Annen için başarılar! 💛*
