
import React, { createContext, useContext, useState } from "react";
import { AuthState, User } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    // Mock login - in reality would call API
    if (email && password) {
      const mockUser: User = {
        id: "1",
        email,
        name: "Demo User",
      };
      
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
      });
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${mockUser.name}!`,
      });
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
