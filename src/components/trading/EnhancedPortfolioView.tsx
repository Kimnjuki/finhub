import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp, BarChart3, DollarSign, ExternalLink, PieChart, Plus, RefreshCw, TrendingDown, TrendingUp, Wallet } from "lucide-react";

interface Position {
  id: string;
  instrument: string;
  direction: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  marginUsed: number;
  leverage: number;
  liquidationPrice: number;
  isOpen: boolean;
}

interface Account {
  id: string;
  name: string;
  accountType: 'spot' | 'margin' | 'futures' | 'funding' | 'external';
  currency: string;
  currentBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  realizedPnl: number;
  positions: Position[];
}

const mockAccounts: Account[] = [
  {
    id: 'acc-001',
    name: 'Main Trading Account',
    accountType: 'futures',
    currency: 'USDT',
    currentBalance: 45230.50,
    totalDeposits: 50000,
    totalWithdrawals: 10000,
    realizedPnl: 5230.50,
    positions: [
      { id: 'pos-001', instrument: 'BTC/USDT', direction: 'long', quantity: 1.5, entryPrice: 65420, currentPrice: 67890, unrealizedPnl: 3705, unrealizedPnlPercent: 3.77, marginUsed: 16355, leverage: 5, liquidationPrice: 52336, isOpen: true },
      { id: 'pos-002', instrument: 'ETH/USDT', direction: 'short', quantity: 12, entryPrice: 3450, currentPrice: 3320, unrealizedPnl: 1560, unrealizedPnlPercent: 4.52, marginUsed: 6900, leverage: 3, liquidationPrice: 4485, isOpen: true },
      { id: 'pos-003', instrument: 'SOL/USDT', direction: 'long', quantity: 50, entryPrice: 142, currentPrice: 151, unrealizedPnl: 450, unrealizedPnlPercent: 6.34, marginUsed: 2840, leverage: 2.5, liquidationPrice: 85, isOpen: true },
    ],
  },
  {
    id: 'acc-002',
    name: 'Spot Holdings',
    accountType: 'spot',
    currency: 'USDT',
    currentBalance: 28340.75,
    totalDeposits: 20000,
    totalWithdrawals: 5000,
    realizedPnl: 3340.75,
    positions: [
      { id: 'pos-004', instrument: 'BTC/USDT', direction: 'long', quantity: 0.25, entryPrice: 52000, currentPrice: 67890, unrealizedPnl: 3972.50, unrealizedPnlPercent: 30.56, marginUsed: 0, leverage: 1, liquidationPrice: 0, isOpen: true },
    ],
  },
];

const EnhancedPortfolioView: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [selectedAccount, setSelectedAccount] = useState<Account>(mockAccounts[0]);

  const totalEquity = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const totalOpenPnl = accounts.reduce((sum, acc) => 
    sum + acc.positions.filter(p => p.isOpen).reduce((s, p) => s + p.unrealizedPnl, 0), 0
  );
  const totalRealizedPnl = accounts.reduce((sum, acc) => sum + acc.realizedPnl, 0);

  const getPnlColor = (value: number) => value >= 0 ? 'text-green-500' : 'text-red-500';
  const getPnlIcon = (value: number) => value >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Tracker</h2>
          <p className="text-muted-foreground">Real-time portfolio performance, positions, and P&L tracking</p>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Equity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEquity.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open P&L</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-1 ${getPnlColor(totalOpenPnl)}`}>
              {getPnlIcon(totalOpenPnl)}
              ${totalOpenPnl.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Realized P&L</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-1 ${getPnlColor(totalRealizedPnl)}`}>
              {getPnlIcon(totalRealizedPnl)}
              ${totalRealizedPnl.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accounts.reduce((sum, acc) => sum + acc.positions.filter(p => p.isOpen).length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedAccount.id} onValueChange={(v) => setSelectedAccount(accounts.find(a => a.id === v) || accounts[0])}>
        <TabsList className="grid grid-cols-2 lg:grid-cols-4">
          {accounts.map((acc) => (
            <TabsTrigger key={acc.id} value={acc.id} className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {acc.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {accounts.map((account) => (
          <TabsContent key={account.id} value={account.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {account.name}
                      <Badge variant="outline">{account.accountType}</Badge>
                    </CardTitle>
                    <CardDescription>{account.currency} · Balance: ${account.currentBalance.toLocaleString()}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Deposits: ${account.totalDeposits.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Withdrawals: ${account.totalWithdrawals.toLocaleString()}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Instrument</th>
                        <th className="text-center py-2 px-2">Direction</th>
                        <th className="text-right py-2 px-2">Qty</th>
                        <th className="text-right py-2 px-2">Entry</th>
                        <th className="text-right py-2 px-2">Current</th>
                        <th className="text-right py-2 px-2">Unrealized P&L</th>
                        <th className="text-right py-2 px-2">P&L %</th>
                        <th className="text-right py-2 px-2">Leverage</th>
                        <th className="text-right py-2 px-2">Liq. Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {account.positions.filter(p => p.isOpen).map((pos) => (
                        <tr key={pos.id} className="border-b border-muted/30 hover:bg-muted/20">
                          <td className="py-3 px-2 font-medium">{pos.instrument}</td>
                          <td className="py-3 px-2 text-center">
                            <Badge variant={pos.direction === 'long' ? 'default' : 'secondary'} className="text-xs">
                              {pos.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
                            </Badge>
                          </td>
                          <td className="text-right py-3 px-2">{pos.quantity}</td>
                          <td className="text-right py-3 px-2">${pos.entryPrice.toLocaleString()}</td>
                          <td className="text-right py-3 px-2">${pos.currentPrice.toLocaleString()}</td>
                          <td className={`text-right py-3 px-2 font-semibold ${getPnlColor(pos.unrealizedPnl)}`}>
                            ${pos.unrealizedPnl.toLocaleString()}
                          </td>
                          <td className={`text-right py-3 px-2 ${getPnlColor(pos.unrealizedPnlPercent)}`}>
                            {pos.unrealizedPnlPercent >= 0 ? '+' : ''}{pos.unrealizedPnlPercent.toFixed(2)}%
                          </td>
                          <td className="text-right py-3 px-2">{pos.leverage}x</td>
                          <td className="text-right py-3 px-2 text-orange-500">${pos.liquidationPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                      {account.positions.filter(p => p.isOpen).length === 0 && (
                        <tr>
                          <td colSpan={9} className="text-center py-8 text-muted-foreground">No open positions</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Portfolio Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.map((account) => {
              const totalPositionValue = account.positions
                .filter(p => p.isOpen)
                .reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);
              return (
                <div key={account.id} className="p-4 rounded-lg bg-muted/20">
                  <h4 className="font-semibold mb-2">{account.name}</h4>
                  <div className="space-y-1 text-sm">
                    {account.positions.filter(p => p.isOpen).map((pos) => {
                      const pctOfAccount = totalPositionValue > 0 
                        ? ((pos.currentPrice * pos.quantity) / totalPositionValue * 100) 
                        : 0;
                      return (
                        <div key={pos.id} className="flex items-center justify-between">
                          <span>{pos.instrument}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded h-2">
                              <div 
                                className={`h-full rounded ${pos.unrealizedPnl >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(Math.abs(pctOfAccount), 100)}%` }}
                              />
                            </div>
                            <span className="text-xs w-12 text-right">{pctOfAccount.toFixed(0)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPortfolioView;