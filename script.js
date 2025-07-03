document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('saveButton');

    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                const row = e.target.closest('tr');
                row.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    if (cb !== e.target) {
                        cb.checked = false;
                    }
                });
            }
        });
    });

    saveButton.addEventListener('click', async () => {
        const allSelections = [];
        const rows = document.querySelectorAll('tbody tr');

        rows.forEach(row => {
            if (row.cells.length > 1) { 
                const processName = row.cells[0].textContent.trim();
                const checkboxes = row.querySelectorAll('input[type="checkbox"]');
                let selection = 'Seçim Yok';

                checkboxes.forEach((checkbox, index) => {
                    if (checkbox.checked) {
                        if (index === 0) selection = 'Acil Kurulsun / Değişsin';
                        if (index === 1) selection = 'Planlanarak Kurulsun / Değişsin';
                        if (index === 2) selection = 'Şimdilik Mevcut Kalsın';
                    }
                });

                if (selection !== 'Seçim Yok') {
                    allSelections.push({ processName, selection });
                }
            }
        });

        if (allSelections.length === 0) {
            alert('Lütfen kaydetmeden önce en az bir maddeyi işaretleyin.');
            return;
        }

        try {
            const response = await fetch('/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(allSelections),
            });
            const result = await response.json();
            if (result.success) {
                alert('Değerlendirmeniz başarıyla kaydedildi!');
                saveButton.disabled = true;
                saveButton.textContent = 'Kaydedildi';
            } else {
                alert('Kaydetme sırasında bir hata oluştu.');
            }
        } catch (error) {
            alert('Sunucuya bağlanırken bir hata oluştu.');
        }
    });
});