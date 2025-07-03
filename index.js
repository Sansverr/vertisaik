// Gerekli olan kütüphaneler
const express = require('express');
const path = require('path');
const fs = require('fs').promises; // Dosya işlemleri için Node.js'in kendi modülü

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Veritabanı olarak kullanacağımız JSON dosyasının yolu
const DB_PATH = path.join(__dirname, 'database.json');

// Ana form sayfasını gösterir
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Sonuçlar sayfasını gösterir
app.get('/results', (req, res) => {
  res.sendFile(path.join(__dirname, 'results.html'));
});

// Veritabanındaki tüm verileri gönderen API
app.get('/api/get-results', async (req, res) => {
  try {
    // database.json dosyasını okumayı dene
    const data = await fs.readFile(DB_PATH, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    // Eğer dosya henüz yoksa (ilk çalıştırma gibi), boş bir obje gönder
    if (error.code === 'ENOENT') {
      return res.json({});
    }
    res.status(500).json({ message: "Veriler alınırken hata oluştu." });
  }
});

// Toplu veri kaydetme API'si
app.post('/save', async (req, res) => {
  const newSelections = req.body;
  let dataToUpdate = {};

  try {
    // 1. Mevcut veriyi dosyadan oku
    const currentData = await fs.readFile(DB_PATH, 'utf8');
    dataToUpdate = JSON.parse(currentData);
  } catch (error) {
    // Dosya yoksa, boş bir obje ile başla
    if (error.code !== 'ENOENT') {
      return res.status(500).json({ success: false, message: 'Veritabanı okunurken hata.' });
    }
  }

  try {
    // 2. Yeni seçimleri mevcut veriye ekle/güncelle
    if (Array.isArray(newSelections)) {
      for (const item of newSelections) {
        dataToUpdate[item.processName] = item.selection;
      }
    }

    // 3. Güncellenmiş veriyi tekrar database.json dosyasına yaz
    await fs.writeFile(DB_PATH, JSON.stringify(dataToUpdate, null, 2)); // null, 2 -> dosyayı daha okunaklı yapar
    res.json({ success: true, message: 'Veri başarıyla kaydedildi.' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Veri kaydedilirken hata oluştu.' });
  }
});

// --- RENDER İÇİN DÜZELTİLMİŞ BÖLÜM ---
// Render'ın bize verdiği PORT'u veya yerelde çalışmak için 3000'i kullan
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
