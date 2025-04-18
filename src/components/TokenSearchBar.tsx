
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";
import { TokenSummary } from "@/types/token";
import { searchTokens } from "@/services/mockDataService";
import { useNavigate } from "react-router-dom";
import TokenRiskScore from "./TokenRiskScore";

export default function TokenSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TokenSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchTokens(query);
      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const selectToken = (mint: string) => {
    navigate(`/token/${mint}`);
    setShowResults(false);
  };

  // Close search results when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
      setShowResults(false);
    }
  };

  // Add event listener for clicking outside
  useState(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="flex items-center">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search by token name, symbol, or address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-8"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          className="ml-2"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-96 overflow-y-auto">
          <ul className="py-1">
            {results.map((token) => (
              <li key={token.mint} className="px-4 py-2 hover:bg-muted cursor-pointer" onClick={() => selectToken(token.mint)}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {token.name} ({token.symbol})
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {token.mint}
                    </div>
                    <div className="text-sm mt-1">
                      ${token.price.toFixed(6)}
                    </div>
                  </div>
                  <TokenRiskScore riskLevel={token.riskLevel} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No Results Message */}
      {showResults && query && results.length === 0 && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg p-4 text-center">
          No tokens found matching "{query}"
        </div>
      )}
    </div>
  );
}
