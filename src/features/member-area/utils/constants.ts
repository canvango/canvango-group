/**
 * Application Constants
 * Centralized constants used across the member area
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  TRANSACTIONS: '/api/transactions',
  TOPUP: '/api/topup',
  WARRANTY: '/api/warranty',
  VERIFIED_BM: '/api/verified-bm',
  USER: '/api/user',
  API_KEYS: '/api/api-keys',
  TUTORIALS: '/api/tutorials'
};

// Status Colors
export const STATUS_COLORS = {
  // Transaction Status
  pending: 'yellow',
  processing: 'blue',
  completed: 'green',
  success: 'green',
  failed: 'red',
  cancelled: 'gray',
  refunded: 'purple',
  
  // Warranty Status
  active: 'green',
  expired: 'red',
  claimed: 'blue',
  
  // Product Status
  in_stock: 'green',
  out_of_stock: 'red',
  limited: 'yellow',
  coming_soon: 'blue',
  
  // Claim Status
  reviewing: 'blue',
  approved: 'green',
  rejected: 'red'
} as const;

// Payment Methods
export const PAYMENT_METHODS = [
  { id: 'gopay', name: 'GoPay', icon: '💚', type: 'ewallet' },
  { id: 'ovo', name: 'OVO', icon: '💜', type: 'ewallet' },
  { id: 'dana', name: 'DANA', icon: '💙', type: 'ewallet' },
  { id: 'shopeepay', name: 'ShopeePay', icon: '🧡', type: 'ewallet' },
  { id: 'bank_transfer', name: 'Transfer Bank', icon: '🏦', type: 'bank_transfer' },
  { id: 'qris', name: 'QRIS', icon: '📱', type: 'qris' }
] as const;

// Top-up Nominal Options
export const TOPUP_NOMINALS = [
  10000,
  25000,
  50000,
  100000,
  250000,
  500000,
  1000000,
  2500000
] as const;

export const TOPUP_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export const MIN_TOPUP_AMOUNT = 10000;
export const MAX_TOPUP_AMOUNT = 10000000;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_VISIBLE_PAGES: 7
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg']
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD MMMM YYYY',
  FULL: 'dddd, DD MMMM YYYY',
  TIME: 'HH:mm',
  DATETIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DD'
} as const;

// Routes
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Member Area
  DASHBOARD: '/member/dashboard',
  TRANSACTIONS: '/member/riwayat-transaksi',
  TOPUP: '/member/top-up',
  BM_ACCOUNTS: '/member/akun-bm',
  PERSONAL_ACCOUNTS: '/member/akun-personal',
  VERIFIED_BM: '/member/jasa-verified-bm',
  CLAIM_WARRANTY: '/member/claim-garansi',
  API_DOCS: '/member/api',
  TUTORIAL: '/member/tutorial'
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  FILTERS: 'filters',
  PREFERENCES: 'preferences'
} as const;

// Validation Rules
export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 13,
    PATTERN: /^[0-9]+$/
  }
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Koneksi internet bermasalah. Silakan coba lagi.',
  SERVER_ERROR: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
  UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
  FORBIDDEN: 'Anda tidak memiliki akses ke halaman ini.',
  NOT_FOUND: 'Halaman tidak ditemukan.',
  VALIDATION_ERROR: 'Data yang Anda masukkan tidak valid.',
  TIMEOUT_ERROR: 'Permintaan timeout. Silakan coba lagi.',
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login berhasil!',
  REGISTER: 'Registrasi berhasil! Silakan login.',
  LOGOUT: 'Logout berhasil.',
  PROFILE_UPDATED: 'Profil berhasil diperbarui.',
  PASSWORD_CHANGED: 'Password berhasil diubah.',
  PURCHASE_SUCCESS: 'Pembelian berhasil!',
  TOPUP_SUCCESS: 'Top-up berhasil!',
  CLAIM_SUBMITTED: 'Klaim garansi berhasil diajukan.',
  COPY_SUCCESS: 'Berhasil disalin ke clipboard.'
} as const;

// Tutorial Categories
export const TUTORIAL_CATEGORIES = [
  { id: 'getting_started', name: 'Memulai', icon: '🚀' },
  { id: 'account_management', name: 'Manajemen Akun', icon: '👤' },
  { id: 'purchasing', name: 'Pembelian', icon: '🛒' },
  { id: 'warranty', name: 'Garansi', icon: '🛡️' },
  { id: 'api', name: 'API', icon: '⚙️' },
  { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧' },
  { id: 'best_practices', name: 'Best Practices', icon: '⭐' }
] as const;

// Product Categories
export const PRODUCT_CATEGORIES = [
  { id: 'bm', name: 'Business Manager', icon: '💼' },
  { id: 'personal', name: 'Personal Account', icon: '👤' }
] as const;

// Claim Reasons
export const CLAIM_REASONS = [
  { id: 'account_invalid', name: 'Akun tidak valid' },
  { id: 'account_disabled', name: 'Akun di-disable' },
  { id: 'account_suspended', name: 'Akun di-suspend' },
  { id: 'password_incorrect', name: 'Password salah' },
  { id: 'not_as_described', name: 'Tidak sesuai deskripsi' },
  { id: 'other', name: 'Lainnya' }
] as const;

// WhatsApp Contact
export const WHATSAPP = {
  NUMBER: '6281234567890', // Replace with actual number
  MESSAGE: 'Halo, saya ingin bertanya tentang Canvango Group'
} as const;

// Social Media
export const SOCIAL_MEDIA = {
  FACEBOOK: 'https://facebook.com/canvangogroup',
  INSTAGRAM: 'https://instagram.com/canvangogroup',
  TWITTER: 'https://twitter.com/canvangogroup',
  TELEGRAM: 'https://t.me/canvangogroup'
} as const;

// App Info
export const APP_INFO = {
  NAME: 'Canvango Group',
  VERSION: '1.0.0',
  DESCRIPTION: 'Platform jual beli akun Facebook Business Manager dan Personal',
  COPYRIGHT: `© ${new Date().getFullYear()} Canvango Group. All rights reserved.`
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_API: true,
  ENABLE_TUTORIALS: true,
  ENABLE_VERIFIED_BM: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: false,
  ENABLE_DARK_MODE: false
} as const;
