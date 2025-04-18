import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetchLiquidityLockInfo } from "@/services/apiService";
import { LiquidityEvent } from "@/types/token";
import { Loader2, AlertTriangle, LockIcon, UnlockIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TokenLiquidityInfoProps {
  mint: string;
}

export default function TokenLiquidityInfo({ mint }: TokenLiquidityInfoProps) {
  const { 
    data: liquidityEvents = [],
    isLoading, 
    isError, 
    error 
  } = useQuery<LiquidityEvent[], Error>({
    queryKey: ['liquidityLockInfo', mint],
    queryFn: () => fetchLiquidityLockInfo(mint),
    enabled: !!mint,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1
  });

  const formatUnlockDate = (timestamp: number | null) => {
    if (timestamp === null) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  const getDaysUntilUnlock = (timestamp: number | null) => {
    if (timestamp === null) return Infinity;
    const now = new Date();
    const unlockDate = new Date(timestamp * 1000);
    const diffTime = unlockDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getLockColor = (percentage: number | null) => {
    if (percentage === null) return "bg-gray-400";
    if (percentage >= 80) return "bg-risk-low";
    if (percentage >= 50) return "bg-risk-medium";
    if (percentage >= 20) return "bg-risk-high";
    return "bg-risk-critical";
  };

  const calculateLiquidityRisk = () => {
    if (liquidityEvents.length === 0) return null;
    
    const validPercentages = liquidityEvents.map(e => e.lpLockedPct).filter(p => p !== null) as number[];
    if (validPercentages.length === 0) return null;
    const avgLockPercentage = validPercentages.reduce((sum, pct) => sum + pct, 0) / validPercentages.length;
    
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

  const checkUpcomingUnlocks = () => {
    if (liquidityEvents.length === 0) return null;
    
    const upcomingUnlocks = liquidityEvents.filter(event => {
      if (event.unlockDate === null) return false;
      const daysToUnlock = getDaysUntilUnlock(event.unlockDate);
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-destructive">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p>{error?.message || "Failed to load liquidity data"}</p>
        </div>
      );
    }

    if (liquidityEvents.length === 0) {
        return (
           <div className="flex items-center justify-center h-64 text-muted-foreground">
               <p>No liquidity lock information available.</p>
           </div>
        );
    }

    return (
      <div>
        <div className="space-y-4">
          {liquidityEvents.map((event, index) => {
            const daysToUnlock = getDaysUntilUnlock(event.unlockDate);
            const isUnlocked = event.unlockDate === null ? false : daysToUnlock < 0;
            
            return (
              <div key={index} className="bg-muted p-3 rounded-md">
                <div className="text-xs text-muted-foreground mb-2">
                    Market: {event.market_pubkey}
                </div>
                
                <div className="mb-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>LP Lock Percentage</span>
                    <span>{event.lpLockedPct !== null ? `${event.lpLockedPct.toFixed(2)}%` : 'N/A'}</span>
                  </div>
                  <Progress 
                    value={event.lpLockedPct ?? 0}
                    className={getLockColor(event.lpLockedPct)} 
                  />
                </div>

                <div className="flex justify-between items-start mt-2">
                    <div>
                      <div className="text-sm font-medium mb-1">
                        {event.unlockDate === null ? (
                           <div className="flex items-center">
                             <LockIcon className="h-4 w-4 mr-1 text-risk-low" />
                             <span>Permanently Locked (?)</span>
                           </div>
                        ) : isUnlocked ? (
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
                        USDC Locked: {event.usdcLocked !== null ? `$${event.usdcLocked.toLocaleString()}` : 'N/A'}
                      </div>
                    </div>
                    {event.unlockDate !== null && (
                        <div className="text-right">
                          <div className="text-xs font-medium">
                            {isUnlocked ? "Unlocked on:" : "Unlocks on:"}
                          </div>
                          <div className="text-sm">
                            {formatUnlockDate(event.unlockDate)}
                          </div>
                          {!isUnlocked && (
                            <div className={`text-xs mt-1 ${daysToUnlock <= 7 ? 'text-risk-high' : 'text-muted-foreground'}`}>
                              {daysToUnlock} days remaining
                            </div>
                          )}
                        </div>
                    )}
                 </div>
              </div>
            );
          })}
        </div>

        {calculateLiquidityRisk()}
        {checkUpcomingUnlocks()}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Liquidity Lock Information</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
