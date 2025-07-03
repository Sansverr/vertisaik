// Gerekli olan kütüphaneler
const express = require('express');
const path =require('path');
const fs = require('fs').promises;
// JSONBin.io ile iletişim kurmak için fetch'i ekliyoruz
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Render'ın bize verdiği Ortam Değişkenlerini kullanıyoruz
const API_KEY = process.env.JSONBIN_API_KEY;
const BIN_ID = process.env.JSONBIN_BIN_ID;
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Ana form sayfasını gösterir
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Sonuçlar sayfasını gösterir
app.get('/results', (req, res) => {
  res.sendFile(path.join(__dirname, 'results.html'));
});

// Veritabanındaki tüm verileri JSONBin'den alıp gönderen API
app.get('/api/get-results', async (req, res) => {
  try {
    const response = await fetch(`${BIN_URL}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });
    if (!response.ok) throw new Error('Veri alınamadı');
    const data = await response.json();
    res.json(data.record || {});
  } catch (error) {
    res.status(500).json({ message: "Veriler alınırken hata oluştu." });
  }
});

// Toplu veriyi JSONBin'e kaydeden API
app.post('/save', async (req, res) => {
  try {
    const newSelections = req.body;
    
    // 1. Mevcut veriyi JSONBin'den oku
    const currentDataResponse = await fetch(`${BIN_URL}/latest`, { headers: { 'X-Master-Key': API_KEY }});
    const currentData = await currentDataResponse.json();
    let dataToUpdate = currentData.record || {};
    
    // 2. Yeni seçimleri mevcut veriye ekle/güncelle
    if (Array.isArray(newSelections)) {
      for (const item of newSelections) {
        dataToUpdate[item.processName] = item.selection;
      }
    }

    // 3. Güncellenmiş veriyi JSONBin'e geri yaz
    await fetch(BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify(dataToUpdate)
    });

    res.json({ success: true, message: 'Veri başarıyla kaydedildi.' });
  } catch (error) {
    console.error("JSONBin hatası:", error);
    res.status(500).json({ success: false, message: 'Veri kaydedilirken hata oluştu.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
