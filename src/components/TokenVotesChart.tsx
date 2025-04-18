
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTokenVotes } from "@/services/mockDataService";
import { TokenVotes } from "@/types/token";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2, ThumbsUp, ThumbsDown } from "lucide-react";

interface TokenVotesChartProps {
  mint: string;
}

export default function TokenVotesChart({ mint }: TokenVotesChartProps) {
  const [votes, setVotes] = useState<TokenVotes | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const votesData = await fetchTokenVotes(mint);
        setVotes(votesData);
      } catch (error) {
        console.error("Error fetching votes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [mint]);

  // Prepare chart data
  const prepareChartData = () => {
    if (!votes) return [];
    
    return [
      { name: 'Upvotes', votes: votes.up, color: '#4ade80' },
      { name: 'Downvotes', votes: votes.down, color: '#f87171' }
    ];
  };

  // Calculate sentiment ratio
  const calculateSentiment = () => {
    if (!votes || (votes.up === 0 && votes.down === 0)) {
      return { ratio: 0, text: 'No votes yet' };
    }
    
    const total = votes.up + votes.down;
    const ratio = votes.up / total;
    
    if (ratio >= 0.8) {
      return { ratio, text: 'Very Positive' };
    } else if (ratio >= 0.6) {
      return { ratio, text: 'Positive' };
    } else if (ratio >= 0.4) {
      return { ratio, text: 'Neutral' };
    } else if (ratio >= 0.2) {
      return { ratio, text: 'Negative' };
    } else {
      return { ratio, text: 'Very Negative' };
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-md shadow-md">
          <p className="text-sm font-medium">{payload[0].payload.name}</p>
          <p className="text-sm">{payload[0].value} votes</p>
        </div>
      );
    }
    return null;
  };

  const sentiment = calculateSentiment();
  const chartData = prepareChartData();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Community Sentiment</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <ThumbsUp className="h-5 w-5 mr-2 text-risk-low" />
                  <span className="font-medium">{votes?.up || 0}</span>
                </div>
                <div className="flex items-center">
                  <ThumbsDown className="h-5 w-5 mr-2 text-risk-high" />
                  <span className="font-medium">{votes?.down || 0}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Sentiment</div>
                <div className="text-lg font-semibold">{sentiment.text}</div>
                <div className="text-xs text-muted-foreground">
                  {(sentiment.ratio * 100).toFixed(1)}% positive
                </div>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="votes" fill="#8884d8">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
