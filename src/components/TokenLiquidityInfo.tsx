
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTokenReport } from "@/services/mockDataService";
import { Market, Locker } from "@/types/token";
import { Loader2, AlertTriangle, LockIcon, UnlockIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TokenLiquidityInfoProps {
  mint: string;
}

export default function TokenLiquidityInfo({ mint }: TokenLiquidityInfoProps) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [lockers, setLockers] = useState<Record<string, Locker>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const report = await fetchTokenReport(mint);
        setMarkets(report.markets);
        setLockers(report.lockers);
      } catch (err) {
        setError("Failed to load liquidity data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mint]);

  // Format date
  const formatUnlockDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  // Calculate days until unlock
  const getDaysUntilUnlock = (timestamp: number) => {
    const now = new Date();
    const unlockDate = new Date(timestamp * 1000);
    const diffTime = unlockDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get color based on lock percentage
  const getLockColor = (percentage: number) => {
    if (percentage >= 80) return "bg-risk-low";
    if (percentage >= 50) return "bg-risk-medium";
    if (percentage >= 20) return "bg-risk-high";
    return "bg-risk-critical";
  };

  // Check for liquidity lock risk
  const calculateLiquidityRisk = () => {
    if (markets.length === 0) return null;
    
    const avgLockPercentage = markets.reduce((sum, market) => sum + market.lp.lpLockedPct, 0) / markets.length;
    
    if (avgLockPercentage < 50) {
      return (
        <div className="mt-4 p-2 bg-muted rounded-md border border-risk-high">
          <div className="flex items-center text-risk-high font-medium">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Low Liquidity Lock
          </div>
          <p className="text-sm mt-1">
            Only {avgLockPercentage.toFixed(1)}% of liquidity is locked, which increases risk of price manipulation.
          </p>
        </div>
      );
    }
    
    return null;
  };

  // Check for upcoming unlocks
  const checkUpcomingUnlocks = () => {
    const lockerEntries = Object.entries(lockers);
    if (lockerEntries.length === 0) return null;
    
    const upcomingUnlocks = lockerEntries.filter(([_, locker]) => {
      const daysToUnlock = getDaysUntilUnlock(locker.unlockDate);
      return daysToUnlock >= 0 && daysToUnlock <= 7;
    });
    
    if (upcomingUnlocks.length > 0) {
      return (
        <div className="mt-4 p-2 bg-muted rounded-md border border-risk-medium">
          <div className="flex items-center text-risk-medium font-medium">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Upcoming Liquidity Unlock
          </div>
          <p className="text-sm mt-1">
            {upcomingUnlocks.length} liquidity lock{upcomingUnlocks.length > 1 ? 's' : ''} will unlock within the next 7 days.
          </p>
        </div>
      );
    }
    
    return null;
  };

  // Render content
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-destructive">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p>{error}</p>
        </div>
      );
    }

    return (
      <div>
        <h3 className="font-medium mb-3">LP Tokens</h3>
        {markets.length > 0 ? (
          <div className="space-y-4">
            {markets.map((market, index) => (
              <div key={index} className="bg-muted p-3 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">Market: {market.pubkey}</div>
                  <div className="text-xs text-muted-foreground">
                    Locked: ${market.lp.lpLocked.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Lock Percentage</span>
                    <span>{market.lp.lpLockedPct.toFixed(2)}%</span>
                  </div>
                  <Progress 
                    value={market.lp.lpLockedPct} 
                    className={getLockColor(market.lp.lpLockedPct)} 
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No market liquidity data available</p>
        )}

        <h3 className="font-medium mt-6 mb-3">Liquidity Locks</h3>
        {Object.keys(lockers).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(lockers).map(([id, locker]) => {
              const daysToUnlock = getDaysUntilUnlock(locker.unlockDate);
              const isUnlocked = daysToUnlock < 0;
              
              return (
                <div key={id} className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium mb-1">
                        {isUnlocked ? (
                          <div className="flex items-center">
                            <UnlockIcon className="h-4 w-4 mr-1 text-risk-high" />
                            <span>Unlocked</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <LockIcon className="h-4 w-4 mr-1 text-risk-low" />
                            <span>Locked</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        USDC Value: ${locker.usdcLocked.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium">
                        {isUnlocked ? "Unlocked on:" : "Unlocks on:"}
                      </div>
                      <div className="text-sm">
                        {formatUnlockDate(locker.unlockDate)}
                      </div>
                      {!isUnlocked && (
                        <div className={`text-xs mt-1 ${daysToUnlock <= 7 ? 'text-risk-high' : 'text-muted-foreground'}`}>
                          {daysToUnlock} days remaining
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No liquidity lock data available</p>
        )}

        {calculateLiquidityRisk()}
        {checkUpcomingUnlocks()}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Liquidity Information</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
