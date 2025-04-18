import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { fetchPriceHistory, fetchLiquidityHistory, fetchHolderHistory } from "@/services/apiService";
import { PriceHistory, LiquidityHistory, HolderHistory, TimeSeriesDataPoint } from "@/types/token";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2 } from "lucide-react";

interface TokenPriceChartProps {
  mint: string;
}

export default function TokenPriceChart({ mint }: TokenPriceChartProps) {
  const [activeTab, setActiveTab] = useState<string>("price");

  const { data: priceHistory, isLoading: isLoadingPrice } = useQuery<PriceHistory, Error>({
    queryKey: ['priceHistory', mint],
    queryFn: () => fetchPriceHistory(mint),
    enabled: !!mint,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: liquidityHistory, isLoading: isLoadingLiquidity } = useQuery<LiquidityHistory, Error>({
    queryKey: ['liquidityHistory', mint],
    queryFn: () => fetchLiquidityHistory(mint),
    enabled: !!mint,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: holderHistory, isLoading: isLoadingHolders } = useQuery<HolderHistory, Error>({
    queryKey: ['holderHistory', mint],
    queryFn: () => fetchHolderHistory(mint),
    enabled: !!mint,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const isLoading = isLoadingPrice || isLoadingLiquidity || isLoadingHolders;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatValue = (value: number) => {
    switch (activeTab) {
      case "price":
        return `$${value.toFixed(6)}`;
      case "liquidity":
        return `$${value.toLocaleString()}`;
      case "holders":
        return value.toLocaleString();
      default:
        return value;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-md shadow-md">
          <p className="text-xs font-medium">{formatDate(label)}</p>
          <p className="text-sm font-medium text-primary">
            {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const getCurrentData = (): TimeSeriesDataPoint[] => {
    switch (activeTab) {
      case "price":
        return priceHistory?.data ?? [];
      case "liquidity":
        return liquidityHistory?.data ?? [];
      case "holders":
        return holderHistory?.data ?? [];
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Token Metrics</CardTitle>
        <Tabs 
          defaultValue="price" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="price">Price</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            <TabsTrigger value="holders">Holders</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={getCurrentData()}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                stroke="#6B7280"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#6B7280" 
                tick={{ fontSize: 12 }}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={getChartColor()}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
