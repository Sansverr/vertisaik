window.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('results-container');

    try {
        const response = await fetch('/api/get-results');
        const results = await response.json();
        container.innerHTML = ''; 

        if (Object.keys(results).length === 0) {
            container.innerHTML = '<p>Henüz kaydedilmiş bir sonuç bulunmuyor.</p>';
            return;
        }

        for (const processName in results) {
            const selection = results[processName];

            const resultElement = document.createElement('div');
            resultElement.className = 'result-item';
            resultElement.innerHTML = `<strong>${processName}:</strong> ${selection}`;

            container.appendChild(resultElement);
        }

    } catch (error) {
        console.error('Sonuçlar alınırken hata oluştu:', error);
        container.innerHTML = '<p>Sonuçlar yüklenirken bir hata oluştu.</p>';
    }
});