/**
 * GESTION ALFA CAR - Export Functionality
 * Export tables to PDF and Excel
 */

// ============================================================
// Export to PDF using jsPDF + AutoTable
// ============================================================
function exportTableToPDF(tableId, filename, title) {
    // Load jsPDF dynamically if not loaded
    if (typeof window.jspdf === 'undefined') {
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', function() {
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.1/jspdf.plugin.autotable.min.js', function() {
                generatePDF(tableId, filename, title);
            });
        });
    } else {
        generatePDF(tableId, filename, title);
    }
}

function generatePDF(tableId, filename, title) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Header
    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F');
    
    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ALFA CAR', 14, 15);
    
    // Report title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(title || 'Rapport', 14, 25);
    
    // Date
    const today = new Date().toLocaleDateString('fr-FR', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });
    doc.setFontSize(10);
    doc.text('Date: ' + today, doc.internal.pageSize.width - 60, 15);
    
    // Get table data
    const table = document.getElementById(tableId);
    if (!table) {
        console.error('Table not found:', tableId);
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur', 'Tableau non trouvé', 'error');
        }
        return;
    }
    
    // Extract headers (skip checkbox column)
    const headers = [];
    const headerCells = table.querySelectorAll('thead th');
    headerCells.forEach(function(th, index) {
        if (th.querySelector('input[type="checkbox"]')) return;
        if (th.textContent.trim() === 'Actions') return;
        headers.push(th.textContent.trim());
    });
    
    // Extract rows
    const rows = [];
    const bodyRows = table.querySelectorAll('tbody tr');
    bodyRows.forEach(function(tr) {
        if (tr.style.display === 'none') return;
        const row = [];
        const cells = tr.querySelectorAll('td');
        cells.forEach(function(td, index) {
            if (td.querySelector('input[type="checkbox"]')) return;
            // Skip actions column (last column usually)
            const correspondingHeader = headerCells[index];
            if (correspondingHeader && correspondingHeader.textContent.trim() === 'Actions') return;
            row.push(td.textContent.trim());
        });
        if (row.length > 0) {
            rows.push(row);
        }
    });
    
    // Generate table
    doc.autoTable({
        head: [headers],
        body: rows,
        startY: 42,
        theme: 'grid',
        headStyles: {
            fillColor: [233, 69, 96],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 8,
            cellPadding: 3
        },
        alternateRowStyles: {
            fillColor: [245, 245, 250]
        },
        styles: {
            overflow: 'linebreak',
            cellWidth: 'wrap'
        },
        margin: { top: 42, right: 14, bottom: 20, left: 14 },
        didDrawPage: function(data) {
            // Footer on each page
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
                'ALFA CAR - Système de Gestion de Vente de Voitures | Page ' + doc.internal.getNumberOfPages(),
                doc.internal.pageSize.width / 2, 
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }
    });
    
    // Save
    doc.save((filename || 'rapport') + '.pdf');
    
    // Success notification
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'Exporté!',
            text: 'Le fichier PDF a été téléchargé avec succès.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    }
}

// ============================================================
// Export to Excel using SheetJS
// ============================================================
function exportTableToExcel(tableId, filename) {
    // Load SheetJS dynamically if not loaded
    if (typeof XLSX === 'undefined') {
        loadScript('https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js', function() {
            generateExcel(tableId, filename);
        });
    } else {
        generateExcel(tableId, filename);
    }
}

function generateExcel(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) {
        console.error('Table not found:', tableId);
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur', 'Tableau non trouvé', 'error');
        }
        return;
    }
    
    // Clone table to remove checkboxes and action columns
    const clonedTable = table.cloneNode(true);
    
    // Remove checkbox columns
    const checkboxHeaders = clonedTable.querySelectorAll('th');
    const columnsToRemove = [];
    checkboxHeaders.forEach(function(th, index) {
        if (th.querySelector('input[type="checkbox"]') || th.textContent.trim() === 'Actions') {
            columnsToRemove.push(index);
        }
    });
    
    // Remove columns in reverse order
    columnsToRemove.reverse().forEach(function(colIndex) {
        const allRows = clonedTable.querySelectorAll('tr');
        allRows.forEach(function(row) {
            const cells = row.querySelectorAll('th, td');
            if (cells[colIndex]) {
                cells[colIndex].remove();
            }
        });
    });
    
    // Remove image elements, keep text
    const images = clonedTable.querySelectorAll('img');
    images.forEach(function(img) {
        const textNode = document.createTextNode(img.alt || '');
        img.parentNode.replaceChild(textNode, img);
    });
    
    // Remove buttons/links from cells
    const buttons = clonedTable.querySelectorAll('button, a.btn, form');
    buttons.forEach(function(btn) {
        btn.remove();
    });
    
    // Create workbook
    const wb = XLSX.utils.table_to_book(clonedTable, { 
        sheet: filename || 'Données',
        raw: true
    });
    
    // Style the sheet
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (ws['!ref']) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        // Set column widths
        const colWidths = [];
        for (let c = range.s.c; c <= range.e.c; c++) {
            colWidths.push({ wch: 18 });
        }
        ws['!cols'] = colWidths;
    }
    
    // Save file
    XLSX.writeFile(wb, (filename || 'rapport') + '.xlsx');
    
    // Success notification
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'Exporté!',
            text: 'Le fichier Excel a été téléchargé avec succès.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    }
}

// ============================================================
// Export Selected Rows to PDF
// ============================================================
function exportSelectedToPDF(tableId, checkboxClass, filename, title) {
    const checkboxes = document.querySelectorAll('.' + checkboxClass + ':checked');
    if (checkboxes.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Attention',
            text: 'Veuillez sélectionner au moins un élément à exporter.'
        });
        return;
    }
    
    // Show only selected rows temporarily
    const allRows = document.querySelectorAll('#' + tableId + ' tbody tr');
    const hiddenRows = [];
    
    allRows.forEach(function(row) {
        const checkbox = row.querySelector('.' + checkboxClass);
        if (checkbox && !checkbox.checked) {
            row.style.display = 'none';
            hiddenRows.push(row);
        }
    });
    
    // Export
    exportTableToPDF(tableId, filename, title);
    
    // Restore hidden rows
    setTimeout(function() {
        hiddenRows.forEach(function(row) {
            row.style.display = '';
        });
    }, 100);
}

// ============================================================
// Export Invoice to PDF
// ============================================================
function exportInvoiceToPDF(invoiceData) {
    if (typeof window.jspdf === 'undefined') {
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', function() {
            generateInvoicePDF(invoiceData);
        });
    } else {
        generateInvoicePDF(invoiceData);
    }
}

function generateInvoicePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    
    // Header background
    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ALFA CAR', 20, 20);
    
    // Company details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Système de Gestion de Vente de Voitures', 20, 28);
    doc.text('contact@alfacar.ma | +212 522 123456', 20, 35);
    
    // Invoice title
    doc.setFontSize(14);
    doc.text('FACTURE', pageWidth - 60, 20);
    doc.setFontSize(10);
    doc.text('N°: ' + (data.numero_facture || 'N/A'), pageWidth - 60, 28);
    doc.text('Date: ' + (data.date_facture || new Date().toLocaleDateString('fr-FR')), pageWidth - 60, 35);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    let y = 60;
    
    // Client info box
    doc.setFillColor(245, 245, 250);
    doc.rect(20, y - 5, pageWidth - 40, 30, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations Client', 25, y + 3);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Nom: ' + (data.client_nom || '') + ' ' + (data.client_prenom || ''), 25, y + 11);
    doc.text('Email: ' + (data.client_email || 'N/A'), 25, y + 18);
    doc.text('Téléphone: ' + (data.client_telephone || 'N/A'), pageWidth / 2, y + 11);
    doc.text('Adresse: ' + (data.client_adresse || 'N/A'), pageWidth / 2, y + 18);
    
    y += 40;
    
    // Vehicle info box
    doc.setFillColor(245, 245, 250);
    doc.rect(20, y - 5, pageWidth - 40, 30, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations Véhicule', 25, y + 3);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Marque: ' + (data.marque || ''), 25, y + 11);
    doc.text('Modèle: ' + (data.modele || ''), 25, y + 18);
    doc.text('Année: ' + (data.annee || ''), pageWidth / 2, y + 11);
    doc.text('Couleur: ' + (data.couleur || ''), pageWidth / 2, y + 18);
    
    y += 40;
    
    // Payment details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Détails de Paiement', 25, y);
    y += 8;
    
    // Payment table
    const paymentHeaders = [['Description', 'Type', 'Montant']];
    const paymentRows = [[
        (data.marque || '') + ' ' + (data.modele || '') + ' ' + (data.annee || ''),
        (data.type_paiement || 'Cash').toUpperCase(),
        formatPricePDF(data.montant_total || 0) + ' MAD'
    ]];
    
    if (data.type_paiement === 'credit' && data.montant_avance) {
        paymentRows.push(['Avance', '', formatPricePDF(data.montant_avance) + ' MAD']);
        paymentRows.push(['Mensualité (' + (data.nombre_mensualites || 0) + ' mois)', 
            'Taux: ' + (data.taux_interet || 0) + '%', 
            formatPricePDF(data.mensualite || 0) + ' MAD/mois']);
    }
    
    doc.autoTable({
        head: paymentHeaders,
        body: paymentRows,
        startY: y,
        theme: 'grid',
        headStyles: {
            fillColor: [233, 69, 96],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: { fontSize: 9 },
        margin: { left: 20, right: 20 }
    });
    
    y = doc.lastAutoTable.finalY + 15;
    
    // Total box
    doc.setFillColor(26, 26, 46);
    doc.rect(pageWidth - 90, y, 70, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', pageWidth - 85, y + 9);
    doc.text(formatPricePDF(data.montant_total || 0) + ' MAD', pageWidth - 25, y + 9, { align: 'right' });
    
    // Footer
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Merci pour votre confiance | ALFA CAR - Vente de Voitures Premium', 
        pageWidth / 2, doc.internal.pageSize.height - 15, { align: 'center' });
    
    // Save
    doc.save('Facture_' + (data.numero_facture || 'N-A') + '.pdf');
}

function formatPricePDF(price) {
    return parseFloat(price).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ============================================================
// Dynamic Script Loader Helper
// ============================================================
function loadScript(url, callback) {
    const existing = document.querySelector('script[src="' + url + '"]');
    if (existing) {
        if (callback) callback();
        return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    script.onerror = function() {
        console.error('Failed to load script:', url);
    };
    document.head.appendChild(script);
}
