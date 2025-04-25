export interface TokenReport {
    mint: string;
    detectedAt: string;
    totalMarketLiquidity: number;
    totalHolders: number;
    score: number;
    score_normalised: number;
    markets: Market[];
    topHolders: TopHolder[];
    lockers: Record<string, Locker>;
    price?: number;
    votes?: TokenVotes;
    insiderGraph?: InsiderGraphNode[];
}

export interface Market {
    pubkey: string;
    lp: {
        lpLocked: number;
        lpLockedPct: number;
    };
}

export interface TopHolder {
    address: string;
    amount: number;
    pct: number;
    insider: boolean;
}

export interface Locker {
    usdcLocked: number;
    unlockDate: number;
}

export interface TokenPrice {
    price: number;
}

export interface TokenVotes {
    up: number;
    down: number;
}

export interface InsiderGraphNode {
    nodes: {
        id: string;
        participant: string;
        holdings: number;
    }[];
}

export interface TokenMetrics {
    timestamp: string;
    mint: string;
    price: number;
    totalMarketLiquidity: number;
    totalHolders: number;
    score: number;
    score_normalised: number;
    upvotes: number;
    downvotes: number;
}

export interface HolderMovement {
    timestamp: string;
    mint: string;
    address: string;
    amount: number;
    pct: number;
    insider: boolean;
}

export interface LiquidityEvent {
    timestamp: string;
    mint: string;
    market_pubkey: string;
    lpLocked: number;
    lpLockedPct: number;
    usdcLocked: number;
    unlockDate: number;
}

export interface InsiderGraphData {
    timestamp: string;
    mint: string;
    node_id: string;
    participant: string;
    holdings: number;
    edge_source?: string;
    edge_target?: string;
}

export interface Alert {
    id: string;
    userEmail: string;
    mint: string;
    parameter: string;
    comparison: "GREATER_THAN" | "LESS_THAN" | "EQUALS";
    threshold: number;
    isActive: boolean;
    triggeredAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Chart data types
export interface TimeSeriesDataPoint {
    timestamp: string;
    value: number;
}

export interface PriceHistory {
    data: TimeSeriesDataPoint[];
}

export interface LiquidityHistory {
    data: TimeSeriesDataPoint[];
}

export interface HolderHistory {
    data: TimeSeriesDataPoint[];
}

export interface RiskLevel {
    name: string;
    value: string;
    description: string;
    score: number;
    level: string;
}

export interface TokenSummary {
    token_program: string;
    token_type: string;
    risks: RiskLevel[];
    score: number;
    score_normalised: number;
    upvotes: number;
    downvotes: number;
}
