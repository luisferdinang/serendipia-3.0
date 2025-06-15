
export enum Currency {
  BS = 'Bs.',
  USD = 'USD',
}

export enum PaymentMethod {
  PAGO_MOVIL_BS = 'PAGO_MOVIL_BS',
  EFECTIVO_BS = 'EFECTIVO_BS',
  EFECTIVO_USD = 'EFECTIVO_USD',
  USDT = 'USDT',
}

export interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  currency: Currency;
  accountType: 'bank' | 'cash' | 'digital';
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  ADJUSTMENT = 'adjustment',
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  quantity?: number;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  paymentMethod: PaymentMethod;
  // Currency is derived from paymentMethod
}

export enum FilterPeriod {
  ALL = 'all',
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  CUSTOM = 'custom',
}

export interface BsSummary {
  periodIncome: number;
  cashBalance: number;
  bankBalance: number; // Pago Movil
  totalBalance: number;
}

export interface UsdSummary {
  periodIncome: number;
  cashBalance: number;
  usdtBalance: number;
  totalBalance: number;
}

export interface FinancialSummaryData {
  bs: BsSummary;
  usd: UsdSummary;
}

export interface CustomDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}
