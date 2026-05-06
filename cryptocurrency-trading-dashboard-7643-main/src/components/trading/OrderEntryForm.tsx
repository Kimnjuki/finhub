import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface OrderEntryFormProps {
  symbol: string;
  currentPrice: number;
}

type OrderType = 'market' | 'limit' | 'stop-limit';
type OrderSide = 'buy' | 'sell';

export const OrderEntryForm = ({ symbol, currentPrice }: OrderEntryFormProps) => {
  const [orderSide, setOrderSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const { toast } = useToast();

  // Mock available balance
  const availableBalance = orderSide === 'buy' ? 10000 : 0.5;
  const balanceCurrency = orderSide === 'buy' ? 'USDT' : symbol.replace('USDT', '');

  const tradingFeeRate = 0.001; // 0.1% fee

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const price = orderType === 'market' ? currentPrice : parseFloat(limitPrice) || currentPrice;
    return qty * price;
  };

  const calculateFee = () => {
    return calculateTotal() * tradingFeeRate;
  };

  const calculateTotalWithFee = () => {
    return calculateTotal() + calculateFee();
  };

  const handleSubmitOrder = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast({
        title: 'Invalid Quantity',
        description: 'Please enter a valid quantity',
        variant: 'destructive',
      });
      return;
    }

    if (orderType !== 'market' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    if (orderType === 'stop-limit' && (!stopPrice || parseFloat(stopPrice) <= 0)) {
      toast({
        title: 'Invalid Stop Price',
        description: 'Please enter a valid stop price',
        variant: 'destructive',
      });
      return;
    }

    // Mock order submission
    toast({
      title: 'Order Submitted',
      description: `${orderSide.toUpperCase()} ${quantity} ${symbol} at ${orderType === 'market' ? 'Market Price' : `$${limitPrice}`}`,
    });

    // Reset form
    setQuantity('');
    setLimitPrice('');
    setStopPrice('');
  };

  const setPercentageAmount = (percentage: number) => {
    if (orderSide === 'buy') {
      const price = orderType === 'market' ? currentPrice : parseFloat(limitPrice) || currentPrice;
      const totalAvailable = availableBalance / (1 + tradingFeeRate);
      const amount = (totalAvailable * percentage) / price;
      setQuantity(amount.toFixed(6));
    } else {
      const amount = availableBalance * percentage;
      setQuantity(amount.toFixed(6));
    }
  };

  return (
    <Card className="p-4">
      <Tabs value={orderSide} onValueChange={(value) => setOrderSide(value as OrderSide)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Sell
          </TabsTrigger>
        </TabsList>

        <TabsContent value={orderSide} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Order Type</Label>
            <Select value={orderType} onValueChange={(value) => setOrderType(value as OrderType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="limit">Limit</SelectItem>
                <SelectItem value="stop-limit">Stop-Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {orderType !== 'market' && (
            <div className="space-y-2">
              <Label>Limit Price (USDT)</Label>
              <Input
                type="number"
                placeholder={currentPrice.toFixed(2)}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
              />
            </div>
          )}

          {orderType === 'stop-limit' && (
            <div className="space-y-2">
              <Label>Stop Price (USDT)</Label>
              <Input
                type="number"
                placeholder={currentPrice.toFixed(2)}
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Quantity ({balanceCurrency})</Label>
              <span className="text-xs text-muted-foreground">
                Available: {availableBalance.toFixed(6)} {balanceCurrency}
              </span>
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPercentageAmount(0.25)}>
                25%
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPercentageAmount(0.5)}>
                50%
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPercentageAmount(0.75)}>
                75%
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPercentageAmount(1)}>
                100%
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Price:</span>
              <span>
                {orderType === 'market'
                  ? `${currentPrice.toFixed(2)} (Market)`
                  : `${parseFloat(limitPrice) || 0} USDT`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span>{calculateTotal().toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee (0.1%):</span>
              <span>{calculateFee().toFixed(2)} USDT</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total with Fee:</span>
              <span>{calculateTotalWithFee().toFixed(2)} USDT</span>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            variant={orderSide === 'buy' ? 'default' : 'destructive'}
            onClick={handleSubmitOrder}
          >
            {orderSide === 'buy' ? 'Buy' : 'Sell'} {symbol.replace('USDT', '')}
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
