
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, ArrowUpRight, ArrowDownRight, Users, DollarSign } from "lucide-react";
import { TokenSummary } from "@/types/token";
import TokenRiskScore from "./TokenRiskScore";

interface TokenMetricsCardProps {
  token: TokenSummary;
}

export default function TokenMetricsCard({ token }: TokenMetricsCardProps) {
  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  // Generate a mock 24h change percentage
  const getTrendChange = () => {
    // Random value between -15 and +15
    return (Math.random() * 30 - 15).toFixed(2);
  };

  const priceChange = parseFloat(getTrendChange());
  const liquidityChange = parseFloat(getTrendChange());

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Coins className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">{token.name} ({token.symbol})</CardTitle>
        </div>
        <TokenRiskScore riskLevel={token.riskLevel} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Price */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Price</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">${token.price.toFixed(6)}</p>
              <div className={`flex items-center ml-2 ${priceChange >= 0 ? 'text-risk-low' : 'text-risk-high'}`}>
                {priceChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">{Math.abs(priceChange)}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">24h change</p>
          </div>

          {/* Market Cap */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Market Cap</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{formatNumber(token.marketCap)}</p>
            </div>
            <p className="text-xs text-muted-foreground">Fully diluted</p>
          </div>

          {/* Liquidity */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Liquidity</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{formatNumber(token.totalMarketLiquidity)}</p>
              <div className={`flex items-center ml-2 ${liquidityChange >= 0 ? 'text-risk-low' : 'text-risk-high'}`}>
                {liquidityChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">{Math.abs(liquidityChange)}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">24h change</p>
          </div>

          {/* Holders */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Holders</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{token.totalHolders.toLocaleString()}</p>
            </div>
            <p className="text-xs text-muted-foreground">Unique addresses</p>
          </div>
        </div>

        {/* Token Risk Analysis */}
        <div className="mt-6 bg-muted p-4 rounded-md">
          <h3 className="font-medium mb-2">Risk Analysis</h3>
          <TokenRiskScore riskLevel={token.riskLevel} showDetails={true} />
        </div>
      </CardContent>
    </Card>
  );
}
