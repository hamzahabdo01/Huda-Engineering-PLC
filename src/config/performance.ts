// Performance configuration constants
export const PERFORMANCE_CONFIG = {
  // Image optimization
  IMAGE: {
    LAZY_LOADING_THRESHOLD: 50, // pixels from viewport
    PLACEHOLDER_BLUR: 10,
    PRELOAD_PRIORITY: ['hero', 'above-fold'],
    WEBP_SUPPORT: true,
    AVIF_SUPPORT: false, // Enable when more browsers support it
  },

  // Lazy loading
  LAZY_LOADING: {
    COMPONENT_THRESHOLD: 0.1,
    IMAGE_THRESHOLD: 0.1,
    ROOT_MARGIN: '50px',
  },

  // Caching
  CACHE: {
    TRANSLATION_TTL: 5 * 60 * 1000, // 5 minutes
    API_RESPONSE_TTL: 10 * 60 * 1000, // 10 minutes
    IMAGE_CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours
    STATIC_ASSETS_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  // Debouncing
  DEBOUNCE: {
    SEARCH_INPUT: 300,
    FORM_VALIDATION: 500,
    SCROLL_EVENTS: 100,
    RESIZE_EVENTS: 250,
    MOUSE_MOVE: 16, // ~60fps
  },

  // Throttling
  THROTTLE: {
    SCROLL_EVENTS: 16, // ~60fps
    RESIZE_EVENTS: 100,
    MOUSE_MOVE: 32, // ~30fps
    API_CALLS: 1000,
  },

  // Virtual scrolling
  VIRTUAL_SCROLL: {
    DEFAULT_ITEM_HEIGHT: 60,
    OVERSCAN_ITEMS: 5,
    MIN_VISIBLE_ITEMS: 10,
  },

  // Bundle optimization
  BUNDLE: {
    CHUNK_SIZE_LIMIT: 1000, // KB
    PRELOAD_CRITICAL: true,
    PREFETCH_ON_HOVER: true,
    ROUTE_PREFETCH_DELAY: 100, // ms
  },

  // React optimization
  REACT: {
    MEMO_THRESHOLD: 100, // items
    DEBOUNCE_RENDER: 16, // ms
    BATCH_UPDATES: true,
    CONCURRENT_FEATURES: true,
  },

  // API optimization
  API: {
    REQUEST_TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 2,
    RETRY_DELAY: 1000, // 1 second
    BATCH_REQUESTS: true,
    REQUEST_DEBOUNCE: 300, // ms
  },

  // Animation performance
  ANIMATION: {
    REDUCE_MOTION: true,
    GPU_ACCELERATION: true,
    FRAME_RATE: 60,
    TRANSITION_DURATION: 300, // ms
  },

  // Memory management
  MEMORY: {
    MAX_CACHE_SIZE: 100, // items
    CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
    GARBAGE_COLLECTION_THRESHOLD: 0.8, // 80% of available memory
  },
} as const;

// Performance monitoring thresholds
export const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME: {
    WARNING: 16, // ms (60fps)
    ERROR: 33, // ms (30fps)
  },
  MEMORY_USAGE: {
    WARNING: 50 * 1024 * 1024, // 50MB
    ERROR: 100 * 1024 * 1024, // 100MB
  },
  NETWORK: {
    SLOW_3G: 780, // Kbps
    FAST_3G: 1500, // Kbps
    SLOW_4G: 4000, // Kbps
    FAST_4G: 15000, // Kbps
  },
} as const;

// Feature flags for performance optimizations
export const PERFORMANCE_FEATURES = {
  ENABLE_VIRTUAL_SCROLLING: true,
  ENABLE_IMAGE_OPTIMIZATION: true,
  ENABLE_LAZY_LOADING: true,
  ENABLE_PREFETCHING: true,
  ENABLE_CACHING: true,
  ENABLE_DEBOUNCING: true,
  ENABLE_THROTTLING: true,
  ENABLE_MEMOIZATION: true,
  ENABLE_CODE_SPLITTING: true,
  ENABLE_SERVICE_WORKER: false, // Enable when implementing PWA
} as const;

// Performance monitoring configuration
export const MONITORING_CONFIG = {
  ENABLE_PERFORMANCE_MARKERS: process.env.NODE_ENV === 'development',
  ENABLE_MEMORY_MONITORING: process.env.NODE_ENV === 'development',
  ENABLE_RENDER_TIMING: process.env.NODE_ENV === 'development',
  ENABLE_NETWORK_MONITORING: true,
  LOG_LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
} as const;

export default PERFORMANCE_CONFIG;