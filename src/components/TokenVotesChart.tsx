import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface TokenVotesChartProps {
  upvotes: number;
  downvotes: number;
}

export default function TokenVotesChart({ upvotes, downvotes }: TokenVotesChartProps) {
  const prepareChartData = () => {
    return [
      { name: 'Upvotes', votes: upvotes, color: '#4ade80' },
      { name: 'Downvotes', votes: downvotes, color: '#f87171' }
    ];
  };

  const calculateSentiment = () => {
    if (upvotes === 0 && downvotes === 0) {
      return { ratio: 0, text: 'No votes yet' };
    }
    
    const total = upvotes + downvotes;
    const ratio = total === 0 ? 0 : upvotes / total;
    
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
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <ThumbsUp className="h-5 w-5 mr-2 text-risk-low" />
                <span className="font-medium">{upvotes}</span>
              </div>
              <div className="flex items-center">
                <ThumbsDown className="h-5 w-5 mr-2 text-risk-high" />
                <span className="font-medium">{downvotes}</span>
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
      </CardContent>
    </Card>
  );
}
