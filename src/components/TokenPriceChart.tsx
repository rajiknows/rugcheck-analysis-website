import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    usePriceHistory,
    useLiquidityHistory,
    useHolderHistory,
} from "@/services/apiService";
import {
    PriceHistory,
    LiquidityHistory,
    HolderHistory,
    TimeSeriesDataPoint,
} from "@/types/token";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

interface TokenPriceChartProps {
    mint: string;
}

export default function TokenPriceChart({ mint }: TokenPriceChartProps) {
    const [activeTab, setActiveTab] = useState<string>("price");

    const { data: priceHistoryResponse, isLoading: isLoadingPrice } =
        usePriceHistory(mint);
    const { data: liquidityHistoryResponse, isLoading: isLoadingLiquidity } =
        useLiquidityHistory(mint);
    const { data: holderHistoryResponse, isLoading: isLoadingHolders } =
        useHolderHistory(mint);

    const isLoading = isLoadingPrice || isLoadingLiquidity || isLoadingHolders;

    const formatDate = (timestamp: string) => {
        if (!timestamp) return "";
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return "Invalid Date";
            return date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch (e) {
            console.error("Error formatting date:", timestamp, e);
            return "Invalid Date";
        }
    };

    const formatValue = (value: number | undefined | null) => {
        if (value === undefined || value === null) return "N/A";

        switch (activeTab) {
            case "price":
                if (value === 0) return "$0.00";
                if (Math.abs(value) < 0.000001) {
                    return `$${value.toExponential(2)}`;
                }
                return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
            case "liquidity":
                return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            case "holders":
                return value.toLocaleString();
            default:
                return value.toString();
        }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload as TimeSeriesDataPoint;
            return (
                <div className="bg-card border border-border p-2 rounded-md shadow-md text-card-foreground">
                    <p className="text-xs font-medium text-muted-foreground">
                        {formatDate(label)}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                        {formatValue(dataPoint?.value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    const getCurrentData = (): TimeSeriesDataPoint[] => {
        switch (activeTab) {
            case "price":
                return priceHistoryResponse?.data ?? [];
            case "liquidity":
                return liquidityHistoryResponse?.data ?? [];
            case "holders":
                return holderHistoryResponse?.data ?? [];
            default:
                return [];
        }
    };

    const getChartColor = () => {
        switch (activeTab) {
            case "price":
                return "#60a5fa";
            case "liquidity":
                return "#8b5cf6";
            case "holders":
                return "#f97316";
            default:
                return "#60a5fa";
        }
    };

    const currentData = getCurrentData();

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">
                    Token Metrics
                </CardTitle>
                <Tabs
                    defaultValue="price"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full mt-2"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="price" disabled={isLoadingPrice}>
                            Price
                        </TabsTrigger>
                        <TabsTrigger
                            value="liquidity"
                            disabled={isLoadingLiquidity}
                        >
                            Liquidity
                        </TabsTrigger>
                        <TabsTrigger
                            value="holders"
                            disabled={isLoadingHolders}
                        >
                            Holders
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : currentData.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No {activeTab} data available for this token.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={currentData}
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                                opacity={0.5}
                            />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={formatDate}
                                stroke="hsl(var(--muted-foreground))"
                                tick={{ fontSize: 10 }}
                                angle={-30}
                                textAnchor="end"
                                height={50}
                                interval="preserveStartEnd"
                                dy={10}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                tick={{ fontSize: 10 }}
                                tickFormatter={formatValue}
                                domain={["auto", "auto"]}
                                width={80}
                                dx={-5}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{
                                    stroke: "hsl(var(--primary))",
                                    strokeWidth: 1,
                                    strokeDasharray: "3 3",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={getChartColor()}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{
                                    r: 5,
                                    strokeWidth: 1,
                                    fill: getChartColor(),
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
