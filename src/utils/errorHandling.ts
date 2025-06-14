
import * as Sentry from "@sentry/react";

// Initialize Sentry with proper configuration
export const initSentry = () => {
  // Only initialize Sentry in production with a valid DSN
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  // Check if DSN is set and not a placeholder value
  if (dsn && dsn !== 'YOUR_SENTRY_DSN' && dsn.startsWith('https://') && import.meta.env.PROD) {
    try {
      Sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        integrations: [
          new Sentry.BrowserTracing(),
        ],
        tracesSampleRate: 1.0,
      });
      console.log('Sentry initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize Sentry:', error);
    }
  } else {
    console.log('Sentry not initialized - no valid DSN provided or in development mode');
  }
};

// Enhanced error capturing with context
export const captureError = (error: any, context?: any) => {
  console.error('Error captured:', error, context);
  
  // Only try to send to Sentry if it's properly initialized
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN && 
      import.meta.env.VITE_SENTRY_DSN !== 'YOUR_SENTRY_DSN' && 
      import.meta.env.VITE_SENTRY_DSN.startsWith('https://')) {
    try {
      Sentry.captureException(error, {
        tags: context?.tags,
        extra: context,
      });
    } catch (sentryError) {
      console.error('Failed to send error to Sentry:', sentryError);
    }
  }
};

// Retry utility function
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
  onRetry?: (attempt: number, error: any) => void
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        captureError(error, { context: 'withRetry', attempt, maxRetries });
        throw error;
      }
      
      if (onRetry) {
        onRetry(attempt, error);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError;
};
