
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchAllTokens } from "@/services/mockDataService";
import { TokenSummary } from "@/types/token";
import TokenSearchBar from "./TokenSearchBar";
import TokenRiskScore from "./TokenRiskScore";
import { Shield, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  const [tokens, setTokens] = useState<TokenSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const data = await fetchAllTokens();
        setTokens(data);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  // Navigate to token details page
  const viewToken = (mint: string) => {
    navigate(`/token/${mint}`);
  };

  // Get high risk tokens
  const getHighRiskTokens = () => {
    return tokens
      .filter(token => token.riskLevel.level === 'high' || token.riskLevel.level === 'critical')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col items-center text-center mb-8 space-y-4">
        <Shield className="h-12 w-12 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold">Token Risk Beacon</h1>
        <p className="text-muted-foreground max-w-2xl">
          Monitor and assess cryptocurrency tokens for potential risks. Get real-time alerts, analytics, and community insights.
        </p>
        <div className="w-full max-w-md mt-4">
          <TokenSearchBar />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-pulse space-y-4 w-full max-w-4xl">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      ) : (
        <>
          {/* High Risk Tokens Section */}
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-risk-high mr-2" />
              <h2 className="text-xl font-bold">High Risk Tokens</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getHighRiskTokens().map((token) => (
                <Card key={token.mint} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{token.symbol}</CardTitle>
                        <CardDescription className="line-clamp-1">{token.name}</CardDescription>
                      </div>
                      <TokenRiskScore riskLevel={token.riskLevel} />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">${token.price.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Liquidity:</span>
                        <span className="font-medium">${token.totalMarketLiquidity.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Holders:</span>
                        <span className="font-medium">{token.totalHolders.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline" onClick={() => viewToken(token.mint)}>
                      View Analysis
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* All Tracked Tokens */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-bold">All Tracked Tokens</h2>
              </div>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Token</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Market Cap</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Holders</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Risk Level</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((token, index) => (
                      <>
                        <tr key={token.mint} className="hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium">{token.name}</div>
                              <div className="text-sm text-muted-foreground">{token.symbol}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">${token.price.toFixed(6)}</td>
                          <td className="px-4 py-3 text-right">
                            ${(token.marketCap / 1_000_000).toFixed(2)}M
                          </td>
                          <td className="px-4 py-3 text-right">{token.totalHolders.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              <TokenRiskScore riskLevel={token.riskLevel} />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm" onClick={() => viewToken(token.mint)}>
                              Details
                            </Button>
                          </td>
                        </tr>
                        {index < tokens.length - 1 && (
                          <tr>
                            <td colSpan={6} className="px-0 py-0">
                              <Separator />
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
