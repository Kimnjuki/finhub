import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Copy, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ExternalLink,
  Webhook,
  Activity,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Settings,
  Key,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  Hash,
} from 'lucide-react';

interface WebhookConfig {
  _id: string;
  userId: string;
  endpointId: string;
  label: string;
  description?: string;
  hmacSecret: string;
  isActive: boolean;
  defaultExchange?: string;
  symbolMappings?: string;
  maxOrderSize?: number;
  maxNotional?: number;
  dailyOrderLimit?: number;
  dailyVolumeLimit?: number;
  allowMultiplePositions?: boolean;
  maxLeverage?: number;
  defaultTimeInForce?: string;
  defaultOrderType?: string;
  totalAlertsReceived?: number;
  totalOrdersPlaced?: number;
  totalErrors?: number;
  lastAlertAt?: number;
  webhookUrl?: string;
  createdAt: number;
  updatedAt: number;
}

interface ExchangeCredential {
  _id: string;
  userId: string;
  exchange: string;
  label?: string;
  isActive: boolean;
  isTestnet?: boolean;
  permissions: string[];
  hasApiKey: boolean;
  hasSecretKey: boolean;
  hasPassphrase: boolean;
  createdAt: number;
}

interface WebhookEvent {
  _id: string;
  configId: string;
  userId: string;
  rawPayload: string;
  parsedSymbol?: string;
  parsedSide?: string;
  parsedQuantity?: number;
  parsedPrice?: number;
  parsedStrategyName?: string;
  hmacValid: boolean;
  processingStatus: string;
  errorMessage?: string;
  linkedOrderId?: string;
  receivedAt: number;
}

interface OrderRecord {
  _id: string;
  userId: string;
  configId: string;
  exchange: string;
  symbol: string;
  side: string;
  orderType: string;
  quantity: number;
  price?: number;
  status: string;
  exchangeOrderId?: string;
  createdAt: number;
}

const EXCHANGES = [
  { value: 'binance', label: 'Binance' },
  { value: 'coinbase', label: 'Coinbase' },
  { value: 'kraken', label: 'Kraken' },
  { value: 'bybit', label: 'Bybit' },
  { value: 'okx', label: 'OKX' },
  { value: 'deribit', label: 'Deribit' },
];

const TIME_IN_FORCE = [
  { value: 'GTC', label: 'Good Till Canceled' },
  { value: 'IOC', label: 'Immediate or Cancel' },
  { value: 'FOK', label: 'Fill or Kill' },
  { value: 'GTD', label: 'Good Till Date' },
];

const ORDER_TYPES = [
  { value: 'market', label: 'Market' },
  { value: 'limit', label: 'Limit' },
  { value: 'stop', label: 'Stop' },
  { value: 'stop_limit', label: 'Stop Limit' },
];

export function TradingViewWebhookPanel() {
  const [activeTab, setActiveTab] = useState('configs');
  const [configs, setConfigs] = useState<WebhookConfig[]>([]);
  const [credentials, setCredentials] = useState<ExchangeCredential[]>([]);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  // New config form
  const [showNewConfig, setShowNewConfig] = useState(false);
  const [newConfig, setNewConfig] = useState({
    label: '',
    description: '',
    defaultExchange: 'binance',
    defaultOrderType: 'market',
    defaultTimeInForce: 'GTC',
    maxOrderSize: '',
    maxNotional: '',
    dailyOrderLimit: '',
    dailyVolumeLimit: '',
    maxLeverage: '',
  });

  // New credential form
  const [showNewCredential, setShowNewCredential] = useState(false);
  const [newCredential, setNewCredential] = useState({
    exchange: 'binance',
    apiKey: '',
    secretKey: '',
    passphrase: '',
    label: '',
    isTestnet: false,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // In production these would call the Convex API
      // For now, simulate loading from the TV API
      const userId = localStorage.getItem('userId') || 'demo_user';
      
      // These would be actual Convex action calls:
      // const configs = await useAction(api.tradingview.listWebhookConfigs, { userId });
      // setConfigs(configs);
      
      // For now, set empty arrays
      setConfigs([]);
      setCredentials([]);
      setEvents([]);
      setOrders([]);
    } catch (error: any) {
      toast.error('Failed to load webhook data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateConfig = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'demo_user';
      
      // This would call: useAction(api.tradingview.createWebhookConfig, { ... })
      
      toast.success('Webhook configuration created!');
      setShowNewConfig(false);
      setNewConfig({
        label: '', description: '', defaultExchange: 'binance',
        defaultOrderType: 'market', defaultTimeInForce: 'GTC',
        maxOrderSize: '', maxNotional: '', dailyOrderLimit: '',
        dailyVolumeLimit: '', maxLeverage: '',
      });
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    try {
      // This would call: useAction(api.tradingview.deleteWebhookConfig, { configId })
      toast.success('Webhook configuration deleted');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSaveCredential = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'demo_user';
      
      // This would call: useAction(api.tradingview.saveExchangeCredentials, { ... })
      
      toast.success('Exchange credentials saved!');
      setShowNewCredential(false);
      setNewCredential({
        exchange: 'binance', apiKey: '', secretKey: '',
        passphrase: '', label: '', isTestnet: false,
      });
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteCredential = async (credentialId: string) => {
    try {
      // This would call: useAction(api.tradingview.deleteExchangeCredentials, { credentialId })
      toast.success('Credentials deleted');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecret(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">TradingView Webhook Trader</h1>
          <p className="text-muted-foreground">
            Connect TradingView alerts to automated exchange execution
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="configs" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhook Configs
          </TabsTrigger>
          <TabsTrigger value="credentials" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Exchange Keys
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Event Log
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Orders
          </TabsTrigger>
        </TabsList>

        {/* ─── Webhook Configs Tab ─────────────────────────────────── */}
        <TabsContent value="configs" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowNewConfig(!showNewConfig)}>
              <Plus className="h-4 w-4 mr-2" />
              New Webhook Config
            </Button>
          </div>

          {showNewConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Create Webhook Configuration</CardTitle>
                <CardDescription>
                  Configure how TradingView alerts are processed and executed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Label *</Label>
                    <Input
                      placeholder="My BTC Strategy"
                      value={newConfig.label}
                      onChange={e => setNewConfig(prev => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="TradingView alerts for BTCUSDT"
                      value={newConfig.description}
                      onChange={e => setNewConfig(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Exchange</Label>
                    <Select
                      value={newConfig.defaultExchange}
                      onValueChange={v => setNewConfig(prev => ({ ...prev, defaultExchange: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXCHANGES.map(ex => (
                          <SelectItem key={ex.value} value={ex.value}>{ex.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Order Type</Label>
                    <Select
                      value={newConfig.defaultOrderType}
                      onValueChange={v => setNewConfig(prev => ({ ...prev, defaultOrderType: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_TYPES.map(ot => (
                          <SelectItem key={ot.value} value={ot.value}>{ot.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time in Force</Label>
                    <Select
                      value={newConfig.defaultTimeInForce}
                      onValueChange={v => setNewConfig(prev => ({ ...prev, defaultTimeInForce: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_IN_FORCE.map(tif => (
                          <SelectItem key={tif.value} value={tif.value}>{tif.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Order Size</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 1.5"
                      value={newConfig.maxOrderSize}
                      onChange={e => setNewConfig(prev => ({ ...prev, maxOrderSize: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Notional (USD)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 10000"
                      value={newConfig.maxNotional}
                      onChange={e => setNewConfig(prev => ({ ...prev, maxNotional: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Order Limit</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 50"
                      value={newConfig.dailyOrderLimit}
                      onChange={e => setNewConfig(prev => ({ ...prev, dailyOrderLimit: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Volume Limit (USD)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 100000"
                      value={newConfig.dailyVolumeLimit}
                      onChange={e => setNewConfig(prev => ({ ...prev, dailyVolumeLimit: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Leverage</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={newConfig.maxLeverage}
                      onChange={e => setNewConfig(prev => ({ ...prev, maxLeverage: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewConfig(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateConfig}>
                    Create Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Config list */}
          {configs.length === 0 && !loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Webhook className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Webhook Configurations</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first TradingView webhook configuration to start automating trades
                </p>
                <Button onClick={() => setShowNewConfig(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Configuration
                </Button>
              </CardContent>
            </Card>
          ) : (
            configs.map(config => (
              <Card key={config._id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{config.label}</CardTitle>
                        <Badge variant={config.isActive ? 'default' : 'secondary'}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {config.description && (
                        <CardDescription>{config.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteConfig(config._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Webhook URL</Label>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                          {config.webhookUrl || 'https://...'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(config.webhookUrl || '', 'Webhook URL')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">HMAC Secret</Label>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                          {showSecret[config._id] ? config.hmacSecret : '••••••••••••••••'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSecretVisibility(config._id)}
                        >
                          {showSecret[config._id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(config.hmacSecret, 'HMAC Secret')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-2xl font-bold">{config.totalAlertsReceived || 0}</div>
                      <div className="text-xs text-muted-foreground">Alerts</div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-2xl font-bold">{config.totalOrdersPlaced || 0}</div>
                      <div className="text-xs text-muted-foreground">Orders</div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-2xl font-bold">{config.totalErrors || 0}</div>
                      <div className="text-xs text-muted-foreground">Errors</div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-2xl font-bold">{config.defaultExchange?.toUpperCase() || 'BINANCE'}</div>
                      <div className="text-xs text-muted-foreground">Exchange</div>
                    </div>
                  </div>

                  {config.symbolMappings && (
                    <div className="mt-3">
                      <Label className="text-xs text-muted-foreground">Symbol Mappings</Label>
                      <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                        {config.symbolMappings}
                      </code>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    {config.lastAlertAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last alert: {new Date(config.lastAlertAt).toLocaleString()}
                      </span>
                    )}
                    {config.maxOrderSize && (
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        Max size: {config.maxOrderSize}
                      </span>
                    )}
                    {config.maxNotional && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Max notional: ${config.maxNotional.toLocaleString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Quick Setup Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Setup Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>1. Create a webhook configuration above</p>
              <p>2. Save your exchange API keys in the <strong>Exchange Keys</strong> tab</p>
              <p>3. In TradingView, create an alert with Webhook URL:</p>
              <code className="block bg-muted p-2 rounded text-xs my-1">
                POST {`{your_url}/tradingview-webhook/{endpoint_id}`}
              </code>
              <p>4. Set alert message to JSON format:</p>
              <code className="block bg-muted p-2 rounded text-xs my-1">
{`{
  "ticker": "BTCUSDT",
  "action": "buy",
  "quantity": 0.01,
  "price": {{close}}
}`}
              </code>
              <p>5. Set the HMAC secret in your TradingView alert for security</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Exchange Keys Tab ───────────────────────────────────── */}
        <TabsContent value="credentials" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowNewCredential(!showNewCredential)}>
              <Key className="h-4 w-4 mr-2" />
              Add Exchange Keys
            </Button>
          </div>

          {showNewCredential && (
            <Card>
              <CardHeader>
                <CardTitle>Add Exchange API Credentials</CardTitle>
                <CardDescription>
                  Your API keys are encrypted at rest and used only for order execution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Exchange *</Label>
                    <Select
                      value={newCredential.exchange}
                      onValueChange={v => setNewCredential(prev => ({ ...prev, exchange: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXCHANGES.map(ex => (
                          <SelectItem key={ex.value} value={ex.value}>{ex.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      placeholder="My Binance Key"
                      value={newCredential.label}
                      onChange={e => setNewCredential(prev => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Key *</Label>
                    <Input
                      placeholder="Enter your API key"
                      value={newCredential.apiKey}
                      onChange={e => setNewCredential(prev => ({ ...prev, apiKey: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secret Key *</Label>
                    <Input
                      type="password"
                      placeholder="Enter your secret key"
                      value={newCredential.secretKey}
                      onChange={e => setNewCredential(prev => ({ ...prev, secretKey: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Passphrase (if required)</Label>
                    <Input
                      type="password"
                      placeholder="Coinbase requires a passphrase"
                      value={newCredential.passphrase}
                      onChange={e => setNewCredential(prev => ({ ...prev, passphrase: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newCredential.isTestnet}
                        onCheckedChange={v => setNewCredential(prev => ({ ...prev, isTestnet: v }))}
                      />
                      <Label>Use Testnet</Label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewCredential(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveCredential}>
                    <Shield className="h-4 w-4 mr-2" />
                    Save Credentials
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {credentials.length === 0 && !loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Exchange Credentials</h3>
                <p className="text-muted-foreground mb-4">
                  Add your exchange API keys to enable automated order execution
                </p>
                <Button onClick={() => setShowNewCredential(true)}>
                  <Key className="h-4 w-4 mr-2" />
                  Add Exchange Keys
                </Button>
              </CardContent>
            </Card>
          ) : (
            credentials.map(cred => (
              <Card key={cred._id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-sm">
                        {cred.exchange.toUpperCase()}
                      </Badge>
                      <div>
                        <CardTitle className="text-sm">{cred.label || `${cred.exchange} Keys`}</CardTitle>
                        <CardDescription className="text-xs">
                          API Key: {cred.hasApiKey ? '✓ Configured' : '✗ Missing'} | 
                          Secret: {cred.hasSecretKey ? '✓ Configured' : '✗ Missing'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {cred.isTestnet && (
                        <Badge variant="secondary">Testnet</Badge>
                      )}
                      <Badge variant={cred.isActive ? 'default' : 'secondary'}>
                        {cred.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCredential(cred._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ─── Event Log Tab ───────────────────────────────────────── */}
        <TabsContent value="events" className="space-y-4">
          {events.length === 0 && !loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Webhook Events Yet</h3>
                <p className="text-muted-foreground">
                  Events will appear here when TradingView sends alerts to your webhook URL
                </p>
              </CardContent>
            </Card>
          ) : (
            events.map(event => (
              <Card key={event._id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {event.processingStatus === 'order_placed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : event.processingStatus === 'rejected' || event.processingStatus === 'order_failed' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <CardTitle className="text-sm">
                          {event.parsedSymbol || 'Unknown'} - {event.parsedSide || 'N/A'}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {new Date(event.receivedAt).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge>{event.processingStatus}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {event.parsedQuantity && (
                      <div>
                        <span className="text-muted-foreground">Qty:</span> {event.parsedQuantity}
                      </div>
                    )}
                    {event.parsedPrice && (
                      <div>
                        <span className="text-muted-foreground">Price:</span> ${event.parsedPrice}
                      </div>
                    )}
                    {event.parsedStrategyName && (
                      <div>
                        <span className="text-muted-foreground">Strategy:</span> {event.parsedStrategyName}
                      </div>
                    )}
                  </div>
                  {event.errorMessage && (
                    <div className="mt-2 text-xs text-red-500 bg-red-500/10 rounded p-2">
                      {event.errorMessage}
                    </div>
                  )}
                  {event.linkedOrderId && (
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">Order ID:</span> {event.linkedOrderId}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ─── Orders Tab ──────────────────────────────────────────── */}
        <TabsContent value="orders" className="space-y-4">
          {orders.length === 0 && !loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground">
                  Orders will appear here when TradingView alerts successfully execute trades
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orders.map(order => (
                    <div key={order._id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={order.side === 'buy' ? 'default' : 'destructive'}>
                          {order.side.toUpperCase()}
                        </Badge>
                        <div>
                          <div className="font-medium">{order.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.exchange.toUpperCase()} · {order.orderType}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{order.quantity} @ {order.price ? `$${order.price}` : 'Market'}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant={order.status === 'filled' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TradingViewWebhookPanel;