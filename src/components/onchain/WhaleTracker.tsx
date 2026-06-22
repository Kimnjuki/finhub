import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  ArrowRightLeft,
  Building,
  Circle,
  Hash,
  Loader2,
  RefreshCw,
  Clock,
} from "lucide-react";

interface WhaleTransaction {
  txHash: string;
  from: string;
  to: string;
  asset: string;
  amount: number;
  amountUsd: number;
  txType: 'deposit' | 'withdrawal' | 'transfer';
  exchange: string;
  timestamp: string;
}

const fetchWhaleTransactions = async (filters?: {
  asset?: string;
  txType?: string;
  minAmount?: number;
}): Promise<WhaleTransaction[]> => {
  // Simulate API call - in real app this would connect to blockchain APIs
  const now = Date.now();
  const transactions: WhaleTransaction[] = [
    {
      txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      to: "0x245d35Cc6634C0532925a3b844Bc454e4438f44f",
      asset: "ETH",
      amount: 1500,
      amountUsd: 4500000,
      txType: "transfer",
      exchange: "Binance",
      timestamp: new Date(now - Math.random() * 86400000).toISOString(),
    },
    {
      txHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
      from: "0x8ba1f109551bD432803012645Ac136ee64C17e6E",
      to: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835Cb2",
      asset: "BTC",
      amount: 250,
      amountUsd: 15000000,
      txType: "withdrawal",
      exchange: "Coinbase",
      timestamp: new Date(now - Math.random() * 86400000).toISOString(),
    },
    {
      txHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
      from: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835Cb2",
      to: "0x4e83362442b8d1bec652594ee82315a099443103",
      asset: "USDT",
      amount: 5000000,
      amountUsd: 5000000,
      txType: "transfer",
      exchange: "Kraken",
      timestamp: new Date(now - Math.random() * 86400000).toISOString(),
    },
    {
      txHash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
      from: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      asset: "USDC",
      amount: 2000000,
      amountUsd: 2000000,
      txType: "deposit",
      exchange: "Huobi",
      timestamp: new Date(now - Math.random() * 86400000).toISOString(),
    },
    {
      txHash: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
      from: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      asset: "USDT",
      amount: 1000000,
      amountUsd: 1000000,
      txType: "withdrawal",
      exchange: "OKX",
      timestamp: new Date(now - Math.random() * 86400000).toISOString(),
    },
  ];

  // Apply filters
  return transactions.filter(tx => {
    if (filters?.asset && tx.asset !== filters.asset) return false;
    if (filters?.txType && tx.txType !== filters.txType) return false;
    if (filters?.minAmount && tx.amountUsd < filters.minAmount) return false;
    return true;
  });
};

const WhaleTracker = () => {
  const [filters, setFilters] = React.useState({
    asset: "all",
    txType: "all",
    minAmount: 0,
  });

  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ["whaleTransactions", filters],
    queryFn: () => fetchWhaleTransactions({
      asset: filters.asset === "all" ? undefined : filters.asset,
      txType: filters.txType === "all" ? undefined : filters.txType,
      minAmount: filters.minAmount > 0 ? filters.minAmount : undefined,
    }),
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const getTxTypeClass = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-success/20 text-success';
      case 'withdrawal': return 'bg-destructive/20 text-destructive';
      default: return 'bg-warning/20 text-warning';
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5" />
            Whale Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Loading whale transactions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Whale Tracker
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <Button variant="outline" size="sm" onClick={() => setFilters(prev => ({ ...prev, asset: "all" }))}>
              All Assets
            </Button>
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={() => setFilters(prev => ({ ...prev, txType: "all" }))}>
              All Types
            </Button>
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={() => setFilters(prev => ({ ...prev, minAmount: 0 }))}>
              Min $0
            </Button>
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={() => setFilters(prev => ({ ...prev, minAmount: 1000000 }))}>
              Min $1M+
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {transactions?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No whale transactions match the current filters
          </div>
        ) : (
          <Table className="w-full">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-left text-xs font-medium text-muted-foreground w-24">
                  Transaction
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-muted-foreground w-20">
                  From
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-muted-foreground w-20">
                  To
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-muted-foreground w-10">
                  Asset
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-muted-foreground w-16">
                  Amount
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-muted-foreground w-12">
                  Type
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-muted-foreground w-16">
                  Exchange
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-muted-foreground w-14">
                  Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-muted/50">
              {transactions.map((tx) => (
                <TableRow key={tx.txHash} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="p-3 text-sm font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-muted rounded">
                        <Hash className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-8)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-muted rounded">
                        <Circle className="w-4 h-4" />
                      </div>
                      <div className="text-xs">{formatAddress(tx.from)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-muted rounded">
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                      <div className="text-xs">{formatAddress(tx.to)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="p-3 text-sm text-center font-medium">
                    <Badge variant="secondary" className="text-xs">
                      {tx.asset}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-3 text-sm text-right font-medium">
                    ${tx.amountUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="p-3 text-sm text-center">
                    <Badge 
                      variant="outline"
                      className={`${getTxTypeClass(tx.txType)} text-xs`}
                    >
                      {tx.txType.charAt(0).toUpperCase() + tx.txType.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-3 text-sm text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 flex items-center justify-center bg-muted rounded">
                        <Building className="w-4 h-4" />
                      </div>
                      <span className="ml-1 text-xs">{tx.exchange}</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-3 text-sm text-center text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default WhaleTracker;