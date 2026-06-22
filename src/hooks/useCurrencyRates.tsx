import { useState, useEffect, useCallback } from 'react';

interface CurrencyRate {
  [key: string]: number;
}

interface CurrencyRatesResponse {
  base: string;
  rates: CurrencyRate;
  timestamp: number;
  success: boolean;
}

interface UseCurrencyRatesReturn {
  rates: CurrencyRate;
  loading: boolean;
  error: string | null;
  fetchRates: (baseCurrency: string, targetCurrencies?: string[]) => Promise<CurrencyRate>;
  lastUpdated: number;
}

export const useCurrencyRates = (): UseCurrencyRatesReturn => {
  const [rates, setRates] = useState<CurrencyRate>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(0);

  // Fallback exchange rates for offline/error scenarios (updated with all African countries)
  const fallbackRates: CurrencyRate = {
    // Major Currencies
    'USD': 1.0,
    'EUR': 0.85,
    'GBP': 0.73,
    'JPY': 110.12,
    'CNY': 7.25,
    'CAD': 1.25,
    'AUD': 1.35,
    'CHF': 0.88,
    'INR': 74.50,
    
    // African Currencies (Complete List)
    'NGN': 411.50,      // Nigeria
    'ZAR': 14.85,       // South Africa
    'EGP': 15.70,       // Egypt
    'KES': 101.25,      // Kenya
    'GHS': 6.15,        // Ghana
    'UGX': 3520.00,     // Uganda
    'TZS': 2310.00,     // Tanzania
    'ETB': 43.80,       // Ethiopia
    'MAD': 9.15,        // Morocco
    'DZD': 134.20,      // Algeria
    'TND': 2.82,        // Tunisia
    'LYD': 4.55,        // Libya
    'AOA': 331.50,      // Angola
    'BWP': 11.25,       // Botswana
    'NAD': 14.85,       // Namibia
    'SZL': 14.85,       // Eswatini
    'LSL': 14.85,       // Lesotho
    'MWK': 735.00,      // Malawi
    'ZMW': 16.85,       // Zambia
    'ZWL': 322.35,      // Zimbabwe
    'MZN': 63.75,       // Mozambique
    'MGA': 4025.00,     // Madagascar
    'MUR': 43.50,       // Mauritius
    'SCR': 13.45,       // Seychelles
    'SOS': 575.00,      // Somalia
    'DJF': 178.25,      // Djibouti
    'ERN': 15.00,       // Eritrea
    'SDP': 450.75,      // Sudan
    'SSP': 130.26,      // South Sudan
    'CDF': 2050.00,     // DR Congo
    'XAF': 585.50,      // Central African CFA Franc
    'XOF': 585.50,      // West African CFA Franc
    'GMD': 51.25,       // Gambia
    'GNF': 8650.00,     // Guinea
    'LRD': 153.75,      // Liberia
    'SLE': 11.50,       // Sierra Leone
    'CVE': 98.50,       // Cape Verde
    'STN': 21.85,       // São Tomé and Príncipe
    'RWF': 1032.50,     // Rwanda
    'BIF': 2845.75,     // Burundi
    'KMF': 415.25,      // Comoros
    
    // Middle East & Asia
    'AED': 3.67,
    'SAR': 3.75,
    'QAR': 3.64,
    'KWD': 0.30,
    'BHD': 0.38,
    'OMR': 0.38,
    'JOD': 0.71,
    'LBP': 1507.50,
    'PKR': 278.50,
    'BDT': 85.75,
    'LKR': 325.50,
    'THB': 33.85,
    'MYR': 4.18,
    'SGD': 1.34,
    'IDR': 14785.00,
    'PHP': 50.25,
    'KRW': 1185.50,
    
    // Europe
    'RUB': 75.85,
    'UAH': 27.15,
    'TRY': 18.95,
    'PLN': 3.95,
    'CZK': 21.75,
    'HUF': 315.50,
    'RON': 4.18,
    'NOK': 8.85,
    'SEK': 9.25,
    'DKK': 6.32,
    'ISK': 125.75,
    
    // Americas
    'MXN': 20.15,
    'BRL': 5.15,
    'COP': 3875.50,
    'PEN': 3.68,
    'CLP': 785.25,
    'ARS': 98.75,
    
    // Oceania
    'NZD': 1.42,
    'FJD': 2.15
  };

  const fetchRates = useCallback(async (baseCurrency: string, targetCurrencies?: string[]): Promise<CurrencyRate> => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = '3da7enfkjpy040dmwlar';
      const targets = targetCurrencies && targetCurrencies.length > 0 ? targetCurrencies.join(',') : undefined;
      let url = `https://freecryptoapi.com/api/v1/rates?base=${encodeURIComponent(baseCurrency)}&apikey=${apiKey}`;
      if (targets) {
        url += `&currencies=${encodeURIComponent(targets)}`;
      }

      console.log('Fetching currency rates from:', url);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CurrencyRatesResponse = await response.json();

      if (!data || !data.success || !data.rates) {
        throw new Error('API returned unsuccessful response');
      }

      console.log('Received currency rates:', data);

      const normalized: CurrencyRate = {};
      for (const [currency, rate] of Object.entries(data.rates)) {
        normalized[currency.toUpperCase()] = typeof rate === 'number' ? rate : parseFloat((rate as any));
      }

      setRates(normalized);
      setLastUpdated(typeof data.timestamp === 'number' ? data.timestamp : Date.now());
      return normalized;

    } catch (fetchError) {
      console.warn('Currency rates fetch failed, using fallback rates:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch rates');

      let selectedRates: CurrencyRate = {};
      if (baseCurrency === 'USD') {
        selectedRates = fallbackRates;
      } else {
        const baseRate = fallbackRates[baseCurrency];
        if (baseRate) {
          const convertedRates: CurrencyRate = {};
          for (const [currency, rate] of Object.entries(fallbackRates)) {
            convertedRates[currency] = rate / baseRate;
          }
          selectedRates = convertedRates;
        } else {
          selectedRates = fallbackRates;
        }
      }
      setRates(selectedRates);
      setLastUpdated(Date.now());
      return selectedRates;
    } finally {
      setLoading(false);
    }
  }, [fallbackRates]);

  // Auto-fetch USD rates on mount and refresh every 15 seconds
  useEffect(() => {
    fetchRates('USD');
    
    // Refresh rates every 15 seconds to reduce blinking
    const interval = setInterval(() => {
      fetchRates('USD');
    }, 15000); // 15 seconds
    
    return () => clearInterval(interval);
  }, []);

  return {
    rates,
    loading,
    error,
    fetchRates,
    lastUpdated
  };
};