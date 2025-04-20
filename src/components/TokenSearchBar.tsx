import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TokenSearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }
    console.log(`[TokenSearchBar] Navigating to /token/${trimmedQuery}`);
    navigate(`/token/${trimmedQuery}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Enter token address..."
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
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
