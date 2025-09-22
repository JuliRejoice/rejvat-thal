import { removeToken, removeUser, getUser } from "@/lib/utils";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type UserRole = "admin" | "manager" | "staff";

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  restaurantId?: {
    name: string;
    _id: string;
  };
  restaurantName?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (data: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize user from cookies on app startup
  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = getUser();
      if (storedUser) {
        setUser(storedUser);
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  const logout = () => {
    removeToken();
    removeUser();
    setUser(null);
  };

  const isAuthenticated = !!user && isInitialized;

  // Don't render children until auth is initialized to prevent flash
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};