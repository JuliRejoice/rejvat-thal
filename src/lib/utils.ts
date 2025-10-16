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

/**
 * Formats a date range string, showing the date only once if the range is a single day
 * @param startDate - Start date string or Date object
 * @param endDate - End date string or Date object
 * @param locale - Locale string (default: 'en-IN')
 * @param options - Intl.DateTimeFormatOptions for date formatting
 * @returns Formatted date range string
 */
export const formatDateRange = (
  startDate: string | Date,
  endDate: string | Date,
  locale: string = 'en-IN',
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  }
): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // If dates are the same, return just one date
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString(locale, options);
  }
  
  // Otherwise return the date range
  return `${start.toLocaleDateString(locale, options)} - ${end.toLocaleDateString(locale, options)}`;
};

// Helper function to format date into YYYY-MM-DD without timezone conversion
export const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


