import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import {
  formatThaiMonthYear,
  getAdjacentMonth,
  getCurrentMonthStr,
} from '../utils/formatters';

interface MonthSelectorProps {
  currentMonth: string;
  onChangeMonth: (newMonth: string) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentMonth,
  onChangeMonth,
}) => {
  const thisMonth = getCurrentMonthStr();
  const isThisMonth = currentMonth === thisMonth;

  const handlePrev = () => {
    onChangeMonth(getAdjacentMonth(currentMonth, -1));
  };

  const handleNext = () => {
    onChangeMonth(getAdjacentMonth(currentMonth, 1));
  };

  const handleResetToCurrent = () => {
    onChangeMonth(thisMonth);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-700 font-medium">สรุปผลประจำเดือน</div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {formatThaiMonthYear(currentMonth)}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {!isThisMonth && (
          <button
            id="btn-current-month"
            onClick={handleResetToCurrent}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>เดือนปัจจุบัน</span>
          </button>
        )}

        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          <button
            id="btn-prev-month"
            onClick={handlePrev}
            title="เดือนก่อนหน้า"
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            id="btn-next-month"
            onClick={handleNext}
            title="เดือนถัดไป"
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
