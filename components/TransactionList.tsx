
import React from 'react';
import { Transaction, PaymentMethod } from '../types';
import { Button } from './ui/Button';
import { PAYMENT_METHOD_OPTIONS, getCurrencyForPaymentMethod } from '../constants';

interface TransactionListProps {
  title: string;
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string, transactionDescription: string) => void;
  getPaymentMethodDetails: (methodId: PaymentMethod) => { label: string; currency: string } | undefined;
}

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.242.078 3.324.225m8.916-.225c-.342.052-.682.107-1.022.166M6.538 5.79L6.255 3H4.065a1.125 1.125 0 00-1.124 1.125v1.5c0 .621.504 1.125 1.124 1.125h18.75c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-2.298L19.74 5.79M6.538 5.79l-.283-2.79M14.74 9v9" />
  </svg>
);


export const TransactionList: React.FC<TransactionListProps> = ({ title, transactions, onEdit, onDelete, getPaymentMethodDetails }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-sky-300 mb-4">{title}</h3>
        <p className="text-slate-400">No hay transacciones para mostrar en este período.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-2 sm:p-4 md:p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold text-sky-300 mb-4 px-2 md:px-0">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-700/50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Descripción</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden md:table-cell">Cantidad</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Fecha</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden sm:table-cell">Método/Cuenta</th>
              <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Monto</th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {transactions.map(t => {
              const paymentMethodDetails = getPaymentMethodDetails(t.paymentMethod);
              const currency = paymentMethodDetails ? paymentMethodDetails.currency : getCurrencyForPaymentMethod(t.paymentMethod);
              const amountColor = t.type === 'expense' ? 'text-red-400' : 'text-green-400';
              if (t.type === 'adjustment') { /* amountColor = 'text-blue-400'; */ }


              return (
                <tr key={t.id} className="hover:bg-slate-700/30 transition-colors duration-150">
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-200">{t.description}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-300 hidden md:table-cell">{t.quantity !== undefined ? t.quantity : 'N/A'}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-300">{new Date(t.date + 'T00:00:00').toLocaleDateString('es-VE')}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-300 hidden sm:table-cell">{paymentMethodDetails?.label || t.paymentMethod}</td>
                  <td className={`px-3 py-4 whitespace-nowrap text-sm text-right font-medium ${amountColor}`}>
                    {`${t.type === 'expense' ? '-' : ''}${t.amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-center text-sm space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(t)} aria-label={`Editar ${t.description}`}>
                      <EditIcon />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(t.id, t.description)} aria-label={`Eliminar ${t.description}`}>
                      <DeleteIcon className="text-red-400 hover:text-red-300" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
