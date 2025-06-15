
import { useState, useEffect, useCallback } from 'react';
import { Transaction, FilterPeriod, FinancialSummaryData, Currency, PaymentMethod, TransactionType, CustomDateRange } from '../types';
import { PAYMENT_METHOD_OPTIONS, INITIAL_EXCHANGE_RATE, formatDateForInput, parseInputDate } from '../constants';
import * as transactionService from '../services/transactionService';

const today = new Date();

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>(FilterPeriod.ALL);
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>({
    startDate: formatDateForInput(new Date(today.getFullYear(), today.getMonth(), 1)),
    endDate: formatDateForInput(today),
  });

  const [exchangeRate, setExchangeRateState] = useState<number>(INITIAL_EXCHANGE_RATE);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedTransactions, fetchedRate] = await Promise.all([
        transactionService.getTransactions(),
        transactionService.getExchangeRate() // Uses localStorage version
      ]);
      setTransactions(fetchedTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setExchangeRateState(fetchedRate); // fetchedRate from localStorage will be a number
    } catch (e: any) {
      setError(`Error al cargar datos de localStorage: ${e.message}.`);
      console.error(e);
      setExchangeRateState(INITIAL_EXCHANGE_RATE); // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const setAndSaveExchangeRate = async (rate: number) => {
    setExchangeRateState(rate);
    try {
      await transactionService.saveExchangeRate(rate); // Uses localStorage version
    } catch (e: any) {
      console.error("Failed to save exchange rate to localStorage", e);
      setError(`Error al guardar tasa de cambio en localStorage: ${e.message}`);
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    try {
      const newTransactionFromStorage = await transactionService.addTransaction(transactionData);
      setTransactions(prevTransactions => 
        [newTransactionFromStorage, ...prevTransactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } catch (e: any) {
      console.error("Failed to add transaction to localStorage", e);
      setError(`Error al agregar transacción a localStorage: ${e.message}`);
    }
  };

  const updateTransaction = async (transactionToUpdate: Transaction) => {
    try {
      const updatedTransactionFromStorage = await transactionService.updateTransaction(transactionToUpdate);
      setTransactions(prevTransactions =>
        prevTransactions.map(t => t.id === updatedTransactionFromStorage.id ? updatedTransactionFromStorage : t)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } catch (e: any) {
      console.error("Failed to update transaction in localStorage", e);
      setError(`Error al actualizar transacción en localStorage: ${e.message}`);
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    try {
      await transactionService.deleteTransaction(transactionId);
      setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== transactionId));
    } catch (e: any) {
      console.error("Failed to delete transaction from localStorage", e);
      setError(`Error al eliminar transacción de localStorage: ${e.message}`);
    }
  };

  const getPaymentMethodDetails = (methodId: PaymentMethod) => {
    return PAYMENT_METHOD_OPTIONS.find(m => m.id === methodId);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filterPeriod === FilterPeriod.ALL) return true;
    
    const transactionDate = parseInputDate(transaction.date);
    const todayDt = new Date(); 
    todayDt.setHours(0,0,0,0);

    if (filterPeriod === FilterPeriod.TODAY) {
      return transactionDate.getTime() === todayDt.getTime();
    }
    if (filterPeriod === FilterPeriod.WEEK) {
      const startOfWeek = new Date(todayDt);
      startOfWeek.setDate(todayDt.getDate() - todayDt.getDay() + (todayDt.getDay() === 0 ? -6 : 1)); 
      startOfWeek.setHours(0,0,0,0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);
      return transactionDate >= startOfWeek && transactionDate <= endOfWeek;
    }
    if (filterPeriod === FilterPeriod.MONTH) {
      const startOfMonth = new Date(todayDt.getFullYear(), todayDt.getMonth(), 1);
      const endOfMonth = new Date(todayDt.getFullYear(), todayDt.getMonth() + 1, 0);
      endOfMonth.setHours(23,59,59,999);
      return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
    }
    if (filterPeriod === FilterPeriod.CUSTOM && customDateRange.startDate && customDateRange.endDate) {
        const startDate = parseInputDate(customDateRange.startDate);
        startDate.setHours(0,0,0,0);
        const endDate = parseInputDate(customDateRange.endDate);
        endDate.setHours(23,59,59,999);
        return transactionDate >= startDate && transactionDate <= endDate;
    }
    return true;
  });

  const incomeAndAdjustments = filteredTransactions.filter(
    t => t.type === TransactionType.INCOME || t.type === TransactionType.ADJUSTMENT
  );
  const expenses = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE);

  const financialSummary: FinancialSummaryData = transactions.reduce<FinancialSummaryData>((acc, t) => {
    const methodDetails = getPaymentMethodDetails(t.paymentMethod);
    if (!methodDetails) return acc;

    // Check if the transaction is part of the filtered set for periodIncome
    const isWithinFilterPeriodForIncome = filteredTransactions.some(ft => ft.id === t.id);
    
    // Balance calculation considers *all* transactions up to the current date,
    // not just the filtered period, to reflect true current balances.
    if (methodDetails.currency === Currency.BS) {
        if (t.type === TransactionType.INCOME || t.type === TransactionType.ADJUSTMENT) {
            if (methodDetails.accountType === 'cash') acc.bs.cashBalance += t.amount;
            if (methodDetails.accountType === 'bank') acc.bs.bankBalance += t.amount;
        } else if (t.type === TransactionType.EXPENSE) {
            if (methodDetails.accountType === 'cash') acc.bs.cashBalance -= t.amount;
            if (methodDetails.accountType === 'bank') acc.bs.bankBalance -= t.amount;
        }
    } else if (methodDetails.currency === Currency.USD) {
        if (t.type === TransactionType.INCOME || t.type === TransactionType.ADJUSTMENT) {
            if (methodDetails.accountType === 'cash') acc.usd.cashBalance += t.amount;
            if (methodDetails.accountType === 'digital') acc.usd.usdtBalance += t.amount;
        } else if (t.type === TransactionType.EXPENSE) {
            if (methodDetails.accountType === 'cash') acc.usd.cashBalance -= t.amount;
            if (methodDetails.accountType === 'digital') acc.usd.usdtBalance -= t.amount;
        }
    }
    
    // Period income only considers income/adjustments within the filtered period.
    if (isWithinFilterPeriodForIncome && (t.type === TransactionType.INCOME || t.type === TransactionType.ADJUSTMENT)) {
        if (methodDetails.currency === Currency.BS) {
            acc.bs.periodIncome += t.amount;
        } else if (methodDetails.currency === Currency.USD) {
            acc.usd.periodIncome += t.amount;
        }
    }

    return acc;
  }, {
    bs: { periodIncome: 0, cashBalance: 0, bankBalance: 0, totalBalance: 0 },
    usd: { periodIncome: 0, cashBalance: 0, usdtBalance: 0, totalBalance: 0 },
  });

  financialSummary.bs.totalBalance = financialSummary.bs.cashBalance + financialSummary.bs.bankBalance;
  financialSummary.usd.totalBalance = financialSummary.usd.cashBalance + financialSummary.usd.usdtBalance;

  return {
    transactions: filteredTransactions,
    allTransactions: transactions, 
    incomeAndAdjustments,
    expenses,
    financialSummary,
    filterPeriod,
    setFilterPeriod,
    customDateRange,
    setCustomDateRange,
    exchangeRate,
    setExchangeRate: setAndSaveExchangeRate,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading,
    error,
    getPaymentMethodDetails,
  };
};
