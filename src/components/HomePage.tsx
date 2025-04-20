import { useNavigate } from "react-router-dom";
import TokenSearchBar from "./TokenSearchBar";
import { Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="flex flex-col items-center text-center space-y-4">
        <Shield className="h-12 w-12 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold">Token Risk Beacon</h1>
        <p className="text-muted-foreground max-w-2xl">
          Enter a Solana token address below to analyze its potential risks and view key metrics.
        </p>
        <div className="w-full max-w-md pt-4">
          <TokenSearchBar />
        </div>
      </div>
    </div>
  );
}
