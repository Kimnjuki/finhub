import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, BarChart3, Globe, DollarSign } from "lucide-react";
import MobileNavigation from "@/components/MobileNavigation";
import SEOHead from "@/components/SEOHead";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Products = () => {
  const [selectedCountry, setSelectedCountry] = useState("all");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Global Commodity Prices - African Markets",
    "description": "Real-time commodity prices across African markets",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "Product",
          "name": "Crude Oil",
          "category": "Energy Commodity"
        },
        {
          "@type": "Product",
          "name": "Gold",
          "category": "Precious Metal"
        },
        {
          "@type": "Product",
          "name": "Coffee",
          "category": "Agricultural Commodity"
        }
      ]
    }
  };

  // Mock data for African countries and global commodities
  const africanCountries = [
    { code: "NG", name: "Nigeria", currency: "NGN", flag: "🇳🇬" },
    { code: "ZA", name: "South Africa", currency: "ZAR", flag: "🇿🇦" },
    { code: "EG", name: "Egypt", currency: "EGP", flag: "🇪🇬" },
    { code: "KE", name: "Kenya", currency: "KES", flag: "🇰🇪" },
    { code: "GH", name: "Ghana", currency: "GHS", flag: "🇬🇭" },
    { code: "MA", name: "Morocco", currency: "MAD", flag: "🇲🇦" },
    { code: "ET", name: "Ethiopia", currency: "ETB", flag: "🇪🇹" },
    { code: "TZ", name: "Tanzania", currency: "TZS", flag: "🇹🇿" },
  ];

  const globalProducts = [
    {
      id: 1,
      name: "Crude Oil (Brent)",
      category: "Energy",
      unit: "per barrel",
      globalPrice: 85.50,
      trend: "up",
      change: 2.3,
      prices: {
        NG: { price: 130895.0, change: 2.1, localizedName: "Crude Oil" },
        ZA: { price: 1554.09, change: 2.5, localizedName: "Crude Oil" },
        EG: { price: 4161.67, change: 1.8, localizedName: "البترول الخام" },
        KE: { price: 11038.6, change: 2.7, localizedName: "Crude Oil" },
        GH: { price: 927.67, change: 1.9, localizedName: "Crude Oil" },
        MA: { price: 779.76, change: 2.0, localizedName: "Pétrole brut" },
        ET: { price: 11774.35, change: 2.4, localizedName: "Crude Oil" },
        TZ: { price: 218721.5, change: 2.2, localizedName: "Crude Oil" },
      }
    },
    {
      id: 2,
      name: "Gold",
      category: "Precious Metals",
      unit: "per ounce",
      globalPrice: 2045.30,
      trend: "up",
      change: 1.2,
      prices: {
        NG: { price: 3131420.4, change: 1.0, localizedName: "Gold" },
        ZA: { price: 37223.96, change: 1.5, localizedName: "Gold" },
        EG: { price: 99537.86, change: 0.8, localizedName: "الذهب" },
        KE: { price: 264169.49, change: 1.4, localizedName: "Gold" },
        GH: { price: 22191.51, change: 1.1, localizedName: "Gold" },
        MA: { price: 18653.04, change: 1.3, localizedName: "Or" },
        ET: { price: 281658.285, change: 1.2, localizedName: "Gold" },
        TZ: { price: 5232086.85, change: 1.0, localizedName: "Gold" },
      }
    },
    {
      id: 3,
      name: "Wheat",
      category: "Agriculture",
      unit: "per bushel",
      globalPrice: 6.85,
      trend: "down",
      change: -1.5,
      prices: {
        NG: { price: 10488.8, change: -1.2, localizedName: "Wheat" },
        ZA: { price: 124.56, change: -1.8, localizedName: "Wheat" },
        EG: { price: 333.34, change: -1.0, localizedName: "القمح" },
        KE: { price: 884.2, change: -1.7, localizedName: "Wheat" },
        GH: { price: 74.32, change: -1.3, localizedName: "Wheat" },
        MA: { price: 62.48, change: -1.6, localizedName: "Blé" },
        ET: { price: 943.35, change: -1.4, localizedName: "Wheat" },
        TZ: { price: 17521.3, change: -1.5, localizedName: "Wheat" },
      }
    },
    {
      id: 4,
      name: "Coffee (Arabica)",
      category: "Agriculture",
      unit: "per lb",
      globalPrice: 1.65,
      trend: "up",
      change: 3.2,
      prices: {
        NG: { price: 2526.15, change: 3.0, localizedName: "Coffee" },
        ZA: { price: 29.98, change: 3.5, localizedName: "Coffee" },
        EG: { price: 80.31, change: 2.8, localizedName: "القهوة" },
        KE: { price: 213.03, change: 3.7, localizedName: "Kahawa" },
        GH: { price: 17.90, change: 3.1, localizedName: "Coffee" },
        MA: { price: 15.05, change: 3.3, localizedName: "Café" },
        ET: { price: 227.16, change: 3.4, localizedName: "ቡና" },
        TZ: { price: 4218.7, change: 3.2, localizedName: "Kahawa" },
      }
    },
    {
      id: 5,
      name: "Cocoa",
      category: "Agriculture",
      unit: "per tonne",
      globalPrice: 3850.00,
      trend: "down",
      change: -2.1,
      prices: {
        NG: { price: 5895350.0, change: -1.8, localizedName: "Cocoa" },
        ZA: { price: 69972.5, change: -2.4, localizedName: "Cocoa" },
        EG: { price: 187472.5, change: -1.6, localizedName: "الكاكاو" },
        KE: { price: 497220.0, change: -2.6, localizedName: "Cocoa" },
        GH: { price: 41792.5, change: -1.9, localizedName: "Cocoa" },
        MA: { price: 35112.0, change: -2.3, localizedName: "Cacao" },
        ET: { price: 530247.5, change: -2.0, localizedName: "Cocoa" },
        TZ: { price: 9849075.0, change: -2.1, localizedName: "Cocoa" },
      }
    },
    {
      id: 6,
      name: "Natural Gas",
      category: "Energy",
      unit: "per MMBtu",
      globalPrice: 3.75,
      trend: "up",
      change: 4.1,
      prices: {
        NG: { price: 5738.25, change: 3.8, localizedName: "Natural Gas" },
        ZA: { price: 68.19, change: 4.4, localizedName: "Natural Gas" },
        EG: { price: 182.62, change: 3.6, localizedName: "الغاز الطبيعي" },
        KE: { price: 484.5, change: 4.6, localizedName: "Natural Gas" },
        GH: { price: 40.69, change: 3.9, localizedName: "Natural Gas" },
        MA: { price: 34.2, change: 4.3, localizedName: "Gaz naturel" },
        ET: { price: 516.375, change: 4.0, localizedName: "Natural Gas" },
        TZ: { price: 9593.25, change: 4.1, localizedName: "Natural Gas" },
      }
    },
    {
      id: 7,
      name: "Silver",
      category: "Precious Metals",
      unit: "per ounce",
      globalPrice: 24.85,
      trend: "up",
      change: 1.8,
      prices: {
        NG: { price: 38069.4, change: 1.6, localizedName: "Silver" },
        ZA: { price: 452.18, change: 2.1, localizedName: "Silver" },
        EG: { price: 1210.33, change: 1.4, localizedName: "الفضة" },
        KE: { price: 3211.69, change: 2.3, localizedName: "Silver" },
        GH: { price: 269.84, change: 1.7, localizedName: "Silver" },
        MA: { price: 226.74, change: 1.9, localizedName: "Argent" },
        ET: { price: 3424.43, change: 1.8, localizedName: "Silver" },
        TZ: { price: 63583.15, change: 1.6, localizedName: "Silver" },
      }
    },
    {
      id: 8,
      name: "Copper",
      category: "Industrial Metals",
      unit: "per pound",
      globalPrice: 4.12,
      trend: "down",
      change: -0.8,
      prices: {
        NG: { price: 6307.44, change: -0.6, localizedName: "Copper" },
        ZA: { price: 74.84, change: -1.1, localizedName: "Copper" },
        EG: { price: 200.34, change: -0.4, localizedName: "النحاس" },
        KE: { price: 532.09, change: -1.3, localizedName: "Copper" },
        GH: { price: 44.70, change: -0.7, localizedName: "Copper" },
        MA: { price: 37.56, change: -1.0, localizedName: "Cuivre" },
        ET: { price: 567.51, change: -0.8, localizedName: "Copper" },
        TZ: { price: 10535.24, change: -0.6, localizedName: "Copper" },
      }
    },
    {
      id: 9,
      name: "Platinum",
      category: "Precious Metals",
      unit: "per ounce",
      globalPrice: 1028.50,
      trend: "up",
      change: 0.9,
      prices: {
        NG: { price: 1574653.5, change: 0.7, localizedName: "Platinum" },
        ZA: { price: 18699.23, change: 1.2, localizedName: "Platinum" },
        EG: { price: 50068.93, change: 0.5, localizedName: "البلاتين" },
        KE: { price: 132803.85, change: 1.4, localizedName: "Platinum" },
        GH: { price: 11152.89, change: 0.8, localizedName: "Platinum" },
        MA: { price: 9372.12, change: 1.1, localizedName: "Platine" },
        ET: { price: 141651.275, change: 0.9, localizedName: "Platinum" },
        TZ: { price: 2631096.75, change: 0.7, localizedName: "Platinum" },
      }
    },
    {
      id: 10,
      name: "Palm Oil",
      category: "Agriculture",
      unit: "per tonne",
      globalPrice: 950.00,
      trend: "down",
      change: -1.3,
      prices: {
        NG: { price: 1454950.0, change: -1.0, localizedName: "Palm Oil" },
        ZA: { price: 17282.5, change: -1.6, localizedName: "Palm Oil" },
        EG: { price: 46282.5, change: -0.8, localizedName: "زيت النخيل" },
        KE: { price: 122730.0, change: -1.8, localizedName: "Palm Oil" },
        GH: { price: 10312.5, change: -1.1, localizedName: "Palm Oil" },
        MA: { price: 8664.0, change: -1.5, localizedName: "Huile de palme" },
        ET: { price: 130842.5, change: -1.3, localizedName: "Palm Oil" },
        TZ: { price: 2430425.0, change: -1.0, localizedName: "Palm Oil" },
      }
    },
    {
      id: 11,
      name: "Aluminum",
      category: "Industrial Metals",
      unit: "per tonne",
      globalPrice: 2385.00,
      trend: "up",
      change: 2.1,
      prices: {
        NG: { price: 3653627.5, change: 1.8, localizedName: "Aluminum" },
        ZA: { price: 43374.75, change: 2.4, localizedName: "Aluminum" },
        EG: { price: 116121.25, change: 1.6, localizedName: "الألومنيوم" },
        KE: { price: 308051.5, change: 2.6, localizedName: "Aluminum" },
        GH: { price: 25880.25, change: 1.9, localizedName: "Aluminum" },
        MA: { price: 21753.6, change: 2.3, localizedName: "Aluminium" },
        ET: { price: 328491.75, change: 2.1, localizedName: "Aluminum" },
        TZ: { price: 6101347.5, change: 1.8, localizedName: "Aluminum" },
      }
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatLocalPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <>
      <SEOHead
        title="Global Commodity Prices in Africa | Oil, Gold, Coffee & Metal Prices | FINHUBAFRICA"
        description="Track real-time commodity prices across African markets. Monitor crude oil, gold, silver, platinum, wheat, coffee, cocoa prices in Nigeria, South Africa, Kenya, Ghana, Egypt & more. Live updates in local currencies."
        keywords="commodity prices Africa, oil prices Nigeria, gold price South Africa, coffee prices Kenya, cocoa prices Ghana, commodity trading, agricultural commodities, precious metals, energy commodities, African markets"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background font-financial pt-28 lg:pt-24">
      <MobileNavigation />
      
      <div className="p-6">
      
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold font-vogun text-gradient-green mb-2">Global Commodity Prices</h1>
          <p className="text-xl text-muted-foreground font-vogun">
            Track major commodity prices across African markets in real-time
          </p>
          
          {/* Ad Space - Products Header */}
          <div className="mx-auto max-w-2xl mt-4 p-4 bg-muted/20 border border-border/40 rounded-lg">
            <span className="text-sm text-muted-foreground">Sponsored - Advanced Trading Tools & Market Insights</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-vogun">Total Products</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalProducts.length}</div>
              <p className="text-xs text-muted-foreground">Tracked commodities</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-vogun">Countries</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{africanCountries.length}</div>
              <p className="text-xs text-muted-foreground">African markets</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-vogun">Average Change</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                +1.2%
                <TrendingUp className="h-4 w-4 text-success ml-2" />
              </div>
              <p className="text-xs text-muted-foreground">24h change</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Market Overview</TabsTrigger>
            <TabsTrigger value="countries">By Country</TabsTrigger>
            <TabsTrigger value="trends">Price Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6">
              {globalProducts.map((product) => (
                <Card key={product.id} className="glass-card animate-slide-in">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {product.name}
                          <Badge variant="secondary">{product.category}</Badge>
                        </CardTitle>
                        <CardDescription>
                          Global price: ${formatLocalPrice(product.globalPrice)} {product.unit}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(product.trend)}
                        <span className={`font-mono text-sm ${
                          product.change > 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {product.change > 0 ? '+' : ''}{product.change}%
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Country</TableHead>
                            <TableHead>Local Price</TableHead>
                            <TableHead>Currency</TableHead>
                            <TableHead>24h Change</TableHead>
                            <TableHead>Local Name</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {africanCountries.map((country) => (
                            <TableRow key={country.code}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{country.flag}</span>
                                  {country.name}
                                </div>
                              </TableCell>
                              <TableCell className="font-mono">
                                {formatLocalPrice(product.prices[country.code as keyof typeof product.prices].price)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{country.currency}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {product.prices[country.code as keyof typeof product.prices].change > 0 ? (
                                    <TrendingUp className="h-3 w-3 text-success" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 text-destructive" />
                                  )}
                                  <span className={`text-sm font-mono ${
                                    product.prices[country.code as keyof typeof product.prices].change > 0 
                                      ? 'text-success' : 'text-destructive'
                                  }`}>
                                    {product.prices[country.code as keyof typeof product.prices].change > 0 ? '+' : ''}
                                    {product.prices[country.code as keyof typeof product.prices].change}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {product.prices[country.code as keyof typeof product.prices].localizedName}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="countries" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <button
                onClick={() => setSelectedCountry("all")}
                className={`p-4 rounded-lg border transition-all ${
                  selectedCountry === "all" 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-card hover:bg-accent border-border'
                }`}
              >
                <div className="text-2xl mb-2">🌍</div>
                <div className="font-medium">All Countries</div>
              </button>
              {africanCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => setSelectedCountry(country.code)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedCountry === country.code 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-card hover:bg-accent border-border'
                  }`}
                >
                  <div className="text-2xl mb-2">{country.flag}</div>
                  <div className="font-medium">{country.name}</div>
                  <div className="text-sm text-muted-foreground">{country.currency}</div>
                </button>
              ))}
            </div>

            <div className="grid gap-4">
              {globalProducts.map((product) => (
                <Card key={product.id} className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{product.name}</span>
                      <Badge variant="secondary">{product.category}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCountry === "all" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {africanCountries.map((country) => (
                          <div key={country.code} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span>{country.flag}</span>
                              <span className="font-medium">{country.name}</span>
                            </div>
                            <div className="font-mono text-lg">
                              {formatLocalPrice(product.prices[country.code as keyof typeof product.prices].price)} {country.currency}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {product.prices[country.code as keyof typeof product.prices].change > 0 ? (
                                <TrendingUp className="h-3 w-3 text-success" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-destructive" />
                              )}
                              <span className={`text-sm ${
                                product.prices[country.code as keyof typeof product.prices].change > 0 
                                  ? 'text-success' : 'text-destructive'
                              }`}>
                                {product.prices[country.code as keyof typeof product.prices].change > 0 ? '+' : ''}
                                {product.prices[country.code as keyof typeof product.prices].change}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        {africanCountries.find(c => c.code === selectedCountry) && (
                          <div>
                            <div className="text-4xl mb-4">
                              {africanCountries.find(c => c.code === selectedCountry)?.flag}
                            </div>
                            <div className="text-2xl font-bold mb-2">
                              {formatLocalPrice(product.prices[selectedCountry as keyof typeof product.prices].price)} {africanCountries.find(c => c.code === selectedCountry)?.currency}
                            </div>
                            <div className="text-muted-foreground mb-2">
                              {product.prices[selectedCountry as keyof typeof product.prices].localizedName}
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              {product.prices[selectedCountry as keyof typeof product.prices].change > 0 ? (
                                <TrendingUp className="h-4 w-4 text-success" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              )}
                              <span className={`font-mono ${
                                product.prices[selectedCountry as keyof typeof product.prices].change > 0 
                                  ? 'text-success' : 'text-destructive'
                              }`}>
                                {product.prices[selectedCountry as keyof typeof product.prices].change > 0 ? '+' : ''}
                                {product.prices[selectedCountry as keyof typeof product.prices].change}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Price Volatility Analysis</CardTitle>
                  <CardDescription>
                    Commodities ranked by price volatility across African markets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {globalProducts
                      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
                      .map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="font-mono text-sm text-muted-foreground">
                              #{index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.category}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(product.trend)}
                            <span className={`font-mono text-lg ${
                              product.change > 0 ? 'text-success' : 'text-destructive'
                            }`}>
                              {product.change > 0 ? '+' : ''}{product.change}%
                            </span>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </div>
      </div>
    </>
  );
};

export default Products;
