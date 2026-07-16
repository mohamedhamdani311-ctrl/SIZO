/* ============================================================
   GESTION ALFA CAR - Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* ----------------------------------------------------------
     1. Dark / Light Mode Toggle
     ---------------------------------------------------------- */
  const themeToggleBtns = document.querySelectorAll('.theme-toggle, .theme-toggle-btn');
  const htmlEl = document.documentElement;

  function getStoredTheme() {
    return localStorage.getItem('alfa-car-theme') || 'light';
  }

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('alfa-car-theme', theme);
    updateThemeIcons(theme);
  }

  function updateThemeIcons(theme) {
    themeToggleBtns.forEach(function (btn) {
      var icon = btn.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    });
  }

  function toggleTheme() {
    var current = htmlEl.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Initialize theme
  applyTheme(getStoredTheme());

  // Bind toggle buttons
  themeToggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      toggleTheme();
    });
  });

  /* ----------------------------------------------------------
     2. Sidebar Toggle (Dashboard)
     ---------------------------------------------------------- */
  var sidebar = document.querySelector('.sidebar');
  var mainContent = document.querySelector('.main-content');
  var sidebarToggle = document.querySelector('.sidebar-toggle');
  var mobileSidebarToggle = document.querySelector('.mobile-sidebar-toggle');
  var sidebarOverlay = document.querySelector('.sidebar-overlay');

  function getSidebarState() {
    return localStorage.getItem('alfa-car-sidebar') || 'expanded';
  }

  function applySidebarState(state) {
    if (!sidebar || !mainContent) return;
    if (state === 'collapsed') {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('sidebar-collapsed');
    } else {
      sidebar.classList.remove('collapsed');
      mainContent.classList.remove('sidebar-collapsed');
    }
  }

  function toggleSidebar() {
    if (!sidebar || !mainContent) return;
    var isCollapsed = sidebar.classList.contains('collapsed');
    if (isCollapsed) {
      sidebar.classList.remove('collapsed');
      mainContent.classList.remove('sidebar-collapsed');
      localStorage.setItem('alfa-car-sidebar', 'expanded');
    } else {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('sidebar-collapsed');
      localStorage.setItem('alfa-car-sidebar', 'collapsed');
    }
  }

  function toggleMobileSidebar() {
    if (!sidebar || !sidebarOverlay) return;
    var isOpen = sidebar.classList.contains('mobile-open');
    if (isOpen) {
      sidebar.classList.remove('mobile-open');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    } else {
      sidebar.classList.add('mobile-open');
      sidebarOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  // Apply saved sidebar state on desktop
  if (window.innerWidth > 992) {
    applySidebarState(getSidebarState());
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function (e) {
      e.preventDefault();
      toggleSidebar();
    });
  }

  if (mobileSidebarToggle) {
    mobileSidebarToggle.addEventListener('click', function (e) {
      e.preventDefault();
      toggleMobileSidebar();
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function () {
      toggleMobileSidebar();
    });
  }

  /* ----------------------------------------------------------
     3. Smooth Scroll for Anchor Links
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length <= 1) return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ----------------------------------------------------------
     4. Active Nav Link Highlighting
     ---------------------------------------------------------- */
  var currentPath = window.location.pathname;
  document.querySelectorAll('.sidebar-nav-link, .nav-link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && currentPath.includes(href) && href !== '/') {
      link.classList.add('active');
    } else if (href === '/' && currentPath === '/') {
      link.classList.add('active');
    }
  });

  /* ----------------------------------------------------------
     5. Back to Top Button
     ---------------------------------------------------------- */
  var backToTopBtn = document.querySelector('.back-to-top');

  function handleBackToTopVisibility() {
    if (!backToTopBtn) return;
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleBackToTopVisibility);
  handleBackToTopVisibility();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     6. Loading Overlay Helpers
     ---------------------------------------------------------- */
  window.showLoading = function () {
    var overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.classList.add('active');
    } else {
      var div = document.createElement('div');
      div.className = 'loading-overlay active';
      div.innerHTML = '<div class="loading-spinner"></div>';
      document.body.appendChild(div);
    }
  };

  window.hideLoading = function () {
    var overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(function () {
        if (!overlay.classList.contains('active')) {
          // keep in DOM for reuse
        }
      }, 300);
    }
  };

  /* ----------------------------------------------------------
     7. Confirm Action (SweetAlert2)
     ---------------------------------------------------------- */
  window.confirmAction = function (title, text, action, confirmText, iconType) {
    if (typeof Swal === 'undefined') {
      if (confirm(title + '\n' + text)) {
        action();
      }
      return;
    }

    Swal.fire({
      title: title || 'Êtes-vous sûr ?',
      text: text || 'Cette action est irréversible.',
      icon: iconType || 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e94560',
      cancelButtonColor: '#636e72',
      confirmButtonText: confirmText || '<i class="fas fa-check"></i> Confirmer',
      cancelButtonText: '<i class="fas fa-times"></i> Annuler',
      reverseButtons: true,
      customClass: {
        popup: 'swal-custom-popup',
        confirmButton: 'btn btn-primary-custom',
        cancelButton: 'btn btn-outline-custom'
      }
    }).then(function (result) {
      if (result.isConfirmed) {
        action();
      }
    });
  };

  // Confirm delete shortcut
  window.confirmDelete = function (formId, itemName) {
    var name = itemName || 'cet élément';
    window.confirmAction(
      'Supprimer ?',
      'Voulez-vous vraiment supprimer ' + name + ' ? Cette action est irréversible.',
      function () {
        var form = document.getElementById(formId);
        if (form) form.submit();
      },
      '<i class="fas fa-trash"></i> Supprimer',
      'warning'
    );
  };

  // Bind data-confirm-delete buttons
  document.querySelectorAll('[data-confirm-delete]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var formId = this.getAttribute('data-confirm-delete');
      var itemName = this.getAttribute('data-item-name') || 'cet élément';
      window.confirmDelete(formId, itemName);
    });
  });

  /* ----------------------------------------------------------
     8. Format Helpers
     ---------------------------------------------------------- */
  window.formatPrice = function (price) {
    if (price === null || price === undefined) return '0 MAD';
    var num = parseFloat(price);
    if (isNaN(num)) return '0 MAD';
    return num.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }) + ' MAD';
  };

  window.formatDate = function (dateStr) {
    if (!dateStr) return '-';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  window.formatDateTime = function (dateStr) {
    if (!dateStr) return '-';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /* ----------------------------------------------------------
     9. Initialize AOS
     ---------------------------------------------------------- */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
      offset: 50
    });
  }

  /* ----------------------------------------------------------
     10. Flash Messages
     ---------------------------------------------------------- */
  function displayFlashMessages() {
    var flashContainer = document.getElementById('flash-messages');
    if (!flashContainer) return;

    var messages = flashContainer.querySelectorAll('[data-flash]');
    messages.forEach(function (msg) {
      var type = msg.getAttribute('data-flash-type') || 'info';
      var text = msg.getAttribute('data-flash') || msg.textContent;

      if (typeof Swal !== 'undefined') {
        var iconMap = {
          success: 'success',
          error: 'error',
          danger: 'error',
          warning: 'warning',
          info: 'info'
        };
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: iconMap[type] || 'info',
          title: text,
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
          customClass: { popup: 'swal-toast-custom' }
        });
      }
    });

    // Also check global flash variables
    if (typeof window.flashMessages !== 'undefined' && Array.isArray(window.flashMessages)) {
      window.flashMessages.forEach(function (msg) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: msg.type || 'info',
            title: msg.text,
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true
          });
        }
      });
    }
  }

  displayFlashMessages();

  // Auto-dismiss Bootstrap alerts
  document.querySelectorAll('.alert-dismissible').forEach(function (alert) {
    setTimeout(function () {
      var closeBtn = alert.querySelector('.btn-close');
      if (closeBtn) closeBtn.click();
    }, 5000);
  });

  /* ----------------------------------------------------------
     11. Form Validation Helpers
     ---------------------------------------------------------- */
  window.validateRequired = function (value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  };

  window.validateEmail = function (email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  window.validatePhone = function (phone) {
    var re = /^[+]?[\d\s\-()]{8,15}$/;
    return re.test(phone);
  };

  window.validateMinLength = function (value, min) {
    return value && value.length >= min;
  };

  window.showFieldError = function (field, message) {
    var input = typeof field === 'string' ? document.querySelector(field) : field;
    if (!input) return;
    input.classList.add('is-invalid');
    var feedback = input.parentElement.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      input.parentElement.appendChild(feedback);
    }
    feedback.textContent = message;
  };

  window.clearFieldError = function (field) {
    var input = typeof field === 'string' ? document.querySelector(field) : field;
    if (!input) return;
    input.classList.remove('is-invalid');
    var feedback = input.parentElement.querySelector('.invalid-feedback');
    if (feedback) feedback.textContent = '';
  };

  // Clear errors on input
  document.querySelectorAll('.form-control, .form-select').forEach(function (input) {
    input.addEventListener('input', function () {
      window.clearFieldError(this);
    });
  });

  /* ----------------------------------------------------------
     12. Animated Counter
     ---------------------------------------------------------- */
  window.animateCounter = function (element, target, duration, suffix) {
    var start = 0;
    var startTime = null;
    suffix = suffix || '';
    target = parseFloat(target) || 0;
    duration = duration || 2000;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      var current = Math.floor(eased * target);
      element.textContent = current.toLocaleString('fr-FR') + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target.toLocaleString('fr-FR') + suffix;
      }
    }

    requestAnimationFrame(step);
  };

  // Auto-animate counters with data-counter attribute
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (counters.length === 0) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseFloat(el.getAttribute('data-counter')) || 0;
          var suffix = el.getAttribute('data-counter-suffix') || '';
          var duration = parseInt(el.getAttribute('data-counter-duration')) || 2000;
          window.animateCounter(el, target, duration, suffix);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  initCounters();

  /* ----------------------------------------------------------
     13. Tooltips & Popovers (Bootstrap)
     ---------------------------------------------------------- */
  if (typeof bootstrap !== 'undefined') {
    var tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(function (el) {
      new bootstrap.Tooltip(el);
    });

    var popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    popoverTriggerList.forEach(function (el) {
      new bootstrap.Popover(el);
    });
  }

  /* ----------------------------------------------------------
     14. Notification Sound (optional)
     ---------------------------------------------------------- */
  window.showNotification = function (title, message, type) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: type || 'info',
        title: title,
        text: message,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
      });
    }
  };

  /* ----------------------------------------------------------
     15. Copy to Clipboard
     ---------------------------------------------------------- */
  window.copyToClipboard = function (text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        window.showNotification('Copié !', '', 'success');
      });
    } else {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      window.showNotification('Copié !', '', 'success');
    }
  };

  console.log('%c🚗 GESTION ALFA CAR - Système chargé', 'color: #e94560; font-size: 14px; font-weight: bold;');
});
