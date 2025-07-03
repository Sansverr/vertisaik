const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Render'da kalıcı disk için /data klasörünü, yoksa proje klasörünü kullan
const DATA_DIR = process.env.RENDER_DATA_DIR || __dirname;
const DB_PATH = path.join(DATA_DIR, 'database.json');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/results', (req, res) => {
  res.sendFile(path.join(__dirname, 'results.html'));
});

app.get('/api/get-results', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.json({});
    }
    res.status(500).json({ message: "Veriler alınırken hata oluştu." });
  }
});

app.post('/save', async (req, res) => {
  const newSelections = req.body;
  let dataToUpdate = {};
  try {
    const currentData = await fs.readFile(DB_PATH, 'utf8');
    dataToUpdate = JSON.parse(currentData);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      return res.status(500).json({ success: false, message: 'Veritabanı okunurken hata.' });
    }
  }
  try {
    if (Array.isArray(newSelections)) {
      for (const item of newSelections) {
        dataToUpdate[item.processName] = item.selection;
      }
    }
    await fs.writeFile(DB_PATH, JSON.stringify(dataToUpdate, null, 2));
    res.json({ success: true, message: 'Veri başarıyla kaydedildi.' });
  } catch (error) {
    console.error("Yazma hatası:", error); // Hatayı log'da daha detaylı görelim
    res.status(500).json({ success: false, message: 'Veri kaydedilirken hata oluştu.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
