/**
* Template Name: eStartup
* Template URL: https://bootstrapmade.com/estartup-bootstrap-landing-page-template/
* Updated: Aug 07 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  mobileNavToggleBtn.addEventListener('click', mobileNavToogle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
      
      // 모든 메뉴에서 active 클래스 제거
      document.querySelectorAll('#navmenu a').forEach(item => {
        item.classList.remove('active');
      });
      
      // 클릭된 메뉴에 active 클래스 추가
      navmenu.classList.add('active');
    });
  });

  /**
   * 현재 페이지에 맞는 메뉴 항목 활성화
   */
  function setActiveMenu() {
    const currentHash = window.location.hash || "#hero";
    
    // 모든 메뉴에서 active 클래스 제거
    document.querySelectorAll('#navmenu a').forEach(item => {
      item.classList.remove('active');
    });
    
    // 현재 hash에 해당하는 메뉴 항목 찾기
    const activeMenuItem = document.querySelector(`#navmenu a[href="${currentHash}"]`);
    if (activeMenuItem) {
      activeMenuItem.classList.add('active');
    } else if (currentHash === "" || currentHash === "#hero") {
      // 기본적으로 홈 메뉴 활성화
      const homeMenuItem = document.querySelector('#navmenu a[href="#hero"]');
      if (homeMenuItem) homeMenuItem.classList.add('active');
    }
  }

  // 페이지 로드시 활성 메뉴 설정
  window.addEventListener('load', setActiveMenu);
  
  // hash 변경시 활성 메뉴 업데이트
  window.addEventListener('hashchange', setActiveMenu);

  /**
   * 스크롤 위치에 따른 메뉴 활성화 (Intersection Observer 사용)
   */
  function initScrollSpy() {
    // 모든 섹션 요소 선택
    const sections = document.querySelectorAll('section[id]');
    
    // 이미 해시가 있는 경우 (예: 페이지 로드 시 특정 섹션으로 이동)
    if (window.location.hash) {
      setActiveMenu();
    }
    
    // 메뉴 활성화 함수 (클릭이 아닌 스크롤 기반)
    const setActiveMenuByScroll = (id) => {
      // URL의 해시가 변경되지 않도록 history.pushState 사용하지 않음
      
      // 모든 메뉴 항목에서 active 클래스 제거
      document.querySelectorAll('#navmenu a').forEach(item => {
        item.classList.remove('active');
      });
      
      // 해당 섹션의 메뉴 항목 활성화
      const menuItem = document.querySelector(`#navmenu a[href="#${id}"]`);
      if (menuItem) {
        menuItem.classList.add('active');
      }
    };
    
    // Intersection Observer 옵션
    const observerOptions = {
      root: null, // 뷰포트 기준
      rootMargin: '-50% 0px', // 뷰포트의 중앙 기준
      threshold: 0 // 요소가 조금이라도 보이면 콜백 실행
    };
    
    // Intersection Observer 생성
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // 요소가 화면에 보이는 경우 (맨 위가 화면 중앙보다 위에 있고, 맨 아래가 화면 중앙보다 아래에 있는 경우)
        if (entry.isIntersecting) {
          setActiveMenuByScroll(entry.target.getAttribute('id'));
        }
      });
    }, observerOptions);
    
    // 모든 섹션 요소 관찰
    sections.forEach(section => {
      observer.observe(section);
    });
  }
  
  // 페이지 로드 후 스크롤 감지 초기화
  window.addEventListener('load', initScrollSpy);

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

})();