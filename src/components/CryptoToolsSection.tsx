import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TrendingUp, Calculator } from "lucide-react";

const CryptoToolsSection = () => {
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({});
  const [selectedCrypto, setSelectedCrypto] = useState("bitcoin");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [result, setResult] = useState("");

  const cryptoList = [
    { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
    { id: "ethereum", name: "Ethereum", symbol: "ETH" },
    { id: "binancecoin", name: "BNB", symbol: "BNB" },
    { id: "solana", name: "Solana", symbol: "SOL" },
    { id: "cardano", name: "Cardano", symbol: "ADA" },
    { id: "ripple", name: "XRP", symbol: "XRP" },
  ];

  useEffect(() => {
    const ids = cryptoList.map(c => c.id).join(',');
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
      .then(r => r.json())
      .then(d => {
        const prices: Record<string, number> = {};
        Object.keys(d).forEach(key => {
          prices[key] = d[key].usd;
        });
        setCryptoPrices(prices);
      })
      .catch(() => setCryptoPrices({}));
  }, []);

  const calculatePL = () => {
    const b = parseFloat(buyPrice);
    const s = parseFloat(sellPrice);
    const q = parseFloat(quantity);
    
    if (!b || !s || !q) {
      setResult('Please enter all values');
      return;
    }
    
    const pl = (s - b) * q;
    const percentage = ((s - b) / b) * 100;
    setResult(`Profit/Loss: $${pl.toFixed(2)} (${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%)`);
  };

  return (
    <section id="tools-section" className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Crypto Tools</h2>
          <p className="text-lg text-muted-foreground">Essential calculators for your trading journey</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Live Crypto Prices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cryptoList.map((crypto) => (
                  <div 
                    key={crypto.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      selectedCrypto === crypto.id 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'bg-muted/20 hover:bg-muted/30'
                    }`}
                    onClick={() => setSelectedCrypto(crypto.id)}
                  >
                    <div>
                      <div className="font-semibold">{crypto.symbol}</div>
                      <div className="text-xs text-muted-foreground">{crypto.name}</div>
                    </div>
                    <div className="text-right">
                      {cryptoPrices[crypto.id] ? (
                        <div className="font-bold text-primary">
                          ${cryptoPrices[crypto.id].toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm">Loading...</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Profit/Loss Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="buyPrice">Buy Price ($)</Label>
                <Input
                  id="buyPrice"
                  type="number"
                  step="0.01"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="Enter buy price"
                />
              </div>
              <div>
                <Label htmlFor="sellPrice">Sell Price ($)</Label>
                <Input
                  id="sellPrice"
                  type="number"
                  step="0.01"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="Enter sell price"
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>
              <Button onClick={calculatePL} className="w-full">
                Calculate
              </Button>
              {result && (
                <div className={`text-center p-4 rounded-lg ${result.includes('-') ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'}`}>
                  <p className="font-semibold">{result}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CryptoToolsSection;
