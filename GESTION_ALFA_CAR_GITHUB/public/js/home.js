/* ============================================================
   GESTION ALFA CAR - Homepage JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. Loading Screen
     ---------------------------------------------------------- */
  function initLoadingScreen() {
    var loadingScreen = document.querySelector('.loading-screen');
    if (!loadingScreen) return;

    window.addEventListener('load', function () {
      setTimeout(function () {
        loadingScreen.classList.add('hidden');
        setTimeout(function () {
          loadingScreen.style.display = 'none';
        }, 600);
      }, 1800);
    });

    // Fallback: force hide after 4 seconds
    setTimeout(function () {
      if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        loadingScreen.classList.add('hidden');
        setTimeout(function () {
          loadingScreen.style.display = 'none';
        }, 600);
      }
    }, 4000);
  }

  /* ----------------------------------------------------------
     2. Three.js Hero Scene
     ---------------------------------------------------------- */
  function initHeroScene() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 6);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Build a simple wireframe car shape ---
    var carGroup = new THREE.Group();

    // Body (box)
    var bodyGeo = new THREE.BoxGeometry(3.2, 0.8, 1.6);
    var wireMat = new THREE.MeshBasicMaterial({ color: 0xe94560, wireframe: true, transparent: true, opacity: 0.45 });
    var body = new THREE.Mesh(bodyGeo, wireMat);
    body.position.y = 0.4;
    carGroup.add(body);

    // Cabin (box)
    var cabinGeo = new THREE.BoxGeometry(1.8, 0.7, 1.4);
    var cabinMat = new THREE.MeshBasicMaterial({ color: 0xff6b81, wireframe: true, transparent: true, opacity: 0.35 });
    var cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(-0.1, 1.1, 0);
    carGroup.add(cabin);

    // Wheels
    var wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
    var wheelMat = new THREE.MeshBasicMaterial({ color: 0xf0a500, wireframe: true, transparent: true, opacity: 0.5 });

    var wheelPositions = [
      { x: -1.1, y: 0.05, z: 0.9 },
      { x: 1.1, y: 0.05, z: 0.9 },
      { x: -1.1, y: 0.05, z: -0.9 },
      { x: 1.1, y: 0.05, z: -0.9 }
    ];

    wheelPositions.forEach(function (pos) {
      var wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.rotation.x = Math.PI / 2;
      carGroup.add(wheel);
    });

    carGroup.position.y = -0.5;
    scene.add(carGroup);

    // --- Ambient Particles ---
    var particleCount = 200;
    var particleGeo = new THREE.BufferGeometry();
    var positions = new Float32Array(particleCount * 3);
    var colors = new Float32Array(particleCount * 3);

    var particleColors = [
      { r: 0.914, g: 0.271, b: 0.376 }, // accent
      { r: 1.0, g: 0.420, b: 0.506 },   // accent-hover
      { r: 0.941, g: 0.647, b: 0.0 },   // gold
      { r: 0.455, g: 0.725, b: 1.0 }    // info
    ];

    for (var i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

      var colorChoice = particleColors[Math.floor(Math.random() * particleColors.length)];
      colors[i * 3] = colorChoice.r;
      colors[i * 3 + 1] = colorChoice.g;
      colors[i * 3 + 2] = colorChoice.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    var particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    });

    var particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Line connections between nearby particles ---
    var lineGeo = new THREE.BufferGeometry();
    var linePositions = [];
    var posArray = particleGeo.attributes.position.array;
    for (var a = 0; a < particleCount; a++) {
      for (var b = a + 1; b < particleCount; b++) {
        var dx = posArray[a * 3] - posArray[b * 3];
        var dy = posArray[a * 3 + 1] - posArray[b * 3 + 1];
        var dz = posArray[a * 3 + 2] - posArray[b * 3 + 2];
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 2.5) {
          linePositions.push(posArray[a * 3], posArray[a * 3 + 1], posArray[a * 3 + 2]);
          linePositions.push(posArray[b * 3], posArray[b * 3 + 1], posArray[b * 3 + 2]);
        }
      }
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    var lineMat = new THREE.LineBasicMaterial({ color: 0xe94560, transparent: true, opacity: 0.06 });
    var lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // --- Animation Loop ---
    var clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      var elapsed = clock.getElapsedTime();

      // Rotate car slowly
      carGroup.rotation.y = elapsed * 0.3;
      carGroup.position.y = -0.5 + Math.sin(elapsed * 0.8) * 0.15;

      // Move particles
      var posAttr = particles.geometry.attributes.position;
      for (var i = 0; i < particleCount; i++) {
        posAttr.array[i * 3 + 1] += Math.sin(elapsed + i) * 0.001;
      }
      posAttr.needsUpdate = true;

      // Rotate line connections
      lines.rotation.y = elapsed * 0.02;
      lines.rotation.x = elapsed * 0.01;

      renderer.render(scene, camera);
    }

    animate();

    // --- Handle Resize ---
    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /* ----------------------------------------------------------
     3. GSAP Animations
     ---------------------------------------------------------- */
  function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    // Hero text entrance
    var heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      gsap.from('.hero-badge', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 2.2,
        ease: 'power3.out'
      });

      gsap.from('.hero-content h1', {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 2.4,
        ease: 'power3.out'
      });

      gsap.from('.hero-subtext', {
        opacity: 0,
        y: 40,
        duration: 0.9,
        delay: 2.7,
        ease: 'power3.out'
      });

      gsap.from('.hero-buttons', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 3.0,
        ease: 'power3.out'
      });
    }

    // Stats counter animation on scroll
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray('.stat-number').forEach(function (el) {
        var target = parseInt(el.getAttribute('data-target')) || 0;
        var suffix = el.getAttribute('data-suffix') || '';

        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: function () {
            gsap.to(el, {
              duration: 2,
              ease: 'power2.out',
              onUpdate: function () {
                var progress = this.progress();
                var current = Math.floor(progress * target);
                el.textContent = current.toLocaleString('fr-FR') + suffix;
              },
              onComplete: function () {
                el.textContent = target.toLocaleString('fr-FR') + suffix;
              }
            });
          }
        });
      });

      // Section headings slide in
      gsap.utils.toArray('.section-heading').forEach(function (heading) {
        gsap.from(heading, {
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            once: true
          },
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: 'power3.out'
        });
      });
    }
  }

  /* ----------------------------------------------------------
     4. Swiper Initialization
     ---------------------------------------------------------- */
  function initSwipers() {
    if (typeof Swiper === 'undefined') return;

    // Featured cars slider
    var featuredSlider = document.querySelector('.featured-cars-swiper');
    if (featuredSlider) {
      new Swiper('.featured-cars-swiper', {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        autoplay: {
          delay: 4000,
          disableOnInteraction: false
        },
        pagination: {
          el: '.featured-cars-swiper .swiper-pagination',
          clickable: true
        },
        navigation: {
          nextEl: '.featured-cars-swiper .swiper-button-next',
          prevEl: '.featured-cars-swiper .swiper-button-prev'
        },
        breakpoints: {
          576: { slidesPerView: 1, spaceBetween: 16 },
          768: { slidesPerView: 2, spaceBetween: 20 },
          992: { slidesPerView: 3, spaceBetween: 24 },
          1200: { slidesPerView: 3, spaceBetween: 30 }
        }
      });
    }

    // Testimonials slider
    var testimonialSlider = document.querySelector('.testimonials-swiper');
    if (testimonialSlider) {
      new Swiper('.testimonials-swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false
        },
        pagination: {
          el: '.testimonials-swiper .swiper-pagination',
          clickable: true
        },
        breakpoints: {
          768: { slidesPerView: 2, spaceBetween: 24 },
          1200: { slidesPerView: 3, spaceBetween: 30 }
        }
      });
    }
  }

  /* ----------------------------------------------------------
     5. AOS Init with Custom Settings
     ---------------------------------------------------------- */
  function initAOS() {
    if (typeof AOS === 'undefined') return;
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
      offset: 60,
      delay: 50
    });
  }

  /* ----------------------------------------------------------
     6. Counter Animation (Fallback if no GSAP ScrollTrigger)
     ---------------------------------------------------------- */
  function initCounterFallback() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') return;

    var counters = document.querySelectorAll('.stat-number[data-target]');
    if (counters.length === 0) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target')) || 0;
          var suffix = el.getAttribute('data-suffix') || '';
          var duration = 2000;
          var startTime = null;

          function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString('fr-FR') + suffix;
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = target.toLocaleString('fr-FR') + suffix;
            }
          }

          requestAnimationFrame(step);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(function (c) { observer.observe(c); });
  }

  /* ----------------------------------------------------------
     7. Search Form Handler
     ---------------------------------------------------------- */
  function initSearchForm() {
    var searchForm = document.getElementById('search-form');
    if (!searchForm) return;

    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var formData = new FormData(searchForm);
      var params = new URLSearchParams();

      formData.forEach(function (value, key) {
        if (value && value.trim() !== '') {
          params.append(key, value.trim());
        }
      });

      var queryString = params.toString();
      var url = '/cars' + (queryString ? '?' + queryString : '');
      window.location.href = url;
    });
  }

  /* ----------------------------------------------------------
     8. Parallax on Hero Scroll
     ---------------------------------------------------------- */
  function initParallax() {
    var heroContent = document.querySelector('.hero-content');
    var heroSection = document.querySelector('.hero-section');
    if (!heroContent || !heroSection) return;

    var ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrolled = window.scrollY;
          var heroHeight = heroSection.offsetHeight;

          if (scrolled < heroHeight) {
            var translateY = scrolled * 0.3;
            var opacity = 1 - (scrolled / heroHeight) * 0.8;
            heroContent.style.transform = 'translateY(' + translateY + 'px)';
            heroContent.style.opacity = Math.max(opacity, 0);
          }

          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ----------------------------------------------------------
     9. Navbar Scroll Effect
     ---------------------------------------------------------- */
  function initNavbarScroll() {
    var navbar = document.querySelector('.navbar-home');
    if (!navbar) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  /* ----------------------------------------------------------
     INIT ALL
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initLoadingScreen();
    initHeroScene();
    initGSAPAnimations();
    initSwipers();
    initAOS();
    initCounterFallback();
    initSearchForm();
    initParallax();
    initNavbarScroll();
  });

})();
