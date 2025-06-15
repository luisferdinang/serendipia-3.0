
import { PaymentMethod, Currency, PaymentMethodOption, FilterPeriod } from './types';

export const APP_TITLE = "Serendipia Studio Finanzas";

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  { id: PaymentMethod.PAGO_MOVIL_BS, label: 'Pago Móvil (Bs.)', currency: Currency.BS, accountType: 'bank' },
  { id: PaymentMethod.EFECTIVO_BS, label: 'Efectivo (Bs.)', currency: Currency.BS, accountType: 'cash' },
  { id: PaymentMethod.EFECTIVO_USD, label: 'Efectivo (USD)', currency: Currency.USD, accountType: 'cash' },
  { id: PaymentMethod.USDT, label: 'USDT (Digital USD)', currency: Currency.USD, accountType: 'digital' },
];

export const TRANSACTION_TYPE_OPTIONS = [
  { id: 'income', label: 'Ingreso' },
  { id: 'expense', label: 'Gasto' },
  { id: 'adjustment', label: 'Ajuste de Saldo' },
];

export const FILTER_PERIOD_OPTIONS = [
  { id: FilterPeriod.ALL, label: 'Todo' },
  { id: FilterPeriod.TODAY, label: 'Hoy' },
  { id: FilterPeriod.WEEK, label: 'Esta Semana' },
  { id: FilterPeriod.MONTH, label: 'Este Mes' },
  { id: FilterPeriod.CUSTOM, label: 'Rango Personalizado' },
];

export const INITIAL_EXCHANGE_RATE = 36.5; // Example rate

export const getCurrencyForPaymentMethod = (methodId: PaymentMethod): Currency => {
  const method = PAYMENT_METHOD_OPTIONS.find(m => m.id === methodId);
  return method ? method.currency : Currency.BS; // Default, though should always find
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const parseInputDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};
