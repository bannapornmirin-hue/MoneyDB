import React, { useState, useEffect } from 'react';
import { X, Check, Utensils, Calendar, CreditCard, FileText } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { getTodayDateStr } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    category: string;
    date: string;
    note?: string;
    paymentMethod?: PaymentMethod;
  }) => Promise<void>;
  initialData?: Transaction | null;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'เงินสด',
  'โอนเงิน / PromptPay',
  'บัตรเครดิต/เดบิต',
  'อื่นๆ',
];

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateStr());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('โอนเงิน / PromptPay');
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(String(initialData.amount));
      setCategory(initialData.category);
      setDate(initialData.date);
      setPaymentMethod((initialData.paymentMethod as PaymentMethod) || 'โอนเงิน / PromptPay');
      setNote(initialData.note || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0].name);
      setDate(getTodayDateStr());
      setPaymentMethod('โอนเงิน / PromptPay');
      setNote('');
    }
    setError(null);
  }, [initialData, isOpen]);

  // When type changes, ensure valid default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const list = newType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    setCategory(list[0].name);
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + addValue));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('กรุณาระบุจำนวนเงินที่ถูกต้อง (มากกว่า 0)');
      return;
    }
    if (parsedAmount > 1000000000) {
      setError('จำนวนเงินสูงสุดไม่เกิน 1,000,000,000 บาท');
      return;
    }
    if (!category) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }
    if (!date) {
      setError('กรุณาระบุวันที่');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        type,
        amount: parsedAmount,
        category,
        date,
        note: note.trim(),
        paymentMethod,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {initialData ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Type Toggle: Expense vs Income */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย (Expense)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ (Income)
            </button>
          </div>

          {/* Amount Field & Quick Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                autoFocus
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                ฿
              </span>
            </div>

            {/* Quick add chips */}
            <div className="flex items-center gap-1.5 mt-2">
              {[50, 100, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Grid Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              หมวดหมู่ *
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-200 rounded-xl">
              {categories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-1"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : cat.bgColor,
                        color: isSelected ? '#ffffff' : cat.color,
                      }}
                    >
                      <CategoryIcon name={cat.icon} size={16} />
                    </div>
                    <span className="text-[11px] font-medium leading-tight line-clamp-1">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                วันที่ทำรายการ *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ช่องทางชำระเงิน
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note / Memo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              บันทึกช่วยจำ (ถ้ามี)
            </label>
            <input
              type="text"
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น ข้าวกลางวัน, ค่าน้ำมัน, ช้อปปิ้งออนไลน์..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'กำลังบันทึก...' : 'บันทึกรายการ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
