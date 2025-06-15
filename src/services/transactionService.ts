import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  setDoc,
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Transaction, TransactionType, PaymentMethod } from '../../types';

export interface TransactionInput extends Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> {
  // Hereda los campos de Transaction excepto id, createdAt y updatedAt
}

// Obtener todas las transacciones
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    console.log('Obteniendo transacciones de Firestore...');
    
    // Verificar que db esté inicializado
    if (!db) {
      throw new Error('Firestore no está inicializado');
    }
    
    const q = query(
      collection(db, 'transactions'),
      orderBy('date', 'desc')
    );
    
    console.log('Ejecutando consulta a Firestore...');
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot) {
      throw new Error('No se pudo obtener la respuesta de Firestore');
    }
    
    console.log('Transacciones obtenidas:', querySnapshot.docs.length);
    
    const transactions = querySnapshot.docs.map(doc => {
      try {
        const data = doc.data();
        if (!data) {
          console.warn('Documento sin datos:', doc.id);
          return null;
        }
        
        console.log('Procesando documento:', doc.id, data);
        
        // Convertir los datos de Firestore a Transaction
        const transaction: Transaction = {
          id: doc.id,
          description: data.description || '',
          amount: data.amount || 0,
          type: data.type as TransactionType,
          paymentMethod: data.paymentMethod as PaymentMethod,
          date: data.date?.toDate?.()?.toISOString()?.split('T')[0] || data.date || new Date().toISOString().split('T')[0],
          quantity: data.quantity || 1,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        };
        
        return transaction;
      } catch (docError) {
        console.error(`Error procesando documento ${doc.id}:`, docError);
        return null;
      }
    }).filter(Boolean) as Transaction[]; // Filtrar documentos nulos
    
    return transactions;
    
  } catch (error) {
    console.error('Error en getTransactions:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      code: (error as any)?.code,
      details: (error as any)?.details,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

// Agregar una nueva transacción
export const addTransaction = async (transaction: TransactionInput): Promise<Transaction> => {
  try {
    console.log('Agregando transacción a Firestore:', transaction);
    const now = Timestamp.now();
    
    // Crear el objeto de datos para Firestore
    const transactionData = {
      ...transaction,
      date: transaction.date, // Guardar como string
      createdAt: now,
      updatedAt: now
    };
    
    console.log('Datos a guardar en Firestore:', transactionData);
    const docRef = await addDoc(collection(db, 'transactions'), transactionData);
    console.log('Transacción guardada con ID:', docRef.id);
    
    // Devolver el objeto Transaction con los datos formateados
    return {
      id: docRef.id,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      paymentMethod: transaction.paymentMethod,
      date: transaction.date,
      quantity: transaction.quantity || 1,
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString()
    };
  } catch (error) {
    console.error('Error en addTransaction:', error);
    throw error;
  }
};

// Actualizar una transacción existente
export const updateTransaction = async (id: string, transaction: Partial<TransactionInput>): Promise<Transaction> => {
  try {
    console.log('Actualizando transacción en Firestore:', id, transaction);
    const now = Timestamp.now();
    const transactionRef = doc(db, 'transactions', id);
    
    // Actualizar solo los campos proporcionados
    const updateData = {
      ...transaction,
      updatedAt: now
    };
    
    await updateDoc(transactionRef, updateData);
    console.log('Transacción actualizada con éxito');
    
    // Obtener la transacción actualizada
    const updatedTransaction = {
      id,
      ...transaction,
      updatedAt: now.toDate().toISOString()
    } as unknown as Transaction;
    
    return updatedTransaction;
  } catch (error) {
    console.error('Error en updateTransaction:', error);
    throw error;
  }
};

// Eliminar una transacción
export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    console.log('Eliminando transacción de Firestore:', id);
    await deleteDoc(doc(db, 'transactions', id));
    console.log('Transacción eliminada con éxito');
  } catch (error) {
    console.error('Error en deleteTransaction:', error);
    throw error;
  }
};

// Colección para almacenar la configuración de la aplicación
const SETTINGS_COLLECTION = 'settings';
const EXCHANGE_RATE_DOC = 'exchange_rate';

// Obtener la tasa de cambio desde Firestore
export const getExchangeRate = async (): Promise<number> => {
  try {
    console.log('Obteniendo tasa de cambio desde Firestore...');
    
    // Verificar que db esté inicializado
    if (!db) {
      console.error('Firestore no está inicializado al intentar obtener la tasa de cambio');
      return 1;
    }
    
    const docRef = doc(db, SETTINGS_COLLECTION, EXCHANGE_RATE_DOC);
    console.log('Referencia al documento de tasa de cambio creada');
    
    const docSnap = await getDoc(docRef);
    console.log('Respuesta de Firestore recibida:', { exists: docSnap.exists() });
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const rate = data.rate as number;
      console.log('Tasa de cambio obtenida:', rate);
      return rate;
    } else {
      console.log('No se encontró la tasa de cambio, creando documento con valor por defecto 1');
      try {
        // Crear el documento con el valor por defecto
        await setDoc(docRef, { rate: 1 });
        console.log('Documento de tasa de cambio creado exitosamente');
        return 1;
      } catch (setDocError) {
        console.error('Error al crear el documento de tasa de cambio:', {
          message: setDocError instanceof Error ? setDocError.message : 'Error desconocido',
          code: (setDocError as any)?.code,
          details: (setDocError as any)?.details
        });
        return 1;
      }
    }
  } catch (error) {
    console.error('Error al obtener la tasa de cambio:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      code: (error as any)?.code,
      details: (error as any)?.details,
      stack: error instanceof Error ? error.stack : undefined
    });
    return 1; // Valor por defecto en caso de error
  }
};

// Guardar la tasa de cambio en Firestore
export const saveExchangeRate = async (rate: number): Promise<void> => {
  try {
    console.log('Guardando tasa de cambio en Firestore:', rate);
    const docRef = doc(db, SETTINGS_COLLECTION, EXCHANGE_RATE_DOC);
    await setDoc(docRef, { rate }, { merge: true });
    console.log('Tasa de cambio guardada con éxito');
  } catch (error) {
    console.error('Error al guardar la tasa de cambio:', error);
    throw error;
  }
};
