/**
 * Environment variables and configuration
 * 
 * This file centralizes access to environment variables for better TypeScript support
 * and easier management across the application.
 */


/**
 * API base URL from environment configuration
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

/**
 * Whether the application is running in development mode
 */
export const IS_DEV = import.meta.env.DEV; 