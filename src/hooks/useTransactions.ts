import { useState, useEffect, useCallback } from 'react';
import { 
  getTransactions, 
  addTransaction as addTransactionService, 
  updateTransaction as updateTransactionService, 
  deleteTransaction as deleteTransactionService,
  getExchangeRate as getExchangeRateService,
  saveExchangeRate as saveExchangeRateService,
  TransactionInput
} from '../services/transactionService';
import { Transaction, TransactionType, Currency, PaymentMethod } from '../../types';
import { format, isAfter, isBefore, isWithinInterval, subDays, startOfDay, endOfDay } from 'date-fns';
import { PAYMENT_METHOD_OPTIONS } from '../constants';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros
  const [filterPeriod, setFilterPeriod] = useState<string>('this_month');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  // Estado para la tasa de cambio
  const [exchangeRate, setExchangeRateState] = useState<number>(1);
  
  // Estados para resumen financiero
  const [financialSummary, setFinancialSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    bs: {
      totalBalance: 0
    }
  });

  // Cargar datos iniciales
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Cargar transacciones y tasa de cambio en paralelo
      const [transactionsData, currentRate] = await Promise.all([
        getTransactions(),
        getExchangeRateService()
      ]);
      
      // Ordenar por fecha descendente
      const sortedTransactions = [...transactionsData].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setTransactions(sortedTransactions);
      setExchangeRateState(currentRate);
      
    } catch (err) {
      console.error('Error al cargar datos iniciales:', err);
      setError('No se pudieron cargar los datos. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  // Filtrar transacciones según el período seleccionado
  const filterTransactionsByPeriod = useCallback((transactions: Transaction[]) => {
    if (filterPeriod === 'all') return transactions;
    
    const now = new Date();
    let startDate: Date;
    
    switch (filterPeriod) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'custom':
        return transactions.filter(tx => {
          const txDate = new Date(tx.date);
          const start = new Date(customDateRange.startDate);
          const end = new Date(customDateRange.endDate);
          return isWithinInterval(txDate, { start, end });
        });
      default:
        return transactions;
    }
    
    return transactions.filter(tx => 
      isAfter(new Date(tx.date), startDate) && isBefore(new Date(tx.date), endOfDay(now))
    );
  }, [filterPeriod, customDateRange]);

  // Agregar una nueva transacción
  const addTransaction = async (transaction: Omit<TransactionInput, 'createdAt' | 'updatedAt'>) => {
    try {
      const newTransaction = await addTransactionService(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      console.error('Error al agregar transacción:', err);
      throw err;
    }
  };

  // Actualizar una transacción existente
  const updateTransaction = async (id: string, updates: Partial<TransactionInput>) => {
    try {
      const updatedTransaction = await updateTransactionService(id, updates);
      setTransactions(prev => 
        prev.map(tx => tx.id === id ? { ...tx, ...updatedTransaction } : tx)
      );
      return updatedTransaction;
    } catch (err) {
      console.error('Error al actualizar transacción:', err);
      throw err;
    }
  };

  // Eliminar una transacción
  const deleteTransaction = async (id: string) => {
    try {
      await deleteTransactionService(id);
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    } catch (err) {
      console.error('Error al eliminar transacción:', err);
      throw err;
    }
  };

  // Calcular resumen financiero
  const calculateFinancialSummary = useCallback((transactions: Transaction[]) => {
    const filteredTransactions = filterTransactionsByPeriod(transactions);
    
    const incomeAndAdjustments = filteredTransactions.filter(
      tx => tx.type === TransactionType.INCOME || tx.type === TransactionType.ADJUSTMENT
    );
    
    const expenses = filteredTransactions.filter(
      tx => tx.type === TransactionType.EXPENSE
    );
    
    const income = incomeAndAdjustments.reduce((sum, tx) => sum + tx.amount, 0);
    const expensesTotal = expenses.reduce((sum, tx) => sum + tx.amount, 0);
    const balance = income - expensesTotal;
    
    return {
      income,
      expenses: expensesTotal,
      balance,
      bs: {
        totalBalance: balance * exchangeRate
      }
    };
  }, [filterTransactionsByPeriod, exchangeRate]);
  
  // Actualizar resumen financiero cuando cambian las transacciones o los filtros
  useEffect(() => {
    const summary = calculateFinancialSummary(transactions);
    setFinancialSummary(summary);
  }, [transactions, calculateFinancialSummary]);
  
  // Obtener transacciones filtradas
  const filteredTransactions = filterTransactionsByPeriod(transactions);
  
  // Filtrar por tipo para componentes que lo necesiten
  const incomeAndAdjustments = filteredTransactions.filter(
    tx => tx.type === TransactionType.INCOME || tx.type === TransactionType.ADJUSTMENT
  );
  
  const expenses = filteredTransactions.filter(
    tx => tx.type === TransactionType.EXPENSE
  );

  // Actualizar tasa de cambio
  const updateExchangeRate = async (newRate: number) => {
    try {
      await saveExchangeRateService(newRate);
      setExchangeRateState(newRate);
    } catch (err) {
      console.error('Error al actualizar la tasa de cambio:', err);
      throw err;
    }
  };

  return {
    transactions: filteredTransactions,
    incomeAndAdjustments,
    expenses,
    isLoading,
    error,
    financialSummary,
    filterPeriod,
    setFilterPeriod,
    customDateRange,
    setCustomDateRange,
    exchangeRate,
    setExchangeRate: updateExchangeRate,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: loadInitialData,
    getPaymentMethodDetails: (method: PaymentMethod) => {
      const paymentMethod = PAYMENT_METHOD_OPTIONS.find((m) => m.id === method);
      return {
        name: paymentMethod?.label || method,
        color: 'bg-gray-200',
        icon: '💳',
        currency: paymentMethod?.currency || Currency.BS
      };
    }
  };
};
