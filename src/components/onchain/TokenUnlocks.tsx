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

interface TokenUnlock {
  token: string;
  amount: number;
  amountUsd: number;
  supplyPercentage: number;
  unlockType: "cliff" | "linear" | "monthly";
  unlockDate: string;
}

const fetchTokenUnlocks = async (): Promise<TokenUnlock[]> => {
  return [
    {
      token: "ETH",
      amount: 1000,
      amountUsd: 3000000,
      supplyPercentage: 0.01,
      unlockType: "cliff",
      unlockDate: "2026-12-01",
    },
    {
      token: "BTC",
      amount: 5000,
      amountUsd: 15000000,
      supplyPercentage: 0.02,
      unlockType: "linear",
      unlockDate: "2026-12-01 - Linear",
    },
    {
      token: "SOL",
      amount: 20000,
      amountUsd: 60000000,
      supplyPercentage: 0.03,
      unlockType: "monthly",
      unlockDate: "2026-12-01, 2027-01-01, 2027-02-01",
    },
  ];
};

const formatUnlockType = (unlockType: TokenUnlock["unlockType"]) => {
  return unlockType.charAt(0).toUpperCase() + unlockType.slice(1);
};

const TokenUnlocks = () => {
  const [refresh, setRefresh] = React.useState(0);
  const [refreshProgress, setRefreshProgress] = React.useState(0);

  const { data: unlocks = [], isLoading, isError } = useQuery({
    queryKey: ["tokenUnlocks", refresh],
    queryFn: fetchTokenUnlocks,
    refetchInterval: 30000,
    staleTime: 30000,
  });

  const handleRefresh = () => {
    setRefresh((value) => value + 1);
    setRefreshProgress(0);

    window.setTimeout(() => {
      setRefreshProgress(100);
    }, 250);
  };

  if (isError) {
    return (
      <Card className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <Badge variant="outline" className="mr-3">
          Error
        </Badge>
        Failed to load token unlocks
      </Card>
    );
  }

  return (
    <Card className="glass-card rounded-lg p-4">
      <CardHeader className="mb-4 flex flex-row items-center justify-between space-y-0 p-0">
        <div>
          <CardTitle>Token Unlocks</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upcoming token unlock schedule and vesting events
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          Refresh
        </Button>
      </CardHeader>
      <Progress value={refreshProgress} className="mb-4" />
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left text-sm">
            <thead className="sticky top-0 border-b bg-background">
              <tr>
                <th className="px-3 py-2 font-medium text-foreground">Token</th>
                <th className="px-3 py-2 font-medium text-foreground">Amount</th>
                <th className="px-3 py-2 font-medium text-foreground">USD Value</th>
                <th className="px-3 py-2 font-medium text-foreground">Supply %</th>
                <th className="px-3 py-2 font-medium text-foreground">Unlock Type</th>
                <th className="px-3 py-2 font-medium text-foreground">Unlock Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {unlocks.map((unlock) => (
                <tr
                  key={`${unlock.token}-${unlock.unlockDate}`}
                  className="bg-background transition-colors hover:bg-muted/50"
                >
                  <td className="px-3 py-2 font-medium text-foreground">
                    {unlock.token}
                  </td>
                  <td className="px-3 py-2 text-right text-xl font-bold text-indigo-500">
                    ${unlock.amount.toLocaleString()} {unlock.token}
                  </td>
                  <td className="px-3 py-2 text-right text-foreground">
                    ${unlock.amountUsd.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-foreground">
                    {(unlock.supplyPercentage * 100).toFixed(2)}%
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline">{formatUnlockType(unlock.unlockType)}</Badge>
                  </td>
                  <td className="px-3 py-2 text-foreground">
                    {unlock.unlockType === "monthly" ? (
                      <div className="flex flex-col gap-1">
                        {unlock.unlockDate.split(", ").map((date) => (
                          <span key={date} className="text-xs">
                            {date}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs">{unlock.unlockDate}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenUnlocks;
