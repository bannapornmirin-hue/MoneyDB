import React, { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit3,
  Download,
  Receipt,
  ArrowUpDown,
  CreditCard,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatThaiDate } from '../utils/formatters';
import { getCategoryInfo, ALL_CATEGORIES } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  currentMonth: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onAddNew,
  currentMonth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter & Search
  const filtered = transactions.filter((t) => {
    // Type filter
    if (filterType !== 'all' && t.type !== filterType) return false;
    // Category filter
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCat = t.category.toLowerCase().includes(q);
      const matchNote = (t.note || '').toLowerCase().includes(q);
      const matchAmount = String(t.amount).includes(q);
      const matchPay = (t.paymentMethod || '').toLowerCase().includes(q);
      if (!matchCat && !matchNote && !matchAmount && !matchPay) return false;
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
    if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (sorted.length === 0) return;
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน', 'ช่องทางชำระเงิน', 'บันทึกช่วยจำ'];
    const rows = sorted.map((t) => [
      t.date,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      `"${t.category.replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `moneyDB_statement_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteConfirm = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* List Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">
              ประวัติรายการรายรับ-รายจ่าย ({sorted.length} รายการ)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={sorted.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
              title="ส่งออกรายงานเป็น CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ส่งออก CSV</span>
            </button>
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>+ บันทึกรายการ</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search box */}
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามโน้ต, หมวดหมู่, หรือจำนวนเงิน..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Type filter tabs */}
          <div className="sm:col-span-3 flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium border border-slate-200">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1 rounded-md transition-all cursor-pointer text-center ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`flex-1 py-1 rounded-md transition-all cursor-pointer text-center ${
                filterType === 'expense'
                  ? 'bg-white text-rose-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              จ่าย
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`flex-1 py-1 rounded-md transition-all cursor-pointer text-center ${
                filterType === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รับ
            </button>
          </div>

          {/* Sort selector */}
          <div className="sm:col-span-4 flex gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="date-desc">วันที่ (ล่าสุดก่อน)</option>
              <option value="date-asc">วันที่ (เก่าสุดก่อน)</option>
              <option value="amount-desc">จำนวนเงิน (มากไปน้อย)</option>
              <option value="amount-asc">จำนวนเงิน (น้อยไปมาก)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Records List */}
      {sorted.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-800">
            {searchQuery ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีรายการในเดือนนี้'}
          </p>
          <p className="text-xs text-slate-700 mt-1 max-w-xs mx-auto">
            {searchQuery
              ? 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรอง'
              : 'เริ่มต้นบันทึกรายรับหรือรายจ่ายเพื่อดูสถิติและการวิเคราะห์'}
          </p>
          {!searchQuery && (
            <button
              onClick={onAddNew}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>+ เพิ่มรายการแรกเลย</span>
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {sorted.map((t) => {
            const catInfo = getCategoryInfo(t.category, t.type);
            const isIncome = t.type === 'income';

            return (
              <div
                key={t.id}
                className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 group"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: catInfo.bgColor,
                      color: catInfo.color,
                    }}
                  >
                    <CategoryIcon name={catInfo.icon} size={18} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {t.category}
                      </span>
                      {t.paymentMethod && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          <CreditCard className="w-2.5 h-2.5" />
                          {t.paymentMethod}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-700">
                      <span>{formatThaiDate(t.date)}</span>
                      {t.note && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[150px] sm:max-w-xs text-slate-600 italic">
                            "{t.note}"
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-bold tracking-tight ${
                        isIncome ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </span>
                    <div className="text-[10px] text-slate-700 sm:hidden">
                      {t.paymentMethod}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(t)}
                      title="แก้ไขรายการ"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(t.id)}
                      title="ลบรายการ"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
