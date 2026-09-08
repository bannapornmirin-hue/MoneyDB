import React, { useState, useEffect } from 'react';
import { X, Target, Check } from 'lucide-react';
import { formatThaiMonthYear, formatCurrency } from '../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: string;
  initialBudget: number;
  onSave: (amount: number) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
  initialBudget,
  onSave,
}) => {
  const [budget, setBudget] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBudget > 0) {
      setBudget(String(initialBudget));
    } else {
      setBudget('');
    }
    setError(null);
  }, [initialBudget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(budget);
    if (isNaN(val) || val < 0) {
      setError('กรุณาระบุจำนวนงบประมาณเป็นตัวเลขที่ถูกต้อง');
      return;
    }
    if (val > 1000000000) {
      setError('งบประมาณสูงสุดไม่เกิน 1,000,000,000 บาท');
      return;
    }

    try {
      setSaving(true);
      await onSave(val);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถบันทึกงบประมาณได้');
    } finally {
      setSaving(false);
    }
  };

  const presetAmounts = [10000, 15000, 20000, 30000, 50000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              ตั้งงบประมาณรายจ่าย
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs text-slate-700">
            กำหนดเพดานรายจ่ายสูงสุดสำหรับเดือน{' '}
            <strong className="text-slate-800">{formatThaiMonthYear(currentMonth)}</strong>{' '}
            เพื่อช่วยควบคุมวินัยทางการเงิน
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              งบประมาณ (บาท)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="เช่น 20000"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                autoFocus
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                ฿
              </span>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presetAmounts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setBudget(String(p))}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  {formatCurrency(p)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึกงบประมาณ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
