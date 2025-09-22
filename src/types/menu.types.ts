export type DailyMenu = {
  breakfast: string;
  lunch: string;
  dinner: string;
  _id?: string;
};

export type MenuMap = Record<string, DailyMenu>;

export type CreateMonthlyMenuPayload = {
  breakfastPlans: string;
  lunchPlans: string;
  dinnerPlans: string;
  restaurantId: string;
  date: string; // YYYY-MM-DD
};