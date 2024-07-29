document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const headerRow = document.getElementById('header-row');
    const bodyRow = document.getElementById('body-row');
    const downloadTSVButton = document.getElementById('download-tsv');
    const downloadCSVButton = document.getElementById('download-csv');
    
    let headers = new Set();
    let rows = [];

    // Prevent default behavior for drag-and-drop events
    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropArea.style.backgroundColor = '#e0e0e0'; // Visual feedback
    });

    dropArea.addEventListener('dragleave', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropArea.style.backgroundColor = ''; // Remove visual feedback
    });

    dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropArea.style.backgroundColor = ''; // Remove visual feedback

        const files = event.dataTransfer.files;
        console.log('Files dropped:', files); // Debugging
        for (const file of files) {
            if (file.type === 'text/tab-separated-values' || file.type === 'text/tsv' || file.name.endsWith('.tsv')) {
                parseTSV(file);
            } else {
                alert("Only TSV files are supported.");
            }
        }
    });

    function parseTSV(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            console.log('File content:', text); // Debugging
            const lines = text.split('\n').filter(line => line.trim() !== '');

            if (lines.length === 0) return;

            const fileHeaders = lines[0].split('\t').map(header => header.trim());
            fileHeaders.forEach((header, index) => {
                headers.add(header);
            });

            lines.slice(1).forEach(line => {
                const cells = line.split('\t').map(cell => cell.trim());
                const fullRow = Array.from(headers).map(header => {
                    const index = fileHeaders.indexOf(header);
                    return index >= 0 ? cells[index] : '';
                });
                rows.push(fullRow);
            });

            updateTable();
        };
        reader.readAsText(file);
    }

    function updateTable() {
        const headerArray = Array.from(headers);

        // Update header row
        headerRow.innerHTML = '';
        headerArray.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });

        // Update body rows
        bodyRow.innerHTML = '';
        rows.forEach(row => {
            const tr = document.createElement('tr');
            headerArray.forEach((header, index) => {
                const td = document.createElement('td');
                td.textContent = row[index] || '';
                tr.appendChild(td);
            });
            bodyRow.appendChild(tr);
        });

        console.log('Headers:', headerArray);
        console.log('Rows:', rows);
    }

    function downloadFile(data, filename, mime) {
        const blob = new Blob([data], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function generateTSV() {
        const headerArray = Array.from(headers);
        const tsv = [
            headerArray.join('\t'),
            ...rows.map(row => headerArray.map(header => row[headerArray.indexOf(header)] || '').join('\t'))
        ].join('\n');
        return tsv;
    }

    function generateCSV() {
        const headerArray = Array.from(headers);
        const csv = [
            headerArray.join(','),
            ...rows.map(row => headerArray.map(header => `"${row[headerArray.indexOf(header)] || ''}"`).join(','))
        ].join('\n');
        return csv;
    }

    downloadTSVButton.addEventListener('click', () => {
        const tsv = generateTSV();
        downloadFile(tsv, 'table-data.tsv', 'text/tab-separated-values');
    });

    downloadCSVButton.addEventListener('click', () => {
        const csv = generateCSV();
        downloadFile(csv, 'table-data.csv', 'text/csv');
    });
});
