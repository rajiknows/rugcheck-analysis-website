
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTokenReport } from "@/services/mockDataService";
import { TopHolder } from "@/types/token";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Loader2, AlertTriangle } from "lucide-react";

interface TopHoldersChartProps {
  mint: string;
}

export default function TopHoldersChart({ mint }: TopHoldersChartProps) {
  const [topHolders, setTopHolders] = useState<TopHolder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const report = await fetchTokenReport(mint);
        setTopHolders(report.topHolders);
      } catch (err) {
        setError("Failed to load top holders data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mint]);

  // Prepare data for pie chart
  const prepareChartData = () => {
    // Display top 5 holders, group the rest as "Others"
    const displayHolders = topHolders.slice(0, 5);
    
    // Calculate the sum of remaining holders
    const othersPercentage = topHolders
      .slice(5)
      .reduce((sum, holder) => sum + holder.pct, 0);
    
    const chartData = displayHolders.map((holder) => ({
      name: holder.insider 
        ? `${holder.address} (Insider)` 
        : holder.address,
      value: holder.pct,
      insider: holder.insider
    }));
    
    // Add "Others" if there are more than 5 holders
    if (othersPercentage > 0) {
      chartData.push({
        name: "Others",
        value: othersPercentage,
        insider: false
      });
    }
    
    return chartData;
  };

  // Pie chart colors
  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#10B981', '#6B7280'];
  
  // Insider highlight color
  const INSIDER_COLOR = '#EF4444';

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border p-2 rounded-md shadow-md">
          <p className="text-xs font-medium">{data.name}</p>
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

  // Render chart content
  const renderChartContent = () => {
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

    const chartData = prepareChartData();
    
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
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
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

  // Check for concentration risk
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
        {!loading && !error && calculateConcentrationRisk()}
      </CardContent>
    </Card>
  );
}
