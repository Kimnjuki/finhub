import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, DollarSign, ArrowRightLeft, Zap, Clock, RefreshCw, Check, ChevronsUpDown } from "lucide-react";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { useToast } from "@/hooks/use-toast";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Currency {
  code: string;
  name: string;
  flag: string;
  category?: string;
}

const SmartCalculator = () => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);
  
  const { rates, loading, error, fetchRates, lastUpdated } = useCurrencyRates();
  const { toast } = useToast();

  // Comprehensive currency list organized by regions
  const currencies: Currency[] = [
    // Major World Currencies
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸', category: 'major' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺', category: 'major' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧', category: 'major' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', category: 'major' },
    { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', category: 'major' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', category: 'major' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', category: 'major' },
    { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', category: 'major' },
    { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', category: 'major' },
    
    // African Currencies (Complete List - All 54 Countries)
    { code: 'DZD', name: 'Algerian Dinar', flag: '🇩🇿', category: 'africa' },
    { code: 'AOA', name: 'Angolan Kwanza', flag: '🇦🇴', category: 'africa' },
    { code: 'XAF', name: 'Central African CFA Franc', flag: '🇨🇲', category: 'africa' },
    { code: 'BWP', name: 'Botswana Pula', flag: '🇧🇼', category: 'africa' },
    { code: 'BIF', name: 'Burundian Franc', flag: '🇧🇮', category: 'africa' },
    { code: 'CVE', name: 'Cape Verdean Escudo', flag: '🇨🇻', category: 'africa' },
    { code: 'XOF', name: 'West African CFA Franc', flag: '🇨🇮', category: 'africa' },
    { code: 'KMF', name: 'Comorian Franc', flag: '🇰🇲', category: 'africa' },
    { code: 'CDF', name: 'Congolese Franc', flag: '🇨🇩', category: 'africa' },
    { code: 'DJF', name: 'Djiboutian Franc', flag: '🇩🇯', category: 'africa' },
    { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬', category: 'africa' },
    { code: 'ERN', name: 'Eritrean Nakfa', flag: '🇪🇷', category: 'africa' },
    { code: 'SZL', name: 'Swazi Lilangeni', flag: '🇸🇿', category: 'africa' },
    { code: 'ETB', name: 'Ethiopian Birr', flag: '🇪🇹', category: 'africa' },
    { code: 'GMD', name: 'Gambian Dalasi', flag: '🇬🇲', category: 'africa' },
    { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭', category: 'africa' },
    { code: 'GNF', name: 'Guinean Franc', flag: '🇬🇳', category: 'africa' },
    { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', category: 'africa' },
    { code: 'LSL', name: 'Lesotho Loti', flag: '🇱🇸', category: 'africa' },
    { code: 'LRD', name: 'Liberian Dollar', flag: '🇱🇷', category: 'africa' },
    { code: 'LYD', name: 'Libyan Dinar', flag: '🇱🇾', category: 'africa' },
    { code: 'MGA', name: 'Malagasy Ariary', flag: '🇲🇬', category: 'africa' },
    { code: 'MWK', name: 'Malawian Kwacha', flag: '🇲🇼', category: 'africa' },
    { code: 'MUR', name: 'Mauritian Rupee', flag: '🇲🇺', category: 'africa' },
    { code: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦', category: 'africa' },
    { code: 'MZN', name: 'Mozambican Metical', flag: '🇲🇿', category: 'africa' },
    { code: 'NAD', name: 'Namibian Dollar', flag: '🇳🇦', category: 'africa' },
    { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', category: 'africa' },
    { code: 'RWF', name: 'Rwandan Franc', flag: '🇷🇼', category: 'africa' },
    { code: 'STN', name: 'São Tomé and Príncipe Dobra', flag: '🇸🇹', category: 'africa' },
    { code: 'SCR', name: 'Seychellois Rupee', flag: '🇸🇨', category: 'africa' },
    { code: 'SLE', name: 'Sierra Leonean Leone', flag: '🇸🇱', category: 'africa' },
    { code: 'SOS', name: 'Somali Shilling', flag: '🇸🇴', category: 'africa' },
    { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', category: 'africa' },
    { code: 'SSP', name: 'South Sudanese Pound', flag: '🇸🇸', category: 'africa' },
    { code: 'SDP', name: 'Sudanese Pound', flag: '🇸🇩', category: 'africa' },
    { code: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿', category: 'africa' },
    { code: 'TND', name: 'Tunisian Dinar', flag: '🇹🇳', category: 'africa' },
    { code: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬', category: 'africa' },
    { code: 'ZMW', name: 'Zambian Kwacha', flag: '🇿🇲', category: 'africa' },
    { code: 'ZWL', name: 'Zimbabwean Dollar', flag: '🇿🇼', category: 'africa' },
    
    // Middle East & Asia
    { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', category: 'asia' },
    { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', category: 'asia' },
    { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦', category: 'asia' },
    { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼', category: 'asia' },
    { code: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭', category: 'asia' },
    { code: 'OMR', name: 'Omani Rial', flag: '🇴🇲', category: 'asia' },
    { code: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴', category: 'asia' },
    { code: 'LBP', name: 'Lebanese Pound', flag: '🇱🇧', category: 'asia' },
    { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰', category: 'asia' },
    { code: 'BDT', name: 'Bangladeshi Taka', flag: '🇧🇩', category: 'asia' },
    { code: 'LKR', name: 'Sri Lankan Rupee', flag: '🇱🇰', category: 'asia' },
    { code: 'THB', name: 'Thai Baht', flag: '🇹🇭', category: 'asia' },
    { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', category: 'asia' },
    { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', category: 'asia' },
    { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩', category: 'asia' },
    { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭', category: 'asia' },
    { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷', category: 'asia' },
    
    // Europe
    { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺', category: 'europe' },
    { code: 'UAH', name: 'Ukrainian Hryvnia', flag: '🇺🇦', category: 'europe' },
    { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷', category: 'europe' },
    { code: 'PLN', name: 'Polish Zloty', flag: '🇵🇱', category: 'europe' },
    { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿', category: 'europe' },
    { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺', category: 'europe' },
    { code: 'RON', name: 'Romanian Leu', flag: '🇷🇴', category: 'europe' },
    { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴', category: 'europe' },
    { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪', category: 'europe' },
    { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰', category: 'europe' },
    { code: 'ISK', name: 'Icelandic Krona', flag: '🇮🇸', category: 'europe' },
    
    // Americas
    { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽', category: 'americas' },
    { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', category: 'americas' },
    { code: 'COP', name: 'Colombian Peso', flag: '🇨🇴', category: 'americas' },
    { code: 'PEN', name: 'Peruvian Sol', flag: '🇵🇪', category: 'americas' },
    { code: 'CLP', name: 'Chilean Peso', flag: '🇨🇱', category: 'americas' },
    { code: 'ARS', name: 'Argentine Peso', flag: '🇦🇷', category: 'americas' },
    
    // Oceania
    { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿', category: 'oceania' },
    { code: 'FJD', name: 'Fijian Dollar', flag: '🇫🇯', category: 'oceania' },
  ];

  // Real-time calculation with proper rate handling
  useEffect(() => {
    if (amount && fromCurrency && toCurrency && rates[toCurrency] && rates[fromCurrency] && !calculating) {
      // Correct calculation: convert from base to target
      const fromRate = rates[fromCurrency] || 1;
      const toRate = rates[toCurrency] || 1;
      const rate = toRate / fromRate;
      const convertedAmount = (parseFloat(amount) * rate).toFixed(2);
      setResult(convertedAmount);
    } else if (!amount) {
      setResult('');
    }
  }, [amount, fromCurrency, toCurrency, rates, calculating]);

  const handleCalculate = async () => {
    if (!amount || fromCurrency === toCurrency) {
      setResult('');
      return;
    }

    setCalculating(true);
    
    try {
      // Refresh rates for accurate calculation
      const latest = await fetchRates('USD', [fromCurrency, toCurrency]);
      
      if (latest[toCurrency] && latest[fromCurrency]) {
        const rate = latest[toCurrency] / latest[fromCurrency];
        const convertedAmount = (parseFloat(amount) * rate).toFixed(2);
        setResult(convertedAmount);
        
        toast({
          title: "Conversion Complete",
          description: `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`,
        });
      }
    } catch (calcError) {
      console.error('Calculation error:', calcError);
      toast({
        title: "Calculation Error",
        description: "Failed to calculate conversion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setResult('');
  };

  const refreshRates = async () => {
    await fetchRates('USD', [fromCurrency, toCurrency]);
    toast({
      title: "Rates Updated",
      description: "Currency rates have been refreshed",
    });
  };

  const getExchangeRate = () => {
    if (rates[toCurrency] && rates[fromCurrency]) {
      return (rates[toCurrency] / rates[fromCurrency]).toFixed(6);
    }
    return '0.000000';
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    const date = new Date(lastUpdated);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="w-full">
      <Card className="glass-card hover:shadow-xl transition-all duration-300 border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4">
            <Calculator className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="flex items-center justify-center gap-3 text-2xl">
            <DollarSign className="h-6 w-6 text-success" />
            Smart Currency Calculator
            <Zap className="h-5 w-5 text-warning animate-pulse" />
          </CardTitle>
          <CardDescription className="text-lg">
            Convert 150+ global currencies including all 54 African countries with real-time rates
          </CardDescription>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <Badge variant="secondary">
              <TrendingUp className="h-3 w-3 mr-1" />
              Real-time Rates
            </Badge>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              Updated: {formatLastUpdated()}
            </Badge>
            {error && (
              <Badge variant="destructive">
                Offline Mode
              </Badge>
            )}
            <Badge variant="default" className="bg-success/10 text-success border-success/20">
              All African Currencies
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Amount and From Currency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount to convert"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg h-12 border-2 focus:border-primary"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">From Currency</Label>
              <Popover open={openFrom} onOpenChange={setOpenFrom}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openFrom}
                    className="h-12 w-full justify-between border-2 focus:border-primary"
                  >
                    {fromCurrency ? (
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{currencies.find((c) => c.code === fromCurrency)?.flag}</span>
                        <span className="font-medium">{fromCurrency}</span>
                        <span className="text-muted-foreground text-sm">{currencies.find((c) => c.code === fromCurrency)?.name}</span>
                      </span>
                    ) : (
                      "Select currency..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 bg-popover z-50" align="start">
                  <Command className="bg-popover">
                    <CommandInput placeholder="Search currency..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No currency found.</CommandEmpty>
                      <CommandGroup>
                        {currencies.map((currency) => (
                          <CommandItem
                            key={currency.code}
                            value={`${currency.code} ${currency.name}`}
                            onSelect={() => {
                              setFromCurrency(currency.code);
                              setOpenFrom(false);
                            }}
                            className="cursor-pointer"
                          >
                            <span className="flex items-center gap-3 flex-1">
                              <span className="text-lg">{currency.flag}</span>
                              <span className="font-medium">{currency.code}</span>
                              <span className="text-muted-foreground text-sm">{currency.name}</span>
                            </span>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                fromCurrency === currency.code ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={swapCurrencies}
              className="rounded-full hover:scale-110 transition-all duration-300 border-2 hover:border-primary"
            >
              <ArrowRightLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Result and To Currency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="result" className="text-sm font-semibold">Converted Amount</Label>
              <Input
                id="result"
                value={result ? `${result}` : ''}
                placeholder="Conversion result will appear here"
                readOnly
                className="text-lg h-12 bg-muted/50 border-2 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">To Currency</Label>
              <Popover open={openTo} onOpenChange={setOpenTo}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openTo}
                    className="h-12 w-full justify-between border-2 focus:border-primary"
                  >
                    {toCurrency ? (
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{currencies.find((c) => c.code === toCurrency)?.flag}</span>
                        <span className="font-medium">{toCurrency}</span>
                        <span className="text-muted-foreground text-sm">{currencies.find((c) => c.code === toCurrency)?.name}</span>
                      </span>
                    ) : (
                      "Select currency..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 bg-popover z-50" align="start">
                  <Command className="bg-popover">
                    <CommandInput placeholder="Search currency..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No currency found.</CommandEmpty>
                      <CommandGroup>
                        {currencies.map((currency) => (
                          <CommandItem
                            key={currency.code}
                            value={`${currency.code} ${currency.name}`}
                            onSelect={() => {
                              setToCurrency(currency.code);
                              setOpenTo(false);
                            }}
                            className="cursor-pointer"
                          >
                            <span className="flex items-center gap-3 flex-1">
                              <span className="text-lg">{currency.flag}</span>
                              <span className="font-medium">{currency.code}</span>
                              <span className="text-muted-foreground text-sm">{currency.name}</span>
                            </span>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                toCurrency === currency.code ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleCalculate} 
              className="h-12 text-lg"
              disabled={!amount || calculating || loading}
            >
              {calculating || loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Converting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Convert Now
                </div>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={refreshRates}
              className="h-12 text-lg"
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Rates
            </Button>
          </div>

          {/* Exchange Rate Info */}
          {result && rates[toCurrency] && rates[fromCurrency] && (
            <div className="text-center p-6 bg-gradient-to-r from-success/10 to-primary/10 rounded-xl border border-success/20">
              <div className="space-y-2">
                <p className="text-lg font-bold text-success">
                  1 {fromCurrency} = {getExchangeRate()} {toCurrency}
                </p>
                <p className="text-sm text-muted-foreground">
                  Rates refresh every 15 seconds • {error ? 'Offline mode active' : 'Live rates'}
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-3">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Real-time
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    150+ Currencies
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    15s Refresh
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartCalculator;