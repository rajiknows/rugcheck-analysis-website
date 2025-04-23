import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Share2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TokenMetricsCard from "@/components/TokenMetricsCard";
import TokenPriceChart from "@/components/TokenPriceChart";
import TopHoldersChart from "@/components/TopHoldersChart";
import TokenLiquidityInfo from "@/components/TokenLiquidityInfo";
import TokenVotesChart from "@/components/TokenVotesChart";
import CreateAlertDialog from "@/components/alerts/CreateAlertDialog";

// Import our new TanStack Query hooks
import { useTokenSummary } from "@/services/apiService";
import { TokenSummary } from "@/types/token";

export default function TokenDetail() {
    const { mint } = useParams<{ mint: string }>();
    console.log(`[TokenDetail] Received mint parameter: ${mint}`);
    const navigate = useNavigate();

    // Use our new hook instead of direct useQuery
    const {
        data: tokenSummaryResponse,
        isLoading,
        isError,
        error,
    } = useTokenSummary(mint!);
    const token = tokenSummaryResponse; // Access the nested 'data' property

    console.log(
        `[TokenDetail] useQuery state: isLoading=${isLoading}, isError=${isError}, hasData=${!!token}`,
    );

    const goBack = () => {
        navigate("/");
    };

    const shareToken = () => {
        if (token) {
            alert(`Sharing token analysis for ${mint}`);
        } else {
            console.warn(
                "[TokenDetail] shareToken called with invalid token state:",
                token,
            );
        }
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

    if (isError) {
        console.error("[TokenDetail] React Query Error:", error);
        return (
            <div className="container py-12">
                <Alert variant="destructive" className="max-w-2xl mx-auto">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error?.message ||
                            "Failed to load token data due to a query error."}
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

    if (!token) {
        console.error(
            "[TokenDetail] Query successful but token data is missing.",
        );
        return (
            <div className="container py-12">
                <Alert variant="destructive" className="max-w-2xl mx-auto">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Token data is unavailable. Please try again later.
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

    console.log(
        "[TokenDetail] Rendering success state. Token data:",
        JSON.stringify(token, null, 2),
    );

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={goBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div className="flex gap-2">
                    <CreateAlertDialog
                        mint={mint!}
                        tokenSymbol=""
                        tokenName=""
                        currentPrice={token.score}
                    />
                    <Button variant="outline" size="sm" onClick={shareToken}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                </div>
            </div>

            <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                    Token Address: <span className="font-mono">{mint}</span>
                </p>
            </div>

            <div className="mb-8">
                <TokenMetricsCard mint={mint} />
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
                        <TokenPriceChart mint={mint!} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TopHoldersChart mint={mint!} />
                            <TokenLiquidityInfo mint={mint!} />
                        </div>
                    </TabsContent>

                    <TabsContent value="holders" className="space-y-6">
                        <TopHoldersChart mint={mint!} />
                        {/* Additional holders analysis components would go here */}
                    </TabsContent>

                    <TabsContent value="liquidity" className="space-y-6">
                        <TokenLiquidityInfo mint={mint!} />
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
