import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetchLiquidityLockInfo, LiquidityLockInfo } from "@/services/apiService";
import { Loader2, AlertTriangle, LockIcon, UnlockIcon } from "lucide-react";

interface TokenLiquidityInfoProps {
  mint: string;
}

export default function TokenLiquidityInfo({ mint }: TokenLiquidityInfoProps) {
  const { 
    data: lockInfo, 
    isLoading, 
    isError, 
    error 
  } = useQuery<LiquidityLockInfo, Error>({
    queryKey: ['liquidityLockInfo', mint],
    queryFn: () => fetchLiquidityLockInfo(mint),
    enabled: !!mint,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1
  });

  const formatUnlockDate = (isoDateString: string | null) => {
    if (!isoDateString) return "N/A";
    try {
      const date = new Date(isoDateString);
      if (isNaN(date.getTime())) {
          return "Invalid Date";
      }
      return date.toLocaleDateString();
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-40"> 
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-destructive"> 
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p>{error?.message || "Failed to load liquidity data"}</p>
        </div>
      );
    }

    if (!lockInfo || typeof lockInfo.lockedAmount === 'undefined' || typeof lockInfo.unlockDate === 'undefined') {
        console.log("Liquidity Lock Info received invalid data:", lockInfo);
        return (
           <div className="flex items-center justify-center h-40 text-muted-foreground"> 
               <p>Liquidity lock information not available or in unexpected format.</p>
           </div>
        );
    }

    const isLocked = lockInfo.unlockDate !== null; 
    const unlockDateFormatted = formatUnlockDate(lockInfo.unlockDate);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-muted p-3 rounded-md">
          <span className="text-sm font-medium">Total Locked Amount</span>
          <span className="text-sm">
            {lockInfo.lockedAmount !== null 
              ? `$${lockInfo.lockedAmount.toLocaleString()}` 
              : 'N/A'}
          </span>
        </div>

        <div className="flex justify-between items-center bg-muted p-3 rounded-md">
          <div className="flex items-center">
            {isLocked ? (
              <LockIcon className="h-4 w-4 mr-2 text-risk-low" /> 
            ) : (
              <UnlockIcon className="h-4 w-4 mr-2 text-muted-foreground" /> 
            )}
            <span className="text-sm font-medium">
              {isLocked ? 'Locked' : 'Not Locked / Info Unavailable'}
            </span>
          </div>
          {isLocked && (
            <div className="text-right">
                <span className="text-xs text-muted-foreground block">Unlocks On</span>
                <span className="text-sm">{unlockDateFormatted}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Liquidity Lock Summary</CardTitle> 
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
