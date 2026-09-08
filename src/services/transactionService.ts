import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Transaction, MonthlyBudget } from '../types';

const TRANSACTIONS_COLLECTION = 'transactions';
const BUDGETS_COLLECTION = 'budgets';

// Sanitization & Validation matching firebase-blueprint.json
export function sanitizeTransactionInput(data: {
  userId: string;
  userEmail?: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
  paymentMethod?: string;
}) {
  if (!data.userId) throw new Error('User ID is required');
  if (data.type !== 'income' && data.type !== 'expense') throw new Error('Invalid transaction type');
  
  const amount = Number(data.amount);
  if (isNaN(amount) || amount < 0 || amount > 1000000000) {
    throw new Error('จำนวนเงินต้องอยู่ระหว่าง 0 ถึง 1,000,000,000 บาท');
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(data.date)) {
    throw new Error('รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)');
  }

  const category = (data.category || '').trim().slice(0, 100);
  if (!category) throw new Error('กรุณาระบุหมวดหมู่');

  const month = data.date.slice(0, 7); // YYYY-MM
  const year = parseInt(data.date.slice(0, 4), 10);
  const note = (data.note || '').trim().slice(0, 500);
  const paymentMethod = (data.paymentMethod || '').trim().slice(0, 50);
  const userEmail = (data.userEmail || '').trim().slice(0, 150);

  return {
    userId: data.userId,
    userEmail,
    type: data.type,
    amount,
    category,
    date: data.date,
    month,
    year,
    note,
    paymentMethod,
  };
}

// Subscribe to transactions for a specific user and month
export function subscribeUserMonthlyTransactions(
  userId: string,
  month: string,
  onData: (transactions: Transaction[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const path = TRANSACTIONS_COLLECTION;
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId),
      where('month', '==', month),
      orderBy('date', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            userId: d.userId,
            userEmail: d.userEmail,
            type: d.type,
            amount: d.amount,
            category: d.category,
            date: d.date,
            month: d.month,
            year: d.year,
            note: d.note,
            paymentMethod: d.paymentMethod,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          });
        });
        onData(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (wrappedErr) {
          onError(wrappedErr as Error);
        }
      }
    );
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, path);
    } catch (wrappedErr) {
      onError(wrappedErr as Error);
    }
    return () => {};
  }
}

// Add new transaction
export async function createTransaction(
  payload: Parameters<typeof sanitizeTransactionInput>[0]
): Promise<string> {
  const sanitized = sanitizeTransactionInput(payload);
  const path = TRANSACTIONS_COLLECTION;
  const newId = `${sanitized.userId.slice(0, 10)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const docData: Omit<Transaction, 'id'> = {
    ...sanitized,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const docRef = doc(db, path, newId);
    await setDoc(docRef, docData);
    return newId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${newId}`);
  }
}

// Update existing transaction
export async function updateTransaction(
  transactionId: string,
  payload: Parameters<typeof sanitizeTransactionInput>[0]
): Promise<void> {
  const sanitized = sanitizeTransactionInput(payload);
  const path = `${TRANSACTIONS_COLLECTION}/${transactionId}`;
  const now = new Date().toISOString();

  try {
    const docRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    await updateDoc(docRef, {
      ...sanitized,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete transaction
export async function deleteTransaction(transactionId: string): Promise<void> {
  const path = `${TRANSACTIONS_COLLECTION}/${transactionId}`;
  try {
    const docRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Monthly Budget functions
export function subscribeMonthlyBudget(
  userId: string,
  month: string,
  onData: (budget: MonthlyBudget | null) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const budgetDocId = `${userId}_${month.replace('-', '_')}`;
  const path = `${BUDGETS_COLLECTION}/${budgetDocId}`;

  try {
    const docRef = doc(db, BUDGETS_COLLECTION, budgetDocId);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          onData({
            id: snapshot.id,
            userId: data.userId,
            month: data.month,
            budgetAmount: data.budgetAmount,
            updatedAt: data.updatedAt,
          });
        } else {
          onData(null);
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch (wrappedErr) {
          onError(wrappedErr as Error);
        }
      }
    );
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.GET, path);
    } catch (wrappedErr) {
      onError(wrappedErr as Error);
    }
    return () => {};
  }
}

export async function saveMonthlyBudget(
  userId: string,
  month: string,
  budgetAmount: number
): Promise<void> {
  const budgetDocId = `${userId}_${month.replace('-', '_')}`;
  const path = `${BUDGETS_COLLECTION}/${budgetDocId}`;
  const amount = Math.max(0, Math.min(1000000000, Number(budgetAmount) || 0));

  try {
    const docRef = doc(db, BUDGETS_COLLECTION, budgetDocId);
    await setDoc(docRef, {
      userId,
      month,
      budgetAmount: amount,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
