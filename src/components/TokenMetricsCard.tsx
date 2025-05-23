import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, Loader2, AlertTriangle } from "lucide-react";
import { useTokenSummary } from "@/services/apiService";
import { TokenSummary } from "@/types/token";
import TokenRiskScore from "./TokenRiskScore";

export default function TokenMetricsCard({ mint }: { mint: string }) {
    const {
        data: tokenSummary,
        isLoading,
        isError,
        error,
    } = useTokenSummary(mint);

    const formatNumber = (num: number | undefined | null): string => {
        if (num === undefined || num === null) return "N/A";
        if (Math.abs(num) >= 1_000_000_000)
            return `$${(num / 1_000_000_000).toFixed(2)}B`;
        if (Math.abs(num) >= 1_000_000)
            return `$${(num / 1_000_000).toFixed(2)}M`;
        if (Math.abs(num) >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
        return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatPrice = (price: number | undefined | null): string => {
        if (price === undefined || price === null) return "N/A";
        if (price === 0) return "$0.00";
        if (Math.abs(price) < 0.000001) return `$${price.toExponential(2)}`;
        if (Math.abs(price) < 0.01)
            return `$${price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 })}`;
        return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    };

    const formatInteger = (num: number | undefined | null): string => {
        if (num === undefined || num === null) return "N/A";
        return num.toLocaleString();
    };

    if (isLoading) {
        return (
            <Card className="w-full h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </Card>
        );
    }

    if (isError || !tokenSummary) {
        console.error("Failed to load token summary:", error);
        return (
            <Card className="w-full h-80 flex flex-col items-center justify-center">
                <AlertTriangle className="h-8 w-8 mb-2 text-destructive" />
                <p className="text-destructive text-center px-4">
                    Failed to load token metrics.
                </p>
                {!tokenSummary && !isLoading && (
                    <p className="text-muted-foreground text-sm mt-1">
                        (No data received)
                    </p>
                )}
            </Card>
        );
    }

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between space-x-4 pb-4">
                <div className="flex items-center space-x-3">
                    <Coins className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                        <CardTitle className="text-xl font-bold">
                            {tokenSummary.token_program}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {tokenSummary.token_type || "Unknown Token Type"}
                        </p>
                    </div>
                </div>
                {tokenSummary.risks && tokenSummary.risks.length > 0 && (
                    <TokenRiskScore
                        riskLevel={tokenSummary.risks[0]}
                        showDetails
                    />
                )}
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                    {typeof tokenSummary?.score !== "undefined" &&
                        tokenSummary?.score !== null && (
                            <div className="space-y-1 p-3 bg-muted/50 rounded-md">
                                <p className="text-xs font-medium text-muted-foreground flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1.5" />{" "}
                                    Score
                                </p>
                                <p className="text-lg font-semibold">
                                    {tokenSummary.score.toLocaleString(
                                        undefined,
                                        { maximumFractionDigits: 2 },
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Normalized: {tokenSummary.score_normalised}
                                </p>
                            </div>
                        )}

                    {typeof tokenSummary?.upvotes !== "undefined" &&
                        tokenSummary?.upvotes !== null && (
                            <div className="space-y-1 p-3 bg-muted/50 rounded-md">
                                <p className="text-xs font-medium text-muted-foreground flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1.5" />{" "}
                                    Upvotes
                                </p>
                                <p className="text-lg font-semibold">
                                    {formatInteger(tokenSummary.upvotes)}
                                </p>
                            </div>
                        )}

                    {typeof tokenSummary?.downvotes !== "undefined" &&
                        tokenSummary?.downvotes !== null && (
                            <div className="space-y-1 p-3 bg-muted/50 rounded-md">
                                <p className="text-xs font-medium text-muted-foreground flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1.5" />{" "}
                                    Downvotes
                                </p>
                                <p className="text-lg font-semibold">
                                    {formatInteger(tokenSummary.downvotes)}
                                </p>
                            </div>
                        )}

                    {typeof tokenSummary?.score === "undefined" &&
                        typeof tokenSummary?.upvotes === "undefined" &&
                        typeof tokenSummary?.downvotes === "undefined" && (
                            <div className="sm:col-span-2 text-center text-muted-foreground p-4">
                                Basic summary information available. Detailed
                                metrics might be elsewhere.
                            </div>
                        )}
                </div>

                {tokenSummary?.risks && tokenSummary.risks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                        <h3 className="text-base font-semibold mb-3">
                            Risk Analysis
                        </h3>
                        {tokenSummary.risks.map((risk, idx) => (
                            <TokenRiskScore
                                key={idx}
                                riskLevel={risk}
                                showDetails
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
