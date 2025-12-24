// Performance Optimizations for Smooth Animations

// Use requestAnimationFrame for smooth animations
(function() {
    'use strict';
    
    // Debounce function for performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle function for scroll events
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Smooth scroll with requestAnimationFrame
    function smoothScroll(element, target, duration = 300) {
        const start = element.scrollTop;
        const distance = target - start;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function (ease-in-out)
            const ease = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            element.scrollTop = start + distance * ease;
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    }
    
    // Optimize tab switching with requestAnimationFrame
    function optimizeTabSwitch() {
        const tabs = document.querySelectorAll('.tab-content');
        const activeTab = document.querySelector('.tab-content.active');
        
        if (activeTab) {
            // Use will-change for better performance
            tabs.forEach(tab => {
                if (tab === activeTab) {
                    tab.style.willChange = 'opacity, transform';
                } else {
                    tab.style.willChange = 'auto';
                }
            });
        }
    }
    
    // Parallax effect for background (optimized)
    function initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (parallaxElements.length === 0) return;
        
        const handleScroll = throttle(() => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.dataset.parallax) || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
        }, 16); // ~60fps
        
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // Optimize card animations
    function optimizeCardAnimations() {
        const cards = document.querySelectorAll('.api-module-simple, .simple-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.willChange = 'transform, opacity';
                    entry.target.classList.add('animate-in');
                } else {
                    entry.target.style.willChange = 'auto';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        cards.forEach(card => {
            observer.observe(card);
        });
    }
    
    // Lazy load images
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            optimizeTabSwitch();
            initParallax();
            optimizeCardAnimations();
            lazyLoadImages();
        });
    } else {
        optimizeTabSwitch();
        initParallax();
        optimizeCardAnimations();
        lazyLoadImages();
    }
    
    // Re-optimize on tab switch
    document.addEventListener('click', (e) => {
        if (e.target.closest('.nav-tab')) {
            requestAnimationFrame(() => {
                optimizeTabSwitch();
            });
        }
    });
    
    // Export functions for global use
    window.PerformanceUtils = {
        debounce,
        throttle,
        smoothScroll,
        optimizeTabSwitch
    };
})();

