import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLiquidityLockInfo } from "@/services/apiService";
import { Loader2, AlertTriangle, LockIcon, UnlockIcon } from "lucide-react";

interface TokenLiquidityInfoProps {
    mint: string;
}

export default function TokenLiquidityInfo({ mint }: TokenLiquidityInfoProps) {
    const {
        data: lockInfo,
        isLoading,
        isError,
        error,
    } = useLiquidityLockInfo(mint);

    const formatUnlockDate = (timestamp: string | null): string => {
        if (!timestamp || timestamp === "0") return "Never / Not Locked";
        try {
            const date = new Date(parseInt(timestamp, 10) * 1000); // Assuming Unix timestamp in seconds
            if (isNaN(date.getTime())) {
                console.warn("Received invalid timestamp:", timestamp);
                return "Invalid Date";
            }
            if (date.getFullYear() > 2200) {
                return "Effectively Never";
            }
            return date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch (e) {
            console.error("Error formatting timestamp:", timestamp, e);
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
            console.error("Liquidity Lock API Error:", error);
            return (
                <div className="flex flex-col items-center justify-center h-40 text-destructive">
                    <AlertTriangle className="h-8 w-8 mb-2" />
                    <p className="text-center text-sm">
                        Failed to load liquidity lock data.
                    </p>
                </div>
            );
        }

        if (!lockInfo) {
            return (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                    <p>
                        Liquidity lock information not available for this token.
                    </p>
                </div>
            );
        }

        const isLocked =
            lockInfo.unlockDate !== null &&
            lockInfo.unlockDate !== "0" &&
            lockInfo.lockedAmount > 0;
        const unlockDateFormatted = formatUnlockDate(lockInfo.unlockDate);
        const lockedPercentage = lockInfo.lplocked_pct;

        return (
            <div className="space-y-3">
                <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                    <span className="text-sm font-medium text-muted-foreground">
                        Locked Value (USD)
                    </span>
                    <span className="text-sm font-semibold">
                        {lockInfo.usdc_locked !== undefined &&
                        lockInfo.usdc_locked !== null
                            ? `$${lockInfo.usdc_locked.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                            : "N/A"}
                    </span>
                </div>
                {typeof lockedPercentage === "number" && (
                    <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                        <span className="text-sm font-medium text-muted-foreground">
                            LP Locked (%)
                        </span>
                        <span className="text-sm font-semibold">
                            {lockedPercentage.toLocaleString(undefined, {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 2,
                            })}
                            %
                        </span>
                    </div>
                )}
                <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center">
                        {isLocked ? (
                            <LockIcon className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                            <UnlockIcon className="h-4 w-4 mr-2 text-amber-500" />
                        )}
                        <span className="text-sm font-medium text-muted-foreground">
                            Status
                        </span>
                    </div>
                    <div className="text-right">
                        <span
                            className={`text-sm font-semibold ${isLocked ? "text-green-600" : "text-amber-600"}`}
                        >
                            {isLocked ? "Locked" : "Not Locked"}
                        </span>
                        {isLocked && (
                            <>
                                <span className="text-xs text-muted-foreground block mt-1">
                                    Unlocks On
                                </span>
                                <span className="text-sm">
                                    {unlockDateFormatted}
                                </span>
                            </>
                        )}
                        {!isLocked && lockInfo.usdc_locked === 0 && (
                            <span className="text-xs text-muted-foreground block mt-1">
                                (Or no liquidity found)
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">
                    Liquidity Lock Status
                </CardTitle>
            </CardHeader>
            <CardContent>{renderContent()}</CardContent>
        </Card>
    );
}
