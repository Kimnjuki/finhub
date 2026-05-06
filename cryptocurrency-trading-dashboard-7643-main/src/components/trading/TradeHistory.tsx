import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Trade {
  id: string;
  date: string;
  pair: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  fee: number;
  status: 'completed' | 'pending' | 'failed';
}

interface Order {
  id: string;
  date: string;
  pair: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop-limit';
  price: number;
  amount: number;
  filled: number;
  total: number;
  status: 'pending' | 'partial' | 'completed' | 'canceled';
}

// Mock data
const mockTrades: Trade[] = [
  { id: '1', date: '2025-11-07 14:30:25', pair: 'BTC/USDT', type: 'buy', price: 100674, amount: 0.05, total: 5033.7, fee: 5.03, status: 'completed' },
  { id: '2', date: '2025-11-07 13:15:42', pair: 'ETH/USDT', type: 'sell', price: 3286.35, amount: 1.5, total: 4929.53, fee: 4.93, status: 'completed' },
  { id: '3', date: '2025-11-07 11:45:18', pair: 'BTC/USDT', type: 'buy', price: 99850, amount: 0.1, total: 9985, fee: 9.99, status: 'completed' },
];

const mockOrders: Order[] = [
  { id: '1', date: '2025-11-07 15:20:10', pair: 'BTC/USDT', type: 'buy', orderType: 'limit', price: 99000, amount: 0.1, filled: 0, total: 9900, status: 'pending' },
  { id: '2', date: '2025-11-07 14:55:33', pair: 'ETH/USDT', type: 'sell', orderType: 'limit', price: 3350, amount: 2, filled: 1.2, total: 6700, status: 'partial' },
  { id: '3', date: '2025-11-07 10:30:45', pair: 'BTC/USDT', type: 'buy', orderType: 'market', price: 100500, amount: 0.05, filled: 0.05, total: 5025, status: 'completed' },
  { id: '4', date: '2025-11-07 09:15:22', pair: 'SOL/USDT', type: 'buy', orderType: 'limit', price: 150, amount: 10, filled: 0, total: 1500, status: 'canceled' },
];

export const TradeHistory = () => {
  const [tradeFilter, setTradeFilter] = useState<string>('all');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredTrades = mockTrades.filter(trade => {
    const matchesFilter = tradeFilter === 'all' || trade.type === tradeFilter;
    const matchesSearch = trade.pair.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredOrders = mockOrders.filter(order => {
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    const matchesSearch = order.pair.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <Card className="p-4">
      <Tabs defaultValue="trades" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trades">Trade History</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="trades" className="space-y-4">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search by pair..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={tradeFilter} onValueChange={setTradeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="buy">Buy Only</SelectItem>
                <SelectItem value="sell">Sell Only</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(filteredTrades, 'trades')}
              className="ml-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-mono text-xs">{trade.date}</TableCell>
                    <TableCell className="font-semibold">{trade.pair}</TableCell>
                    <TableCell>
                      <Badge variant={trade.type === 'buy' ? 'default' : 'destructive'}>
                        {trade.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">${trade.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{trade.amount}</TableCell>
                    <TableCell className="text-right font-mono">${trade.total.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">${trade.fee}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{trade.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search by pair..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={orderFilter} onValueChange={setOrderFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(filteredOrders, 'orders')}
              className="ml-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Order Type</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Filled</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.date}</TableCell>
                    <TableCell className="font-semibold">{order.pair}</TableCell>
                    <TableCell>
                      <Badge variant={order.type === 'buy' ? 'default' : 'destructive'}>
                        {order.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.orderType}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">${order.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{order.amount}</TableCell>
                    <TableCell className="text-right font-mono">
                      {order.filled} ({((order.filled / order.amount) * 100).toFixed(0)}%)
                    </TableCell>
                    <TableCell className="text-right font-mono">${order.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          order.status === 'completed' ? 'default' : 
                          order.status === 'pending' ? 'secondary' :
                          order.status === 'partial' ? 'outline' : 'destructive'
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
