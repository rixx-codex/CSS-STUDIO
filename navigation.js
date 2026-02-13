/* ================================================
   ZAN STUDIO - Responsive Navigation JavaScript
   Device Detection, Touch Gestures & Interactions
   ================================================ */

(function() {
  'use strict';

  // ================================================
  // DEVICE DETECTION
  // ================================================
  const DeviceDetector = {
    isMobile: () => window.innerWidth < 1024,
    isTablet: () => window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: () => window.innerWidth >= 1024,
    isTouch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    isAndroid: () => /Android/.test(navigator.userAgent),
    
    getDeviceType: function() {
      if (this.isMobile()) return 'mobile';
      if (this.isTablet()) return 'tablet';
      return 'desktop';
    },

    init: function() {
      document.documentElement.classList.add('device-' + this.getDeviceType());
      document.documentElement.classList.add(this.isTouch() ? 'touch-device' : 'mouse-device');
      
      if (this.isIOS()) document.documentElement.classList.add('ios');
      if (this.isAndroid()) document.documentElement.classList.add('android');
    }
  };

  // ================================================
  // NAVIGATION CONTROLLER
  // ================================================
  const Navigation = {
    navElement: null,
    menuToggle: null,
    navOverlay: null,
    navDrawer: null,
    navCloseBtn: null,
    isOpen: false,
    scrollY: 0,

    init: function() {
      this.navElement = document.querySelector('nav');
      this.menuToggle = document.querySelector('.menu-toggle');
      this.navOverlay = document.querySelector('.nav-overlay');
      this.navDrawer = document.querySelector('.nav-drawer');
      this.navCloseBtn = document.querySelector('.nav-close-btn');

      if (!this.menuToggle || !this.navOverlay || !this.navDrawer) {
        console.warn('Navigation elements not found');
        return;
      }

      this.bindEvents();
      this.handleScroll();
    },

    bindEvents: function() {
      const self = this;

      // Menu Toggle Click
      this.menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        self.toggleMenu();
      });

      // Close Button Click
      if (this.navCloseBtn) {
        this.navCloseBtn.addEventListener('click', function(e) {
          e.preventDefault();
          self.closeMenu();
        });
      }

      // Overlay Click
      this.navOverlay.addEventListener('click', function() {
        self.closeMenu();
      });

      // Escape Key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && self.isOpen) {
          self.closeMenu();
        }
      });

      // Swipe Left to Close (Touch Devices)
      if (DeviceDetector.isTouch()) {
        let startX = 0;
        let endX = 0;

        this.navDrawer.addEventListener('touchstart', function(e) {
          startX = e.touches[0].clientX;
        }, { passive: true });

        this.navDrawer.addEventListener('touchmove', function(e) {
          endX = e.touches[0].clientX;
        }, { passive: true });

        this.navDrawer.addEventListener('touchend', function() {
          if (startX - endX > 100) {
            self.closeMenu();
          }
        }, { passive: true });
      }

      // Window Resize
      window.addEventListener('resize', function() {
        if (DeviceDetector.isDesktop() && self.isOpen) {
          self.closeMenu();
        }
      });

      // Scroll Effect
      window.addEventListener('scroll', function() {
        self.handleScroll();
      }, { passive: true });
    },

    toggleMenu: function() {
      this.isOpen ? this.closeMenu() : this.openMenu();
    },

    openMenu: function() {
      this.isOpen = true;
      this.menuToggle.classList.add('active');
      this.navOverlay.classList.add('active');
      this.navDrawer.classList.add('active');
      
      // Prevent body scroll
      this.scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + this.scrollY + 'px';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      
      // ARIA attributes
      this.menuToggle.setAttribute('aria-expanded', 'true');
    },

    closeMenu: function() {
      this.isOpen = false;
      this.menuToggle.classList.remove('active');
      this.navOverlay.classList.remove('active');
      this.navDrawer.classList.remove('active');
      
      // Restore body scroll
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      window.scrollTo(0, this.scrollY);

      // ARIA attributes
      this.menuToggle.setAttribute('aria-expanded', 'false');
    },

    handleScroll: function() {
      if (!this.navElement) return;

      if (window.scrollY > 50) {
        this.navElement.classList.add('scrolled');
        if (DeviceDetector.isDesktop()) {
          this.navElement.classList.add('scroll-effect');
        }
      } else {
        this.navElement.classList.remove('scrolled');
        this.navElement.classList.remove('scroll-effect');
      }
    }
  };

  // ================================================
  // NAVIGATION HIGHLIGHTER
  // ================================================
  const NavHighlighter = {
    currentPage: null,

    init: function() {
      const path = window.location.pathname;
      const page = path.split('/').pop() || 'index.html';
      this.currentPage = page;

      // Desktop Links
      const desktopLinks = document.querySelectorAll('.nav-link');
      desktopLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === page || (page === '' && href === 'index.html')) {
          link.classList.add('active');
        }
      });

      // Mobile Links
      const mobileLinks = document.querySelectorAll('.nav-drawer-link');
      mobileLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === page || (page === '' && href === 'index.html')) {
          link.classList.add('active');
        }
      });
    }
  };

  // ================================================
  // SMOOTH SCROLL
  // ================================================
  const SmoothScroll = {
    init: function() {
      const links = document.querySelectorAll('a[href^="#"]');
      
      links.forEach(link => {
        link.addEventListener('click', (e) => {
          const targetId = link.getAttribute('href');
          if (targetId === '#') return;

          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });

            // Close mobile menu if open
            if (Navigation.isOpen) {
              Navigation.closeMenu();
            }
          }
        });
      });
    }
  };

  // ================================================
  // ACCESSIBILITY ENHANCEMENTS
  // ================================================
  const Accessibility = {
    init: function() {
      // Add skip link
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.className = 'skip-link';
      skipLink.textContent = 'Skip to main content';
      document.body.insertBefore(skipLink, document.body.firstChild);

      // Add ARIA labels to nav links if missing
      const navLinks = document.querySelectorAll('.nav-link, .nav-drawer-link');
      navLinks.forEach(link => {
        if (!link.getAttribute('aria-label')) {
          link.setAttribute('aria-label', link.textContent.trim());
        }
      });

      // Trap focus in mobile menu when open
      const focusableElements = this.navDrawer.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        this.navDrawer.addEventListener('keydown', (e) => {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
              }
            } else {
              if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
              }
            }
          }
        });
      }
    }
  };

  // ================================================
  // INITIALIZATION
  // ================================================
  function init() {
    DeviceDetector.init();
    Navigation.init();
    NavHighlighter.init();
    SmoothScroll.init();
    
    // Initialize accessibility after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => Accessibility.init());
    } else {
      Accessibility.init();
    }

    console.log('Zan Studio Navigation Initialized');
    console.log('Device Type:', DeviceDetector.getDeviceType());
    console.log('Touch Device:', DeviceDetector.isTouch());
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
