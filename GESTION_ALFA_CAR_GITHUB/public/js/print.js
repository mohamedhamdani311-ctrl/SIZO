/* ============================================================
   GESTION ALFA CAR - Print JavaScript
   ============================================================ */

(function () {
  'use strict';

  /**
   * Print a single element by its ID
   * @param {string} elementId - The ID of the element to print
   * @param {string} [title] - Optional title for the print page
   */
  window.printElement = function (elementId, title) {
    var element = document.getElementById(elementId);
    if (!element) {
      console.warn('printElement: Élément non trouvé:', elementId);
      return;
    }

    var printTitle = title || document.title;
    var content = element.innerHTML;

    openPrintWindow(content, printTitle);
  };

  /**
   * Print a table with formatted layout
   * @param {string} tableId - The ID of the table to print
   * @param {string} title - Title displayed at the top
   */
  window.printTable = function (tableId, title) {
    var table = document.getElementById(tableId);
    if (!table) {
      console.warn('printTable: Table non trouvée:', tableId);
      return;
    }

    var printTitle = title || 'Liste';
    var now = new Date();
    var dateStr = now.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
    var timeStr = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    });

    // Clone and clean the table
    var clonedTable = table.cloneNode(true);

    // Remove action columns and checkboxes
    var rows = clonedTable.querySelectorAll('tr');
    rows.forEach(function (row) {
      // Remove cells with class 'no-print'
      row.querySelectorAll('.no-print, .actions-column').forEach(function (cell) {
        cell.remove();
      });
      // Remove checkbox cells
      row.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
        var td = cb.closest('td, th');
        if (td) td.remove();
      });
    });

    var html =
      '<div class="print-page-header">' +
      '<div>' +
      '<div style="font-size:20pt;font-weight:bold;color:#1a1a2e;">ALFA CAR</div>' +
      '<div style="font-size:9pt;color:#666;">Système de Gestion de Vente de Voitures</div>' +
      '</div>' +
      '<div style="text-align:right;">' +
      '<div style="font-size:9pt;color:#666;">Imprimé le ' + dateStr + ' à ' + timeStr + '</div>' +
      '</div>' +
      '</div>' +
      '<h2 style="font-size:16pt;margin-bottom:15pt;color:#1a1a2e;">' + printTitle + '</h2>' +
      '<div>' + clonedTable.outerHTML + '</div>' +
      '<div style="margin-top:30pt;text-align:center;font-size:8pt;color:#999;border-top:1px solid #ddd;padding-top:10pt;">' +
      'ALFA CAR - Tous droits réservés © ' + now.getFullYear() +
      '</div>';

    openPrintWindow(html, printTitle);
  };

  /**
   * Print selected rows from a table
   * @param {string} checkboxClass - Class of the checkboxes to check
   * @param {string} title - Title for the print page
   */
  window.printSelected = function (checkboxClass, title) {
    var checkedBoxes = document.querySelectorAll('.' + (checkboxClass || 'row-checkbox') + ':checked');
    if (checkedBoxes.length === 0) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'warning',
          title: 'Aucune sélection',
          text: 'Veuillez sélectionner au moins un élément à imprimer.',
          confirmButtonColor: '#e94560'
        });
      } else {
        alert('Veuillez sélectionner au moins un élément à imprimer.');
      }
      return;
    }

    // Find the parent table
    var firstCheckbox = checkedBoxes[0];
    var sourceTable = firstCheckbox.closest('table');
    if (!sourceTable) return;

    // Clone header
    var newTable = document.createElement('table');
    newTable.style.cssText = 'width:100%;border-collapse:collapse;';

    var thead = sourceTable.querySelector('thead');
    if (thead) {
      var newThead = thead.cloneNode(true);
      // Remove checkbox and actions columns
      newThead.querySelectorAll('.no-print, .actions-column').forEach(function (el) { el.remove(); });
      newThead.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
        var th = cb.closest('th');
        if (th) th.remove();
      });
      newTable.appendChild(newThead);
    }

    // Clone selected rows
    var tbody = document.createElement('tbody');
    checkedBoxes.forEach(function (cb) {
      var row = cb.closest('tr');
      if (row) {
        var newRow = row.cloneNode(true);
        newRow.querySelectorAll('.no-print, .actions-column').forEach(function (el) { el.remove(); });
        newRow.querySelectorAll('input[type="checkbox"]').forEach(function (checkbox) {
          var td = checkbox.closest('td');
          if (td) td.remove();
        });
        tbody.appendChild(newRow);
      }
    });
    newTable.appendChild(tbody);

    var now = new Date();
    var dateStr = now.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    var html =
      '<div class="print-page-header">' +
      '<div>' +
      '<div style="font-size:20pt;font-weight:bold;color:#1a1a2e;">ALFA CAR</div>' +
      '<div style="font-size:9pt;color:#666;">Système de Gestion</div>' +
      '</div>' +
      '<div style="text-align:right;">' +
      '<div style="font-size:9pt;color:#666;">' + dateStr + '</div>' +
      '</div>' +
      '</div>' +
      '<h2 style="font-size:14pt;margin-bottom:12pt;">' + (title || 'Éléments sélectionnés') + ' (' + checkedBoxes.length + ')</h2>' +
      newTable.outerHTML +
      '<div style="margin-top:30pt;text-align:center;font-size:8pt;color:#999;border-top:1px solid #ddd;padding-top:10pt;">' +
      'ALFA CAR © ' + now.getFullYear() +
      '</div>';

    openPrintWindow(html, title || 'Impression sélection');
  };

  /**
   * Print an invoice
   * @param {Object} invoiceData - Invoice data object
   * @param {string} invoiceData.numero - Invoice number
   * @param {string} invoiceData.date - Invoice date
   * @param {Object} invoiceData.client - Client info { nom, adresse, telephone, email }
   * @param {Object} invoiceData.voiture - Car info { marque, modele, annee, vin }
   * @param {number} invoiceData.montant - Total amount
   * @param {string} invoiceData.type_paiement - Payment type
   * @param {number} [invoiceData.avance] - Advance payment
   * @param {number} [invoiceData.nombre_mensualites] - Number of installments
   * @param {number} [invoiceData.mensualite] - Monthly payment
   * @param {number} [invoiceData.taux_interet] - Interest rate
   * @param {string} [invoiceData.notes] - Additional notes
   */
  window.printInvoice = function (invoiceData) {
    var data = invoiceData || {};
    var now = new Date();
    var dateStr = data.date || now.toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    var montant = parseFloat(data.montant) || 0;
    var avance = parseFloat(data.avance) || 0;
    var restant = montant - avance;
    var mensualite = parseFloat(data.mensualite) || 0;

    var paymentDetails = '';
    if (data.type_paiement === 'credit') {
      paymentDetails =
        '<tr><td style="padding:8pt 10pt;border-bottom:1px solid #eee;">Type de paiement</td>' +
        '<td style="padding:8pt 10pt;border-bottom:1px solid #eee;text-align:right;">Crédit</td></tr>' +
        '<tr><td style="padding:8pt 10pt;border-bottom:1px solid #eee;">Avance</td>' +
        '<td style="padding:8pt 10pt;border-bottom:1px solid #eee;text-align:right;">' + avance.toLocaleString('fr-FR') + ' MAD</td></tr>' +
        '<tr><td style="padding:8pt 10pt;border-bottom:1px solid #eee;">Reste à payer</td>' +
        '<td style="padding:8pt 10pt;border-bottom:1px solid #eee;text-align:right;">' + restant.toLocaleString('fr-FR') + ' MAD</td></tr>' +
        '<tr><td style="padding:8pt 10pt;border-bottom:1px solid #eee;">Nombre de mensualités</td>' +
        '<td style="padding:8pt 10pt;border-bottom:1px solid #eee;text-align:right;">' + (data.nombre_mensualites || '-') + '</td></tr>' +
        '<tr><td style="padding:8pt 10pt;border-bottom:1px solid #eee;">Taux d\'intérêt</td>' +
        '<td style="padding:8pt 10pt;border-bottom:1px solid #eee;text-align:right;">' + (data.taux_interet || 0) + '%</td></tr>' +
        '<tr><td style="padding:8pt 10pt;border-bottom:1px solid #eee;font-weight:bold;">Mensualité</td>' +
        '<td style="padding:8pt 10pt;border-bottom:1px solid #eee;text-align:right;font-weight:bold;color:#e94560;">' + mensualite.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' MAD</td></tr>';
    } else {
      paymentDetails =
        '<tr><td style="padding:8pt 10pt;border-bottom:1px solid #eee;">Type de paiement</td>' +
        '<td style="padding:8pt 10pt;border-bottom:1px solid #eee;text-align:right;">Comptant</td></tr>';
    }

    var html =
      '<!-- Invoice Header -->' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1a1a2e;padding-bottom:15pt;margin-bottom:20pt;">' +
      '<div>' +
      '<div style="font-size:22pt;font-weight:bold;color:#1a1a2e;">ALFA CAR</div>' +
      '<div style="font-size:9pt;color:#555;line-height:1.8;">' +
      'Vente de Voitures<br>' +
      'Adresse: Maroc<br>' +
      'Tél: +212 6XX-XXXXXX<br>' +
      'Email: contact@alfacar.ma' +
      '</div>' +
      '</div>' +
      '<div style="text-align:right;">' +
      '<div style="font-size:24pt;color:#e94560;text-transform:uppercase;letter-spacing:3pt;font-weight:bold;">FACTURE</div>' +
      '<div style="font-size:11pt;font-weight:bold;margin-top:5pt;">N° ' + (data.numero || 'XXXX') + '</div>' +
      '<div style="font-size:9pt;color:#666;margin-top:3pt;">Date : ' + dateStr + '</div>' +
      '</div>' +
      '</div>' +

      '<!-- Client & Vehicle Details -->' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:25pt;gap:30pt;">' +
      '<div style="flex:1;">' +
      '<h4 style="font-size:10pt;text-transform:uppercase;letter-spacing:1pt;color:#888;border-bottom:1px solid #ddd;padding-bottom:5pt;margin-bottom:8pt;">INFORMATIONS CLIENT</h4>' +
      '<div style="font-weight:bold;font-size:12pt;margin-bottom:3pt;">' + (data.client ? data.client.nom : '-') + '</div>' +
      '<div style="font-size:9pt;color:#555;line-height:1.7;">' +
      (data.client ? (data.client.adresse || '') : '') + '<br>' +
      'Tél: ' + (data.client ? (data.client.telephone || '-') : '-') + '<br>' +
      'Email: ' + (data.client ? (data.client.email || '-') : '-') +
      '</div>' +
      '</div>' +
      '<div style="flex:1;">' +
      '<h4 style="font-size:10pt;text-transform:uppercase;letter-spacing:1pt;color:#888;border-bottom:1px solid #ddd;padding-bottom:5pt;margin-bottom:8pt;">VÉHICULE</h4>' +
      '<div style="font-weight:bold;font-size:12pt;margin-bottom:3pt;">' +
      (data.voiture ? (data.voiture.marque + ' ' + data.voiture.modele) : '-') +
      '</div>' +
      '<div style="font-size:9pt;color:#555;line-height:1.7;">' +
      'Année: ' + (data.voiture ? (data.voiture.annee || '-') : '-') + '<br>' +
      'VIN: ' + (data.voiture ? (data.voiture.vin || '-') : '-') +
      '</div>' +
      '</div>' +
      '</div>' +

      '<!-- Items Table -->' +
      '<table style="width:100%;border-collapse:collapse;margin-bottom:20pt;">' +
      '<thead>' +
      '<tr>' +
      '<th style="background:#1a1a2e;color:#fff;padding:10pt;text-align:left;font-size:9pt;text-transform:uppercase;">Description</th>' +
      '<th style="background:#1a1a2e;color:#fff;padding:10pt;text-align:right;font-size:9pt;text-transform:uppercase;">Montant</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td style="padding:10pt;border-bottom:1px solid #eee;">' +
      (data.voiture ? (data.voiture.marque + ' ' + data.voiture.modele + ' (' + (data.voiture.annee || '') + ')') : 'Véhicule') +
      '</td>' +
      '<td style="padding:10pt;border-bottom:1px solid #eee;text-align:right;">' + montant.toLocaleString('fr-FR') + ' MAD</td></tr>' +
      paymentDetails +
      '</tbody>' +
      '</table>' +

      '<!-- Totals -->' +
      '<div style="display:flex;justify-content:flex-end;margin-bottom:25pt;">' +
      '<div style="width:250pt;">' +
      '<div style="display:flex;justify-content:space-between;padding:5pt 0;font-size:10pt;">' +
      '<span>Sous-total</span><span>' + montant.toLocaleString('fr-FR') + ' MAD</span>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;padding:8pt 0;font-size:14pt;font-weight:bold;border-top:2px solid #1a1a2e;margin-top:5pt;">' +
      '<span>TOTAL</span><span style="color:#e94560;">' + montant.toLocaleString('fr-FR') + ' MAD</span>' +
      '</div>' +
      '</div>' +
      '</div>' +

      (data.notes ?
        '<div style="background:#f9f9f9;border:1px solid #eee;border-radius:4pt;padding:10pt 15pt;margin-bottom:20pt;font-size:9pt;color:#666;">' +
        '<strong style="color:#333;">Notes :</strong> ' + data.notes +
        '</div>' : '') +

      '<!-- Signatures -->' +
      '<div style="display:flex;justify-content:space-between;margin-top:50pt;margin-bottom:20pt;">' +
      '<div style="width:200pt;text-align:center;">' +
      '<div style="border-top:1px solid #000;padding-top:5pt;font-size:9pt;color:#333;">Signature vendeur</div>' +
      '</div>' +
      '<div style="width:200pt;text-align:center;">' +
      '<div style="border-top:1px solid #000;padding-top:5pt;font-size:9pt;color:#333;">Signature client</div>' +
      '</div>' +
      '</div>' +

      '<!-- Footer -->' +
      '<div style="border-top:1px solid #ddd;padding-top:10pt;text-align:center;font-size:8pt;color:#999;">' +
      'ALFA CAR - Système de Gestion de Vente de Voitures | Tous droits réservés © ' + now.getFullYear() +
      '</div>';

    openPrintWindow(html, 'Facture N° ' + (data.numero || ''));
  };

  /**
   * Open a print window with the given HTML content
   * @param {string} content - HTML content to print
   * @param {string} title - Page title
   */
  function openPrintWindow(content, title) {
    var printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour imprimer.');
      return;
    }

    var styles =
      '<style>' +
      '@page { size: A4; margin: 15mm 20mm; }' +
      '* { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }' +
      'body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; font-size: 10pt; color: #000; margin: 0; padding: 20px; line-height: 1.5; }' +
      'table { width: 100%; border-collapse: collapse; }' +
      'table thead th { background: #f0f0f0; font-weight: bold; border: 1px solid #999; padding: 8pt; text-align: left; font-size: 9pt; }' +
      'table tbody td { border: 1px solid #ccc; padding: 6pt 8pt; font-size: 9pt; }' +
      'table tbody tr:nth-child(even) { background: #f9f9f9; }' +
      'h1, h2, h3, h4 { margin: 0 0 10pt 0; }' +
      '.print-page-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1a1a2e; padding-bottom: 10pt; margin-bottom: 20pt; }' +
      'img { max-width: 100%; }' +
      '</style>';

    printWindow.document.write(
      '<!DOCTYPE html>' +
      '<html><head>' +
      '<meta charset="UTF-8">' +
      '<title>' + (title || 'Impression') + '</title>' +
      styles +
      '</head><body>' +
      content +
      '</body></html>'
    );

    printWindow.document.close();

    printWindow.onload = function () {
      setTimeout(function () {
        printWindow.focus();
        printWindow.print();
      }, 300);
    };
  }

  /* ----------------------------------------------------------
     Bind print buttons on DOMContentLoaded
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    // Print page button
    document.querySelectorAll('[data-action="print-page"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.print();
      });
    });

    // Print element button
    document.querySelectorAll('[data-action="print-element"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var elementId = this.getAttribute('data-target');
        var title = this.getAttribute('data-title') || '';
        window.printElement(elementId, title);
      });
    });

    // Print table button
    document.querySelectorAll('[data-action="print-table"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var tableId = this.getAttribute('data-target');
        var title = this.getAttribute('data-title') || 'Liste';
        window.printTable(tableId, title);
      });
    });

    // Print selected button
    document.querySelectorAll('[data-action="print-selected"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var checkboxClass = this.getAttribute('data-checkbox-class') || 'row-checkbox';
        var title = this.getAttribute('data-title') || 'Éléments sélectionnés';
        window.printSelected(checkboxClass, title);
      });
    });

    // Print invoice button
    document.querySelectorAll('[data-action="print-invoice"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var dataStr = this.getAttribute('data-invoice');
        if (dataStr) {
          try {
            var invoiceData = JSON.parse(dataStr);
            window.printInvoice(invoiceData);
          } catch (err) {
            console.error('Erreur parsing invoice data:', err);
          }
        }
      });
    });
  });

})();
