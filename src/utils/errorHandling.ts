
import * as Sentry from '@sentry/react';
import { toast } from '@/hooks/use-toast';

// Initialize Sentry in a separate file to avoid initializing it multiple times
export const initSentry = () => {
  if (process.env.NODE_ENV !== 'development') {
    Sentry.init({
      dsn: "YOUR_SENTRY_DSN", // Replace with your actual Sentry DSN
      integrations: [
        new Sentry.BrowserTracing(),
      ],
      tracesSampleRate: 0.5,
      // Enable ML-powered error grouping
      beforeSend(event) {
        // We can add custom logic here to process the event before sending to Sentry
        return event;
      },
    });
  }
};

// Capture errors with context
export const captureError = (error: any, context?: Record<string, any>) => {
  console.error("Error captured:", error);
  
  // Send to Sentry in production
  if (process.env.NODE_ENV !== 'development') {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  // Show user-friendly notification
  toast({
    title: "Something went wrong",
    description: error.message || "An unexpected error occurred",
    variant: "destructive"
  });

  return error;
};

// Auto retry functionality for async operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
  onRetry?: (attempt: number, error: any) => void
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Call the onRetry callback if provided
      if (onRetry) {
        onRetry(attempt, error);
      }
      
      // Log the retry attempt
      console.log(`Retry attempt ${attempt}/${maxRetries} failed:`, error);
      
      // Don't delay on the last attempt since we're going to throw anyway
      if (attempt < maxRetries) {
        // Exponential backoff
        const backoffDelay = delayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }
  
  // If we've exhausted all retries, capture the error and throw
  captureError(lastError, { 
    context: 'withRetry',
    maxRetries,
    operation: operation.toString().substring(0, 100) 
  });
  
  throw lastError;
};
