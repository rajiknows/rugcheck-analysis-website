import {
  TokenReport,
  TokenPrice,
  TokenVotes,
  PriceHistory,
  LiquidityHistory,
  HolderHistory,
  TokenSummary,
  RiskLevel,
  TokenMetrics,
} from "@/types/token";

// Sample token mints
const TOKEN_MINTS = [
  "6eVpGi4e3AA1fyN8r9oTMAQKUGjSh168jv1h295Ax1Qg",
  "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y",
];

// Token name mapping
const TOKEN_NAMES: Record<string, { name: string; symbol: string }> = {
  "6eVpGi4e3AA1fyN8r9oTMAQKUGjSh168jv1h295Ax1Qg": { name: "Solana", symbol: "SOL" },
  "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU": { name: "Bonk", symbol: "BONK" },
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": { name: "USD Coin", symbol: "USDC" },
  "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": { name: "Wrapped BTC", symbol: "WBTC" },
  "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y": { name: "Shade Protocol", symbol: "SHD" },
};

// Random historical data generation
const generateHistoricalData = (days: number, baseValue: number, volatility: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Random walk with some trend
    const randomChange = (Math.random() - 0.5) * volatility;
    const trendFactor = 1 + (i % 7 === 0 ? (Math.random() - 0.5) * 0.1 : 0); // Weekly cycle
    
    const value = baseValue * (1 + randomChange) * trendFactor;
    
    data.push({
      timestamp: date.toISOString(),
      value: parseFloat(value.toFixed(6)),
    });
    
    // Update base value for next iteration
    baseValue = value;
  }
  
  return data;
};

// Generate risk level based on score
const getRiskLevel = (score: number): RiskLevel => {
  if (score < 30) {
    return {
      level: 'low',
      score,
      description: 'This token appears to have low risk based on current metrics.'
    };
  } else if (score < 60) {
    return {
      level: 'medium',
      score,
      description: 'This token has some concerning metrics that warrant caution.'
    };
  } else if (score < 85) {
    return {
      level: 'high',
      score,
      description: 'This token shows high risk indicators. Exercise extreme caution.'
    };
  } else {
    return {
      level: 'critical',
      score,
      description: 'This token displays critical risk factors consistent with potential scams or rug pulls.'
    };
  }
};

// Generate mock market cap
const calculateMarketCap = (price: number, totalHolders: number) => {
  // Simple mock calculation - in a real system this would use circulating supply
  return price * totalHolders * Math.random() * 1000000;
};

// Generate mock token report
const generateTokenReport = (mint: string): TokenReport => {
  const randomScore = Math.floor(Math.random() * 100);
  const normalizedScore = randomScore / 100;
  
  const totalHolders = Math.floor(10000 + Math.random() * 90000);
  const liquidity = 50000 + Math.random() * 950000;
  
  const topHoldersCount = 5 + Math.floor(Math.random() * 15);
  const topHolders = [];
  
  let remainingPercentage = 100;
  
  // Generate top holders
  for (let i = 0; i < topHoldersCount; i++) {
    const isLast = i === topHoldersCount - 1;
    const holdingPct = isLast 
      ? remainingPercentage 
      : Math.min(remainingPercentage, (25 + Math.random() * 20) / topHoldersCount);
    
    remainingPercentage -= holdingPct;
    
    topHolders.push({
      address: `${mint.substring(0, 8)}...${i}`,
      amount: holdingPct * 10000, // Mock token amount
      pct: parseFloat(holdingPct.toFixed(2)),
      insider: Math.random() > 0.7 // 30% chance of being an insider
    });
  }
  
  // Generate markets
  const marketCount = 1 + Math.floor(Math.random() * 3);
  const markets = [];
  
  for (let i = 0; i < marketCount; i++) {
    const lpLockedPct = Math.random() * 100;
    markets.push({
      pubkey: `market${i}_${mint.substring(0, 6)}`,
      lp: {
        lpLocked: liquidity * (lpLockedPct / 100),
        lpLockedPct
      }
    });
  }
  
  // Generate lock data
  const lockers: Record<string, any> = {};
  const lockerCount = Math.floor(Math.random() * 3);
  
  for (let i = 0; i < lockerCount; i++) {
    const now = new Date();
    const unlockDate = new Date();
    unlockDate.setDate(now.getDate() + Math.floor(Math.random() * 365));
    
    lockers[`locker_${i}`] = {
      usdcLocked: 1000 + Math.random() * 100000,
      unlockDate: Math.floor(unlockDate.getTime() / 1000)
    };
  }
  
  return {
    mint,
    detectedAt: new Date().toISOString(),
    totalMarketLiquidity: parseFloat(liquidity.toFixed(2)),
    totalHolders,
    score: randomScore,
    score_normalised: parseFloat(normalizedScore.toFixed(2)),
    markets,
    topHolders,
    lockers,
    price: 0.1 + Math.random() * 100,
    votes: {
      up: Math.floor(Math.random() * 1000),
      down: Math.floor(Math.random() * 500)
    }
  };
};

// Fetch token report
export const fetchTokenReport = async (mint: string): Promise<TokenReport> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateTokenReport(mint));
    }, 500);
  });
};

// Fetch token price
export const fetchTokenPrice = async (mint: string): Promise<TokenPrice> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ price: 0.1 + Math.random() * 100 });
    }, 300);
  });
};

// Fetch token votes
export const fetchTokenVotes = async (mint: string): Promise<TokenVotes> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        up: Math.floor(Math.random() * 1000),
        down: Math.floor(Math.random() * 500)
      });
    }, 300);
  });
};

// Fetch price history
export const fetchPriceHistory = async (mint: string): Promise<PriceHistory> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const basePrice = 0.1 + Math.random() * 100;
      const data = generateHistoricalData(30, basePrice, 0.05);
      
      resolve({
        data,
        mint
      });
    }, 700);
  });
};

// Fetch liquidity history
export const fetchLiquidityHistory = async (mint: string): Promise<LiquidityHistory> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const baseLiquidity = 50000 + Math.random() * 950000;
      const data = generateHistoricalData(30, baseLiquidity, 0.03);
      
      resolve({
        data,
        mint
      });
    }, 600);
  });
};

// Fetch holder history
export const fetchHolderHistory = async (mint: string): Promise<HolderHistory> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const baseHolders = 10000 + Math.random() * 90000;
      const data = generateHistoricalData(30, baseHolders, 0.01);
      
      resolve({
        data,
        mint
      });
    }, 800);
  });
};

// Fetch token summary
export const fetchTokenSummary = async (mint: string): Promise<TokenSummary> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tokenReport = generateTokenReport(mint);
      const tokenInfo = TOKEN_NAMES[mint] || { name: "Unknown Token", symbol: "???" };
      
      resolve({
        mint,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        price: tokenReport.price || 0,
        marketCap: calculateMarketCap(tokenReport.price || 0, tokenReport.totalHolders),
        totalHolders: tokenReport.totalHolders,
        totalMarketLiquidity: tokenReport.totalMarketLiquidity,
        score: tokenReport.score,
        score_normalised: tokenReport.score_normalised,
        riskLevel: getRiskLevel(tokenReport.score),
        lastUpdated: new Date().toISOString()
      });
    }, 500);
  });
};

// Fetch all available tokens
export const fetchAllTokens = async (): Promise<TokenSummary[]> => {
  return Promise.all(TOKEN_MINTS.map(mint => fetchTokenSummary(mint)));
};

// Mock search functionality
export const searchTokens = async (query: string): Promise<TokenSummary[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = TOKEN_MINTS
        .filter(mint => {
          const tokenInfo = TOKEN_NAMES[mint];
          const searchTermLower = query.toLowerCase();
          return (
            mint.toLowerCase().includes(searchTermLower) ||
            tokenInfo.name.toLowerCase().includes(searchTermLower) ||
            tokenInfo.symbol.toLowerCase().includes(searchTermLower)
          );
        })
        .map(mint => {
          const tokenReport = generateTokenReport(mint);
          const tokenInfo = TOKEN_NAMES[mint];
          
          return {
            mint,
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            price: tokenReport.price || 0,
            marketCap: calculateMarketCap(tokenReport.price || 0, tokenReport.totalHolders),
            totalHolders: tokenReport.totalHolders,
            totalMarketLiquidity: tokenReport.totalMarketLiquidity,
            score: tokenReport.score,
            score_normalised: tokenReport.score_normalised,
            riskLevel: getRiskLevel(tokenReport.score),
            lastUpdated: new Date().toISOString()
          };
        });
      
      resolve(results);
    }, 300);
  });
};

// Get token metrics over time (for charts)
export const fetchTokenMetricsHistory = async (
  mint: string, 
  days: number = 30
): Promise<TokenMetrics[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const metrics: TokenMetrics[] = [];
      const now = new Date();
      
      // Base values
      let price = 0.1 + Math.random() * 100;
      let liquidity = 50000 + Math.random() * 950000;
      let holders = 10000 + Math.random() * 90000;
      let score = Math.floor(Math.random() * 100);
      let upvotes = Math.floor(Math.random() * 1000);
      let downvotes = Math.floor(Math.random() * 500);
      
      for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Random daily fluctuations
        price *= (1 + (Math.random() - 0.5) * 0.05);
        liquidity *= (1 + (Math.random() - 0.5) * 0.03);
        holders += Math.floor((Math.random() - 0.3) * 200); // Slower change for holders
        score += Math.floor((Math.random() - 0.5) * 3); // Slow change for risk score
        upvotes += Math.floor(Math.random() * 10);
        downvotes += Math.floor(Math.random() * 5);
        
        // Keep values in reasonable ranges
        price = Math.max(0.01, price);
        liquidity = Math.max(1000, liquidity);
        holders = Math.max(100, holders);
        score = Math.min(100, Math.max(0, score));
        
        metrics.push({
          timestamp: date.toISOString(),
          mint,
          price: parseFloat(price.toFixed(6)),
          totalMarketLiquidity: parseFloat(liquidity.toFixed(2)),
          totalHolders: Math.floor(holders),
          score,
          score_normalised: parseFloat((score / 100).toFixed(2)),
          upvotes,
          downvotes
        });
      }
      
      resolve(metrics);
    }, 800);
  });
};
