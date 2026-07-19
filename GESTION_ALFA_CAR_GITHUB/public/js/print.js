/* ============================================================
   GESTION ALFA CAR - Print JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Shared styles injected into every print popup
     ---------------------------------------------------------- */
  var BASE_STYLES =
    '<style>' +
    '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");' +
    '@page { size: A4; margin: 12mm 15mm; }' +
    '* { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0; padding: 0; }' +
    'body { font-family: "Inter", "Segoe UI", sans-serif; font-size: 10pt; color: #1a1a2e; background: #fff; padding: 0; line-height: 1.5; }' +

    /* ── Header bar ── */
    '.ph { display:flex; justify-content:space-between; align-items:center; padding:14pt 0 10pt; border-bottom:3px solid #e94560; margin-bottom:18pt; }' +
    '.ph-brand { display:flex; align-items:center; gap:10pt; }' +
    '.ph-dot { width:32pt; height:32pt; border-radius:8pt; background:#e94560; display:flex; align-items:center; justify-content:center; }' +
    '.ph-dot svg { width:18pt; height:18pt; fill:#fff; }' +
    '.ph-name { font-size:18pt; font-weight:800; color:#1a1a2e; letter-spacing:-0.5pt; }' +
    '.ph-sub { font-size:8pt; color:#888; margin-top:1pt; }' +
    '.ph-right { text-align:right; font-size:8.5pt; color:#555; line-height:1.7; }' +
    '.ph-right strong { color:#1a1a2e; }' +

    /* ── Section title ── */
    '.sec-title { font-size:14pt; font-weight:700; color:#1a1a2e; margin-bottom:12pt; padding-bottom:6pt; border-bottom:2px solid #f0f0f0; }' +
    '.sec-title span { color:#e94560; }' +

    /* ── Table ── */
    'table { width:100%; border-collapse:collapse; font-size:9pt; }' +
    'thead tr { background:#1a1a2e !important; }' +
    'thead th { color:#fff !important; font-weight:600; padding:8pt 10pt; text-align:left; text-transform:uppercase; font-size:8pt; letter-spacing:0.5pt; border:none; }' +
    'tbody td { padding:7pt 10pt; border-bottom:1px solid #f0f0f0; color:#333; vertical-align:middle; }' +
    'tbody tr:last-child td { border-bottom:none; }' +
    'tbody tr:nth-child(even) td { background:#fafafa; }' +
    'tbody tr:hover td { background:#fff5f6; }' +

    /* ── Badge ── */
    '.badge { display:inline-block; padding:2pt 7pt; border-radius:20pt; font-size:7.5pt; font-weight:600; }' +
    '.badge-green { background:#d1fae5; color:#065f46; }' +
    '.badge-blue  { background:#dbeafe; color:#1e40af; }' +
    '.badge-orange{ background:#ffedd5; color:#9a3412; }' +
    '.badge-red   { background:#fee2e2; color:#991b1b; }' +
    '.badge-gray  { background:#f3f4f6; color:#374151; }' +

    /* ── Footer ── */
    '.pf { border-top:1px solid #e5e7eb; margin-top:20pt; padding-top:8pt; text-align:center; font-size:7.5pt; color:#aaa; }' +
    '.pf strong { color:#e94560; }' +

    /* ── Invoice specific ── */
    '.inv-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:22pt; }' +
    '.inv-brand-name { font-size:26pt; font-weight:800; color:#1a1a2e; letter-spacing:-1pt; line-height:1; }' +
    '.inv-brand-name span { color:#e94560; }' +
    '.inv-brand-sub { font-size:8.5pt; color:#777; margin-top:4pt; line-height:1.7; }' +
    '.inv-label { font-size:28pt; font-weight:800; color:#e94560; text-transform:uppercase; letter-spacing:2pt; line-height:1; }' +
    '.inv-meta { margin-top:6pt; font-size:9pt; color:#555; line-height:1.8; text-align:right; }' +
    '.inv-meta strong { color:#1a1a2e; }' +
    '.inv-divider { height:3px; background:linear-gradient(90deg,#e94560,#1a1a2e); border-radius:2px; margin-bottom:22pt; }' +
    '.inv-info-grid { display:flex; gap:20pt; margin-bottom:20pt; }' +
    '.inv-info-box { flex:1; border:1px solid #e5e7eb; border-radius:8pt; padding:12pt; }' +
    '.inv-info-box h4 { font-size:7.5pt; font-weight:700; text-transform:uppercase; letter-spacing:1pt; color:#e94560; margin-bottom:8pt; display:flex; align-items:center; gap:4pt; }' +
    '.inv-info-box p { font-size:9pt; color:#444; margin-bottom:3pt; line-height:1.6; }' +
    '.inv-info-box .name { font-size:11pt; font-weight:700; color:#1a1a2e; margin-bottom:5pt; }' +
    '.inv-items table thead th { background:#1a1a2e !important; color:#fff !important; }' +
    '.inv-items { margin-bottom:16pt; }' +
    '.inv-totals { display:flex; justify-content:flex-end; margin-bottom:18pt; }' +
    '.inv-totals-box { width:220pt; border:1px solid #e5e7eb; border-radius:8pt; overflow:hidden; }' +
    '.inv-tot-row { display:flex; justify-content:space-between; padding:7pt 12pt; font-size:9.5pt; border-bottom:1px solid #f0f0f0; }' +
    '.inv-tot-row:last-child { border-bottom:none; background:#1a1a2e; color:#fff; font-weight:700; font-size:11pt; padding:10pt 12pt; }' +
    '.inv-tot-row:last-child span:last-child { color:#e94560; }' +
    '.inv-credit { background:#fffbeb; border:1px solid #fde68a; border-radius:8pt; padding:12pt; margin-bottom:18pt; }' +
    '.inv-credit h5 { font-size:9pt; font-weight:700; color:#92400e; margin-bottom:8pt; }' +
    '.inv-credit-grid { display:flex; gap:0; }' +
    '.inv-credit-item { flex:1; text-align:center; padding:6pt 8pt; border-right:1px solid #fde68a; }' +
    '.inv-credit-item:last-child { border-right:none; }' +
    '.inv-credit-item .lbl { font-size:7.5pt; color:#92400e; text-transform:uppercase; letter-spacing:0.5pt; margin-bottom:2pt; }' +
    '.inv-credit-item .val { font-size:11pt; font-weight:700; color:#1a1a2e; }' +
    '.inv-notes { border-left:3px solid #e94560; padding:8pt 12pt; background:#fff5f6; border-radius:0 6pt 6pt 0; margin-bottom:18pt; font-size:8.5pt; color:#555; }' +
    '.inv-notes strong { color:#1a1a2e; display:block; margin-bottom:3pt; }' +
    '.inv-sigs { display:flex; justify-content:space-between; margin-top:30pt; margin-bottom:12pt; }' +
    '.inv-sig { width:180pt; text-align:center; }' +
    '.inv-sig .line { border-top:1px solid #ccc; padding-top:6pt; font-size:8.5pt; color:#555; }' +
    '.inv-stamp { display:inline-block; border:3px solid #16a34a; border-radius:8pt; padding:4pt 14pt; color:#16a34a; font-weight:800; font-size:11pt; text-transform:uppercase; letter-spacing:2pt; transform:rotate(-5deg); margin-left:auto; display:block; width:fit-content; margin-right:20pt; }' +
    '</style>';

  /* ----------------------------------------------------------
     Open a popup window and print
     ---------------------------------------------------------- */
  function openPrintWindow(content, title) {
    var pw = window.open('', '_blank', 'width=860,height=700');
    if (!pw) { alert('Veuillez autoriser les popups pour imprimer.'); return; }

    pw.document.write(
      '<!DOCTYPE html><html lang="fr"><head>' +
      '<meta charset="UTF-8">' +
      '<title>' + (title || 'Impression') + '</title>' +
      BASE_STYLES +
      '</head><body>' +
      content +
      '</body></html>'
    );
    pw.document.close();
    pw.onload = function () {
      setTimeout(function () { pw.focus(); pw.print(); }, 400);
    };
  }

  /* ----------------------------------------------------------
     Shared page header HTML
     ---------------------------------------------------------- */
  function pageHeader(dateStr, timeStr) {
    return (
      '<div class="ph">' +
        '<div class="ph-brand">' +
          '<div class="ph-dot"><svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg></div>' +
          '<div><div class="ph-name">ALFA CAR</div><div class="ph-sub">Gestion de Vente de Voitures</div></div>' +
        '</div>' +
        '<div class="ph-right"><strong>Imprimé le</strong> ' + dateStr + ' à ' + timeStr + '</div>' +
      '</div>'
    );
  }

  function pageFooter(year) {
    return (
      '<div class="pf"><strong>ALFA CAR</strong> &mdash; Système de Gestion de Vente de Voitures &mdash; Tous droits réservés &copy; ' + year + '</div>'
    );
  }

  /* ----------------------------------------------------------
     printElement
     ---------------------------------------------------------- */
  window.printElement = function (elementId, title) {
    var el = document.getElementById(elementId);
    if (!el) { console.warn('printElement: Élément non trouvé:', elementId); return; }
    var now = new Date();
    var ds = now.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' });
    var ts = now.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
    var html = pageHeader(ds, ts) +
      '<div class="sec-title">' + (title || document.title) + '</div>' +
      el.innerHTML +
      pageFooter(now.getFullYear());
    openPrintWindow(html, title || document.title);
  };

  /* ----------------------------------------------------------
     printTable
     ---------------------------------------------------------- */
  window.printTable = function (tableId, title) {
    var table = document.getElementById(tableId);
    if (!table) { console.warn('printTable: Table non trouvée:', tableId); return; }

    var now = new Date();
    var ds = now.toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
    var ts = now.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });

    // Clone and strip action/checkbox columns
    var clone = table.cloneNode(true);
    clone.querySelectorAll('tr').forEach(function (row) {
      row.querySelectorAll('.no-print, .actions-column, [data-col="actions"]').forEach(function (c) { c.remove(); });
      row.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
        var cell = cb.closest('td, th');
        if (cell) cell.remove();
      });
      // Remove button/link elements inside cells
      row.querySelectorAll('td a.btn, td button').forEach(function (b) { b.remove(); });
    });

    // Count rows
    var rowCount = clone.querySelectorAll('tbody tr').length;

    var html =
      pageHeader(ds, ts) +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12pt;">' +
        '<div class="sec-title" style="margin:0;border:none;padding:0;">' + (title || 'Liste') + '</div>' +
        '<div style="font-size:8.5pt;color:#888;">' + rowCount + ' enregistrement' + (rowCount !== 1 ? 's' : '') + '</div>' +
      '</div>' +
      clone.outerHTML +
      pageFooter(now.getFullYear());

    openPrintWindow(html, title || 'Liste');
  };

  /* ----------------------------------------------------------
     printSelected
     ---------------------------------------------------------- */
  window.printSelected = function (checkboxClass, title) {
    var checked = document.querySelectorAll('.' + (checkboxClass || 'row-checkbox') + ':checked');
    if (checked.length === 0) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({ icon:'warning', title:'Aucune sélection', text:'Veuillez sélectionner au moins un élément.', confirmButtonColor:'#e94560' });
      } else {
        alert('Veuillez sélectionner au moins un élément.');
      }
      return;
    }

    var sourceTable = checked[0].closest('table');
    if (!sourceTable) return;

    var newTable = document.createElement('table');
    var thead = sourceTable.querySelector('thead');
    if (thead) {
      var th = thead.cloneNode(true);
      th.querySelectorAll('.no-print, .actions-column').forEach(function (e) { e.remove(); });
      th.querySelectorAll('input[type="checkbox"]').forEach(function (cb) { var p = cb.closest('th'); if (p) p.remove(); });
      newTable.appendChild(th);
    }
    var tbody = document.createElement('tbody');
    checked.forEach(function (cb) {
      var row = cb.closest('tr');
      if (row) {
        var nr = row.cloneNode(true);
        nr.querySelectorAll('.no-print, .actions-column').forEach(function (e) { e.remove(); });
        nr.querySelectorAll('input[type="checkbox"]').forEach(function (c) { var p = c.closest('td'); if (p) p.remove(); });
        nr.querySelectorAll('td a.btn, td button').forEach(function (b) { b.remove(); });
        tbody.appendChild(nr);
      }
    });
    newTable.appendChild(tbody);

    var now = new Date();
    var ds = now.toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
    var ts = now.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });

    var html =
      pageHeader(ds, ts) +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12pt;">' +
        '<div class="sec-title" style="margin:0;border:none;padding:0;">' + (title || 'Sélection') + '</div>' +
        '<div style="font-size:8.5pt;color:#888;">' + checked.length + ' élément' + (checked.length !== 1 ? 's' : '') + ' sélectionné' + (checked.length !== 1 ? 's' : '') + '</div>' +
      '</div>' +
      newTable.outerHTML +
      pageFooter(now.getFullYear());

    openPrintWindow(html, title || 'Sélection');
  };

  /* ----------------------------------------------------------
     printInvoice
     ---------------------------------------------------------- */
  window.printInvoice = function (invoiceData) {
    var d = invoiceData || {};
    var now = new Date();
    var dateStr = d.date || now.toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });

    var montant   = parseFloat(d.montant)         || 0;
    var avance    = parseFloat(d.avance)           || 0;
    var restant   = montant - avance;
    var mensualite = parseFloat(d.mensualite)      || 0;
    var isCredit  = d.type_paiement === 'credit';

    // Credit details block
    var creditBlock = '';
    if (isCredit) {
      creditBlock =
        '<div class="inv-credit">' +
          '<h5>&#9432; Détails du Crédit</h5>' +
          '<div class="inv-credit-grid">' +
            '<div class="inv-credit-item"><div class="lbl">Avance</div><div class="val">' + avance.toLocaleString('fr-FR') + ' MAD</div></div>' +
            '<div class="inv-credit-item"><div class="lbl">Reste à financer</div><div class="val">' + restant.toLocaleString('fr-FR') + ' MAD</div></div>' +
            '<div class="inv-credit-item"><div class="lbl">Durée</div><div class="val">' + (d.nombre_mensualites || '-') + ' mois</div></div>' +
            '<div class="inv-credit-item"><div class="lbl">Mensualité</div><div class="val">' + mensualite.toLocaleString('fr-FR', { maximumFractionDigits:2 }) + ' MAD</div></div>' +
            '<div class="inv-credit-item"><div class="lbl">Taux</div><div class="val">' + (d.taux_interet || 0) + '%</div></div>' +
          '</div>' +
        '</div>';
    }

    // Notes
    var notesBlock = '';
    if (d.notes) {
      notesBlock =
        '<div class="inv-notes"><strong>Notes :</strong>' + d.notes + '</div>';
    }

    var html =
      // ── Invoice header ──
      '<div class="inv-header">' +
        '<div>' +
          '<div class="inv-brand-name">ALFA<span> CAR</span></div>' +
          '<div class="inv-brand-sub">' +
            (d.agence_nom  || 'Vente de Voitures') + '<br>' +
            (d.agence_adresse || 'Maroc') + '<br>' +
            (d.agence_telephone ? 'Tél : ' + d.agence_telephone + '<br>' : '') +
            (d.agence_email ? d.agence_email : 'contact@alfacar.ma') +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="inv-label">Facture</div>' +
          '<div class="inv-meta">' +
            '<strong>N° </strong>' + (d.numero || 'XXXX') + '<br>' +
            '<strong>Date : </strong>' + dateStr +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="inv-divider"></div>' +

      // ── Client + Vehicle info ──
      '<div class="inv-info-grid">' +
        '<div class="inv-info-box">' +
          '<h4>&#128100; Informations Client</h4>' +
          '<div class="name">' + (d.client ? (d.client.prenom + ' ' + d.client.nom) : (d.client_prenom || '') + ' ' + (d.client_nom || '')) + '</div>' +
          '<p>' + (d.client ? (d.client.adresse || '') : (d.client_adresse || 'N/A')) + '</p>' +
          '<p><strong>Tél :</strong> ' + (d.client ? (d.client.telephone || 'N/A') : (d.client_telephone || 'N/A')) + '</p>' +
          '<p><strong>Email :</strong> ' + (d.client ? (d.client.email || 'N/A') : (d.client_email || 'N/A')) + '</p>' +
        '</div>' +
        '<div class="inv-info-box">' +
          '<h4>&#128663; Véhicule</h4>' +
          '<div class="name">' + (d.voiture ? (d.voiture.marque + ' ' + d.voiture.modele) : ((d.marque || '') + ' ' + (d.modele || ''))) + '</div>' +
          '<p><strong>Année :</strong> ' + (d.voiture ? (d.voiture.annee || '-') : (d.annee || '-')) + '</p>' +
          '<p><strong>Couleur :</strong> ' + (d.voiture ? (d.voiture.couleur || 'N/A') : (d.couleur || 'N/A')) + '</p>' +
          '<p><strong>Mode de paiement :</strong> ' + (isCredit ? 'Crédit' : 'Cash / Comptant') + '</p>' +
        '</div>' +
      '</div>' +

      // ── Items table ──
      '<div class="inv-items">' +
        '<table>' +
          '<thead><tr>' +
            '<th style="width:60%">Description</th>' +
            '<th style="text-align:center">Mode de paiement</th>' +
            '<th style="text-align:right">Montant</th>' +
          '</tr></thead>' +
          '<tbody>' +
            '<tr>' +
              '<td>' +
                '<strong>' + (d.voiture ? (d.voiture.marque + ' ' + d.voiture.modele) : ((d.marque || '') + ' ' + (d.modele || ''))) + '</strong>' +
                ' &mdash; Année ' + (d.voiture ? (d.voiture.annee || '') : (d.annee || '')) +
              '</td>' +
              '<td style="text-align:center;">' +
                '<span class="badge ' + (isCredit ? 'badge-orange' : 'badge-blue') + '">' + (isCredit ? 'Crédit' : 'Cash') + '</span>' +
              '</td>' +
              '<td style="text-align:right;font-weight:700;">' + montant.toLocaleString('fr-FR') + ' MAD</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>' +
      '</div>' +

      // ── Totals ──
      '<div class="inv-totals">' +
        '<div class="inv-totals-box">' +
          '<div class="inv-tot-row"><span>Sous-total</span><span>' + montant.toLocaleString('fr-FR') + ' MAD</span></div>' +
          (isCredit ? '<div class="inv-tot-row"><span>Avance versée</span><span>' + avance.toLocaleString('fr-FR') + ' MAD</span></div>' : '') +
          '<div class="inv-tot-row"><span>TOTAL</span><span>' + montant.toLocaleString('fr-FR') + ' MAD</span></div>' +
        '</div>' +
      '</div>' +

      // ── Credit details ──
      creditBlock +

      // ── Notes ──
      notesBlock +

      // ── Stamp + Signatures ──
      '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:24pt;">' +
        '<div class="inv-stamp">&#10003; Validée</div>' +
        '<div class="inv-sigs" style="margin:0;">' +
          '<div class="inv-sig" style="margin-right:30pt;"><div class="line">Signature Vendeur</div></div>' +
          '<div class="inv-sig"><div class="line">Signature Client</div></div>' +
        '</div>' +
      '</div>' +

      // ── Footer ──
      '<div class="pf" style="margin-top:18pt;">' +
        'Merci pour votre confiance &mdash; <strong>ALFA CAR</strong>, votre partenaire automobile &copy; ' + now.getFullYear() +
      '</div>';

    openPrintWindow(html, 'Facture N° ' + (d.numero || d.numero_facture || ''));
  };

  /* ----------------------------------------------------------
     Bind data-action buttons
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {

    document.querySelectorAll('[data-action="print-page"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.preventDefault(); window.print(); });
    });

    document.querySelectorAll('[data-action="print-element"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.printElement(this.getAttribute('data-target'), this.getAttribute('data-title') || '');
      });
    });

    document.querySelectorAll('[data-action="print-table"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.printTable(this.getAttribute('data-target'), this.getAttribute('data-title') || 'Liste');
      });
    });

    document.querySelectorAll('[data-action="print-selected"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.printSelected(
          this.getAttribute('data-checkbox-class') || 'row-checkbox',
          this.getAttribute('data-title') || 'Éléments sélectionnés'
        );
      });
    });

    document.querySelectorAll('[data-action="print-invoice"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var raw = this.getAttribute('data-invoice');
        if (raw) {
          try { window.printInvoice(JSON.parse(raw)); }
          catch (err) { console.error('Erreur parsing invoice data:', err); }
        }
      });
    });

  });

})();
