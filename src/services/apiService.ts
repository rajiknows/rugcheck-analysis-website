import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import {
    TokenSummary,
    PriceHistory,
    LiquidityHistory,
    HolderHistory,
    TopHolder,
} from "../types/token";
import { ArrowUpCircleIcon } from "lucide-react";

export type AlertComparison = "GREATER_THAN" | "LESS_THAN" | "EQUALS";

export interface Alert {
    id: string;
    userEmail: string;
    mint: string;
    parameter: string;
    comparison: AlertComparison;
    threshold: number;
    isActive: boolean;
    triggeredAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAlertPayload {
    userEmail: string;
    mint: string;
    parameter: string;
    comparison: AlertComparison;
    threshold: number;
}

export interface DeleteAlertPayload {
    alertId: string;
}

export interface UpdateAlertPayload {
    alertId: string;
    parameter?: string;
    comparison?: AlertComparison;
    threshold?: number;
    isActive?: boolean;
}

export interface ApiResponse {
    success: boolean;
    alertId?: string;
    message?: string;
}

export interface LiquidityLockInfo {
    timestamp: string;
    market_pubkey: string;
    lockedAmount: number;
    lplocked_pct: number;
    usdc_locked: number;
    unlockDate: string | null;
}

const API_BASE_URL =
    import.meta.env.BACKEND_URL ||
    "https://rugcheck-backend.rajeshhjhamain-dd8.workers.dev";

interface FetchOptions extends RequestInit {
    body?: any;
}

async function fetchApi<T>(
    endpoint: string,
    options: FetchOptions = {},
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Fetching data from: ${url} with options:`, options);

    const config: RequestInit = {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    };

    if (
        config.body &&
        typeof config.body === "object" &&
        config.method !== "GET" &&
        config.method !== "HEAD"
    ) {
        config.body = JSON.stringify(config.body);
    } else if (config.method === "GET" || config.method === "HEAD") {
        delete config.body;
    }

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(
                `API Error ${response.status} at ${url}: ${errorBody}`,
            );
            let errorJson = {};
            try {
                errorJson = JSON.parse(errorBody);
            } catch (e) {
                /* ignore parsing error */
            }
            throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorBody}, cause: ${JSON.stringify(errorJson)}`,
            );
        }

        if (response.status === 204) {
            return {} as T;
        }

        const data: T = await response.json();
        console.log(`Successfully fetched data from: ${url}`);
        return data;
    } catch (error) {
        console.error(`Failed to fetch from ${url}:`, error);
        throw error;
    }
}

// Factory of queries
export const queryKeys = {
    tokenSummary: (mint: string) => ["token", mint, "summary"],
    priceHistory: (mint: string) => ["token", mint, "price"],
    liquidityHistory: (mint: string) => ["token", mint, "liquidity"],
    holderHistory: (mint: string) => ["token", mint, "holders"],
    topHolders: (mint: string) => ["token", mint, "top-holders"],
    liquidityLock: (mint: string) => ["token", mint, "liquidity-lock"],
    alerts: ["alerts"],
    alertsByUser: (email: string) => ["alerts", "user", email],
    alertsByMint: (mint: string) => ["alerts", "mint", mint],
};

export const useTokenSummary = (mint: string) => {
    return useQuery({
        queryKey: queryKeys.tokenSummary(mint),
        queryFn: () => fetchApi<TokenSummary>(`/tokens/${mint}/report/summary`),
        enabled: !!mint,
    });
};
export const usePriceHistory = (mint: string) => {
    return useQuery({
        queryKey: queryKeys.priceHistory(mint),
        queryFn: async () => {
            type ApiPriceHistoryItem = {
                timestamp: string;
                price: number | null;
            };
            const response = await fetchApi<ApiPriceHistoryItem[]>(
                `/tokens/${mint}/visualizations/price`,
            );

            const processedData = response
                .filter((item) => item.price !== null)
                .map((item) => ({
                    timestamp: item.timestamp,
                    value: item.price as number,
                }));

            return {
                data: processedData,
            };
        },
        enabled: !!mint,
    });
};

export const useLiquidityHistory = (mint: string) => {
    return useQuery({
        queryKey: queryKeys.liquidityHistory(mint),
        queryFn: async () => {
            type apiLiquidityHistory = {
                timestamp: string;
                totalMarketLiquidity: number;
            };
            const response = await fetchApi<apiLiquidityHistory[]>(
                `/tokens/${mint}/visualizations/liquidity`,
            );

            const processedData = response
                .filter((item) => item.totalMarketLiquidity !== null)
                .map((item) => ({
                    timestamp: item.timestamp,
                    value: item.totalMarketLiquidity as number,
                }));

            return {
                data: processedData,
            };
        },
        enabled: !!mint,
    });
};
export const useHolderHistory = (mint: string) => {
    return useQuery({
        queryKey: queryKeys.holderHistory(mint),
        queryFn: async () => {
            type apiHolderHistory = {
                timestamp: string;
                totalHolders: string;
            };
            const response = await fetchApi<apiHolderHistory[]>(
                `/tokens/${mint}/visualizations/holders`,
            );
            const processedData = response.map((item) => ({
                timestamp: item.timestamp,
                value: parseInt(item.totalHolders, 10),
            }));
            return {
                data: processedData,
            };
        },
        enabled: !!mint,
    });
};
export const useTopHolders = (mint: string) => {
    return useQuery({
        queryKey: queryKeys.topHolders(mint),
        queryFn: async () => {
            type apiTopHolders = {
                address: string;
                amount: string;
                pct: number;
                insider: boolean;
            };
            try {
                const response = await fetchApi<apiTopHolders[]>(
                    `/tokens/${mint}/visualizations/top-holders`,
                );
                return response || [];
            } catch (error) {
                console.error("Failed to fetch top holders:", error);
                return [];
            }
        },
        enabled: !!mint,
    });
};
export const useLiquidityLockInfo = (mint: string) => {
    return useQuery({
        queryKey: queryKeys.liquidityLock(mint),
        queryFn: async () => {
            const response = await fetchApi<{
                timestamp: string;
                market_pubkey: string;
                lpLocked: string;
                lpLockedPct: number;
                usdcLocked: number;
                unlockDate: string;
            }>(`/tokens/${mint}/visualizations/liquidity-lock`);
            return {
                timestamp: response.timestamp,
                market_pubkey: response.market_pubkey,
                lockedAmount: parseInt(response.lpLocked, 10),
                lplocked_pct: response.lpLockedPct,
                usdc_locked: response.usdcLocked,
                unlockDate:
                    response.unlockDate === "0" ? null : response.unlockDate,
            };
        },
        enabled: !!mint,
    });
};

export const useAlerts = () => {
    return useQuery({
        queryKey: queryKeys.alerts,
        queryFn: () => fetchApi<Alert[]>("/alert/get"),
    });
};

export const useAlertsByUserEmail = (userEmail: string) => {
    return useQuery({
        queryKey: queryKeys.alertsByUser(userEmail),
        queryFn: () => {
            const encodedEmail = encodeURIComponent(userEmail);
            return fetchApi<Alert[]>(
                `/alert/getbyuseremail?userEmail=${encodedEmail}`,
            );
        },
        enabled: !!userEmail,
    });
};

export const useAlertsByMint = (mint: string) => {
    return useQuery({
        queryKey: queryKeys.alertsByMint(mint),
        queryFn: () => fetchApi<Alert[]>(`/alert/getbymint?mint=${mint}`),
        enabled: !!mint,
    });
};

export const useCreateAlert = () => {
    const queryClient = new QueryClient();

    return useMutation({
        mutationFn: (payload: CreateAlertPayload) =>
            fetchApi<ApiResponse>("/alert/new", {
                method: "POST",
                body: payload,
            }),
        onSuccess: (_, variables) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: queryKeys.alerts });
            queryClient.invalidateQueries({
                queryKey: queryKeys.alertsByUser(variables.userEmail),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.alertsByMint(variables.mint),
            });
        },
    });
};

export const useDeleteAlert = () => {
    const queryClient = new QueryClient();

    return useMutation({
        mutationFn: (payload: DeleteAlertPayload) =>
            fetchApi<ApiResponse>("/alert/delete", {
                method: "DELETE",
                body: payload,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
        },
    });
};

export const useUpdateAlert = () => {
    const queryClient = new QueryClient();

    return useMutation({
        mutationFn: (payload: UpdateAlertPayload) =>
            fetchApi<ApiResponse>("/alert/update", {
                method: "PUT",
                body: payload,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
        },
    });
};

export const useQueueInternalJobs = () => {
    return useMutation({
        mutationFn: () =>
            fetchApi<ApiResponse>("/internal/queue-jobs", { method: "POST" }),
    });
};
