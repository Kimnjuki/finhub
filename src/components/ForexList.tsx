import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const fetchForexRates = async () => {
  const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const ForexList = () => {
  const { data: forexData, isLoading } = useQuery({
    queryKey: ['forexRates'],
    queryFn: fetchForexRates,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return <div className="glass-card rounded-lg p-6 animate-pulse">Loading forex rates...</div>;
  }

  const majorCurrencies = [
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  ];

  const currencies = majorCurrencies.map(currency => ({
    ...currency,
    rate: forexData?.rates?.[currency.code] || 0,
    change: (Math.random() - 0.5) * 2 // Mock change data since API doesn't provide it
  }));

  return (
    <div className="glass-card rounded-lg p-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-6">Major Currency Pairs (vs USD)</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="pb-4">Currency</th>
              <th className="pb-4">Rate</th>
              <th className="pb-4">24h Change</th>
              <th className="pb-4">Spread</th>
            </tr>
          </thead>
          <tbody>
            {currencies.map((currency) => (
              <tr key={currency.code} className="border-t border-secondary">
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currency.flag}</span>
                    <div>
                      <p className="font-medium">USD/{currency.code}</p>
                      <p className="text-sm text-muted-foreground">{currency.name}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4">{currency.rate.toFixed(4)}</td>
                <td className="py-4">
                  <span
                    className={`flex items-center gap-1 ${
                      currency.change >= 0 ? "text-success" : "text-warning"
                    }`}
                  >
                    {currency.change >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(currency.change).toFixed(2)}%
                  </span>
                </td>
                <td className="py-4">0.3 pips</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ForexList;