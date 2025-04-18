
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchPriceHistory, fetchLiquidityHistory, fetchHolderHistory } from "@/services/mockDataService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TimeSeriesDataPoint } from "@/types/token";
import { Loader2 } from "lucide-react";

interface TokenPriceChartProps {
  mint: string;
}

export default function TokenPriceChart({ mint }: TokenPriceChartProps) {
  const [priceData, setPriceData] = useState<TimeSeriesDataPoint[]>([]);
  const [liquidityData, setLiquidityData] = useState<TimeSeriesDataPoint[]>([]);
  const [holderData, setHolderData] = useState<TimeSeriesDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("price");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const price = await fetchPriceHistory(mint);
        setPriceData(price.data);
        
        const liquidity = await fetchLiquidityHistory(mint);
        setLiquidityData(liquidity.data);
        
        const holders = await fetchHolderHistory(mint);
        setHolderData(holders.data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [mint]);

  // Format date for the chart tooltip
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Format value based on the active data type
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

  // Custom tooltip component
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

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "price":
        return priceData;
      case "liquidity":
        return liquidityData;
      case "holders":
        return holderData;
      default:
        return [];
    }
  };

  // Get color based on active tab
  const getChartColor = () => {
    switch (activeTab) {
      case "price":
        return "#60a5fa"; // chart-price
      case "liquidity":
        return "#8b5cf6"; // chart-liquidity
      case "holders":
        return "#f97316"; // chart-holders
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
        {loading ? (
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
