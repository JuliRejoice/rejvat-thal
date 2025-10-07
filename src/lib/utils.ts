import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Cookies from "js-cookie";
import { User } from "@/contexts/AuthContext";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, {
    expires: 7,
    secure: true,
    sameSite: "strict",
  });
};

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
};

export const setUser = (user: User) => {
  Cookies.set(USER_KEY, JSON.stringify(user), {
    expires: 7,
    secure: true,
    sameSite: "strict",
  });
};

export const getUser = (): User | null => {
  try {
    const userStr = Cookies.get(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user data from cookies:", error);
    return null;
  }
};

export const removeUser = () => {
  Cookies.remove(USER_KEY);
};

export const dateFormate = (date: string | Date) => {
  if (!date) return ""; // handle empty or null
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};



