/* ============================================================
   GESTION ALFA CAR - Dashboard JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. DataTables Initialization
     ---------------------------------------------------------- */
  function initDataTables() {
    if (typeof $ === 'undefined' || typeof $.fn.DataTable === 'undefined') return;

    var frenchLang = {
      processing: 'Traitement en cours...',
      search: 'Rechercher&nbsp;:',
      lengthMenu: 'Afficher _MENU_ éléments',
      info: 'Affichage de _START_ à _END_ sur _TOTAL_ éléments',
      infoEmpty: 'Aucun élément à afficher',
      infoFiltered: '(filtré à partir de _MAX_ éléments au total)',
      infoPostFix: '',
      loadingRecords: 'Chargement en cours...',
      zeroRecords: 'Aucun élément correspondant trouvé',
      emptyTable: 'Aucune donnée disponible dans le tableau',
      paginate: {
        first: '<i class="fas fa-angle-double-left"></i>',
        previous: '<i class="fas fa-angle-left"></i>',
        next: '<i class="fas fa-angle-right"></i>',
        last: '<i class="fas fa-angle-double-right"></i>'
      },
      aria: {
        sortAscending: ': activer pour trier la colonne par ordre croissant',
        sortDescending: ': activer pour trier la colonne par ordre décroissant'
      },
      select: {
        rows: {
          _: '%d lignes sélectionnées',
          0: 'Aucune ligne sélectionnée',
          1: '1 ligne sélectionnée'
        }
      },
      buttons: {
        print: '<i class="fas fa-print"></i> Imprimer',
        copy: '<i class="fas fa-copy"></i> Copier',
        csv: '<i class="fas fa-file-csv"></i> CSV',
        excel: '<i class="fas fa-file-excel"></i> Excel',
        pdf: '<i class="fas fa-file-pdf"></i> PDF',
        colvis: '<i class="fas fa-columns"></i> Colonnes'
      }
    };

    document.querySelectorAll('.datatable').forEach(function (table) {
      if ($.fn.DataTable.isDataTable(table)) return;

      $(table).DataTable({
        language: frenchLang,
        responsive: true,
        pageLength: 10,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, 'Tout']],
        dom: '<"row mb-3"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip',
        order: [],
        columnDefs: [
          { orderable: false, targets: 'no-sort' }
        ],
        drawCallback: function () {
          // Re-initialize tooltips on redraw
          if (typeof bootstrap !== 'undefined') {
            var tooltipList = this.api().table().container().querySelectorAll('[data-bs-toggle="tooltip"]');
            tooltipList.forEach(function (el) {
              new bootstrap.Tooltip(el);
            });
          }
        }
      });
    });
  }

  /* ----------------------------------------------------------
     2. Chart.js Initialization
     ---------------------------------------------------------- */
  function initCharts() {
    if (typeof Chart === 'undefined') return;

    // Global Chart.js defaults
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim() || '#636e72';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 16;

    var accentColor = '#e94560';
    var accentHover = '#ff6b81';
    var successColor = '#00b894';
    var goldColor = '#f0a500';
    var infoColor = '#74b9ff';
    var dangerColor = '#e17055';
    var purpleColor = '#6c5ce7';

    // --- Sales Line Chart ---
    var salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
      var salesGradient = salesCtx.getContext('2d').createLinearGradient(0, 0, 0, 300);
      salesGradient.addColorStop(0, 'rgba(233, 69, 96, 0.3)');
      salesGradient.addColorStop(1, 'rgba(233, 69, 96, 0.0)');

      var salesData = [];
      var salesLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

      // Try to get data from data attributes
      if (salesCtx.dataset.values) {
        try { salesData = JSON.parse(salesCtx.dataset.values); } catch (e) { salesData = []; }
      }
      if (salesCtx.dataset.labels) {
        try { salesLabels = JSON.parse(salesCtx.dataset.labels); } catch (e) {}
      }
      if (salesData.length === 0) {
        salesData = [12, 19, 15, 22, 18, 25, 30, 28, 35, 32, 40, 38];
      }

      new Chart(salesCtx, {
        type: 'line',
        data: {
          labels: salesLabels,
          datasets: [{
            label: 'Ventes',
            data: salesData,
            borderColor: accentColor,
            backgroundColor: salesGradient,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: accentColor,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: {
              backgroundColor: '#1a1a2e',
              titleFont: { weight: '600' },
              bodyFont: { size: 13 },
              padding: 12,
              cornerRadius: 8,
              displayColors: false
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 } }
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: { font: { size: 11 } }
            }
          }
        }
      });
    }

    // --- Revenue Bar Chart ---
    var revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
      var revenueData = [];
      var revenueLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

      if (revenueCtx.dataset.values) {
        try { revenueData = JSON.parse(revenueCtx.dataset.values); } catch (e) { revenueData = []; }
      }
      if (revenueCtx.dataset.labels) {
        try { revenueLabels = JSON.parse(revenueCtx.dataset.labels); } catch (e) {}
      }
      if (revenueData.length === 0) {
        revenueData = [450000, 580000, 520000, 690000, 610000, 820000, 950000, 880000, 1100000, 1050000, 1300000, 1200000];
      }

      new Chart(revenueCtx, {
        type: 'bar',
        data: {
          labels: revenueLabels,
          datasets: [{
            label: 'Revenus (MAD)',
            data: revenueData,
            backgroundColor: [
              accentColor, accentHover, successColor, goldColor,
              infoColor, dangerColor, purpleColor, accentColor,
              accentHover, successColor, goldColor, infoColor
            ],
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: {
              backgroundColor: '#1a1a2e',
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function (ctx) {
                  return ctx.parsed.y.toLocaleString('fr-FR') + ' MAD';
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 } }
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { size: 11 },
                callback: function (value) {
                  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                  if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
                  return value;
                }
              }
            }
          }
        }
      });
    }

    // --- Cars Doughnut Chart ---
    var carsCtx = document.getElementById('carsChart');
    if (carsCtx) {
      var carsLabels = [];
      var carsData = [];

      if (carsCtx.dataset.labels) {
        try { carsLabels = JSON.parse(carsCtx.dataset.labels); } catch (e) {}
      }
      if (carsCtx.dataset.values) {
        try { carsData = JSON.parse(carsCtx.dataset.values); } catch (e) {}
      }
      if (carsLabels.length === 0) {
        carsLabels = ['Mercedes', 'BMW', 'Audi', 'Toyota', 'Dacia', 'Autres'];
        carsData = [25, 20, 18, 15, 12, 10];
      }

      new Chart(carsCtx, {
        type: 'doughnut',
        data: {
          labels: carsLabels,
          datasets: [{
            data: carsData,
            backgroundColor: [accentColor, goldColor, infoColor, successColor, purpleColor, dangerColor],
            borderWidth: 0,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { padding: 16, usePointStyle: true }
            },
            tooltip: {
              backgroundColor: '#1a1a2e',
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function (ctx) {
                  var total = ctx.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                  var pct = Math.round((ctx.parsed / total) * 100);
                  return ctx.label + ': ' + ctx.parsed + ' (' + pct + '%)';
                }
              }
            }
          }
        }
      });
    }

    // --- Status Pie Chart ---
    var statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
      var statusLabels = [];
      var statusData = [];

      if (statusCtx.dataset.labels) {
        try { statusLabels = JSON.parse(statusCtx.dataset.labels); } catch (e) {}
      }
      if (statusCtx.dataset.values) {
        try { statusData = JSON.parse(statusCtx.dataset.values); } catch (e) {}
      }
      if (statusLabels.length === 0) {
        statusLabels = ['Disponible', 'Réservée', 'Vendue'];
        statusData = [45, 15, 40];
      }

      new Chart(statusCtx, {
        type: 'pie',
        data: {
          labels: statusLabels,
          datasets: [{
            data: statusData,
            backgroundColor: [successColor, infoColor, purpleColor],
            borderWidth: 0,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { padding: 14, usePointStyle: true }
            }
          }
        }
      });
    }
  }

  /* ----------------------------------------------------------
     3. Checkbox Handling
     ---------------------------------------------------------- */
  function initCheckboxes() {
    // Select all checkbox
    var selectAllCb = document.getElementById('selectAll');
    if (selectAllCb) {
      selectAllCb.addEventListener('change', function () {
        var isChecked = this.checked;
        document.querySelectorAll('.row-checkbox').forEach(function (cb) {
          cb.checked = isChecked;
        });
        updateBulkActionsVisibility();
      });
    }

    // Individual checkboxes
    document.querySelectorAll('.row-checkbox').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var allChecked = document.querySelectorAll('.row-checkbox').length ===
                         document.querySelectorAll('.row-checkbox:checked').length;
        if (selectAllCb) selectAllCb.checked = allChecked;
        updateBulkActionsVisibility();
      });
    });
  }

  function updateBulkActionsVisibility() {
    var checkedCount = document.querySelectorAll('.row-checkbox:checked').length;
    var bulkActions = document.querySelector('.bulk-actions');
    var selectedCount = document.querySelector('.selected-count');

    if (bulkActions) {
      bulkActions.style.display = checkedCount > 0 ? 'flex' : 'none';
    }
    if (selectedCount) {
      selectedCount.textContent = checkedCount;
    }
  }

  window.getSelectedIds = function () {
    var ids = [];
    document.querySelectorAll('.row-checkbox:checked').forEach(function (cb) {
      ids.push(cb.value);
    });
    return ids;
  };

  /* ----------------------------------------------------------
     4. Confirm Actions
     ---------------------------------------------------------- */
  function initConfirmActions() {
    // Delete buttons
    document.querySelectorAll('[data-action="delete"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var url = this.getAttribute('data-url') || this.getAttribute('href');
        var name = this.getAttribute('data-name') || 'cet élément';

        window.confirmAction(
          'Supprimer ?',
          'Voulez-vous vraiment supprimer ' + name + ' ?',
          function () {
            if (url) {
              var form = document.createElement('form');
              form.method = 'POST';
              form.action = url;
              var methodInput = document.createElement('input');
              methodInput.type = 'hidden';
              methodInput.name = '_method';
              methodInput.value = 'DELETE';
              form.appendChild(methodInput);
              document.body.appendChild(form);
              form.submit();
            }
          },
          '<i class="fas fa-trash"></i> Supprimer'
        );
      });
    });

    // Approve buttons
    document.querySelectorAll('[data-action="approve"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var url = this.getAttribute('data-url') || this.getAttribute('href');
        var name = this.getAttribute('data-name') || 'cette action';

        window.confirmAction(
          'Approuver ?',
          'Voulez-vous approuver ' + name + ' ?',
          function () {
            if (url) window.location.href = url;
          },
          '<i class="fas fa-check"></i> Approuver',
          'question'
        );
      });
    });

    // Reject buttons
    document.querySelectorAll('[data-action="reject"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var url = this.getAttribute('data-url') || this.getAttribute('href');
        var name = this.getAttribute('data-name') || 'cette action';

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Rejeter ?',
            text: 'Voulez-vous rejeter ' + name + ' ?',
            icon: 'warning',
            input: 'textarea',
            inputLabel: 'Motif de rejet (optionnel)',
            inputPlaceholder: 'Indiquez le motif...',
            showCancelButton: true,
            confirmButtonColor: '#e17055',
            cancelButtonColor: '#636e72',
            confirmButtonText: '<i class="fas fa-times"></i> Rejeter',
            cancelButtonText: 'Annuler',
            reverseButtons: true
          }).then(function (result) {
            if (result.isConfirmed) {
              var separator = url.indexOf('?') !== -1 ? '&' : '?';
              var fullUrl = url + separator + 'motif=' + encodeURIComponent(result.value || '');
              window.location.href = fullUrl;
            }
          });
        } else {
          if (confirm('Rejeter ' + name + ' ?')) {
            window.location.href = url;
          }
        }
      });
    });

    // Bulk delete
    var bulkDeleteBtn = document.querySelector('[data-action="bulk-delete"]');
    if (bulkDeleteBtn) {
      bulkDeleteBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var ids = window.getSelectedIds();
        if (ids.length === 0) {
          window.showNotification('Attention', 'Veuillez sélectionner au moins un élément.', 'warning');
          return;
        }

        window.confirmAction(
          'Suppression multiple',
          'Supprimer ' + ids.length + ' élément(s) sélectionné(s) ?',
          function () {
            var url = bulkDeleteBtn.getAttribute('data-url');
            if (url) {
              var form = document.createElement('form');
              form.method = 'POST';
              form.action = url;
              var methodInput = document.createElement('input');
              methodInput.type = 'hidden';
              methodInput.name = '_method';
              methodInput.value = 'DELETE';
              form.appendChild(methodInput);
              ids.forEach(function (id) {
                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'ids[]';
                input.value = id;
                form.appendChild(input);
              });
              document.body.appendChild(form);
              form.submit();
            }
          },
          '<i class="fas fa-trash"></i> Supprimer (' + ids.length + ')'
        );
      });
    }
  }

  /* ----------------------------------------------------------
     5. Animated Stat Counters
     ---------------------------------------------------------- */
  function initStatCounters() {
    var counters = document.querySelectorAll('.stat-value[data-counter]');
    if (counters.length === 0) return;

    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-counter')) || 0;
      var suffix = el.getAttribute('data-counter-suffix') || '';
      if (typeof window.animateCounter === 'function') {
        window.animateCounter(el, target, 2000, suffix);
      } else {
        el.textContent = target.toLocaleString('fr-FR') + suffix;
      }
    });
  }

  /* ----------------------------------------------------------
     6. Real-time Search (Debounced)
     ---------------------------------------------------------- */
  function initRealtimeSearch() {
    var searchInput = document.getElementById('dashboard-search');
    if (!searchInput) return;

    var debounceTimer = null;
    var resultsContainer = document.getElementById('search-results');

    searchInput.addEventListener('input', function () {
      var query = this.value.trim();

      if (debounceTimer) clearTimeout(debounceTimer);

      if (query.length < 2) {
        if (resultsContainer) resultsContainer.innerHTML = '';
        return;
      }

      debounceTimer = setTimeout(function () {
        fetch('/api/search?q=' + encodeURIComponent(query), {
          headers: { 'Accept': 'application/json' }
        })
        .then(function (res) {
          if (!res.ok) throw new Error('Erreur réseau');
          return res.json();
        })
        .then(function (data) {
          if (resultsContainer && data.results) {
            var html = '';
            data.results.forEach(function (item) {
              html += '<a href="' + item.url + '" class="notification-item">';
              html += '<div class="notif-icon" style="background:rgba(233,69,96,0.1);color:#e94560;">';
              html += '<i class="fas fa-' + (item.icon || 'car') + '"></i></div>';
              html += '<div><div class="notif-text">' + item.title + '</div>';
              html += '<div class="notif-time">' + (item.subtitle || '') + '</div></div>';
              html += '</a>';
            });
            resultsContainer.innerHTML = html || '<div class="p-3 text-center text-muted">Aucun résultat</div>';
          }
        })
        .catch(function (err) {
          console.warn('Recherche:', err.message);
        });
      }, 350);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (resultsContainer && !searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
        resultsContainer.innerHTML = '';
      }
    });
  }

  /* ----------------------------------------------------------
     7. Sidebar Toggle Persistence
     ---------------------------------------------------------- */
  function initSidebarPersistence() {
    var sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // Already handled in main.js, this is just a supplement
    var state = localStorage.getItem('alfa-car-sidebar');
    if (state === 'collapsed' && window.innerWidth > 992) {
      sidebar.classList.add('collapsed');
      var main = document.querySelector('.main-content');
      if (main) main.classList.add('sidebar-collapsed');
    }
  }

  /* ----------------------------------------------------------
     8. Dashboard Notifications
     ---------------------------------------------------------- */
  function initNotifications() {
    var notifBell = document.querySelector('.notif-bell');
    var notifDropdown = document.querySelector('.notification-dropdown');
    if (!notifBell || !notifDropdown) return;

    notifBell.addEventListener('click', function (e) {
      e.stopPropagation();
      notifDropdown.classList.toggle('show');
    });

    document.addEventListener('click', function () {
      notifDropdown.classList.remove('show');
    });
  }

  /* ----------------------------------------------------------
     INIT ALL
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initDataTables();
    initCharts();
    initCheckboxes();
    initConfirmActions();
    initStatCounters();
    initRealtimeSearch();
    initSidebarPersistence();
    initNotifications();
  });

})();
