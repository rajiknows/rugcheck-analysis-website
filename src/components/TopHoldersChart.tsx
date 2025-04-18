import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetchTopHolders } from "@/services/apiService";
import { TopHolder } from "@/types/token";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Loader2, AlertTriangle } from "lucide-react";

interface TopHoldersChartProps {
  mint: string;
}

export default function TopHoldersChart({ mint }: TopHoldersChartProps) {
  const { 
    data: topHolders = [],
    isLoading, 
    isError, 
    error 
  } = useQuery<TopHolder[], Error>({
    queryKey: ['topHolders', mint],
    queryFn: () => fetchTopHolders(mint),
    enabled: !!mint,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1
  });

  const prepareChartData = () => {
    const displayHolders = topHolders.slice(0, 5);
    const othersPercentage = topHolders
      .slice(5)
      .reduce((sum, holder) => sum + holder.pct, 0);
    const chartData = displayHolders.map((holder) => ({
      name: holder.insider 
        ? `${holder.address.substring(0,6)}... (Insider)`
        : holder.address.substring(0,6) + '...',
      value: holder.pct,
      insider: holder.insider,
      fullAddress: holder.address
    }));
    
    if (othersPercentage > 0) {
      chartData.push({
        name: "Others",
        value: othersPercentage,
        insider: false,
        fullAddress: "Multiple Holders"
      });
    }
    
    return chartData;
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#10B981', '#6B7280'];
  const INSIDER_COLOR = '#EF4444';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border p-2 rounded-md shadow-md max-w-xs break-words">
          <p className="text-xs font-medium">{data.fullAddress}</p>
          <p className="text-sm font-medium">{data.value.toFixed(2)}%</p>
          {data.insider && (
            <div className="flex items-center mt-1 text-risk-high text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Insider wallet
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
      return (
        <div className="flex flex-col items-center justify-center h-64 text-destructive">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p>{error?.message || "Failed to load holders data"}</p>
        </div>
      );
    }

    const chartData = prepareChartData();
    
    if (chartData.length === 0) {
       return (
         <div className="flex items-center justify-center h-64 text-muted-foreground">
           <p>No holder data available.</p>
         </div>
       );
    }
    
    return (
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.insider ? INSIDER_COLOR : COLORS[index % COLORS.length]} 
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
    if (topHolders.length === 0) return null;
    
    const top3Percentage = topHolders
      .slice(0, 3)
      .reduce((sum, holder) => sum + holder.pct, 0);
    
    if (top3Percentage > 60) {
      return (
        <div className="mt-4 p-2 bg-muted rounded-md border border-risk-high">
          <div className="flex items-center text-risk-high font-medium">
            <AlertTriangle className="h-4 w-4 mr-2" />
            High Concentration Risk
          </div>
          <p className="text-sm mt-1">
            Top 3 holders control {top3Percentage.toFixed(1)}% of the supply, suggesting high concentration risk.
          </p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Top Token Holders</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChartContent()}
        {!isLoading && !isError && calculateConcentrationRisk()}
      </CardContent>
    </Card>
  );
}
