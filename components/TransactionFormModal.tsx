
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { PAYMENT_METHOD_OPTIONS, TRANSACTION_TYPE_OPTIONS, formatDateForInput } from '../constants';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transactionData: Omit<Transaction, 'id'>) => void;
  initialData?: Transaction;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>(''); // Store as string for input control
  const [quantity, setQuantity] = useState<string>(''); // Store as string
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PAGO_MOVIL_BS);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setQuantity(initialData.quantity ? initialData.quantity.toString() : '');
      setDate(initialData.date);
      setType(initialData.type);
      setPaymentMethod(initialData.paymentMethod);
    } else {
      // Reset form for new transaction
      setDescription('');
      setAmount('');
      setQuantity('');
      setDate(formatDateForInput(new Date()));
      setType(TransactionType.INCOME);
      setPaymentMethod(PaymentMethod.PAGO_MOVIL_BS);
    }
    setErrors({}); // Clear errors when modal opens or initialData changes
  }, [isOpen, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!description.trim()) newErrors.description = 'La descripción es requerida.';
    if (!amount.trim() || parseFloat(amount) <= 0) newErrors.amount = 'El monto debe ser un número positivo.';
    if (type !== TransactionType.ADJUSTMENT && (!quantity.trim() || parseInt(quantity) <= 0)) {
       if (type === TransactionType.INCOME || type === TransactionType.EXPENSE) {
         newErrors.quantity = 'La cantidad debe ser un número positivo.';
       }
    }
    if (!date) newErrors.date = 'La fecha es requerida.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const transactionData: Omit<Transaction, 'id'> = {
      description,
      amount: parseFloat(amount),
      date,
      type,
      paymentMethod,
    };
    if (type !== TransactionType.ADJUSTMENT) {
      transactionData.quantity = parseInt(quantity);
    }
    
    onSubmit(transactionData);
    onClose(); // Close modal after submission
  };

  const isAdjustment = type === TransactionType.ADJUSTMENT;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Editar Transacción' : 'Nueva Transacción'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          id="type"
          label="Tipo de Transacción"
          options={TRANSACTION_TYPE_OPTIONS.map(t => ({ value: t.id, label: t.label }))}
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          required
        />
        <Input
          id="description"
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          required
        />
        <Input
          id="amount"
          label="Monto Total"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          step="0.01"
          required
        />
        {!isAdjustment && (
          <Input
            id="quantity"
            label="Cantidad"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            error={errors.quantity}
            step="1"
            required={!isAdjustment}
          />
        )}
        <Input
          id="date"
          label="Fecha"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
          required
        />
        <Select
          id="paymentMethod"
          label="Método de Pago / Cuenta"
          options={PAYMENT_METHOD_OPTIONS.map(pm => ({ value: pm.id, label: pm.label }))}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          required
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">{initialData ? 'Actualizar' : 'Agregar'}</Button>
        </div>
      </form>
    </Modal>
  );
};
