
// Location and currency service
export interface UserLocation {
  country: string;
  countryCode: string;
  city?: string;
  currency: string;
  latitude?: number;
  longitude?: number;
}

// Default location if geolocation fails
const defaultLocation: UserLocation = {
  country: "South Africa",
  countryCode: "ZA",
  currency: "ZAR",
};

// Currency mapping by country
const currencyMap: Record<string, string> = {
  ZA: "ZAR", // South Africa
  US: "USD", // United States
  GB: "GBP", // United Kingdom
  EU: "EUR", // Europe
  AU: "AUD", // Australia
  // Add more mappings as needed
};

// Function to get user location
export const getUserLocation = async (): Promise<UserLocation> => {
  try {
    // Use IP geolocation service
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch location data');
    
    const data = await response.json();
    
    return {
      country: data.country_name,
      countryCode: data.country_code,
      city: data.city,
      currency: currencyMap[data.country_code] || "ZAR", // Default to ZAR if not found
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.error('Error detecting location:', error);
    // Return default location (South Africa) if geolocation fails
    return defaultLocation;
  }
};

// Determine if a service should be shown based on user location and service type
export const shouldShowService = (
  userLocation: UserLocation, 
  serviceLocation?: string, 
  isDigital?: boolean
): boolean => {
  // Always show digital services
  if (isDigital) return true;
  
  // If no service location specified, assume it's available everywhere
  if (!serviceLocation) return true;
  
  // For physical services, check if user is in the same country as the service
  return serviceLocation.includes(userLocation.country) || 
         serviceLocation.includes(userLocation.countryCode);
};

// Get currency symbol by currency code
export const getCurrencySymbol = (currency: string): string => {
  const formatter = new Intl.NumberFormat('en', { style: 'currency', currency });
  return formatter.format(0).replace(/\d|\./g, '').trim();
};

// Format price based on currency
export const formatPrice = (price: number, currency: string): string => {
  return new Intl.NumberFormat('en', { 
    style: 'currency', 
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
};

// Convert price between currencies (simplified - in a real app, you'd use exchange rate API)
export const convertPrice = (
  price: number, 
  fromCurrency: string, 
  toCurrency: string
): number => {
  // In a real implementation, you would fetch current exchange rates
  // This is a simple placeholder implementation
  const exchangeRates: Record<string, Record<string, number>> = {
    ZAR: { USD: 0.055, GBP: 0.043, EUR: 0.051, AUD: 0.083 },
    USD: { ZAR: 18.23, GBP: 0.78, EUR: 0.92, AUD: 1.52 },
    // Add more rates as needed
  };
  
  // If currencies are the same, return the original price
  if (fromCurrency === toCurrency) return price;
  
  // If we have a direct conversion rate
  if (exchangeRates[fromCurrency]?.[toCurrency]) {
    return price * exchangeRates[fromCurrency][toCurrency];
  }
  
  // If same currency, no conversion needed
  return price;
};
