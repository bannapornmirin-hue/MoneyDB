import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Edit2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { formatCurrency, formatAmountNumber } from '../utils/formatters';
import { MonthlyBudget } from '../types';

interface MonthlySummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
  budget: MonthlyBudget | null;
  onOpenBudgetModal: () => void;
}

export const MonthlySummaryCards: React.FC<MonthlySummaryCardsProps> = ({
  totalIncome,
  totalExpense,
  balance,
  incomeCount,
  expenseCount,
  budget,
  onOpenBudgetModal,
}) => {
  const budgetAmount = budget?.budgetAmount || 0;
  const hasBudget = budgetAmount > 0;
  const budgetUsedPercent = hasBudget
    ? Math.min(100, Math.round((totalExpense / budgetAmount) * 100))
    : 0;
  const isOverBudget = hasBudget && totalExpense > budgetAmount;
  const remainingBudget = Math.max(0, budgetAmount - totalExpense);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Income Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            รายรับรวม (Income)
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            +{formatCurrency(totalIncome)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-700">
            <span>ทั้งหมด {incomeCount} รายการ</span>
          </div>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
      </div>

      {/* 2. Total Expense Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            รายจ่ายรวม (Expenses)
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-rose-600 tracking-tight">
            -{formatCurrency(totalExpense)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-700">
            <span>ทั้งหมด {expenseCount} รายการ</span>
          </div>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
      </div>

      {/* 3. Net Balance Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            ยอดเงินคงเหลือสุทธิ
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              balance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div
            className={`text-2xl font-bold tracking-tight ${
              balance >= 0 ? 'text-blue-700' : 'text-amber-600'
            }`}
          >
            {balance >= 0 ? '+' : ''}
            {formatCurrency(balance)}
          </div>
          <div className="mt-1 text-xs text-slate-700">
            {balance >= 0 ? (
              <span className="text-emerald-600 font-medium">มีเงินออมเหลือในเดือนนี้</span>
            ) : (
              <span className="text-amber-600 font-medium">รายจ่ายเกินรายรับ</span>
            )}
          </div>
        </div>
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            balance >= 0 ? 'bg-blue-500' : 'bg-amber-500'
          }`}
        />
      </div>

      {/* 4. Budget Tracker Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-700">
              งบประมาณรายจ่าย
            </span>
          </div>
          <button
            onClick={onOpenBudgetModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="ตั้งค่างบประมาณ"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {hasBudget ? (
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(budgetAmount)}
              </span>
              <span
                className={`text-xs font-semibold ${
                  isOverBudget ? 'text-rose-600' : 'text-slate-700'
                }`}
              >
                ใช้ไป {budgetUsedPercent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget
                    ? 'bg-rose-500'
                    : budgetUsedPercent > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (totalExpense / budgetAmount) * 100)}%` }}
              />
            </div>

            <div className="mt-2 text-xs flex items-center justify-between">
              {isOverBudget ? (
                <span className="text-rose-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  เกินงบ {formatCurrency(totalExpense - budgetAmount)}
                </span>
              ) : (
                <span className="text-slate-700 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  เหลือ {formatCurrency(remainingBudget)}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-2 text-center py-2">
            <p className="text-xs text-slate-700 mb-2">ยังไม่ได้ตั้งเป้างบประมาณเดือนนี้</p>
            <button
              onClick={onOpenBudgetModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" />
              <span>ตั้งงบรายจ่าย</span>
            </button>
          </div>
        )}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-300" />
      </div>
    </div>
  );
};
