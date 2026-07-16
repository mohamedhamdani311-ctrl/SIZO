/* ============================================================
   GESTION ALFA CAR - Cars Page JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. Search / Filter Functionality
     ---------------------------------------------------------- */
  function initSearchFilter() {
    var filterForm = document.getElementById('filter-form');
    if (!filterForm) return;

    // Submit handler
    filterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      applyFilters();
    });

    // Auto-filter on select change
    filterForm.querySelectorAll('select').forEach(function (select) {
      select.addEventListener('change', function () {
        applyFilters();
      });
    });

    // Debounced text search
    var searchInput = filterForm.querySelector('input[name="search"]');
    if (searchInput) {
      var debounceTimer = null;
      searchInput.addEventListener('input', function () {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          applyFilters();
        }, 400);
      });
    }

    // Price range inputs
    var prixMin = filterForm.querySelector('input[name="prix_min"]');
    var prixMax = filterForm.querySelector('input[name="prix_max"]');
    if (prixMin) {
      prixMin.addEventListener('change', function () { applyFilters(); });
    }
    if (prixMax) {
      prixMax.addEventListener('change', function () { applyFilters(); });
    }

    // Reset button
    var resetBtn = filterForm.querySelector('[data-action="reset"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', function (e) {
        e.preventDefault();
        filterForm.reset();
        applyFilters();
      });
    }
  }

  function applyFilters() {
    var filterForm = document.getElementById('filter-form');
    if (!filterForm) return;

    var formData = new FormData(filterForm);
    var params = new URLSearchParams();

    formData.forEach(function (value, key) {
      if (value && value.toString().trim() !== '') {
        params.append(key, value.trim());
      }
    });

    var resultsContainer = document.getElementById('cars-results');
    if (!resultsContainer) {
      // If no AJAX container, redirect with query
      window.location.href = '/cars?' + params.toString();
      return;
    }

    // AJAX search
    if (typeof window.showLoading === 'function') window.showLoading();

    fetch('/api/cars?' + params.toString(), {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('Erreur réseau');
      return res.json();
    })
    .then(function (data) {
      renderCarResults(data.cars || [], resultsContainer);
      if (typeof window.hideLoading === 'function') window.hideLoading();
    })
    .catch(function (err) {
      console.error('Erreur filtrage:', err);
      if (typeof window.hideLoading === 'function') window.hideLoading();
      // Fallback: redirect
      window.location.href = '/cars?' + params.toString();
    });
  }

  function renderCarResults(cars, container) {
    if (cars.length === 0) {
      container.innerHTML =
        '<div class="empty-state col-12">' +
        '<i class="fas fa-car-side"></i>' +
        '<h5>Aucune voiture trouvée</h5>' +
        '<p>Essayez de modifier vos critères de recherche.</p>' +
        '</div>';
      return;
    }

    var html = '';
    cars.forEach(function (car) {
      var imageUrl = car.image_principale ? '/uploads/cars/' + car.image_principale : '/images/car-placeholder.jpg';
      var badgeClass = '';
      var badgeText = '';
      if (car.statut === 'disponible') { badgeClass = 'badge-disponible'; badgeText = 'Disponible'; }
      else if (car.statut === 'reservee') { badgeClass = 'badge-reservee'; badgeText = 'Réservée'; }
      else if (car.statut === 'vendue') { badgeClass = 'badge-vendue'; badgeText = 'Vendue'; }

      html +=
        '<div class="col-md-6 col-lg-4 mb-4">' +
        '<div class="car-card">' +
        '<div class="car-image-wrapper">' +
        '<img src="' + imageUrl + '" alt="' + (car.marque || '') + ' ' + (car.modele || '') + '" loading="lazy">' +
        '<div class="car-image-overlay"></div>' +
        '<div class="car-badge"><span class="badge-status ' + badgeClass + '">' + badgeText + '</span></div>' +
        '</div>' +
        '<div class="car-content">' +
        '<h5 class="car-title">' + (car.marque || '') + ' ' + (car.modele || '') + '</h5>' +
        '<div class="car-specs">' +
        '<span class="car-spec"><i class="fas fa-calendar"></i> ' + (car.annee || '-') + '</span>' +
        '<span class="car-spec"><i class="fas fa-gas-pump"></i> ' + (car.carburant || '-') + '</span>' +
        '<span class="car-spec"><i class="fas fa-tachometer-alt"></i> ' + ((car.kilometrage || 0).toLocaleString('fr-FR')) + ' km</span>' +
        '</div>' +
        '<div class="car-footer">' +
        '<span class="car-price">' + (car.prix || 0).toLocaleString('fr-FR') + ' <span class="currency">MAD</span></span>' +
        '<a href="/cars/' + car.id + '" class="car-details-btn"><i class="fas fa-eye"></i> Détails</a>' +
        '</div></div></div></div>';
    });

    container.innerHTML = html;
  }

  /* ----------------------------------------------------------
     2. Image Upload Preview
     ---------------------------------------------------------- */
  function initImageUpload() {
    var imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    if (imageInputs.length === 0) return;

    imageInputs.forEach(function (input) {
      input.addEventListener('change', function () {
        var previewContainer = document.getElementById(input.getAttribute('data-preview') || 'image-preview');
        if (!previewContainer) {
          previewContainer = input.parentElement.querySelector('.image-preview');
        }
        if (!previewContainer) return;

        previewContainer.innerHTML = '';
        var files = this.files;

        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          if (!file.type.startsWith('image/')) continue;

          var reader = new FileReader();
          reader.onload = (function (f) {
            return function (e) {
              var wrapper = document.createElement('div');
              wrapper.className = 'preview-thumb';
              wrapper.style.cssText = 'display:inline-block;position:relative;margin:5px;';

              var img = document.createElement('img');
              img.src = e.target.result;
              img.alt = f.name;
              img.style.cssText = 'width:100px;height:80px;object-fit:cover;border-radius:8px;border:2px solid var(--border);';

              var removeBtn = document.createElement('button');
              removeBtn.type = 'button';
              removeBtn.className = 'btn-icon btn-danger-custom';
              removeBtn.innerHTML = '<i class="fas fa-times"></i>';
              removeBtn.style.cssText = 'position:absolute;top:-8px;right:-8px;width:24px;height:24px;font-size:0.65rem;';
              removeBtn.addEventListener('click', function () {
                wrapper.remove();
              });

              var nameLabel = document.createElement('div');
              nameLabel.textContent = f.name.length > 15 ? f.name.substring(0, 12) + '...' : f.name;
              nameLabel.style.cssText = 'font-size:0.7rem;text-align:center;color:var(--text-light);margin-top:4px;max-width:100px;overflow:hidden;';

              wrapper.appendChild(img);
              wrapper.appendChild(removeBtn);
              wrapper.appendChild(nameLabel);
              previewContainer.appendChild(wrapper);
            };
          })(file);

          reader.readAsDataURL(file);
        }
      });
    });

    // Single image preview (e.g., for edit forms)
    var singleImageInput = document.getElementById('image_principale');
    if (singleImageInput) {
      singleImageInput.addEventListener('change', function () {
        var preview = document.getElementById('main-image-preview');
        if (!preview || !this.files[0]) return;

        var reader = new FileReader();
        reader.onload = function (e) {
          preview.src = e.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(this.files[0]);
      });
    }
  }

  /* ----------------------------------------------------------
     3. Price Formatting on Input
     ---------------------------------------------------------- */
  function initPriceFormatting() {
    var priceInputs = document.querySelectorAll('input[data-format="price"], input[name="prix"], input[name="montant"], input[name="avance"]');

    priceInputs.forEach(function (input) {
      input.addEventListener('input', function () {
        // Remove non-digit characters
        var raw = this.value.replace(/[^\d]/g, '');
        if (raw === '') {
          this.value = '';
          return;
        }
        // Store the raw value in a data attribute
        this.setAttribute('data-raw-value', raw);
      });

      input.addEventListener('blur', function () {
        var raw = this.value.replace(/[^\d]/g, '');
        if (raw === '') return;
        this.value = parseInt(raw).toLocaleString('fr-FR');
        this.setAttribute('data-raw-value', raw);
      });

      input.addEventListener('focus', function () {
        var raw = this.getAttribute('data-raw-value') || this.value.replace(/[^\d]/g, '');
        this.value = raw;
      });
    });

    // Before form submit, convert formatted prices back to raw numbers
    document.querySelectorAll('form').forEach(function (form) {
      form.addEventListener('submit', function () {
        form.querySelectorAll('input[data-raw-value]').forEach(function (input) {
          input.value = input.getAttribute('data-raw-value') || input.value.replace(/[^\d]/g, '');
        });
      });
    });
  }

  /* ----------------------------------------------------------
     4. Car Details Page Interactions
     ---------------------------------------------------------- */
  function initCarDetails() {
    // Image gallery thumbnail clicks
    document.querySelectorAll('.gallery-thumb').forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var mainImage = document.getElementById('main-car-image');
        if (!mainImage) return;

        var src = this.getAttribute('data-src') || this.src;
        mainImage.src = src;

        // Active state
        document.querySelectorAll('.gallery-thumb').forEach(function (t) {
          t.classList.remove('active');
        });
        this.classList.add('active');
      });
    });

    // Image zoom (lightbox)
    var mainImage = document.getElementById('main-car-image');
    if (mainImage) {
      mainImage.style.cursor = 'pointer';
      mainImage.addEventListener('click', function () {
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:99999;cursor:pointer;';

        var img = document.createElement('img');
        img.src = this.src;
        img.style.cssText = 'max-width:90%;max-height:90%;object-fit:contain;border-radius:8px;';

        var closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.style.cssText = 'position:absolute;top:20px;right:20px;background:rgba(255,255,255,0.2);border:none;color:#fff;width:40px;height:40px;border-radius:50%;font-size:1.2rem;cursor:pointer;';

        overlay.appendChild(img);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);

        function close() { overlay.remove(); }
        overlay.addEventListener('click', close);
        closeBtn.addEventListener('click', close);
        document.addEventListener('keydown', function handler(e) {
          if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler); }
        });
      });
    }
  }

  /* ----------------------------------------------------------
     5. Reservation Modal
     ---------------------------------------------------------- */
  function initReservationModal() {
    var reserveBtn = document.querySelector('[data-action="reserve"]');
    if (!reserveBtn) return;

    reserveBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var carId = this.getAttribute('data-car-id');
      var carName = this.getAttribute('data-car-name') || 'cette voiture';

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Réserver ' + carName,
          html:
            '<div style="text-align:left;">' +
            '<div class="mb-3">' +
            '<label class="form-label">Date de réservation</label>' +
            '<input type="date" id="swal-date" class="form-control" value="' + new Date().toISOString().split('T')[0] + '">' +
            '</div>' +
            '<div class="mb-3">' +
            '<label class="form-label">Remarques</label>' +
            '<textarea id="swal-notes" class="form-control" rows="3" placeholder="Notes supplémentaires..."></textarea>' +
            '</div>' +
            '</div>',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#e94560',
          confirmButtonText: '<i class="fas fa-calendar-check"></i> Réserver',
          cancelButtonText: 'Annuler',
          reverseButtons: true,
          preConfirm: function () {
            var date = document.getElementById('swal-date').value;
            var notes = document.getElementById('swal-notes').value;
            if (!date) {
              Swal.showValidationMessage('Veuillez sélectionner une date');
              return false;
            }
            return { date: date, notes: notes };
          }
        }).then(function (result) {
          if (result.isConfirmed) {
            var form = document.createElement('form');
            form.method = 'POST';
            form.action = '/reservations';

            var fields = {
              voiture_id: carId,
              date_reservation: result.value.date,
              remarques: result.value.notes
            };

            Object.keys(fields).forEach(function (key) {
              var input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = fields[key] || '';
              form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
          }
        });
      }
    });
  }

  /* ----------------------------------------------------------
     6. Purchase Modal with Credit Calculation
     ---------------------------------------------------------- */
  function initPurchaseModal() {
    // Payment type toggle
    var typePaiement = document.getElementById('type_paiement');
    var creditFields = document.getElementById('credit-fields');

    if (typePaiement && creditFields) {
      typePaiement.addEventListener('change', function () {
        if (this.value === 'credit') {
          creditFields.style.display = 'block';
          creditFields.querySelectorAll('input').forEach(function (input) {
            input.required = true;
          });
        } else {
          creditFields.style.display = 'none';
          creditFields.querySelectorAll('input').forEach(function (input) {
            input.required = false;
          });
        }
        calculateCredit();
      });
    }

    // Credit calculation inputs
    var creditInputs = document.querySelectorAll('#montant_total, #avance, #nombre_mensualites, #taux_interet');
    creditInputs.forEach(function (input) {
      input.addEventListener('input', calculateCredit);
    });

    // Purchase button with Swal
    var purchaseBtn = document.querySelector('[data-action="purchase"]');
    if (purchaseBtn) {
      purchaseBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var carId = this.getAttribute('data-car-id');
        var carName = this.getAttribute('data-car-name') || 'cette voiture';
        var carPrix = parseFloat(this.getAttribute('data-car-prix')) || 0;

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Acheter ' + carName,
            html:
              '<div style="text-align:left;">' +
              '<div class="mb-3">' +
              '<label class="form-label">Prix total (MAD)</label>' +
              '<input type="number" id="swal-montant" class="form-control" value="' + carPrix + '" readonly>' +
              '</div>' +
              '<div class="mb-3">' +
              '<label class="form-label">Type de paiement</label>' +
              '<select id="swal-type" class="form-select">' +
              '<option value="comptant">Comptant</option>' +
              '<option value="credit">Crédit</option>' +
              '</select>' +
              '</div>' +
              '<div id="swal-credit-fields" style="display:none;">' +
              '<div class="mb-3">' +
              '<label class="form-label">Avance (MAD)</label>' +
              '<input type="number" id="swal-avance" class="form-control" value="0" min="0">' +
              '</div>' +
              '<div class="mb-3">' +
              '<label class="form-label">Nombre de mensualités</label>' +
              '<input type="number" id="swal-mensualites" class="form-control" value="12" min="1" max="72">' +
              '</div>' +
              '<div class="mb-3">' +
              '<label class="form-label">Taux d\'intérêt (%)</label>' +
              '<input type="number" id="swal-taux" class="form-control" value="5" min="0" max="30" step="0.5">' +
              '</div>' +
              '<div class="mb-3 p-3" style="background:rgba(233,69,96,0.08);border-radius:10px;">' +
              '<strong>Mensualité estimée :</strong> <span id="swal-mensualite-result" style="color:#e94560;font-weight:800;">-</span>' +
              '</div>' +
              '</div>' +
              '</div>',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#00b894',
            confirmButtonText: '<i class="fas fa-shopping-cart"></i> Confirmer l\'achat',
            cancelButtonText: 'Annuler',
            reverseButtons: true,
            didOpen: function () {
              var swalType = document.getElementById('swal-type');
              var swalCreditFields = document.getElementById('swal-credit-fields');

              swalType.addEventListener('change', function () {
                swalCreditFields.style.display = this.value === 'credit' ? 'block' : 'none';
                calculateSwalCredit();
              });

              ['swal-avance', 'swal-mensualites', 'swal-taux'].forEach(function (id) {
                var el = document.getElementById(id);
                if (el) el.addEventListener('input', calculateSwalCredit);
              });
            },
            preConfirm: function () {
              var type = document.getElementById('swal-type').value;
              var data = {
                voiture_id: carId,
                montant: carPrix,
                type_paiement: type
              };
              if (type === 'credit') {
                data.avance = parseFloat(document.getElementById('swal-avance').value) || 0;
                data.nombre_mensualites = parseInt(document.getElementById('swal-mensualites').value) || 12;
                data.taux_interet = parseFloat(document.getElementById('swal-taux').value) || 0;

                if (data.avance >= carPrix) {
                  Swal.showValidationMessage('L\'avance ne peut pas dépasser le prix total');
                  return false;
                }
              }
              return data;
            }
          }).then(function (result) {
            if (result.isConfirmed) {
              var form = document.createElement('form');
              form.method = 'POST';
              form.action = '/ventes';

              Object.keys(result.value).forEach(function (key) {
                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = result.value[key];
                form.appendChild(input);
              });

              document.body.appendChild(form);
              form.submit();
            }
          });
        }
      });
    }
  }

  function calculateCredit() {
    var montant = parseFloat((document.getElementById('montant_total') || {}).value) || 0;
    var avance = parseFloat((document.getElementById('avance') || {}).value) || 0;
    var nbMensualites = parseInt((document.getElementById('nombre_mensualites') || {}).value) || 1;
    var taux = parseFloat((document.getElementById('taux_interet') || {}).value) || 0;

    var result = computeMensualite(montant, avance, nbMensualites, taux);
    var displayEl = document.getElementById('mensualite-result');
    if (displayEl) {
      displayEl.textContent = result.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' MAD';
    }

    var totalCreditEl = document.getElementById('total-credit');
    if (totalCreditEl) {
      var totalCredit = result * nbMensualites + avance;
      totalCreditEl.textContent = totalCredit.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' MAD';
    }
  }

  function calculateSwalCredit() {
    var montant = parseFloat((document.getElementById('swal-montant') || {}).value) || 0;
    var avance = parseFloat((document.getElementById('swal-avance') || {}).value) || 0;
    var nbMensualites = parseInt((document.getElementById('swal-mensualites') || {}).value) || 1;
    var taux = parseFloat((document.getElementById('swal-taux') || {}).value) || 0;

    var result = computeMensualite(montant, avance, nbMensualites, taux);
    var displayEl = document.getElementById('swal-mensualite-result');
    if (displayEl) {
      displayEl.textContent = result.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' MAD / mois';
    }
  }

  /**
   * Calculate monthly payment:
   * mensualite = (montant - avance) * (1 + taux/100) / nombre_mensualites
   */
  function computeMensualite(montant, avance, nbMensualites, taux) {
    if (nbMensualites <= 0) return 0;
    var restant = montant - avance;
    if (restant <= 0) return 0;
    var totalWithInterest = restant * (1 + taux / 100);
    return totalWithInterest / nbMensualites;
  }

  /* ----------------------------------------------------------
     INIT ALL
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initSearchFilter();
    initImageUpload();
    initPriceFormatting();
    initCarDetails();
    initReservationModal();
    initPurchaseModal();
  });

})();
