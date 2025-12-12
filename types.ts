export type ThemeType = 'clean' | 'neon' | 'sunset' | 'black' | 'heavie';

export interface EventConfig {
  id: string;
  name: string;
  location: string;
  date: string;
  theme: ThemeType;
  startTime: number; // Timestamp
  durationHours: number;
}

export interface Drink {
  id: string;
  name: string;
  shortDesc: string;
  description: string; // Sensory description
  ingredients: string[];
  imageUrl: string;
  cost: number;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'kitchen' | 'guest';
  coins: number;
  eventId: string;
}

export interface Order {
  id: string;
  drinkId: string;
  drinkName: string;
  drinkImage: string;
  userId: string;
  userName: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  timestamp: number;
}

export interface CoinCode {
  code: string;
  amount: number;
  redeemedBy: string[]; // List of user IDs who redeemed it
  maxRedemptions: number; // 0 for infinite (or single use per user logic)
}
