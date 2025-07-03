const express = require('express');
const path = require('path');
const fs = require('fs').promises;
// node-fetch'i require ile kullanmak için bu şekilde çağırıyoruz
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const API_KEY = process.env.JSONBIN_API_KEY;
const BIN_ID = process.env.JSONBIN_BIN_ID;
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/results', (req, res) => {
  res.sendFile(path.join(__dirname, 'results.html'));
});

// Veritabanındaki tüm verileri gönderen API (GELİŞMİŞ HATA AYIKLAMA İLE)
app.get('/api/get-results', async (req, res) => {
  try {
    console.log('Fetching data from JSONBin...'); // 1. Adım: İsteğin başladığını logla
    const response = await fetch(`${BIN_URL}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });

    // 2. Adım: API cevabının başarılı olup olmadığını kontrol et
    if (!response.ok) {
      const errorText = await response.text();
      console.error('JSONBin API Error:', response.status, response.statusText, errorText);
      throw new Error(`JSONBin API Error: ${response.statusText}`);
    }

    console.log('Data fetched successfully.'); // 3. Adım: Başarılı olduğunu logla
    const data = await response.json();
    res.json(data.record || {});

  } catch (error) {
    // 4. Adım: Herhangi bir hatayı detaylıca logla
    console.error('Error in /api/get-results catch block:', error);
    res.status(500).json({ message: "Veriler alınırken hata oluştu." });
  }
});

// Toplu veri kaydetme API'si (aynen kalıyor)
app.post('/save', async (req, res) => {
  try {
    const newSelections = req.body;
    const currentDataResponse = await fetch(`${BIN_URL}/latest`, { headers: { 'X-Master-Key': API_KEY }});
    const currentData = await currentDataResponse.json();
    let dataToUpdate = currentData.record || {};
    if (Array.isArray(newSelections)) {
      for (const item of newSelections) {
        dataToUpdate[item.processName] = item.selection;
      }
    }
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
    console.error("JSONBin save error:", error);
    res.status(500).json({ success: false, message: 'Veri kaydedilirken hata oluştu.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
