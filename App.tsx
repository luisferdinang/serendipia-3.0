
import React, { useState } from 'react';
import { Header } from './components/Header';
import { FilterControls } from './components/FilterControls';
import { FinancialSummary } from './components/FinancialSummary';
import { TransactionList } from './components/TransactionList';
import { CurrencyConverter } from './components/CurrencyConverter';
import { TransactionFormModal } from './components/TransactionFormModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { Button } from './components/ui/Button';
import { useTransactions } from './hooks/useTransactions';
import { Transaction } from './types';

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export default function App(): JSX.Element {
  const {
    transactions,
    incomeAndAdjustments,
    expenses,
    financialSummary,
    filterPeriod,
    setFilterPeriod,
    customDateRange,
    setCustomDateRange,
    exchangeRate,
    setExchangeRate,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading: isLoadingTransactions,
    error: transactionError,
    getPaymentMethodDetails
  } = useTransactions();

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<{ id: string, description: string } | null>(null);

  const handleOpenTransactionModal = (transaction?: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setEditingTransaction(undefined);
    setIsTransactionModalOpen(false);
  };

  const handleSubmitTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      updateTransaction({ ...editingTransaction, ...transactionData });
    } else {
      addTransaction(transactionData);
    }
  };

  const handleOpenDeleteModal = (id: string, description: string) => {
    setTransactionToDelete({ id, description });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoadingTransactions) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-sky-300">Cargando datos financieros...</div>;
  }

  if (transactionError) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-400 p-8 text-center">{transactionError}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-slate-100">Panel de Control Financiero</h2>
          <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
            <Button
              variant="primary"
              onClick={() => handleOpenTransactionModal()}
              leftIcon={<PlusIcon />}
            >
              Nueva Transacción
            </Button>
          </div>
        </div>

        <FinancialSummary summary={financialSummary} />

        <FilterControls
          currentFilter={filterPeriod}
          onFilterChange={setFilterPeriod}
          customRange={customDateRange}
          onCustomRangeChange={(name, value) => setCustomDateRange(prev => ({...prev, [name]: value}))}
        />

        <div className="space-y-8">
          <TransactionList
            title="Ingresos y Ajustes de Saldo"
            transactions={incomeAndAdjustments}
            onEdit={handleOpenTransactionModal}
            onDelete={handleOpenDeleteModal}
            getPaymentMethodDetails={getPaymentMethodDetails}
          />
          <TransactionList
            title="Gastos"
            transactions={expenses}
            onEdit={handleOpenTransactionModal}
            onDelete={handleOpenDeleteModal}
            getPaymentMethodDetails={getPaymentMethodDetails}
          />
        </div>

        <CurrencyConverter
          bsTotal={financialSummary.bs.totalBalance}
          exchangeRate={exchangeRate}
          onExchangeRateChange={setExchangeRate}
        />

      </main>

      <TransactionFormModal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseTransactionModal}
        onSubmit={handleSubmitTransaction}
        initialData={editingTransaction}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={transactionToDelete?.description}
      />
    </div>
  );
}