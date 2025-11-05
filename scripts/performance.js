// Performance Optimization Module for QuizMaster app
// Handles caching, lazy loading, and performance monitoring

/**
 * Performance Manager class
 * Manages app performance, caching, and optimization
 */
class PerformanceManager {
    constructor() {
        this.cache = new Map();
        this.imageCache = new Map();
        this.loadingStates = new Map();
        this.performanceMetrics = {
            pageLoadTime: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0
        };
        
        console.log('⚡ Performance Manager initialized');
        
        // Initialize performance monitoring
        this.initializePerformanceMonitoring();
        
        // Set up resource optimization
        this.setupResourceOptimization();
    }

    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        // Monitor page load performance
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                this.measurePageLoadPerformance();
            });
        }

        // Monitor Core Web Vitals
        this.monitorCoreWebVitals();

        // Monitor resource loading
        this.monitorResourceLoading();
    }

    /**
     * Measure page load performance
     */
    measurePageLoadPerformance() {
        const timing = window.performance.timing;
        const navigation = window.performance.getEntriesByType('navigation')[0];

        this.performanceMetrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;

        if (navigation) {
            this.performanceMetrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
            this.performanceMetrics.domComplete = navigation.domComplete - navigation.domLoading;
        }

        console.log('📊 Page Load Performance:', {
            pageLoadTime: `${this.performanceMetrics.pageLoadTime}ms`,
            domContentLoaded: `${this.performanceMetrics.domContentLoaded}ms`,
            domComplete: `${this.performanceMetrics.domComplete}ms`
        });

        // Report slow loading
        if (this.performanceMetrics.pageLoadTime > 3000) {
            console.warn('⚠️ Slow page load detected:', `${this.performanceMetrics.pageLoadTime}ms`);
        }
    }

    /**
     * Monitor Core Web Vitals
     */
    monitorCoreWebVitals() {
        // First Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.name === 'first-contentful-paint') {
                            this.performanceMetrics.firstContentfulPaint = entry.startTime;
                            console.log('🎨 First Contentful Paint:', `${entry.startTime.toFixed(2)}ms`);
                        }
                    }
                });
                observer.observe({ entryTypes: ['paint'] });
            } catch (error) {
                console.warn('Performance Observer not supported:', error);
            }
        }
    }

    /**
     * Monitor resource loading
     */
    monitorResourceLoading() {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 1000) {
                            console.warn('⚠️ Slow resource:', entry.name, `${entry.duration.toFixed(2)}ms`);
                        }
                    }
                });
                observer.observe({ entryTypes: ['resource'] });
            } catch (error) {
                console.warn('Resource Performance Observer not supported:', error);
            }
        }
    }

    /**
     * Set up resource optimization
     */
    setupResourceOptimization() {
        // Preload critical resources
        this.preloadCriticalResources();

        // Set up lazy loading for images
        this.setupLazyLoading();

        // Optimize font loading
        this.optimizeFontLoading();
    }

    /**
     * Preload critical resources
     */
    preloadCriticalResources() {
        const criticalResources = [
            { href: 'styles/variables.css', as: 'style' },
            { href: 'styles/components.css', as: 'style' },
            { href: 'scripts/utils.js', as: 'script' },
            { href: 'scripts/config.js', as: 'script' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        });
    }

    /**
     * Set up lazy loading for images
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            });

            // Observe all images with data-src attribute
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    /**
     * Load image with caching
     * @param {HTMLImageElement} img - Image element
     */
    async loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        try {
            // Check cache first
            if (this.imageCache.has(src)) {
                img.src = this.imageCache.get(src);
                img.classList.add('loaded');
                return;
            }

            // Load image
            const imageBlob = await fetch(src).then(r => r.blob());
            const imageUrl = URL.createObjectURL(imageBlob);
            
            // Cache the image
            this.imageCache.set(src, imageUrl);
            
            // Set image source
            img.src = imageUrl;
            img.classList.add('loaded');
            
        } catch (error) {
            console.error('Failed to load image:', src, error);
            img.classList.add('error');
        }
    }

    /**
     * Optimize font loading
     */
    optimizeFontLoading() {
        // Use font-display: swap for better performance
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'Inter';
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Cache data with expiration
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    setCache(key, data, ttl = 300000) { // Default 5 minutes
        const expiry = Date.now() + ttl;
        this.cache.set(key, {
            data,
            expiry
        });
    }

    /**
     * Get cached data
     * @param {string} key - Cache key
     * @returns {*} Cached data or null
     */
    getCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * Clear expired cache entries
     */
    clearExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now > value.expiry) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Debounce function calls for performance
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Throttle function calls for performance
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Optimize DOM operations by batching
     * @param {Function} callback - Function containing DOM operations
     */
    batchDOMOperations(callback) {
        requestAnimationFrame(() => {
            callback();
        });
    }

    /**
     * Preload route data
     * @param {string} route - Route to preload
     */
    async preloadRoute(route) {
        if (this.loadingStates.get(route)) return;

        this.loadingStates.set(route, true);

        try {
            switch (route) {
                case 'leaderboard':
                    if (window.leaderboardManager) {
                        await window.leaderboardManager.getTopUsers(10);
                    }
                    break;
                case 'quiz':
                    if (window.quizManager) {
                        await window.quizManager.getCategories();
                    }
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Failed to preload route:', route, error);
        } finally {
            this.loadingStates.set(route, false);
        }
    }

    /**
     * Optimize scroll performance
     */
    optimizeScrollPerformance() {
        let ticking = false;

        const optimizedScrollHandler = () => {
            // Scroll-dependent operations here
            this.updateScrollPosition();
            ticking = false;
        };

        const scrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(optimizedScrollHandler);
                ticking = true;
            }
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    /**
     * Update scroll position for scroll-dependent features
     */
    updateScrollPosition() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Update navbar transparency based on scroll
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (scrollTop > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }

    /**
     * Minimize layout thrashing
     * @param {Function} readCallback - Function for DOM reads
     * @param {Function} writeCallback - Function for DOM writes
     */
    minimizeLayoutThrashing(readCallback, writeCallback) {
        // Batch reads
        const readResults = readCallback();
        
        // Batch writes
        requestAnimationFrame(() => {
            writeCallback(readResults);
        });
    }

    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            cacheSize: this.cache.size,
            imageCacheSize: this.imageCache.size,
            memoryUsage: this.getMemoryUsage()
        };
    }

    /**
     * Get memory usage information
     * @returns {Object} Memory usage data
     */
    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    /**
     * Clean up resources
     */
    cleanup() {
        // Clear caches
        this.cache.clear();
        
        // Revoke image URLs to free memory
        for (const url of this.imageCache.values()) {
            URL.revokeObjectURL(url);
        }
        this.imageCache.clear();
        
        console.log('🧹 Performance Manager cleaned up');
    }
}

// Create global instance
const performanceManager = new PerformanceManager();

// Set up periodic cache cleanup
setInterval(() => {
    performanceManager.clearExpiredCache();
}, 60000); // Every minute

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceManager;
}

// Make available globally
window.PerformanceManager = PerformanceManager;
window.performanceManager = performanceManager;