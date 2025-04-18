import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTokenSummary } from "@/services/apiService";
import { TokenSummary } from "@/types/token";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Bell, Share2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TokenMetricsCard from "@/components/TokenMetricsCard";
import TokenPriceChart from "@/components/TokenPriceChart";
import TopHoldersChart from "@/components/TopHoldersChart";
import TokenLiquidityInfo from "@/components/TokenLiquidityInfo";
import TokenVotesChart from "@/components/TokenVotesChart";
import CreateAlertDialog from "@/components/alerts/CreateAlertDialog";

export default function TokenDetail() {
  const { mint } = useParams<{ mint: string }>();
  const navigate = useNavigate();

  const { 
    data: token,
    isLoading,
    isError,
    error
  } = useQuery<TokenSummary, Error>({
    queryKey: ['tokenSummary', mint],
    queryFn: () => fetchTokenSummary(mint!),
    enabled: !!mint,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1
  });
  
  const goBack = () => {
    navigate('/');
  };
  
  const shareToken = () => {
    if (!token) return;
    alert(`Sharing ${token.name} (${token.symbol}) analysis`);
  };
  
  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Loading token data...</p>
        </div>
      </div>
    );
  }
  
  if (isError || !token) {
    return (
      <div className="container py-12">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error?.message || "Token not found or failed to load."}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={goBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={goBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <CreateAlertDialog 
            tokenSymbol={token.symbol}
            tokenName={token.name}
            currentPrice={token.price}
          />
          <Button variant="outline" size="sm" onClick={shareToken}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Token Address: <span className="font-mono">{token.mint}</span>
        </p>
      </div>
      
      <div className="mb-8">
        <TokenMetricsCard token={token} />
      </div>
      
      <div>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="holders">Holders</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <TokenPriceChart mint={token.mint} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TopHoldersChart mint={token.mint} />
              <TokenLiquidityInfo mint={token.mint} />
            </div>
          </TabsContent>
          
          <TabsContent value="holders" className="space-y-6">
            <TopHoldersChart mint={token.mint} />
            {/* Additional holders analysis components would go here */}
          </TabsContent>
          
          <TabsContent value="liquidity" className="space-y-6">
            <TokenLiquidityInfo mint={token.mint} />
            {/* Additional liquidity analysis components would go here */}
          </TabsContent>
          
          <TabsContent value="community" className="space-y-6">
            <TokenVotesChart 
              upvotes={token.upvotes ?? 0} 
              downvotes={token.downvotes ?? 0}
            />
            {/* Additional community analysis components would go here */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
