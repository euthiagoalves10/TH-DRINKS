import { EventConfig, Drink, Order, User, CoinCode } from '../types';

const KEYS = {
  EVENT: 'th_drinks_event',
  DRINKS: 'th_drinks_drinks',
  ORDERS: 'th_drinks_orders',
  USER: 'th_drinks_current_user',
  COIN_CODES: 'th_drinks_coin_codes',
};

// --- Event ---
export const getEvent = (): EventConfig | null => {
  const data = localStorage.getItem(KEYS.EVENT);
  return data ? JSON.parse(data) : null;
};

export const saveEvent = (event: EventConfig) => {
  localStorage.setItem(KEYS.EVENT, JSON.stringify(event));
};

// --- Drinks ---
export const getDrinks = (): Drink[] => {
  const data = localStorage.getItem(KEYS.DRINKS);
  return data ? JSON.parse(data) : [];
};

export const saveDrink = (drink: Drink) => {
  const drinks = getDrinks();
  const index = drinks.findIndex(d => d.id === drink.id);
  if (index >= 0) {
    drinks[index] = drink;
  } else {
    drinks.push(drink);
  }
  localStorage.setItem(KEYS.DRINKS, JSON.stringify(drinks));
};

export const deleteDrink = (id: string) => {
  const drinks = getDrinks().filter(d => d.id !== id);
  localStorage.setItem(KEYS.DRINKS, JSON.stringify(drinks));
};

// --- User ---
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const saveUser = (user: User) => {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const logoutUser = () => {
  localStorage.removeItem(KEYS.USER);
};

// --- Orders ---
export const getOrders = (): Order[] => {
  const data = localStorage.getItem(KEYS.ORDERS);
  return data ? JSON.parse(data) : [];
};

export const addOrder = (order: Order) => {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
};

export const updateOrderStatus = (orderId: string, status: Order['status']) => {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  }
};

// --- Coin Codes ---
export const getCoinCodes = (): CoinCode[] => {
  const data = localStorage.getItem(KEYS.COIN_CODES);
  return data ? JSON.parse(data) : [];
};

export const createCoinCode = (amount: number): string => {
  const codes = getCoinCodes();
  const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const coinCode: CoinCode = {
    code: newCode,
    amount,
    redeemedBy: [],
    maxRedemptions: 9999, // Simplified: one code can be used by many users once
  };
  codes.push(coinCode);
  localStorage.setItem(KEYS.COIN_CODES, JSON.stringify(codes));
  return newCode;
};

export const redeemCoinCode = (code: string, userId: string): number | null => {
  const codes = getCoinCodes();
  const codeIndex = codes.findIndex(c => c.code === code);
  
  if (codeIndex === -1) return null; // Invalid
  
  const coinCode = codes[codeIndex];
  if (coinCode.redeemedBy.includes(userId)) return -1; // Already redeemed
  
  coinCode.redeemedBy.push(userId);
  codes[codeIndex] = coinCode;
  localStorage.setItem(KEYS.COIN_CODES, JSON.stringify(codes));
  return coinCode.amount;
};

// --- Helper for Mock Data ---
export const initializeMockData = () => {
  if (!getDrinks().length) {
    const mocks: Drink[] = [
      {
        id: '1',
        name: 'Neon Sunset',
        shortDesc: 'Frutado e refrescante',
        description: 'Uma explosão de frutas cítricas com um final suave de grenadine. Perfeito para começar a noite.',
        ingredients: ['Vodka', 'Suco de Laranja', 'Grenadine', 'Gelo'],
        imageUrl: 'https://picsum.photos/400/400?random=1',
        cost: 1
      },
      {
        id: '2',
        name: 'Dark Matter',
        shortDesc: 'Forte e intenso',
        description: 'Café espresso misturado com licor de café e vodka premium. Para quem precisa de energia.',
        ingredients: ['Vodka', 'Licor de Café', 'Espresso', 'Grãos de Café'],
        imageUrl: 'https://picsum.photos/400/400?random=2',
        cost: 1
      },
      {
        id: '3',
        name: 'Electric Blue',
        shortDesc: 'Ácido e vibrante',
        description: 'Curaçao blue traz a cor elétrica, equilibrada com limão siciliano e soda.',
        ingredients: ['Gin', 'Blue Curaçao', 'Limão', 'Soda'],
        imageUrl: 'https://picsum.photos/400/400?random=3',
        cost: 1
      }
    ];
    localStorage.setItem(KEYS.DRINKS, JSON.stringify(mocks));
  }
};
