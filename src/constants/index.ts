import { Currency, PaymentMethod } from '../../types';

export const INITIAL_EXCHANGE_RATE = 1;

export interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  currency: Currency;
  accountType: 'bank' | 'cash' | 'digital';
}

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  {
    id: PaymentMethod.PAGO_MOVIL_BS,
    label: 'Pago Móvil (Bs.)',
    currency: Currency.BS,
    accountType: 'bank',
  },
  {
    id: PaymentMethod.EFECTIVO_BS,
    label: 'Efectivo (Bs.)',
    currency: Currency.BS,
    accountType: 'cash',
  },
  {
    id: PaymentMethod.EFECTIVO_USD,
    label: 'Efectivo (USD)',
    currency: Currency.USD,
    accountType: 'cash',
  },
  {
    id: PaymentMethod.USDT,
    label: 'USDT',
    currency: Currency.USD,
    accountType: 'digital',
  },
];

export const TRANSACTION_TYPES = [
  { value: 'income', label: 'Ingreso' },
  { value: 'expense', label: 'Gasto' },
  { value: 'adjustment', label: 'Ajuste' },
];

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_DISPLAY_FORMAT = 'dd/MM/yyyy';
