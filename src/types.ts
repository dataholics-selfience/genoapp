export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isHtml: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  sessionId: string;
  createdAt: Date;
  messages: Message[];
  userEmail?: string;
  deleted?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  challenges: Challenge[];
  currentChallenge: Challenge | null;
  startupListCount: number;
}

export type Theme = 'dark' | 'light';

export type SubscriptionPlan = 'padawan' | 'jedi' | 'mestre-jedi' | 'adm-universo';

export interface PlanDetails {
  name: string;
  price: number;
  limit: number;
  description: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, PlanDetails> = {
  'padawan': {
    name: 'Padawan',
    price: 0,
    limit: 2,
    description: 'Plano Gratuito - 2 Desafios'
  },
  'jedi': {
    name: 'Jedi',
    price: 3000,
    limit: 6,
    description: 'R$ 3.000 - 6 Desafios'
  },
  'mestre-jedi': {
    name: 'Mestre Jedi',
    price: 5000,
    limit: 12,
    description: 'R$ 5.000 - 12 Desafios'
  },
  'adm-universo': {
    name: 'Adm do Universo',
    price: 11000,
    limit: 99,
    description: 'R$ 11.000 - Desafios ilimitados'
  }
};

export interface UserData {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  company: string;
  subscriptionPlan: SubscriptionPlan;
  isDeleted?: boolean;
}