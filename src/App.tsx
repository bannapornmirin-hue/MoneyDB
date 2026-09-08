/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { MonthSelector } from './components/MonthSelector';
import { MonthlySummaryCards } from './components/MonthlySummaryCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionFormModal } from './components/TransactionFormModal';
import { BudgetModal } from './components/BudgetModal';
import { AuthModal } from './components/AuthModal';
import { Transaction, MonthlyBudget, TransactionType, PaymentMethod } from './types';
import {
  subscribeUserMonthlyTransactions,
  subscribeMonthlyBudget,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  saveMonthlyBudget,
} from './services/transactionService';
import { getCurrentMonthStr, formatThaiMonthYear, getTodayDateStr } from './utils/formatters';
import {
  Database,
  Lock,
  Sparkles,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

// Demo transactions for unauthenticated preview
const DEMO_MONTH = getCurrentMonthStr();
const [demoY, demoM] = DEMO_MONTH.split('-');
const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'demo-1',
    userId: 'demo',
    type: 'income',
    amount: 45000,
    category: 'เงินเดือน / ค่าจ้าง',
    date: `${demoY}-${demoM}-01`,
    month: DEMO_MONTH,
    year: parseInt(demoY, 10),
    note: 'เงินเดือนประจำเดือน',
    paymentMethod: 'โอนเงิน / PromptPay',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    userId: 'demo',
    type: 'income',
    amount: 6500,
    category: 'งานเสริม / ฟรีแลนซ์',
    date: `${demoY}-${demoM}-04`,
    month: DEMO_MONTH,
    year: parseInt(demoY, 10),
    note: 'รับงานออกแบบกราฟิก',
    paymentMethod: 'โอนเงิน / PromptPay',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    userId: 'demo',
    type: 'expense',
    amount: 12000,
    category: 'บิล / ค่าน้ำค่าไฟ / ที่พัก',
    date: `${demoY}-${demoM}-02`,
    month: DEMO_MONTH,
    year: parseInt(demoY, 10),
    note: 'ค่าเช่าคอนโด + ค่าส่วนกลาง',
    paymentMethod: 'โอนเงิน / PromptPay',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    userId: 'demo',
    type: 'expense',
    amount: 1450,
    category: 'บิล / ค่าน้ำค่าไฟ / ที่พัก',
    date: `${demoY}-${demoM}-03`,
    month: DEMO_MONTH,
    year: parseInt(demoY, 10),
    note: 'ค่าไฟฟ้าประจำเดือน',
    paymentMethod: 'โอนเงิน / PromptPay',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    userId: 'demo',
    type: 'expense',
    amount: 380,
    category: 'อาหารและเครื่องดื่ม',
    date: `${demoY}-${demoM}-05`,
    month: DEMO_MONTH,
    year: parseInt(demoY, 10),
    note: 'ก๋วยเตี๋ยวเรือ + กาแฟโบราณ',
    paymentMethod: 'โอนเงิน / PromptPay',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-6',
    userId: 'demo',
    type: 'expense',
    amount: 1200,
    category: 'การเดินทาง / ยานพาหนะ',
    date: `${demoY}-${demoM}-06`,
    month: DEMO_MONTH,
    year: parseInt(demoY, 10),
    note: 'เติมน้ำมันรถยนต์',
    paymentMethod: 'บัตรเครดิต/เดบิต',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-7',
    userId: 'demo',
    type: 'expense',
    amount: 2190,
    category: 'ช้อปปิ้ง / ของใช้',
    date: `${demoY}-${demoM}-07`,
    month: DEMO_MONTH,
    year: parseInt(demoY, 10),
    note: 'ซื้อของใช้ในบ้านและซูเปอร์มาร์เก็ต',
    paymentMethod: 'บัตรเครดิต/เดบิต',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function ExpenseTrackerDashboard() {
  const { user, login, loading: authLoading, openAuthModal } = useAuth();
  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonthStr());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Subscribe to user transactions & budget from Firestore when logged in
  useEffect(() => {
    if (user) {
      setLoadingData(true);
      setFirestoreError(null);

      // Subscribe to transactions
      const unsubscribeTx = subscribeUserMonthlyTransactions(
        user.uid,
        currentMonth,
        (data) => {
          setTransactions(data);
          setLoadingData(false);
        },
        (err) => {
          console.error('Firestore subscription error:', err);
          setFirestoreError(err.message);
          setLoadingData(false);
        }
      );

      // Subscribe to monthly budget
      const unsubscribeBudget = subscribeMonthlyBudget(
        user.uid,
        currentMonth,
        (budgetData) => {
          setBudget(budgetData);
        },
        (err) => {
          console.error('Budget subscription error:', err);
        }
      );

      return () => {
        unsubscribeTx();
        unsubscribeBudget();
      };
    } else {
      // In demo mode for unauthenticated users
      setTransactions(INITIAL_DEMO_TRANSACTIONS);
      setBudget({
        id: 'demo-budget',
        userId: 'demo',
        month: currentMonth,
        budgetAmount: 25000,
        updatedAt: new Date().toISOString(),
      });
      setLoadingData(false);
    }
  }, [user, currentMonth]);

  // Aggregate monthly totals
  const { totalIncome, totalExpense, balance, incomeCount, expenseCount } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    let incCount = 0;
    let expCount = 0;

    transactions.forEach((t) => {
      if (t.type === 'income') {
        inc += t.amount;
        incCount += 1;
      } else {
        exp += t.amount;
        expCount += 1;
      }
    });

    return {
      totalIncome: inc,
      totalExpense: exp,
      balance: inc - exp,
      incomeCount: incCount,
      expenseCount: expCount,
    };
  }, [transactions]);

  // Handlers for Add/Edit/Delete
  const handleOpenNewTransaction = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (t: Transaction) => {
    setEditingTransaction(t);
    setIsTransactionModalOpen(true);
  };

  const handleSubmitTransaction = async (formData: {
    type: TransactionType;
    amount: number;
    category: string;
    date: string;
    note?: string;
    paymentMethod?: PaymentMethod;
  }) => {
    if (!user) {
      // Demo mode fallback
      if (editingTransaction) {
        setTransactions((prev) =>
          prev.map((item) =>
            item.id === editingTransaction.id
              ? {
                  ...item,
                  ...formData,
                  month: formData.date.slice(0, 7),
                  year: parseInt(formData.date.slice(0, 4), 10),
                  updatedAt: new Date().toISOString(),
                }
              : item
          )
        );
        showToast('แก้ไขรายการสำเร็จ (โหมดตัวอย่าง)');
      } else {
        const newDemoItem: Transaction = {
          id: `demo-${Date.now()}`,
          userId: 'demo',
          ...formData,
          month: formData.date.slice(0, 7),
          year: parseInt(formData.date.slice(0, 4), 10),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTransactions((prev) => [newDemoItem, ...prev]);
        showToast('บันทึกรายการสำเร็จ (โหมดตัวอย่าง)');
      }
      return;
    }

    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, {
        userId: user.uid,
        userEmail: user.email || undefined,
        ...formData,
      });
      showToast('อัปเดตข้อมูลลง Firebase สำเร็จแล้ว');
    } else {
      await createTransaction({
        userId: user.uid,
        userEmail: user.email || undefined,
        ...formData,
      });
      showToast('บันทึกรายการลง Firebase (moneyDB) เรียบร้อย');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast('ลบรายการสำเร็จ (โหมดตัวอย่าง)');
      return;
    }

    try {
      await deleteTransaction(id);
      showToast('ลบรายการออกจาก Firebase สำเร็จ');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'ไม่สามารถลบรายการได้');
    }
  };

  const handleSaveBudget = async (amount: number) => {
    if (!user) {
      setBudget({
        id: 'demo-budget',
        userId: 'demo',
        month: currentMonth,
        budgetAmount: amount,
        updatedAt: new Date().toISOString(),
      });
      showToast('ตั้งงบประมาณสำเร็จ (โหมดตัวอย่าง)');
      return;
    }

    await saveMonthlyBudget(user.uid, currentMonth, amount);
    showToast('บันทึกงบประมาณลง Firebase เรียบร้อย');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar onOpenNewTransaction={handleOpenNewTransaction} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner if Not Logged In */}
        {!user && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>เชื่อมต่อ Firebase moneyDB ด้วยบัญชี Gmail</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    ความปลอดภัยระดับองค์กร
                  </span>
                </h3>
                <p className="text-xs text-slate-700 mt-1 max-w-2xl leading-relaxed">
                  ขณะนี้คุณกำลังดูโหมดพรีวิวตัวอย่างข้อมูล เมื่อเข้าสู่ระบบด้วย Gmail
                  ข้อมูลรายรับรายจ่ายทั้งหมดของคุณจะถูกเข้ารหัสและจัดเก็บไว้อย่างปลอดภัยบน Firebase
                  (โปรเจกต์ moneyDB) แบบเรียลไทม์
                </p>
              </div>
            </div>

            <button
              onClick={() => openAuthModal()}
              disabled={authLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>เข้าสู่ระบบด้วย Gmail ทันที</span>
            </button>
          </div>
        )}

        {/* Firestore Permission / Offline Error Notice if any */}
        {firestoreError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">เกิดข้อผิดพลาดในการโหลดข้อมูลจาก Firestore: {firestoreError}</span>
          </div>
        )}

        {/* Month Selector Bar */}
        <MonthSelector
          currentMonth={currentMonth}
          onChangeMonth={setCurrentMonth}
        />

        {/* Monthly Summary Metric Cards */}
        <MonthlySummaryCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          balance={balance}
          incomeCount={incomeCount}
          expenseCount={expenseCount}
          budget={budget}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* Analytical Charts */}
        <AnalyticsCharts
          transactions={transactions}
          currentMonth={currentMonth}
        />

        {/* Transaction History & Records List */}
        <TransactionList
          transactions={transactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          onAddNew={handleOpenNewTransaction}
          currentMonth={currentMonth}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <img
              src="/phrae_vocational_logo.jpg"
              alt="โลโก้วิทยาลัยอาชีวศึกษาแพร่"
              className="w-5 h-5 rounded-full object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <span className="font-semibold text-slate-800">MoneyDB</span>
            <span>•</span>
            <span>วิทยาลัยอาชีวศึกษาแพร่ (Phrae Vocational College)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Firebase Firestore Active
            </span>
            <span>Google Authentication</span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Transaction Modal */}
      <TransactionFormModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSubmitTransaction}
        initialData={editingTransaction}
      />

      {/* Monthly Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentMonth={currentMonth}
        initialBudget={budget?.budgetAmount || 0}
        onSave={handleSaveBudget}
      />

      {/* Authentication Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ExpenseTrackerDashboard />
    </AuthProvider>
  );
}
