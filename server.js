// ============================================================
// AllerScan v4 — Backend Server
// - Open Food Facts'ten ürün bilgisi çeker (barkod ile)
// - Gemini API'ye analiz yaptırır (key burada, güvende)
// - Frontend'e temiz JSON döner
// ============================================================

require('dotenv').config();
const express = require('express');
const fetch   = require('node-fetch');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const GEMINI_KEY = process.env.GEMINI_KEY;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '/')));
// ── Sağlık kontrolü ─────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, version: '4.0' }));

// ── Barkoddan ürün bilgisi ───────────────────────────────────
// Open Food Facts — tamamen ücretsiz, kayıt gerekmez
app.get('/api/product/:barcode', async (req, res) => {
  const { barcode } = req.params;
  try {
    const r = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,ingredients_text,allergens_tags,allergens_imported,image_front_url,brands,countries`,
      { headers: { 'User-Agent': 'AllerScan/4.0 (contact@allerscan.app)' } }
    );
    const data = await r.json();

    if (data.status !== 1) {
      return res.status(404).json({ error: 'Ürün bulunamadı', barcode });
    }

    const p = data.product;
    res.json({
      found:            true,
      name:             p.product_name || 'İsim yok',
      brand:            p.brands       || '',
      ingredients_text: p.ingredients_text || '',
      allergens_tags:   p.allergens_tags   || [],
      image:            p.image_front_url  || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Alerjen analizi (Gemini) ─────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  const { ingredients_text, lang = 'tr' } = req.body;

  if (!ingredients_text) {
    return res.status(400).json({ error: 'ingredients_text zorunlu' });
  }
  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'Sunucuda GEMINI_KEY ayarlanmamış' });
  }

  // Dile göre prompt — Gemini alerjen adlarını o dilde döndürür
  const langName = { tr:'Türkçe', en:'English', fi:'Finnish', sv:'Swedish', ru:'Russian', ar:'Arabic' }[lang] || 'Turkish';

  const prompt = `You are a food allergen expert. Analyze this ingredients text for the 14 mandatory EU allergens.

Ingredients text:
"""
${ingredients_text}
"""

For EACH allergen found, provide:
- allergen_id: number 0-13
- allergen_name: in ${langName}
- trigger_ingredients: exact words that triggered it (array)
- from_may_contain: true if from a "may contain" warning

Also extract any "may contain" / cross-contamination warnings.

Allergen IDs: 0=gluten cereals, 1=crustaceans, 2=eggs, 3=fish, 4=peanuts, 5=soybeans, 6=milk/lactose, 7=tree nuts, 8=celery, 9=mustard, 10=sesame, 11=sulphites, 12=lupin, 13=molluscs

Respond ONLY with valid JSON (no markdown, no backticks):
{"found":[{"allergen_id":0,"allergen_name":"...","trigger_ingredients":["..."],"from_may_contain":false}],"may_contain_warnings":["..."],"confidence":"high"}`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!r.ok) {
      const e = await r.json();
      return res.status(502).json({ error: e.error?.message || 'Gemini API hatası' });
    }

    const d    = await r.json();
    const raw  = (d.candidates?.[0]?.content?.parts?.[0]?.text || '')
                   .replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const result = JSON.parse(raw);
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Diğer tüm istekler → index.html ─────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅ AllerScan çalışıyor → http://localhost:${PORT}`);
  console.log(`   Gemini key: ${GEMINI_KEY ? '✓ yüklendi' : '✗ EKSİK!'}\n`);
});
