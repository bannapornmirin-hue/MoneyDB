import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatCurrency, formatAmountNumber } from '../utils/formatters';
import { getCategoryInfo } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { PieChart, BarChart3, TrendingUp, Info } from 'lucide-react';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  currentMonth: string;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  currentMonth,
}) => {
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<{ day: number; income: number; expense: number } | null>(null);

  // Filter transactions by selected type for category breakdown
  const targetTransactions = transactions.filter((t) => t.type === chartType);
  const totalTargetAmount = targetTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const categoryMap: { [cat: string]: number } = {};
  targetTransactions.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  const categoryData = Object.entries(categoryMap)
    .map(([category, amount]) => {
      const info = getCategoryInfo(category, chartType);
      const percent = totalTargetAmount > 0 ? (amount / totalTargetAmount) * 100 : 0;
      return {
        category,
        amount,
        percent,
        color: info.color,
        icon: info.icon,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Daily Trend Data (days 1..daysInMonth)
  const [yearStr, monthStr] = currentMonth.split('-');
  const yearNum = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

  const dailyData: { day: number; income: number; expense: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    dailyData.push({ day: d, income: 0, expense: 0 });
  }

  transactions.forEach((t) => {
    const day = parseInt(t.date.split('-')[2], 10);
    if (day >= 1 && day <= daysInMonth) {
      if (t.type === 'income') {
        dailyData[day - 1].income += t.amount;
      } else {
        dailyData[day - 1].expense += t.amount;
      }
    }
  });

  const maxDailyValue = Math.max(
    ...dailyData.map((d) => Math.max(d.income, d.expense)),
    100
  );

  // Find peak day
  const peakExpenseDay = [...dailyData].sort((a, b) => b.expense - a.expense)[0];
  const peakIncomeDay = [...dailyData].sort((a, b) => b.income - a.income)[0];

  // SVG Donut Chart calculations
  const size = 220;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const donutSlices = categoryData.map((item) => {
    const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += item.percent;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Category Breakdown Donut Chart (7 cols) */}
      <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">
                สัดส่วนตามหมวดหมู่
              </h3>
            </div>
            {/* Toggle Income / Expense */}
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium border border-slate-200">
              <button
                onClick={() => setChartType('expense')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  chartType === 'expense'
                    ? 'bg-white text-rose-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายจ่าย
              </button>
              <button
                onClick={() => setChartType('income')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  chartType === 'income'
                    ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายรับ
              </button>
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                <PieChart className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-700">ยังไม่มีข้อมูล{chartType === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในเดือนนี้</p>
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center">
              {/* Interactive Donut SVG */}
              <div className="relative w-[220px] h-[220px] flex items-center justify-center">
                <svg width={size} height={size} className="transform -rotate-90">
                  {donutSlices.map((slice) => {
                    const isHovered = hoveredCategory === slice.category;
                    return (
                      <circle
                        key={slice.category}
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        strokeLinecap="butt"
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredCategory(slice.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      />
                    );
                  })}
                </svg>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                  {hoveredCategory ? (
                    (() => {
                      const item = categoryData.find((c) => c.category === hoveredCategory);
                      return item ? (
                        <>
                          <span className="text-[11px] text-slate-700 font-medium truncate max-w-[120px]">
                            {item.category}
                          </span>
                          <span className="text-base font-bold text-slate-800">
                            {formatCurrency(item.amount)}
                          </span>
                          <span className="text-xs font-semibold text-emerald-600">
                            {item.percent.toFixed(1)}%
                          </span>
                        </>
                      ) : null;
                    })()
                  ) : (
                    <>
                      <span className="text-[11px] text-slate-700 font-medium">
                        {chartType === 'expense' ? 'ยอดจ่ายรวม' : 'ยอดรับรวม'}
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {formatCurrency(totalTargetAmount)}
                      </span>
                      <span className="text-[11px] text-slate-700">
                        {categoryData.length} หมวดหมู่
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Category Breakdown Table */}
              <div className="w-full mt-4 space-y-2 max-h-56 overflow-y-auto pr-1">
                {categoryData.map((item) => {
                  const isHovered = hoveredCategory === item.category;
                  return (
                    <div
                      key={item.category}
                      onMouseEnter={() => setHoveredCategory(item.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer text-xs ${
                        isHovered ? 'bg-slate-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate max-w-[170px]">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <CategoryIcon name={item.icon} size={14} color={item.color} />
                        <span className="font-medium text-slate-700 truncate">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(item.amount)}
                        </span>
                        <span className="text-slate-700 w-10 text-right">
                          {item.percent.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {categoryData.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-700">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              หมวดสูงสุด: <strong className="text-slate-800">{categoryData[0].category}</strong> ({categoryData[0].percent.toFixed(1)}%)
            </span>
          </div>
        )}
      </div>

      {/* 2. Daily Cash Flow Trend Bar Chart (7 cols) */}
      <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">
                แนวโน้มรายรับ-รายจ่ายประจำวัน
              </h3>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                <span className="text-slate-600">รายรับ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                <span className="text-slate-600">รายจ่าย</span>
              </div>
            </div>
          </div>

          {/* Daily Bar Chart Visualization */}
          <div className="mt-6">
            {/* Chart area */}
            <div className="h-48 flex items-end gap-1 sm:gap-1.5 pt-4 pb-2 border-b border-slate-200 relative">
              {dailyData.map((d) => {
                const incomeHeightPercent = (d.income / maxDailyValue) * 100;
                const expenseHeightPercent = (d.expense / maxDailyValue) * 100;
                const hasActivity = d.income > 0 || d.expense > 0;

                return (
                  <div
                    key={d.day}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                    onMouseEnter={() => setHoveredDay(d)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {/* Bars pair container */}
                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      {/* Income Bar */}
                      <div
                        className="w-1/2 max-w-[8px] bg-emerald-500/80 hover:bg-emerald-600 rounded-t-xs transition-all duration-300"
                        style={{ height: `${Math.max(d.income > 0 ? 4 : 0, incomeHeightPercent)}%` }}
                      />
                      {/* Expense Bar */}
                      <div
                        className="w-1/2 max-w-[8px] bg-rose-500/80 hover:bg-rose-600 rounded-t-xs transition-all duration-300"
                        style={{ height: `${Math.max(d.expense > 0 ? 4 : 0, expenseHeightPercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis days label */}
            <div className="flex justify-between text-[10px] text-slate-700 mt-1.5 px-0.5">
              <span>วันที่ 1</span>
              <span>วันที่ 10</span>
              <span>วันที่ 20</span>
              <span>วันที่ {daysInMonth}</span>
            </div>

            {/* Hovered Day Details Card */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 min-h-[52px] flex items-center justify-between">
              {hoveredDay ? (
                <>
                  <div className="text-xs font-semibold text-slate-800">
                    วันที่ {hoveredDay.day} {currentMonth}
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-emerald-600 font-medium">
                      รับ: +{formatCurrency(hoveredDay.income)}
                    </span>
                    <span className="text-rose-600 font-medium">
                      จ่าย: -{formatCurrency(hoveredDay.expense)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-700 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>ชี้หรือแตะที่แท่งกราฟเพื่อดูรายรับ-รายจ่ายของแต่ละวัน</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Peak summary badges */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-rose-50/70 p-2 rounded-md border border-rose-100">
            <span className="text-rose-700 block text-[11px]">จ่ายสูงสุด</span>
            <span className="font-semibold text-rose-800">
              วันที่ {peakExpenseDay?.day || '-'}: {formatCurrency(peakExpenseDay?.expense || 0)}
            </span>
          </div>
          <div className="bg-emerald-50/70 p-2 rounded-md border border-emerald-100">
            <span className="text-emerald-700 block text-[11px]">รับสูงสุด</span>
            <span className="font-semibold text-emerald-800">
              วันที่ {peakIncomeDay?.day || '-'}: {formatCurrency(peakIncomeDay?.income || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
