import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTopHolders } from "@/services/apiService";
import { TopHolder } from "@/types/token";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Loader2, AlertTriangle } from "lucide-react";

interface TopHoldersChartProps {
    mint: string;
}

export default function TopHoldersChart({ mint }: TopHoldersChartProps) {
    const {
        data: topHoldersResponse,
        isLoading,
        isError,
        error,
    } = useTopHolders(mint);

    const prepareChartData = () => {
        const topHolders = topHoldersResponse;

        if (!Array.isArray(topHolders)) {
            console.warn("topHolders data is not an array:", topHolders);
            return [];
        }

        const displayCount = 5;
        const displayHolders = topHolders.slice(0, displayCount);
        const othersPercentage = topHolders
            .slice(displayCount)
            .reduce((sum, holder) => sum + (holder?.pct ?? 0), 0);

        const chartData = displayHolders
            .filter((holder) => holder && typeof holder.pct === "number")
            .map((holder) => ({
                name: holder.insider
                    ? `Insider (${holder.address.substring(0, 4)}...${holder.address.substring(holder.address.length - 4)})`
                    : `Wallet (${holder.address.substring(0, 4)}...${holder.address.substring(holder.address.length - 4)})`,
                value: holder.pct,
                insider: holder.insider,
                fullAddress: holder.address,
            }));

        if (othersPercentage > 0.01) {
            chartData.push({
                name: `Others (${topHolders.length - displayCount} wallets)`,
                value: othersPercentage,
                insider: false,
                fullAddress: `${topHolders.length - displayCount} other holders`,
            });
        }

        return chartData;
    };

    const COLORS = [
        "#3B82F6",
        "#8B5CF6",
        "#EC4899",
        "#F97316",
        "#10B981",
        "#6B7280",
    ];
    const INSIDER_COLOR = "#EF4444";

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-card border border-border p-3 rounded-md shadow-lg max-w-xs break-words text-card-foreground">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                        {data.fullAddress}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                        {data.value?.toFixed(2)}% of Supply
                    </p>
                    {data.insider && (
                        <div className="flex items-center mt-2 text-red-500 text-xs font-medium">
                            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                            Insider Wallet
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    const renderChartContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            );
        }

        if (isError) {
            console.error("Failed to load top holders:", error);
            return (
                <div className="flex flex-col items-center justify-center h-64 text-destructive">
                    <AlertTriangle className="h-8 w-8 mb-2" />
                    <p className="text-center px-4">
                        Failed to load holder data.
                    </p>
                </div>
            );
        }

        const chartData = prepareChartData();

        if (chartData.length === 0) {
            const message =
                Array.isArray(topHoldersResponse) &&
                topHoldersResponse.length === 0
                    ? "This token currently has no holders."
                    : "Holder data not available or is empty.";
            return (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p>{message}</p>
                </div>
            );
        }

        return (
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius="80%"
                            innerRadius="40%"
                            fill="#8884d8"
                            dataKey="value"
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.insider
                                            ? INSIDER_COLOR
                                            : COLORS[index % COLORS.length]
                                    }
                                    opacity={1}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const calculateConcentrationRisk = () => {
        const topHolders = topHoldersResponse;

        if (!Array.isArray(topHolders) || topHolders.length < 3) return null;

        const top3Percentage = topHolders
            .slice(0, 3)
            .reduce((sum, holder) => sum + (holder?.pct ?? 0), 0);

        const highRiskThreshold = 50;
        const mediumRiskThreshold = 30;

        if (top3Percentage > highRiskThreshold) {
            return (
                <div className="mt-4 p-3 bg-red-500/10 rounded-md border border-red-500/30">
                    <div className="flex items-center text-red-600 font-semibold text-sm">
                        <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                        High Concentration Risk
                    </div>
                    <p className="text-xs text-red-700/90 mt-1 pl-6">
                        Top 3 holders control {top3Percentage.toFixed(1)}% of
                        supply.
                    </p>
                </div>
            );
        } else if (top3Percentage > mediumRiskThreshold) {
            return (
                <div className="mt-4 p-3 bg-amber-500/10 rounded-md border border-amber-500/30">
                    <div className="flex items-center text-amber-600 font-semibold text-sm">
                        <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                        Moderate Concentration Risk
                    </div>
                    <p className="text-xs text-amber-700/90 mt-1 pl-6">
                        Top 3 holders control {top3Percentage.toFixed(1)}% of
                        supply.
                    </p>
                </div>
            );
        }

        return null;
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">
                    Top Token Holders Distribution
                </CardTitle>
            </CardHeader>
            <CardContent>
                {renderChartContent()}
                {!isLoading && !isError && calculateConcentrationRisk()}
            </CardContent>
        </Card>
    );
}
