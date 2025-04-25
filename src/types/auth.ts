/// currently we will not be doing the auth part as it is a mvp and i figured we should do a wallet login too
/// with the rugcheck api signin
export interface User {
    id: string;
    email: string;
    name?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}
