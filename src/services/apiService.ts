import { 
    TokenSummary, 
    PriceHistory, 
    LiquidityHistory, 
    HolderHistory,
    TopHolder,
    LiquidityEvent
} from '../types/token';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8787';

// Helper function for fetch requests
async function fetchApi<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Fetching data from: ${url}`)
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Error ${response.status} at ${url}: ${errorBody}`);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
        }
        const data: T = await response.json();
        console.log(`Successfully fetched data from: ${url}`);
        return data;
    } catch (error) {
        console.error(`Failed to fetch from ${url}:`, error);
        throw error; // Re-throw the error to be caught by React Query
    }
}

// --- Token Summary --- 
export const fetchTokenSummary = (mint: string): Promise<TokenSummary> => {
    return fetchApi<TokenSummary>(`/tokens/${mint}/report/summary`);
};

// --- Token Visualizations --- 
export const fetchPriceHistory = (mint: string): Promise<PriceHistory> => {
    return fetchApi<PriceHistory>(`/tokens/${mint}/visualizations/price`);
};

export const fetchLiquidityHistory = (mint: string): Promise<LiquidityHistory> => {
    return fetchApi<LiquidityHistory>(`/tokens/${mint}/visualizations/liquidity`);
};

export const fetchHolderHistory = (mint: string): Promise<HolderHistory> => {
    return fetchApi<HolderHistory>(`/tokens/${mint}/visualizations/holders`);
};

export const fetchTopHolders = (mint: string): Promise<TopHolder[]> => {
    return fetchApi<TopHolder[]>(`/tokens/${mint}/visualizations/top-holders`);
};

export const fetchLiquidityLockInfo = (mint: string): Promise<LiquidityEvent[]> => {
    return fetchApi<LiquidityEvent[]>(`/tokens/${mint}/visualizations/liquidity-lock`);
};

// --- Alerts (Add functions as needed later) --- 
// export const createAlert = async (alertData: any) => { ... }
// export const getUserAlerts = async (email: string) => { ... } 