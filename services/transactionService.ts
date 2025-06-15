
import { Transaction } from '../types';
import { INITIAL_EXCHANGE_RATE } from '../constants';

const TRANSACTIONS_STORAGE_KEY = 'transactions_v2'; // Changed key to avoid conflict if old data exists
const EXCHANGE_RATE_STORAGE_KEY = 'exchangeRate_v2';

// Helper to get transactions from localStorage
const getStoredTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing stored transactions:", e);
      return []; // Return empty if parsing fails
    }
  }
  return []; // Return empty if nothing is stored
};

// Helper to save transactions to localStorage
const saveStoredTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
};

export const getTransactions = async (): Promise<Transaction[]> => {
  // Simulate async operation for consistency with hook structure
  return Promise.resolve(getStoredTransactions());
};

export const addTransaction = async (transactionData: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const transactions = getStoredTransactions();
  const newTransaction: Transaction = {
    ...transactionData,
    // Simple unique ID generation, ensure date is handled correctly
    id: `${new Date(transactionData.date + 'T00:00:00').toISOString()}-${Math.random().toString(36).substring(2, 9)}`,
  };
  transactions.push(newTransaction);
  saveStoredTransactions(transactions);
  return Promise.resolve(newTransaction);
};

export const updateTransaction = async (transactionToUpdate: Transaction): Promise<Transaction> => {
  let transactions = getStoredTransactions();
  transactions = transactions.map(t => t.id === transactionToUpdate.id ? transactionToUpdate : t);
  saveStoredTransactions(transactions);
  return Promise.resolve(transactionToUpdate);
};

export const deleteTransaction = async (transactionId: string): Promise<void> => {
  let transactions = getStoredTransactions();
  transactions = transactions.filter(t => t.id !== transactionId);
  saveStoredTransactions(transactions);
  return Promise.resolve();
};

export const getExchangeRate = async (): Promise<number> => {
  const storedRate = localStorage.getItem(EXCHANGE_RATE_STORAGE_KEY);
  // Simulate async operation
  return Promise.resolve(storedRate ? parseFloat(storedRate) : INITIAL_EXCHANGE_RATE);
};

export const saveExchangeRate = async (rate: number): Promise<void> => {
  localStorage.setItem(EXCHANGE_RATE_STORAGE_KEY, rate.toString());
  // Simulate async operation
  return Promise.resolve();
};
